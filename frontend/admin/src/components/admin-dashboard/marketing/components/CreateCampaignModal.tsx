'use client';

import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Mail, Send, AlertCircle } from 'lucide-react';
import { CampaignChannel, CampaignStatus, CreateCampaignFormData } from '../types';
import { AUDIENCE_OPTIONS } from '../marketingData';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCampaign: (formData: CreateCampaignFormData) => void;
}

export default function CreateCampaignModal({
  isOpen,
  onClose,
  onCreateCampaign,
}: CreateCampaignModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState<CampaignChannel>('SMS');
  const [targetAudience, setTargetAudience] = useState('All Customers');
  const [messageContent, setMessageContent] = useState('');
  const [launchStatus, setLaunchStatus] = useState<CampaignStatus>('Draft'); // Matches screenshot default
  const [errorMsg, setErrorMsg] = useState('');

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCampaignName('');
      setCampaignType('SMS');
      setTargetAudience('All Customers');
      setMessageContent('');
      setLaunchStatus('Draft');
      setErrorMsg('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Validation handlers
  const handleStep1Next = () => {
    if (!campaignName.trim()) {
      setErrorMsg('Please enter a campaign name.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleStep2Next = () => {
    if (!targetAudience) {
      setErrorMsg('Please select a target audience.');
      return;
    }
    setErrorMsg('');
    setStep(3);
  };

  const handleFinalSubmit = () => {
    if (!messageContent.trim()) {
      setErrorMsg('Please write your campaign message.');
      return;
    }

    onCreateCampaign({
      name: campaignName.trim(),
      channel: campaignType,
      targetAudience,
      messageContent: messageContent.trim(),
      status: launchStatus,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Container - stopPropagation prevents clicks inside the modal from closing it */}
      <div
        className="relative w-full max-w-[620px] bg-[#18191c] rounded-[20px] border border-[#272932] shadow-2xl overflow-hidden z-10 flex flex-col justify-start items-start"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="self-stretch px-7 py-5 border-b border-[#242630] flex justify-between items-center bg-[#151619]">
          <div className="flex flex-col justify-start items-start">
            <h2 className="text-white text-xl font-bold font-['Plus_Jakarta_Sans',sans-serif] leading-6 tracking-tight">
              Create Campaign
            </h2>
            {/* Step Progress indicators */}
            <div className="pt-2 flex items-center gap-2">
              <div
                className={`w-7 h-1.5 rounded-full transition-colors ${
                  step >= 1 ? 'bg-yellow-500' : 'bg-[#2c2f3a]'
                }`}
              />
              <div
                className={`w-7 h-1.5 rounded-full transition-colors ${
                  step >= 2 ? 'bg-yellow-500' : 'bg-[#2c2f3a]'
                }`}
              />
              <div
                className={`w-7 h-1.5 rounded-full transition-colors ${
                  step === 3 ? 'bg-yellow-500' : 'bg-[#2c2f3a]'
                }`}
              />
              <span className="text-[#6b7280] text-sm font-normal font-['Inter'] leading-4 pl-1">
                Step {step} of 3
              </span>
            </div>
          </div>

          {/* Close button with yellow cross */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-transparent border border-[#2c2f3a] hover:border-yellow-500/50 hover:bg-white/5 flex items-center justify-center text-yellow-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-yellow-500 stroke-[2.5]" />
          </button>
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="w-full px-7 pt-4">
            <div className="px-3.5 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* ================= STEP 1: CAMPAIGN BASICS ================= */}
        {step === 1 && (
          <div className="self-stretch p-7 flex flex-col justify-start items-start space-y-6">
            <div className="self-stretch space-y-4">
              <h3 className="text-white text-base font-semibold font-['Inter'] leading-5">
                Campaign Basics
              </h3>

              {/* Campaign Name Field */}
              <div className="space-y-1.5 w-full">
                <label className="text-[#9ca3af] text-sm font-medium font-['Inter'] leading-4 block">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => {
                    setCampaignName(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="e.g. Summer Flash Sale"
                  className="w-full h-11 px-4 py-3 bg-[#1b1c20] border border-[#2c2f3a] focus:border-amber-500 rounded-xl text-white placeholder-[#525766] text-base font-normal font-['Inter'] transition-all outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleStep1Next();
                    }
                  }}
                />
              </div>

              {/* Campaign Type Selector */}
              <div className="space-y-2 w-full pt-1">
                <label className="text-[#9ca3af] text-sm font-medium font-['Inter'] leading-4 block">
                  Campaign Type
                </label>
                <div className="grid grid-cols-3 gap-3 w-full">
                  {/* SMS */}
                  <button
                    type="button"
                    onClick={() => setCampaignType('SMS')}
                    className={`py-4 px-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      campaignType === 'SMS'
                        ? 'bg-[#202232] border-[#3b4369] text-white shadow-md'
                        : 'bg-transparent border-[#242630] text-[#6b7280] hover:text-[#9ca3af] hover:border-[#353846]'
                    }`}
                  >
                    <MessageSquare
                      className={`w-5 h-5 ${
                        campaignType === 'SMS' ? 'text-white' : 'text-[#6b7280]'
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold font-['Inter'] leading-4 ${
                        campaignType === 'SMS' ? 'text-white' : 'text-[#6b7280]'
                      }`}
                    >
                      SMS
                    </span>
                  </button>

                  {/* Email */}
                  <button
                    type="button"
                    onClick={() => setCampaignType('Email')}
                    className={`py-4 px-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      campaignType === 'Email'
                        ? 'bg-[#202232] border-[#3b4369] text-white shadow-md'
                        : 'bg-transparent border-[#242630] text-[#6b7280] hover:text-[#9ca3af] hover:border-[#353846]'
                    }`}
                  >
                    <Mail
                      className={`w-5 h-5 ${
                        campaignType === 'Email' ? 'text-white' : 'text-[#6b7280]'
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold font-['Inter'] leading-4 ${
                        campaignType === 'Email' ? 'text-white' : 'text-[#6b7280]'
                      }`}
                    >
                      Email
                    </span>
                  </button>

                  {/* Push */}
                  <button
                    type="button"
                    onClick={() => setCampaignType('Push')}
                    className={`py-4 px-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      campaignType === 'Push'
                        ? 'bg-[#202232] border-[#3b4369] text-white shadow-md'
                        : 'bg-transparent border-[#242630] text-[#6b7280] hover:text-[#9ca3af] hover:border-[#353846]'
                    }`}
                  >
                    <Send
                      className={`w-5 h-5 ${
                        campaignType === 'Push' ? 'text-white' : 'text-[#6b7280]'
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold font-['Inter'] leading-4 ${
                        campaignType === 'Push' ? 'text-white' : 'text-[#6b7280]'
                      }`}
                    >
                      Push
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Next Button */}
            <div className="self-stretch pt-2">
              <button
                type="button"
                onClick={handleStep1Next}
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 active:scale-[0.99] rounded-xl text-white text-base font-bold font-['Inter'] leading-5 flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-yellow-500/20"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: TARGET AUDIENCE ================= */}
        {step === 2 && (
          <div className="self-stretch p-7 flex flex-col justify-start items-start space-y-6">
            <div className="self-stretch space-y-3">
              <h3 className="text-white text-base font-semibold font-['Inter'] leading-5">
                Target Audience
              </h3>

              {/* Audience Grid - 2 columns x 3 rows matching Screenshot */}
              <div className="grid grid-cols-2 gap-3 w-full pt-1">
                {AUDIENCE_OPTIONS.map((aud) => {
                  const isSelected = targetAudience === aud.name;
                  return (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => setTargetAudience(aud.name)}
                      className={`py-3.5 px-4 rounded-xl border flex items-center justify-start text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2e2612] border-[#71551b] text-white shadow-sm'
                          : 'bg-transparent border-[#242630] text-[#6b7280] hover:text-[#9ca3af] hover:border-[#353846]'
                      }`}
                    >
                      <span
                        className={`text-sm font-medium font-['Inter'] leading-4 ${
                          isSelected ? 'text-white font-semibold' : 'text-[#6b7280]'
                        }`}
                      >
                        {aud.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Back and Next buttons */}
            <div className="self-stretch pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3.5 bg-[#1a1b20] border border-[#2c2f3a] hover:bg-[#22242c] text-[#8e95a5] hover:text-white rounded-xl text-base font-semibold font-['Inter'] leading-5 transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleStep2Next}
                className="flex-1 py-3.5 bg-yellow-500 hover:bg-yellow-400 active:scale-[0.99] rounded-xl text-white text-base font-bold font-['Inter'] leading-5 flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-yellow-500/20"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: MESSAGE CONTENT ================= */}
        {step === 3 && (
          <div className="self-stretch p-7 flex flex-col justify-start items-start space-y-6">
            <div className="self-stretch space-y-4">
              <h3 className="text-white text-base font-semibold font-['Inter'] leading-5">
                Message Content
              </h3>

              {/* Message Field */}
              <div className="space-y-1.5 w-full">
                <label className="text-[#9ca3af] text-sm font-medium font-['Inter'] leading-4 block">
                  Campaign Message *
                </label>

                <textarea
                  value={messageContent}
                  onChange={(e) => {
                    setMessageContent(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  rows={4}
                  placeholder="Write your campaign message here..."
                  className="w-full p-4 bg-[#1b1c20] border border-[#2c2f3a] focus:border-amber-500 rounded-xl text-white placeholder-[#525766] text-base font-normal font-['Inter'] leading-relaxed resize-none transition-all outline-none min-h-[110px]"
                  autoFocus
                />

                <div className="pt-0.5">
                  <span className="text-[#6b7280] text-sm font-normal font-['Inter']">
                    {messageContent.length} / 160 characters
                  </span>
                </div>
              </div>

              {/* Launch Status */}
              <div className="space-y-2 w-full pt-1">
                <label className="text-[#9ca3af] text-sm font-medium font-['Inter'] leading-4 block">
                  Launch Status
                </label>
                <div className="grid grid-cols-2 gap-3 w-full">
                  {/* Save as Draft */}
                  <button
                    type="button"
                    onClick={() => setLaunchStatus('Draft')}
                    className={`py-3 px-4 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      launchStatus === 'Draft'
                        ? 'bg-[#28292e] border-[#383a42] text-white font-semibold'
                        : 'bg-transparent border-[#242630] text-[#6b7280] hover:text-[#9ca3af] hover:border-[#353846]'
                    }`}
                  >
                    <span className="text-sm leading-4 font-semibold">Save as Draft</span>
                  </button>

                  {/* Launch Now */}
                  <button
                    type="button"
                    onClick={() => setLaunchStatus('Active')}
                    className={`py-3 px-4 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      launchStatus === 'Active'
                        ? 'bg-[#28292e] border-[#383a42] text-white font-semibold'
                        : 'bg-transparent border-[#242630] text-[#6b7280] hover:text-[#9ca3af] hover:border-[#353846]'
                    }`}
                  >
                    <span className="text-sm leading-4 font-semibold">Launch Now</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Back and Submit buttons */}
            <div className="self-stretch pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3.5 bg-[#1a1b20] border border-[#2c2f3a] hover:bg-[#22242c] text-[#8e95a5] hover:text-white rounded-xl text-base font-semibold font-['Inter'] leading-5 transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="flex-1 py-3.5 bg-yellow-500 hover:bg-yellow-400 active:scale-[0.99] rounded-xl text-white text-base font-bold font-['Inter'] leading-5 flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-yellow-500/20"
              >
                Create Campaign
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
