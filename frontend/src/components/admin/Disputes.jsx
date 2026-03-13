import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { AlertTriangle, CheckCircle, Clock, Loader, RefreshCw } from 'lucide-react';

const statusCfg = {
  open:          { color: 'bg-red-100 text-red-700 border-red-200',       icon: <AlertTriangle className="w-3.5 h-3.5" />, label: 'Open'          },
  investigating: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Clock className="w-3.5 h-3.5" />,         label: 'Investigating' },
  resolved:      { color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="w-3.5 h-3.5" />,    label: 'Resolved'      },
};

const Disputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await API.get('/disputes');
      setDisputes(res.data || []);
    } catch (e) {
      console.error(e);
      showToast('Failed to load disputes.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchDisputes(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/disputes/${id}/status`, { status });
      setDisputes(prev => prev.map(d => d.id === id ? { ...d, status } : d));
      showToast(status === 'resolved' ? '✅ Dispute resolved.' : '🔍 Marked as investigating.');
    } catch { showToast('Failed to update dispute status.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Dispute Monitoring</h1>
          <p className="text-gray-500 text-sm mt-1">Review and resolve buyer-farmer disputes</p>
        </div>
        <button onClick={fetchDisputes} className="flex items-center gap-2 text-sm font-bold text-green-700 border border-green-200 px-4 py-2 rounded-xl hover:bg-green-50 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader className="w-10 h-10 animate-spin text-green-600" /></div>
      ) : disputes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No disputes filed</h3>
          <p className="text-gray-500 text-sm mt-1">The marketplace is running smoothly!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] text-gray-400 uppercase tracking-wider bg-gray-50 border-b">
                <tr>
                  {['Dispute ID','Auction','Buyer','Farmer','Issue','Status','Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {disputes.map(d => {
                  const s = statusCfg[d.status] || statusCfg.open;
                  return (
                    <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">D-{String(d.id).padStart(4,'0')}</td>
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">{d.auction_id ? `#${d.auction_id}` : '—'}</td>
                      <td className="px-5 py-3 font-semibold text-gray-900">{d.buyer_name}</td>
                      <td className="px-5 py-3 font-semibold text-gray-700">{d.farmer_name}</td>
                      <td className="px-5 py-3 text-gray-600 max-w-[200px] truncate" title={d.description || d.issue_type}>
                        {d.issue_type}{d.description ? ` — ${d.description}` : ''}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${s.color}`}>
                          {s.icon} {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          {d.status === 'open' && (
                            <button onClick={() => updateStatus(d.id, 'investigating')}
                              className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors">
                              Investigate
                            </button>
                          )}
                          {d.status !== 'resolved' && (
                            <button onClick={() => updateStatus(d.id, 'resolved')}
                              className="text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
                              Resolve
                            </button>
                          )}
                          {d.status === 'resolved' && (
                            <span className="text-xs text-gray-400 font-medium py-1.5">Closed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
            {disputes.length} dispute{disputes.length !== 1 ? 's' : ''} total
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl font-bold z-50">{toast}</div>}
    </div>
  );
};

export default Disputes;
