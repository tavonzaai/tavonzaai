import React from 'react';

export const SubscriptionHeader: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-3">
          <h1 className="text-white text-3xl font-semibold font-sans leading-9">
            Subscription &amp; Billing
          </h1>
        </div>
        <p className="text-zinc-500 text-sm font-normal font-sans leading-6">
          Manage your plan, monitor usage and access your billing documents.
        </p>
      </div>

      {/* Subscription Active Badge (Exact Figma) */}
      <div className="flex items-center">
        <div className="px-3.5 py-2.5 bg-green-500/10 rounded-md outline outline-1 outline-offset-[-1px] outline-green-700/70 flex justify-center items-center gap-2">
          <div className="size-2.5 bg-green-500 rounded-full animate-pulse" />
          <div className="text-green-500 text-sm font-medium font-sans leading-4">
            Subscription Active
          </div>
        </div>
      </div>
    </div>
  );
};
