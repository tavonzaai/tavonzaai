'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  QrCode,
  DollarSign,
  Printer,
  Users,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Send,
  Split,
  Percent,
} from 'lucide-react';
import { waiterService } from '@/redux/features/waiterApi';

export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface BillCheckoutViewProps {
  tableNumber?: number;
  orderId?: string;
  onBackToFloor?: () => void;
  onShowToast?: (msg: string) => void;
  onCompletePayment?: (tableNumber: number, orderId: string, amount: number) => void;
}

export default function BillCheckoutView({
  tableNumber = 2,
  orderId = '#TAV-2196',
  onBackToFloor,
  onShowToast,
  onCompletePayment,
}: BillCheckoutViewProps) {
  const [selectedTipPercent, setSelectedTipPercent] = useState<number>(18);
  const [customTip, setCustomTip] = useState<string>('');
  const [splitCount, setSplitCount] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'cashier' | 'terminal' | 'qr'>('cashier');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSettled, setIsSettled] = useState<boolean>(false);

  // Items from Figma
  const [items, setItems] = useState<BillItem[]>([
    {
      id: 'b-1',
      name: 'Truffle & Wild Mushroom Crostini',
      quantity: 1,
      price: 18.5,
    },
    {
      id: 'b-2',
      name: 'Truffle & Wild Mushroom Crostini',
      quantity: 1,
      price: 18.5,
    },
    {
      id: 'b-3',
      name: 'Truffle Margherita Pizza',
      quantity: 1,
      price: 22.0,
    },
    {
      id: 'b-4',
      name: 'Artisan Negroni Sbagliato',
      quantity: 2,
      price: 16.0,
    },
  ]);

  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const tax = Number((subtotal * 0.09).toFixed(2)); // 9% tax from Figma
  const tip = customTip ? Number(customTip) || 0 : Number(((subtotal * selectedTipPercent) / 100).toFixed(2));
  const grandTotal = Number((subtotal + tax + tip).toFixed(2));
  const perPersonAmount = Number((grandTotal / splitCount).toFixed(2));

  useEffect(() => {
    let mounted = true;
    const cleanId = (orderId || '').replace(/^#/, '').trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanId);
    if (!isUuid) return;

    waiterService
      .getOrderDetail(cleanId)
      .then((detail) => {
        if (!mounted || !detail) return;
        if (Array.isArray(detail.items) && detail.items.length > 0) {
          setItems(
            detail.items.map((it) => ({
              id: it.id,
              name: it.productName,
              quantity: it.quantity,
              price: it.unitPrice,
            }))
          );
        }
        if (detail.paymentStatus === 'PAID') {
          setIsSettled(true);
        }
      })
      .catch((err) => {
        console.warn('Could not load order detail for bill checkout:', err);
      });

    return () => {
      mounted = false;
    };
  }, [orderId]);

  useEffect(() => {
    const handlePaymentChanged = (e: any) => {
      const payload = e?.detail;
      const cleanId = (orderId || '').replace(/^#/, '').trim();
      if (payload && (payload.orderId === cleanId || payload.orderId === orderId) && payload.status === 'PAID') {
        setIsSettled(true);
        onShowToast?.(`Payment for Table ${tableNumber} has been authoritatively confirmed PAID by Cashier!`);
        onCompletePayment?.(tableNumber, orderId, grandTotal);
      }
    };
    window.addEventListener('tavonza:payment_status_changed', handlePaymentChanged);
    return () => {
      window.removeEventListener('tavonza:payment_status_changed', handlePaymentChanged);
    };
  }, [orderId, tableNumber, grandTotal, onShowToast, onCompletePayment]);

  const handleSendToCashier = async () => {
    setIsProcessing(true);
    try {
      const cleanId = (orderId || '').replace(/^#/, '').trim();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanId);
      
      if (isUuid) {
        await waiterService.requestOfflinePayment({
          orderId: cleanId,
          method: paymentMethod === 'terminal' ? 'CARD' : 'CASH',
          notes: `Requested by Waiter for Table ${tableNumber}`,
        });
        onShowToast?.(
          `Offline payment request for Table ${tableNumber} sent to Cashier Queue! Awaiting cashier receipt confirmation.`
        );
      } else {
        onShowToast?.(
          `Offline payment request for Table ${tableNumber} sent to Cashier Queue! Waiting for settlement authorization.`
        );
      }
    } catch (err: any) {
      onShowToast?.(err?.message || 'Failed to submit payment request to cashier');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessPayment = async () => {
    // Forward directly to authoritative cashier settlement request
    await handleSendToCashier();
  };

  const handlePrintReceipt = () => {
    onShowToast?.(`Itemized receipt sent to Thermal Station Printer for Table ${tableNumber}.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Box (From Figma) */}
      <div className="w-full bg-zinc-900 rounded-[10px] p-5 sm:p-6 border border-zinc-800 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-white text-2xl sm:text-3xl font-semibold font-['Inter'] leading-tight">
              Bill Checkout &amp; Payment For Table {tableNumber}
            </h1>
            {/* 4 Guests Badge (From Figma) */}
            <div className="px-2.5 py-1 bg-amber-500/20 rounded-[5px] border border-neutral-700 flex items-center justify-center">
              <span className="text-amber-500 text-xs font-medium font-['DM_Sans']">
                4 Guests
              </span>
            </div>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm font-normal font-['Inter'] mt-1 leading-relaxed">
            Order id : {orderId}
          </p>
        </div>

        {/* Back to Floor Button (From Figma) */}
        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          <button
            onClick={onBackToFloor}
            className="px-3.5 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 border border-neutral-700 rounded-sm text-xs font-normal font-['Inter'] flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Floor</span>
          </button>
        </div>
      </div>

      {/* Active Client Workflow Amber Banner (From Figma) */}
      <div className="w-full h-auto sm:h-9 px-4 py-2 bg-amber-500/10 rounded-[5px] border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 overflow-hidden">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-amber-500 text-xs font-medium font-['Poppins']">
            Active Client Workflow Mode Send To Cashier Handoff
          </span>
        </div>
        <span className="text-zinc-400 text-[11px] font-normal font-['Poppins'] shrink-0">
          Configurable in Open Dependencies
        </span>
      </div>

      {/* Main Grid: Bill Summary vs Payment Handoff Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Bill Summary Card (From Figma) */}
        <div className="lg:col-span-7 bg-zinc-950 rounded-[10px] border border-zinc-900 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
            <h2 className="text-white text-base font-medium font-['Inter'] leading-6">
              Bill Summary
            </h2>
            <span className="text-amber-500 text-base font-semibold font-['Inter'] font-mono">
              {orderId}
            </span>
          </div>

          {/* Itemized Dish List (From Figma) */}
          <div className="space-y-3 pt-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b border-zinc-900/60"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-white text-xs sm:text-sm font-medium font-['Poppins']">
                    {item.quantity}x {item.name}
                  </span>
                </div>
                <span className="text-white text-xs sm:text-sm font-normal font-['Poppins'] font-mono">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Sub-Card for Breakdown (Subtotal, Tax 9%, Gratuity, Table 2) */}
          <div className="bg-neutral-950 rounded-[10px] border border-zinc-900 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-medium font-['Poppins']">
              <span className="text-neutral-400">Subtotal</span>
              <span className="text-white font-mono">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-xs font-medium font-['Poppins']">
              <span className="text-neutral-400">Tax ( 9% )</span>
              <span className="text-white font-mono">${tax.toFixed(2)}</span>
            </div>

            {/* Gratuity Tip Selection */}
            <div className="pt-2 border-t border-zinc-900 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium font-['Poppins']">
                <span className="text-neutral-400">Gratuity Tip :</span>
                <span className="text-amber-500 font-mono font-bold">${tip.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[15, 18, 20, 25].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => {
                      setSelectedTipPercent(pct);
                      setCustomTip('');
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      selectedTipPercent === pct && !customTip
                        ? 'bg-amber-500 text-black font-semibold'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
                <input
                  type="number"
                  placeholder="Custom $"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  className="w-24 px-2 py-1 bg-zinc-900 text-xs text-white placeholder-zinc-500 rounded border border-zinc-800 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Table Badge & Total Row */}
            <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
              <div className="px-3.5 py-1.5 bg-slate-500/20 rounded-[5px]">
                <span className="text-amber-500 text-sm font-semibold font-['Inter']">
                  Table {tableNumber}
                </span>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-zinc-400 uppercase font-['Inter']">
                  Total Amount Due
                </div>
                <div className="text-amber-500 text-xl sm:text-2xl font-bold font-['DM_Sans'] font-mono">
                  ${grandTotal.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Mode & POS Terminal / QR Handoff */}
        <div className="lg:col-span-5 bg-zinc-950 rounded-[10px] border border-zinc-900 p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
              <h2 className="text-white text-base font-medium font-['Inter'] leading-6">
                Payment Console
              </h2>
              <span className="text-emerald-400 text-xs font-medium font-['DM_Sans'] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                POS Sync Active
              </span>
            </div>

            {/* Split Bill Controls */}
            <div className="bg-zinc-900/70 p-3 rounded-lg border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                  <Split className="w-3.5 h-3.5 text-amber-500" />
                  Split Check
                </span>
                <span className="text-amber-500 font-mono font-semibold">
                  {splitCount > 1 ? `$${perPersonAmount} / guest` : 'Single payer'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => setSplitCount(n)}
                    className={`py-1 rounded text-xs font-medium transition-all ${
                      splitCount === n
                        ? 'bg-amber-500 text-black font-semibold'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {n === 1 ? 'Full' : `${n} Ways`}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-medium font-['Inter']">
                Choose Settlement Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod('cashier')}
                  className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'cashier'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-medium'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span className="text-xs">Cashier Handoff</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('terminal')}
                  className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'terminal'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-medium'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs">Handheld Tap</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('qr')}
                  className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'qr'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-medium'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span className="text-xs">Table QR Pay</span>
                </button>
              </div>
            </div>

            {/* Visual Panel for QR / Terminal */}
            {paymentMethod === 'qr' && (
              <div className="bg-black p-4 rounded-xl border border-zinc-800 flex flex-col items-center text-center space-y-2 animate-in fade-in">
                <div className="w-36 h-36 bg-white p-2 rounded-lg shadow-md flex items-center justify-center">
                  {/* Decorative QR Pattern */}
                  <div className="w-full h-full border-2 border-black flex flex-col justify-between p-1 relative">
                    <div className="flex justify-between">
                      <div className="w-6 h-6 bg-black" />
                      <div className="w-6 h-6 bg-black" />
                    </div>
                    <div className="text-[9px] font-mono text-black font-bold tracking-tighter">
                      SCAN TABLE {tableNumber}
                    </div>
                    <div className="flex justify-between">
                      <div className="w-6 h-6 bg-black" />
                      <div className="w-4 h-4 bg-black" />
                    </div>
                  </div>
                </div>
                <div className="text-xs text-white font-medium">Guest Mobile Pay Link</div>
                <div className="text-[11px] text-zinc-500">
                  Guest points camera to settle via Apple Pay or Card
                </div>
              </div>
            )}

            {paymentMethod === 'terminal' && (
              <div className="bg-black p-4 rounded-xl border border-zinc-800 space-y-2 text-center animate-in fade-in">
                <CreditCard className="w-10 h-10 text-amber-500 mx-auto animate-bounce" />
                <div className="text-white text-xs font-semibold">Ready for Contactless Tap</div>
                <div className="text-[11px] text-zinc-400">
                  Insert or tap EMV Chip / Google Pay on Waiter Terminal #04
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-4 border-t border-zinc-900">
            {paymentMethod === 'cashier' ? (
              <button
                disabled={isProcessing || isSettled}
                onClick={handleSendToCashier}
                className="w-full h-11 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] disabled:opacity-50 rounded-[5px] text-black text-sm font-semibold font-['DM_Sans'] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Send className="w-4 h-4 text-black" />
                <span>
                  {isProcessing ? 'Routing to Cashier...' : 'Send To Cashier Handoff'}
                </span>
              </button>
            ) : (
              <button
                disabled={isProcessing || isSettled}
                onClick={handleProcessPayment}
                className="w-full h-11 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] disabled:opacity-50 rounded-[5px] text-black text-sm font-semibold font-['DM_Sans'] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <DollarSign className="w-4 h-4 text-black" />
                <span>
                  {isProcessing
                    ? 'Processing Authorization...'
                    : isSettled
                    ? 'Payment Settled'
                    : `Charge $${grandTotal.toFixed(2)}`}
                </span>
              </button>
            )}

            <button
              onClick={handlePrintReceipt}
              className="w-full h-9 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 rounded-[5px] text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Itemized Bill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
