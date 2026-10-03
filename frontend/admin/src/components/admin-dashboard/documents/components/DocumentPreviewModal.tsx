'use client';

import React from 'react';
import { X, FileText, Download, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { DocumentItem } from '../types';

interface DocumentPreviewModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (doc: DocumentItem) => void;
}

export default function DocumentPreviewModal({
  document,
  isOpen,
  onClose,
  onDownload,
}: DocumentPreviewModalProps) {
  if (!isOpen || !document) return null;

  const getStatusBadge = (status: DocumentItem['status']) => {
    switch (status) {
      case 'Valid':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-sm font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Valid
          </span>
        );
      case 'Expiring Soon':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-sm font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            Expiring Soon
          </span>
        );
      case 'Expired':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            Expired
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#131417] border border-[#242630] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header with Title, Subtitle & Close button matching Screenshot 2 */}
        <div className="flex items-start justify-between pb-1">
          <div className="space-y-0.5">
            <h2 className="text-white text-lg font-bold font-['Inter']">
              Document Preview
            </h2>
            <p className="text-zinc-500 text-sm font-normal font-['Inter'] truncate max-w-sm">
              {document.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Mini Card with Red File Icon matching Screenshot 2 */}
        <div className="w-full p-4 bg-[#18191d] border border-zinc-800 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 text-red-500">
              <FileText className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="text-white text-base font-bold font-['Inter'] truncate">
                {document.title}
              </h3>
              <span className="text-zinc-500 text-sm font-normal font-['Inter'] mt-0.5">
                {document.size} · {document.fileType || 'PDF'} · {document.date}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0">{getStatusBadge(document.status)}</div>
        </div>

        {/* Center Preview Area matching Screenshot 2 */}
        <div className="h-56 w-full bg-neutral-900/60 rounded-2xl border border-dashed border-zinc-800 flex flex-col items-center justify-center text-center p-6 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-300">
            <FileText className="w-6 h-6 stroke-[1.5]" />
          </div>
          <p className="text-white text-base font-semibold font-['Inter']">
            Preview not available in demo
          </p>
          <button
            type="button"
            onClick={() => onDownload(document)}
            className="text-amber-400 text-sm font-medium hover:underline cursor-pointer"
          >
            Download to view the full document
          </button>
        </div>

        {/* 4 Metadata Info Boxes (2x2 Grid) matching Screenshot 2 */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="p-3 bg-[#18191d] border border-zinc-800/80 rounded-xl flex flex-col">
            <span className="text-zinc-500 text-xs font-medium font-['Inter']">Category</span>
            <span className="text-white text-sm font-semibold font-['Inter'] mt-0.5">
              {document.category}
            </span>
          </div>

          <div className="p-3 bg-[#18191d] border border-zinc-800/80 rounded-xl flex flex-col">
            <span className="text-zinc-500 text-xs font-medium font-['Inter']">Uploaded By</span>
            <span className="text-white text-sm font-semibold font-['Inter'] mt-0.5">
              {document.uploadedBy}
            </span>
          </div>

          <div className="p-3 bg-[#18191d] border border-zinc-800/80 rounded-xl flex flex-col">
            <span className="text-zinc-500 text-xs font-medium font-['Inter']">Upload Date</span>
            <span className="text-white text-sm font-semibold font-['Inter'] mt-0.5">
              {document.date}
            </span>
          </div>

          <div className="p-3 bg-[#18191d] border border-zinc-800/80 rounded-xl flex flex-col">
            <span className="text-zinc-500 text-xs font-medium font-['Inter']">File Size</span>
            <span className="text-white text-sm font-semibold font-['Inter'] mt-0.5">
              {document.size}
            </span>
          </div>
        </div>

        {/* Bottom Action Buttons (Close & Download) matching Screenshot 2 */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-5 bg-neutral-900 border border-neutral-800 text-zinc-300 hover:text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onDownload(document)}
            className="flex-1 py-3 px-6 bg-yellow-500 hover:bg-yellow-400 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-500/20 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
