import React from 'react';

interface PermissionsHeaderProps {
  onSaveChanges: () => void;
}

export const PermissionsHeader: React.FC<PermissionsHeaderProps> = ({ onSaveChanges }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex flex-col justify-start items-start gap-0.5">
        <h1 className="text-white text-3xl font-semibold font-['Inter'] leading-9">
          Permissions
        </h1>
        <p className="text-zinc-500 text-sm font-normal font-['Inter'] leading-6">
          Control what each role can view and manage across your organization.
        </p>
      </div>

      <div className="flex justify-end items-center gap-2">
        <button
          type="button"
          onClick={onSaveChanges}
          className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-start items-center gap-1.5 transition-all text-neutral-800 text-base font-medium font-['Inter'] leading-5 shadow-sm cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};
