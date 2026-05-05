import React from 'react';
import { Badge } from './Badge';

export const DataTable = () => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-slate-200 dark:border-slate-800">
          <th className="py-4 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Student Name</th>
          <th className="py-4 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Class</th>
          <th className="py-4 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider">Status</th>
          <th className="py-4 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider text-right">Action</th>
        </tr>
      </thead>
      <tbody>
        {[
          { name: 'Alice Freeman', cls: 'Grade 10 - A', status: 'Paid', type: 'success' },
          { name: 'Bobby Singer', cls: 'Grade 10 - B', status: 'Pending', type: 'warning' },
          { name: 'Charlie Davis', cls: 'Grade 11 - A', status: 'Overdue', type: 'danger' },
          { name: 'Diana Prince', cls: 'Grade 12 - Sci', status: 'Paid', type: 'success' },
        ].map((row, i) => (
          <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
            <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200 text-sm">{row.name}</td>
            <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-sm font-medium">{row.cls}</td>
            <td className="py-4 px-4">
              <Badge type={row.type}>{row.status}</Badge>
            </td>
            <td className="py-4 px-4 text-right">
              <button className="text-sky-500 hover:text-sky-700 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">View Details</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
