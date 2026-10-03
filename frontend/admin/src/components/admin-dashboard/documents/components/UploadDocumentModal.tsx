'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, ChevronDown, Check, FileText } from 'lucide-react';
import { DocumentCategory, DocumentItem } from '../types';
import { DOCUMENT_CATEGORIES } from '../documentsData';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (newDoc: Omit<DocumentItem, 'id' | 'date'>) => void;
}

export default function UploadDocumentModal({
  isOpen,
  onClose,
  onUpload,
}: UploadDocumentModalProps) {
  const [docName, setDocName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('Operations');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      if (!docName) {
        setDocName(file.name.replace(/\.[^/.]+$/, ''));
      }
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${mb} MB`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFileName(file.name);
      if (!docName) {
        setDocName(file.name.replace(/\.[^/.]+$/, ''));
      }
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${mb} MB`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = docName.trim() || selectedFileName || 'Untitled Document';
    onUpload({
      title: finalName,
      category: selectedCategory,
      size: fileSize || '1.8 MB',
      uploadedBy: 'Admin User',
      status: 'Valid',
      fileType: 'PDF',
      expiryDate: 'Jul 10, 2026',
    });
    // Reset
    setDocName('');
    setSelectedFileName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#131417] border border-[#242630] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header with Title & Close (X) button */}
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-white text-xl font-bold font-['Inter']">
            Upload Document
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drag & Drop Zone matching Screenshot 1 */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full py-9 px-6 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'bg-yellow-500/10 border-yellow-500 scale-[1.01]'
                : 'bg-black/30 border-zinc-600/80 hover:border-zinc-500 hover:bg-white/[0.02]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.docx,.xlsx,.png,.jpg"
            />
            <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 flex items-center justify-center text-zinc-300 mb-3 shadow-inner">
              <Upload className="w-6 h-6 stroke-[1.75]" />
            </div>
            <p className="text-white text-base font-semibold font-['Inter']">
              {selectedFileName || 'Drag & drop or click to upload'}
            </p>
            <p className="text-zinc-500 text-sm font-normal font-['Inter'] mt-1">
              PDF, DOCX, XLSX, PNG — up to 20MB
            </p>
          </div>

          {/* Document Title input */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 text-sm font-semibold font-['Inter'] block">
              Document Name
            </label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. Health & Safety Certificate 2025"
              className="w-full h-11 px-4 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Category Dropdown matching Screenshot 1 */}
          <div className="space-y-1.5 relative">
            <label className="text-zinc-400 text-sm font-semibold font-['Inter'] block">
              Category
            </label>
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full h-11 px-4 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm font-medium flex items-center justify-between cursor-pointer hover:border-zinc-700 transition-colors"
            >
              <span>{selectedCategory}</span>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Custom Dropdown Menu with Yellow Active Highlight matching Screenshot 1 */}
            {isCategoryOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#16171a] border border-zinc-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {DOCUMENT_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-sm text-left font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-yellow-500 text-white'
                          : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{cat}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Action Buttons (Cancel & Upload) matching Screenshot 1 */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-5 bg-neutral-900 border border-neutral-800 text-zinc-300 hover:text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-6 bg-yellow-500 hover:bg-yellow-400 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-yellow-500/20 cursor-pointer active:scale-95"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
