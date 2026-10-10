import React from 'react';
import { X, ArrowRight, Check } from 'lucide-react';
import { PlanDefinition } from '../types';

interface ChangeSubscriptionModalProps {
  selectedPlan: PlanDefinition;
  currentPlan: PlanDefinition;
  changeStep: 1 | 2 | 3;
  isProcessingChange: boolean;
  onClose: () => void;
  onSetStep: (step: 1 | 2 | 3) => void;
  onConfirm: () => void;
}

export const ChangeSubscriptionModal: React.FC<ChangeSubscriptionModalProps> = ({
  selectedPlan,
  currentPlan,
  changeStep,
  isProcessingChange,
  onClose,
  onSetStep,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-[560px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-800 flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-yellow-400 text-xs font-normal font-sans">
              Change subscription
            </span>
            <h3 className="text-white text-lg font-medium font-sans">
              {changeStep === 1
                ? `${selectedPlan.name} Plan details`
                : 'Confirm your change'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Stepper (1 Details, 2 Confirm, 3 Payment) */}
          <div className="flex items-center justify-between px-2">
            {/* Step 1 Indicator */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`size-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  changeStep >= 1
                    ? 'bg-yellow-400 text-black'
                    : 'border border-zinc-600 text-zinc-600'
                }`}
              >
                1
              </div>
              <span
                className={`text-xs font-normal ${
                  changeStep >= 1 ? 'text-yellow-400' : 'text-neutral-500'
                }`}
              >
                Details
              </span>
            </div>

            <div
              className={`flex-1 h-0.5 mx-3 ${
                changeStep >= 2 ? 'bg-yellow-400' : 'bg-neutral-800'
              }`}
            />

            {/* Step 2 Indicator */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`size-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  changeStep >= 2
                    ? 'bg-yellow-400 text-black'
                    : 'border border-zinc-600 text-zinc-600'
                }`}
              >
                2
              </div>
              <span
                className={`text-xs font-normal ${
                  changeStep >= 2 ? 'text-yellow-400' : 'text-neutral-500'
                }`}
              >
                Confirm
              </span>
            </div>

            <div
              className={`flex-1 h-0.5 mx-3 ${
                changeStep === 3 ? 'bg-yellow-400' : 'bg-neutral-800'
              }`}
            />

            {/* Step 3 Indicator */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`size-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  changeStep === 3
                    ? 'bg-yellow-400 text-black'
                    : 'border border-zinc-600 text-zinc-600'
                }`}
              >
                3
              </div>
              <span className="text-xs font-normal text-neutral-500">
                Payment
              </span>
            </div>
          </div>

          {/* Step 1 Content: Selected Plan Details */}
          {changeStep === 1 && (
            <div className="space-y-4">
              {/* Selected Plan Summary Banner */}
              <div className="px-4 py-3 bg-neutral-800 rounded-lg border border-neutral-800 flex justify-between items-center">
                <div className="flex flex-col gap-0.5">
                  <span className="text-neutral-500 text-xs font-normal">
                    Selected plan
                  </span>
                  <span className="text-white text-lg font-medium">
                    {selectedPlan.name} Plan
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-white text-lg font-medium">
                    $ {selectedPlan.price}
                  </span>
                  <span className="text-neutral-500 text-xs">/month</span>
                </div>
              </div>

              {/* Feature checklist */}
              <div className="space-y-3 pt-1">
                <div className="text-white text-sm font-normal">
                  {selectedPlan.tagline}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {selectedPlan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <div className="size-4 rounded-full border border-green-500 flex items-center justify-center shrink-0">
                        <Check className="size-2.5 text-green-500 stroke-[3]" />
                      </div>
                      <span className="text-neutral-300">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 Content: Comparison & Proration Notice (Exact Figma) */}
          {changeStep === 2 && (
            <div className="space-y-4">
              {/* Before vs After Card Row */}
              <div className="flex items-center justify-between gap-3">
                {/* Current Plan Card */}
                <div className="flex-1 p-3.5 bg-neutral-800 rounded-lg border border-neutral-800 flex flex-col gap-1">
                  <span className="text-neutral-500 text-[10px] font-normal uppercase tracking-wider">
                    Current
                  </span>
                  <span className="text-white text-base font-medium">
                    {currentPlan.name} Plan
                  </span>
                  <span className="text-zinc-400 text-xs font-normal">
                    $ {currentPlan.price}/month
                  </span>
                </div>

                {/* Arrow Divider */}
                <div className="p-2 rounded-full bg-neutral-800 text-white shrink-0">
                  <ArrowRight className="size-4" />
                </div>

                {/* New Plan Card */}
                <div className="flex-1 p-3.5 bg-neutral-800 rounded-lg border border-neutral-800 flex flex-col gap-1">
                  <span className="text-neutral-500 text-[10px] font-normal uppercase tracking-wider">
                    New plan
                  </span>
                  <span className="text-white text-base font-medium">
                    {selectedPlan.name} Plan
                  </span>
                  <span className="text-zinc-400 text-xs font-normal">
                    $ {selectedPlan.price}/month
                  </span>
                </div>
              </div>

              {/* Proration Notice Banner (Exact Figma) */}
              <div className="px-4 py-3 bg-yellow-400/10 rounded-lg border border-yellow-400/20 text-xs text-yellow-400 leading-relaxed">
                <span className="font-semibold">Your new plan starts today. </span>
                <span>
                  A prorated amount will be charged now. Your next full payment is due 15 November 2026.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-end gap-2.5">
          <button
            onClick={() => {
              if (changeStep === 2) {
                onSetStep(1);
              } else {
                onClose();
              }
            }}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {changeStep === 2 ? 'Back' : 'Cancel'}
          </button>

          {changeStep === 1 ? (
            <button
              onClick={() => onSetStep(2)}
              className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-800 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
            >
              <span>Continue</span>
              <ArrowRight className="size-4 text-neutral-800" />
            </button>
          ) : (
            <button
              onClick={onConfirm}
              disabled={isProcessingChange}
              className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-800 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-all active:scale-95 shadow-md disabled:opacity-50"
            >
              <span>{isProcessingChange ? 'Updating plan...' : 'Confirm change'}</span>
              <ArrowRight className="size-4 text-neutral-800" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
