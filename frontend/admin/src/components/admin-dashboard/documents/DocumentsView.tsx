'use client';

import React, { useState, useMemo } from 'react';
import {
  DocumentsHeader,
  DocumentsKPICards,
  DocumentsCategoryGrid,
  DocumentsSearchBar,
  DocumentsTable,
  UploadDocumentModal,
  DocumentPreviewModal,
} from './components';
import { INITIAL_DOCUMENTS, DOCUMENT_CATEGORIES } from './documentsData';
import { DocumentCategory, DocumentItem, DocumentKPIs, DocumentStatus } from './types';
import { CheckCircle, X } from 'lucide-react';

export default function DocumentsView() {
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | 'All'>('All');

  // Modal States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Dynamic KPIs Computation
  const kpis = useMemo<DocumentKPIs>(() => {
    const total = documents.length;
    const valid = documents.filter((d) => d.status === 'Valid').length;
    const expiring = documents.filter((d) => d.status === 'Expiring Soon').length;
    const uniqueCats = new Set(documents.map((d) => d.category)).size;

    return {
      totalDocuments: total,
      validCount: valid,
      expiringSoonCount: expiring,
      categoriesCount: uniqueCats || DOCUMENT_CATEGORIES.length,
    };
  }, [documents]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<DocumentCategory, number> = {
      Compliance: 0,
      Legal: 0,
      Operations: 0,
      HR: 0,
      Contracts: 0,
      Finance: 0,
    };

    documents.forEach((doc) => {
      if (counts[doc.category] !== undefined) {
        counts[doc.category]++;
      }
    });

    return counts;
  }, [documents]);

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || doc.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'All' || doc.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [documents, searchQuery, selectedCategory, selectedStatus]);

  // Handlers
  const handleUploadDocument = (newDocData: Omit<DocumentItem, 'id' | 'date'>) => {
    const newDoc: DocumentItem = {
      ...newDocData,
      id: `doc-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    setDocuments((prev) => [newDoc, ...prev]);
    showToast(`Document "${newDoc.title}" uploaded successfully!`);
  };

  const handleOpenPreview = (doc: DocumentItem) => {
    setPreviewDoc(doc);
    setIsPreviewOpen(true);
  };

  const handleDownload = (doc: DocumentItem) => {
    showToast(`Downloading "${doc.title}"...`);
    // Create a mock blob download
    const element = document.createElement('a');
    const file = new Blob([`Tavonza Hospitality Document: ${doc.title}\nCategory: ${doc.category}\nStatus: ${doc.status}`], {
      type: 'text/plain',
    });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDeleteDocument = (doc: DocumentItem) => {
    if (typeof window !== 'undefined' && window.confirm(`Are you sure you want to delete "${doc.title}"?`)) {
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      showToast(`Document "${doc.title}" deleted.`);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-16 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-[#18191c] border border-amber-500/50 rounded-xl shadow-2xl text-white text-sm flex items-center justify-between gap-3 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Header (Title, Subtitle, Upload Button) */}
      <DocumentsHeader onUploadClick={() => setIsUploadOpen(true)} />

      {/* 2. Top 4 KPI Stat Cards with Gold Border Glow */}
      <DocumentsKPICards kpis={kpis} />

      {/* 3. 6 Category Cards Grid */}
      <DocumentsCategoryGrid
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categoryCounts={categoryCounts}
      />

      {/* 4. Search & Filters Bar */}
      <DocumentsSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        totalCount={documents.length}
      />

      {/* 5. Documents Table */}
      <DocumentsTable
        documents={filteredDocuments}
        onPreview={handleOpenPreview}
        onDownload={handleDownload}
        onDelete={handleDeleteDocument}
      />

      {/* 6. Upload Document Modal matching Screenshot 1 */}
      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUploadDocument}
      />

      {/* 7. Document Preview Modal matching Screenshot 2 */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewDoc(null);
        }}
        onDownload={handleDownload}
      />
    </div>
  );
}
