'use client';

import React, { useState, useEffect } from 'react';
import { DocumentItem } from '../types';
import {
  FileText,
  Eye,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface DocumentsTableProps {
  documents: DocumentItem[];
  onPreview: (doc: DocumentItem) => void;
  onDownload: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
  itemsPerPage?: number;
}

export default function DocumentsTable({
  documents,
  onPreview,
  onDownload,
  onDelete,
  itemsPerPage = 10,
}: DocumentsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever documents array changes (e.g. search/filter)
  useEffect(() => {
    setCurrentPage(1);
  }, [documents.length]);

  const totalPages = Math.ceil(documents.length / itemsPerPage) || 1;

  const paginatedDocs = documents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, documents.length);

  const getStatusBadge = (status: DocumentItem['status']) => {
    switch (status) {
      case 'Valid':
        return (
          <div className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-[5px] inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span className="text-green-500 text-xs font-semibold font-['Inter'] leading-3">
              Valid
            </span>
          </div>
        );
      case 'Expiring Soon':
        return (
          <div className="px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-[5px] inline-flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-yellow-500" />
            <span className="text-yellow-500 text-xs font-semibold font-['Inter'] leading-3">
              Expiring Soon
            </span>
          </div>
        );
      case 'Expired':
        return (
          <div className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-[5px] inline-flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3 text-red-500" />
            <span className="text-red-500 text-xs font-semibold font-['Inter'] leading-3">
              Expired
            </span>
          </div>
        );
    }
  };

  if (documents.length === 0) {
    return (
      <div className="w-full py-16 px-6 bg-stone-950 rounded-[10px] outline outline-1 outline-zinc-800 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-white text-lg font-semibold">No documents found</h3>
          <p className="text-zinc-500 text-sm max-w-sm">
            No files match your search keywords or category filters. Try adjusting your query or upload a new document.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-stone-950 rounded-[10px] outline outline-1 outline-zinc-800 overflow-hidden shadow-2xl flex flex-col justify-between">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[850px]">
          {/* Table Header */}
          <thead>
            <tr className="bg-zinc-900 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] border-b border-zinc-800">
              <th className="py-4 px-6 text-white text-base font-semibold font-['Inter'] leading-5">
                Document
              </th>
              <th className="py-4 px-5 text-white text-base font-semibold font-['Inter'] leading-5">
                Category
              </th>
              <th className="py-4 px-5 text-white text-base font-semibold font-['Inter'] leading-5">
                Size
              </th>
              <th className="py-4 px-5 text-white text-base font-semibold font-['Inter'] leading-5">
                Uploaded By
              </th>
              <th className="py-4 px-5 text-white text-base font-semibold font-['Inter'] leading-5">
                Date
              </th>
              <th className="py-4 px-5 text-white text-base font-semibold font-['Inter'] leading-5">
                Status
              </th>
              <th className="py-4 px-6 text-white text-base font-semibold font-['Inter'] leading-5 text-right">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body (Paginated: 10 per page) */}
          <tbody className="divide-y divide-zinc-800/80">
            {paginatedDocs.map((doc) => (
              <tr
                key={doc.id}
                className="hover:bg-white/[0.02] transition-colors duration-150 group"
              >
                {/* Document Column (Red PDF icon + Title) */}
                <td className="py-3.5 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span
                        onClick={() => onPreview(doc)}
                        className="text-white text-sm sm:text-base font-bold font-['Inter'] leading-4 truncate hover:text-amber-400 cursor-pointer transition-colors"
                        title={doc.title}
                      >
                        {doc.title}
                      </span>
                      {doc.expiryDate && (
                        <span className="text-zinc-500 text-xs font-normal font-['Inter'] mt-0.5">
                          Expires: {doc.expiryDate}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3.5 px-5">
                  <span className="text-white text-sm font-medium font-['Inter'] leading-5">
                    {doc.category}
                  </span>
                </td>

                {/* Size */}
                <td className="py-3.5 px-5">
                  <span className="text-white text-sm font-medium font-['Inter'] leading-5">
                    {doc.size}
                  </span>
                </td>

                {/* Uploaded By */}
                <td className="py-3.5 px-5">
                  <span className="text-white text-sm font-medium font-['Inter'] leading-5">
                    {doc.uploadedBy}
                  </span>
                </td>

                {/* Date */}
                <td className="py-3.5 px-5">
                  <span className="text-white text-sm font-medium font-['Inter'] leading-5">
                    {doc.date}
                  </span>
                </td>

                {/* Status Badge */}
                <td className="py-3.5 px-5">{getStatusBadge(doc.status)}</td>

                {/* Actions */}
                <td className="py-3.5 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* View / Preview */}
                    <button
                      onClick={() => onPreview(doc)}
                      title="Preview Document"
                      className="w-7 h-7 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-slate-800 hover:outline-amber-500/50 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Download */}
                    <button
                      onClick={() => onDownload(doc)}
                      title="Download Document"
                      className="w-7 h-7 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-slate-800 hover:outline-yellow-500/50 hover:bg-yellow-500/10 text-slate-400 hover:text-yellow-400 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(doc)}
                      title="Delete Document"
                      className="w-7 h-7 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-slate-800 hover:outline-rose-500/50 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer (10 items per page) */}
      <div className="py-3.5 px-6 bg-zinc-900/90 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
        <div className="text-zinc-400 text-sm font-medium font-['Inter']">
          Showing <span className="text-white font-semibold">{startIdx}</span> to{' '}
          <span className="text-white font-semibold">{endIdx}</span> of{' '}
          <span className="text-white font-semibold">{documents.length}</span> documents
        </div>

        <div className="flex items-center gap-1.5">
          {/* Previous Page */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-neutral-900 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg text-sm font-semibold flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-yellow-500 text-white font-bold shadow-sm shadow-yellow-500/20'
                    : 'bg-neutral-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Page */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-neutral-900 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
