import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { PlanDefinition } from '../types';

interface PlanPricingCardsProps {
  plans: PlanDefinition[];
  currentPlanId: string;
  currentPlan: PlanDefinition;
  onOpenPlanModal: (plan: PlanDefinition) => void;
}

export const PlanPricingCards: React.FC<PlanPricingCardsProps> = ({
  plans,
  currentPlanId,
  currentPlan,
  onOpenPlanModal,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-zinc-100 text-xl font-normal font-sans leading-6">
          Choose a plan that fits
        </h2>
        <p className="text-neutral-400 text-sm font-normal font-sans leading-4">
          Upgrade or switch anytime. Changes take effect immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;

          return (
            <div
              key={plan.id}
              className={`p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] flex flex-col justify-between gap-6 transition-all ${
                isCurrent
                  ? 'outline-yellow-400/50 shadow-[0_0_20px_rgba(250,204,21,0.06)]'
                  : 'outline-neutral-800 hover:outline-neutral-700'
              }`}
            >
              {/* Top Plan Header & Pricing */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="text-white text-lg font-semibold font-sans leading-7">
                    {plan.name}
                  </div>
                  <div className="text-gray-400 text-xs font-normal font-sans leading-4 min-h-[32px]">
                    {plan.tagline}
                  </div>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-white text-2xl font-bold font-sans leading-9">
                    $ {plan.price}
                  </span>
                  <span className="text-gray-400 text-xs font-medium font-sans leading-4">
                    / month
                  </span>
                </div>

                {/* Plan Action Button */}
                {isCurrent ? (
                  <div className="w-full px-3 py-2 bg-white/5 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-center items-center gap-1.5 cursor-default">
                    <span className="text-white text-sm font-medium font-sans leading-5">
                      Your current plan
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => onOpenPlanModal(plan)}
                    className="w-full px-3 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-800 text-sm font-semibold font-sans rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-center items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <span>{plan.price > currentPlan.price ? 'Upgrade plan' : 'Choose plan'}</span>
                    <ArrowRight className="size-4 text-neutral-800" />
                  </button>
                )}
              </div>

              {/* Plan Includes Feature List */}
              <div className="flex flex-col gap-3 pt-3 border-t border-neutral-800/80">
                <div className="text-white text-base font-medium font-sans leading-7">
                  Plan includes
                </div>
                <div className="flex flex-col gap-2.5">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="size-4 rounded-full border border-green-500/80 flex items-center justify-center shrink-0">
                        <Check className="size-2.5 text-green-500 stroke-[3]" />
                      </div>
                      <span className="text-neutral-300 text-sm font-normal font-sans leading-4">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
