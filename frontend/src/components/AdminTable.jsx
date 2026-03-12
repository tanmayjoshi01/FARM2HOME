import React from 'react';
import { AlertTriangle, Trash2, Edit } from 'lucide-react';

// A reusable table component for the Admin Dashboard
const AdminTable = ({ 
  title, 
  columns, 
  data, 
  onDelete, 
  onAction,
  actionLabel, 
  actionIcon, 
  actionColor = 'amber'
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
        </div>
        No {title.toLowerCase()} found in the system.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
      <div className="p-6 border-b border-gray-50">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50 border-b border-gray-100">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-6 py-4">{col.label}</th>
              ))}
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                {columns.map((col, i) => (
                  <td key={i} className="px-6 py-4">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  {onAction && actionLabel && (
                    <button 
                      onClick={() => onAction(row)}
                      className={`text-${actionColor}-600 hover:text-${actionColor}-800 hover:bg-${actionColor}-50 p-2 rounded-lg transition-colors`}
                      title={actionLabel}
                    >
                      {actionIcon || <Edit className="w-4 h-4" />}
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      onClick={() => onDelete(row.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTable;
