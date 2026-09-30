'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export interface DraggableAskAiProps {
  /** Optional custom click callback (e.g. for modal ask AI query). Defaults to router.push('/jarvis') */
  onClick?: () => void;
  /** Initial distance from bottom in px (default: 24) */
  defaultBottom?: number;
  /** Initial distance from right in px (default: 24) */
  defaultRight?: number;
  /** Additional custom classes */
  className?: string;
  /** Storage key to persist drag position across navigation */
  storageKey?: string;
  /** Button label (default: 'Ask AI') */
  label?: string;
}

export default function DraggableAskAi({
  onClick,
  defaultBottom = 24,
  defaultRight = 24,
  className = '',
  storageKey = 'draggable_ask_ai_pos',
  label = 'Ask AI',
}: DraggableAskAiProps) {
  const router = useRouter();
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Drag tracking refs
  const dragInfoRef = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
    elemStartX: 0,
    elemStartY: 0,
    hasMoved: false,
  });

  const justDraggedRef = useRef(false);

  // 1. Initial position setup & restore from sessionStorage if available
  useEffect(() => {
    const computeDefault = () => {
      const btnW = btnRef.current?.offsetWidth || 115;
      const btnH = btnRef.current?.offsetHeight || 44;
      const x = Math.max(12, window.innerWidth - btnW - defaultRight);
      const y = Math.max(12, window.innerHeight - btnH - defaultBottom);
      return { x, y };
    };

    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
            const btnW = btnRef.current?.offsetWidth || 115;
            const btnH = btnRef.current?.offsetHeight || 44;
            const clampedX = Math.max(12, Math.min(parsed.x, window.innerWidth - btnW - 12));
            const clampedY = Math.max(12, Math.min(parsed.y, window.innerHeight - btnH - 12));
            setPosition({ x: clampedX, y: clampedY });
            return;
          }
        }
      } catch {
        // Ignore JSON error
      }

      setPosition(computeDefault());
    }
  }, [defaultBottom, defaultRight, storageKey]);

  // 2. Clamp on viewport resize (desktop resizing or mobile rotation)
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return prev;
        const btnW = btnRef.current?.offsetWidth || 115;
        const btnH = btnRef.current?.offsetHeight || 44;
        const clampedX = Math.max(12, Math.min(prev.x, window.innerWidth - btnW - 12));
        const clampedY = Math.max(12, Math.min(prev.y, window.innerHeight - btnH - 12));
        return { x: clampedX, y: clampedY };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3. Pointer move & up handlers attached to window while dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    // Only primary button (left click) or touch
    if (e.button !== 0) return;

    const btn = btnRef.current;
    if (!btn) return;

    const currentX =
      position?.x ?? Math.max(12, window.innerWidth - btn.offsetWidth - defaultRight);
    const currentY =
      position?.y ?? Math.max(12, window.innerHeight - btn.offsetHeight - defaultBottom);

    dragInfoRef.current = {
      isDown: true,
      startX: e.clientX,
      startY: e.clientY,
      elemStartX: currentX,
      elemStartY: currentY,
      hasMoved: false,
    };

    // Try pointer capture on button
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if not supported
    }

    const onPointerMove = (moveEv: PointerEvent) => {
      if (!dragInfoRef.current.isDown) return;

      const deltaX = moveEv.clientX - dragInfoRef.current.startX;
      const deltaY = moveEv.clientY - dragInfoRef.current.startY;
      const dist = Math.hypot(deltaX, deltaY);

      // Threshold to distinguish click vs drag (5px)
      if (dist > 5) {
        if (!dragInfoRef.current.hasMoved) {
          dragInfoRef.current.hasMoved = true;
          justDraggedRef.current = true;
          setIsDragging(true);
        }

        const btnW = btnRef.current?.offsetWidth || 115;
        const btnH = btnRef.current?.offsetHeight || 44;
        const minX = 12;
        const maxX = Math.max(minX, window.innerWidth - btnW - 12);
        const minY = 12;
        const maxY = Math.max(minY, window.innerHeight - btnH - 12);

        // Allow movement in all directions: above (Y-), bottom (Y+), left (X-), right (X+)
        const targetX = Math.max(minX, Math.min(dragInfoRef.current.elemStartX + deltaX, maxX));
        const targetY = Math.max(minY, Math.min(dragInfoRef.current.elemStartY + deltaY, maxY));

        setPosition({ x: targetX, y: targetY });
      }
    };

    const onPointerUp = (upEv: PointerEvent) => {
      if (!dragInfoRef.current.isDown) return;

      const hadMoved = dragInfoRef.current.hasMoved;
      dragInfoRef.current.isDown = false;
      setIsDragging(false);

      try {
        btn.releasePointerCapture(upEv.pointerId);
      } catch {
        // Ignore
      }

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      if (hadMoved) {
        // Prevent click trigger
        justDraggedRef.current = true;
        setTimeout(() => {
          justDraggedRef.current = false;
        }, 120);

        // Save position to sessionStorage
        setPosition((currentPos) => {
          if (currentPos && typeof window !== 'undefined') {
            try {
              sessionStorage.setItem(storageKey, JSON.stringify(currentPos));
            } catch {
              // Ignore
            }
          }
          return currentPos;
        });
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  const handleClick = (e: React.MouseEvent) => {
    // If it was just dragged, ignore click
    if (justDraggedRef.current || dragInfoRef.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (onClick) {
      onClick();
    } else {
      router.push('/chat');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        transform: position
          ? `translate3d(${position.x}px, ${position.y}px, 0)`
          : undefined,
        bottom: position ? undefined : `${defaultBottom}px`,
        right: position ? undefined : `${defaultRight}px`,
        zIndex: 9999,
        touchAction: 'none',
        userSelect: 'none',
      }}
      className="pointer-events-auto"
    >
      <button
        ref={btnRef}
        type="button"
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        aria-label="Ask AI assistant (drag anywhere on screen)"
        title="Drag in any direction (up, down, left, right) to move. Tap to Ask AI."
        className={`px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-500 text-neutral-950 text-sm font-semibold font-dm-sans rounded-full border border-amber-400/50 flex items-center gap-2 select-none touch-none ${
          isDragging
            ? 'scale-105 shadow-[0px_16px_36px_rgba(245,158,11,0.65)] ring-2 ring-white/50 cursor-grabbing'
            : 'shadow-[0px_8px_24px_rgba(0,0,0,0.35)] hover:shadow-[0px_12px_28px_rgba(245,158,11,0.5)] hover:scale-105 cursor-grab active:scale-95 transition-transform transition-shadow duration-200'
        } ${className}`}
        style={{
          touchAction: 'none',
        }}
      >
        <Sparkles className="w-4 h-4 text-black fill-black shrink-0" />
        <span className="font-semibold tracking-tight">{label}</span>
      </button>
    </div>
  );
}
