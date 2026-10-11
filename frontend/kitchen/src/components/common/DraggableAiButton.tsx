'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export interface DraggableAiButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  defaultBottom?: number;
  defaultRight?: number;
  storageKey?: string;
  label?: string;
  openLabel?: string;
  className?: string;
}

export default function DraggableAiButton({
  isOpen,
  onToggle,
  defaultBottom = 24,
  defaultRight = 24,
  storageKey = 'kitchen_ask_ai_pos',
  label = 'Ask AI',
  openLabel = 'Close AI',
  className = '',
}: DraggableAiButtonProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragInfoRef = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
    elemStartX: 0,
    elemStartY: 0,
    hasMoved: false,
  });

  const justDraggedRef = useRef(false);

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

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
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

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    const onPointerMove = (moveEv: PointerEvent) => {
      if (!dragInfoRef.current.isDown) return;

      const deltaX = moveEv.clientX - dragInfoRef.current.startX;
      const deltaY = moveEv.clientY - dragInfoRef.current.startY;
      const dist = Math.hypot(deltaX, deltaY);

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
        justDraggedRef.current = true;
        setTimeout(() => {
          justDraggedRef.current = false;
        }, 150);

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
    if (justDraggedRef.current || dragInfoRef.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onToggle();
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
        aria-label={isOpen ? openLabel : label}
        title="Drag anywhere on screen. Tap to toggle AI Assistant."
        className={`px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-neutral-950 font-semibold text-xs sm:text-sm rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.6)] border border-yellow-300/60 flex items-center gap-2 select-none touch-none transition-all duration-200 group font-sans ${
          isDragging
            ? 'scale-105 shadow-[0px_16px_36px_rgba(250,204,21,0.65)] ring-2 ring-white/60 cursor-grabbing'
            : 'hover:shadow-yellow-400/20 cursor-grab hover:scale-105'
        } ${className}`}
        style={{
          touchAction: 'none',
        }}
      >
        <Sparkles className="w-4 h-4 text-black group-hover:rotate-12 transition-transform duration-200 shrink-0" />
        <span className="font-semibold tracking-tight">{isOpen ? openLabel : label}</span>
      </button>
    </div>
  );
}
