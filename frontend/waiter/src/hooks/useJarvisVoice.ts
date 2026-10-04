'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { rawChatApi } from '@/redux/features/chatApi';

/**
 * Strips markdown and emojis from text so it sounds natural when spoken aloud.
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[*_~]{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\|[^\n]+\|/g, '') // remove markdown table lines
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface UseJarvisVoiceOptions {
  onTranscriptComplete?: (finalText: string) => void;
  persona?: string;
}

export function useJarvisVoice({
  onTranscriptComplete,
  persona = 'uk_jarvis',
}: UseJarvisVoiceOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  // References to keep active audio & recognition instances
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isListeningRef = useRef(false);

  // Strict session tracking to prevent race conditions & overlapping dual voices
  const speechSessionIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync ref with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      speechSessionIdRef.current++;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      if (currentAudioRef.current) {
        const audio = currentAudioRef.current;
        currentAudioRef.current = null;
        audio.onended = null;
        audio.onerror = null;
        try {
          audio.pause();
          audio.removeAttribute('src');
        } catch (_) {}
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
  }, []);

  const stopSpeaking = useCallback(() => {
    // 1. Invalidate any in-flight speech session
    speechSessionIdRef.current++;

    // 2. Abort active network request for neural voice synthesis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // 3. Stop and clean up current HTML Audio element
    if (currentAudioRef.current) {
      const audio = currentAudioRef.current;
      currentAudioRef.current = null;
      // CRITICAL: Detach listeners BEFORE pausing and clearing source
      // to prevent browser from firing onerror and triggering fallback speech!
      audio.onended = null;
      audio.onerror = null;
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.removeAttribute('src');
      } catch (_) {}
    }

    // 4. Cancel any browser Web SpeechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }

    setIsSpeaking(false);
    setSpeakingId(null);
    setSpeakingText(null);
  }, []);

  const fallbackBrowserSpeech = useCallback((text: string, sessionId: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (sessionId === speechSessionIdRef.current) {
        setIsSpeaking(false);
        setSpeakingId(null);
        setSpeakingText(null);
      }
      return;
    }

    try {
      window.speechSynthesis.cancel();
      // Ensure this session has not been superseded
      if (sessionId !== speechSessionIdRef.current) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-GB';

      utterance.onend = () => {
        if (sessionId === speechSessionIdRef.current) {
          setIsSpeaking(false);
          setSpeakingId(null);
          setSpeakingText(null);
        }
      };

      utterance.onerror = () => {
        if (sessionId === speechSessionIdRef.current) {
          setIsSpeaking(false);
          setSpeakingId(null);
          setSpeakingText(null);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (_) {
      if (sessionId === speechSessionIdRef.current) {
        setIsSpeaking(false);
        setSpeakingId(null);
        setSpeakingText(null);
      }
    }
  }, []);

  const speakText = useCallback(
    async (text: string, messageId?: string) => {
      if (isMuted || !text) return;

      // 1. Immediately cancel any currently speaking audio or queued utterances
      stopSpeaking();

      // 2. Mute listening while speech outputs to avoid microphone self-echo
      if (isListeningRef.current) {
        stopListening();
      }

      const cleaned = cleanTextForSpeech(text);
      if (!cleaned) return;

      // 3. Assign a unique session token for this speech invocation
      const sessionId = ++speechSessionIdRef.current;
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsSpeaking(true);
      setSpeakingId(messageId || null);
      setSpeakingText(cleaned);

      // Attempt 1: High quality Neural TTS from AI backend
      try {
        const audioBlob = await rawChatApi.fetchVoiceAudioBlob(cleaned, persona, abortController.signal);

        // Discard result if user stopped or started another message while fetching
        if (sessionId !== speechSessionIdRef.current) {
          return;
        }

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        audio.onended = () => {
          if (sessionId === speechSessionIdRef.current) {
            setIsSpeaking(false);
            setSpeakingId(null);
            setSpeakingText(null);
            currentAudioRef.current = null;
          }
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          // If stopped intentionally, sessionId will no longer match
          if (sessionId !== speechSessionIdRef.current) {
            URL.revokeObjectURL(audioUrl);
            return;
          }
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
          // Fallback to browser synthesis ONLY if session is still active
          fallbackBrowserSpeech(cleaned, sessionId);
        };

        await audio.play();
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError' || sessionId !== speechSessionIdRef.current) {
          return;
        }
        console.warn('Backend neural voice unavailable, using browser speech synthesis fallback:', err);
      }

      // Attempt 2: Native Web SpeechSynthesis API fallback
      if (sessionId === speechSessionIdRef.current) {
        fallbackBrowserSpeech(cleaned, sessionId);
      }
    },
    [isMuted, persona, stopSpeaking, stopListening, fallbackBrowserSpeech]
  );

  const startListening = useCallback(async () => {
    stopSpeaking();
    setTranscript('');

    const SpeechRecognition =
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    // Path A: Native browser SpeechRecognition (Chrome, Edge, Safari)
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          toast.info('Voice Copilot listening...', {
            description: 'Speak your question or table update clearly.',
          });
        };

        recognition.onresult = (event: any) => {
          let currentText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }
          setTranscript(currentText);

          // If this result is final
          if (event.results[event.results.length - 1].isFinal) {
            const finalText = currentText.trim();
            if (finalText) {
              try {
                recognition.stop();
              } catch (_) {}
              setIsListening(false);
              if (onTranscriptComplete) {
                onTranscriptComplete(finalText);
              }
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            toast.error('Microphone access denied', {
              description: 'Please allow microphone permissions in your browser address bar.',
            });
          } else if (event.error !== 'no-speech') {
            toast.error(`Voice error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
        return;
      } catch (err) {
        console.warn('SpeechRecognition initialization failed, trying MediaRecorder:', err);
      }
    }

    // Path B: MediaRecorder + Backend Whisper Turbo STT
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          setIsListening(false);
          stream.getTracks().forEach((track) => track.stop());

          if (audioChunksRef.current.length === 0) return;
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

          try {
            toast.info('Transcribing voice audio...');
            const recognizedText = await rawChatApi.transcribeAudio(audioBlob);
            if (recognizedText.trim()) {
              setTranscript(recognizedText.trim());
              if (onTranscriptComplete) {
                onTranscriptComplete(recognizedText.trim());
              }
            } else {
              toast.info('No speech detected. Please try again.');
            }
          } catch (error: any) {
            console.error('Audio transcription error:', error);
            toast.error('Voice transcription unavailable', {
              description: 'Could not connect to Whisper STT service.',
            });
          }
        };

        mediaRecorder.start();
        setIsListening(true);
        toast.info('Voice Copilot listening...', {
          description: 'Speak your question now (click stop when done).',
        });
      } catch (err: any) {
        setIsListening(false);
        toast.error('Microphone error', {
          description: err.message || 'Microphone access could not be acquired.',
        });
      }
    } else {
      toast.error('Voice not supported', {
        description: 'Your browser does not support audio recording.',
      });
    }
  }, [onTranscriptComplete, stopSpeaking]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        stopSpeaking();
        toast.info('Voice output muted');
      } else {
        toast.info('Voice output unmuted');
      }
      return next;
    });
  }, [stopSpeaking]);

  return {
    isListening,
    isSpeaking,
    speakingId,
    speakingText,
    transcript,
    isMuted,
    startListening,
    stopListening,
    toggleListening,
    speakText,
    stopSpeaking,
    toggleMute,
  };
}
