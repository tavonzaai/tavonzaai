import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { TableItem } from '../types';

interface BranchTablesTabProps {
  tables: TableItem[];
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  totalCapacity: number;
  onViewQr: (table: TableItem) => void;
  onEditTable: (table: TableItem) => void;
  onDeleteTable: (table: TableItem) => void;
}

export const BranchTablesTab: React.FC<BranchTablesTabProps> = ({
  tables,
  totalTables,
  availableTables,
  occupiedTables,
  totalCapacity,
  onViewQr,
  onEditTable,
  onDeleteTable,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Row of 4 Metric Cards matching Tables snippet: Total tables (5), Available (3), Occupied (1), Total capacity (24) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total tables */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
          <div className="self-stretch flex justify-between items-center">
            <span className="text-white text-lg font-semibold font-['Inter']">
              Total tables
            </span>
          </div>
          <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
              {totalTables}
            </span>
          </div>
        </div>

        {/* Available */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
          <div className="self-stretch flex justify-between items-center">
            <span className="text-white text-lg font-semibold font-['Inter']">
              Available
            </span>
          </div>
          <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
              {availableTables}
            </span>
          </div>
        </div>

        {/* Occupied */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
          <div className="self-stretch flex justify-between items-center">
            <span className="text-white text-lg font-semibold font-['Inter']">
              Occupied
            </span>
          </div>
          <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
              {occupiedTables}
            </span>
          </div>
        </div>

        {/* Total capacity */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
          <div className="self-stretch flex justify-between items-center">
            <span className="text-white text-lg font-semibold font-['Inter']">
              Total capacity
            </span>
          </div>
          <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
              {totalCapacity}
            </span>
          </div>
        </div>
      </div>

      {/* Tables Table matching exact columns: Table number, Capacity, Status, QR Code, Action */}
      <div className="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-neutral-900/50 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-900 border-b border-zinc-800">
              <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5">
                Table number
              </th>
              <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5">
                Capacity
              </th>
              <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5 text-center">
                Status
              </th>
              <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5 text-center">
                QR Code
              </th>
              <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5 text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {tables.map((table) => {
              return (
                <tr key={table.id} className="hover:bg-zinc-900/40 transition-colors">
                  {/* Table Number */}
                  <td className="px-5 py-4 text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                    {table.number}
                  </td>

                  {/* Capacity */}
                  <td className="px-5 py-4 text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                    {table.capacity} guests
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`inline-flex px-3 py-1.5 rounded-md text-sm font-medium font-['Inter'] leading-4 ${
                        table.status === 'Available'
                          ? 'bg-green-500/10 text-green-500'
                          : table.status === 'Occupied'
                          ? 'bg-orange-400/10 text-orange-400'
                          : 'bg-blue-500/10 text-blue-500'
                      }`}
                    >
                      {table.status}
                    </span>
                  </td>

                  {/* View QR Code */}
                  <td className="px-5 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => onViewQr(table)}
                      className="text-yellow-500 hover:text-yellow-400 text-base font-medium font-['Inter'] leading-4 transition-colors underline-offset-4 hover:underline cursor-pointer"
                    >
                      View QR Code
                    </button>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => onEditTable(table)}
                        className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        title="Edit Table"
                      >
                        <Pencil className="size-3.5 stroke-[2]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTable(table)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        title="Delete Table"
                      >
                        <Trash2 className="size-3.5 stroke-[2]" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
