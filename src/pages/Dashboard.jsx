import { useState, useEffect } from 'react';
import api from '../services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, DollarSign, Calendar, Landmark, CreditCard, Banknote, Receipt, AlertCircle, Loader } from 'lucide-react';

// Custom Chart Colors (Indigo, Violet, Rose, Amber, Emerald, Cyan, Slate)
const CHART_COLORS = ['#6366F1', '#8B5CF6', '#F43F5E', '#F59E0B', '#10B981', '#06B6D4', '#64748B'];

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState('this-month');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/analytics/dashboard', {
          params: { timeframe },
        });
        setData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.detail || 'Failed to load dashboard analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeframe]);

  // Helper to format currency values
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  // Helper to format dates
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Get icon for payment methods
  const getPaymentIcon = (method) => {
    switch (method?.toUpperCase()) {
      case 'UPI':
        return <Landmark className="h-4 w-4 text-emerald-400" />;
      case 'CARD':
        return <CreditCard className="h-4 w-4 text-indigo-400" />;
      case 'CASH':
      default:
        return <Banknote className="h-4 w-4 text-amber-400" />;
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader className="animate-spin h-8 w-8 text-brand-accent" />
      </div>
    );
  }

  // Defensive parsing for chart details (handling total_amount vs amount)
  const categoryData = (data?.by_category || []).map((item) => ({
    name: item.category,
    value: item.total_amount ?? item.amount ?? 0,
    percentage: item.percentage || 0,
  }));

  const paymentData = (data?.by_payment_method || []).map((item) => ({
    name: item.payment_method,
    value: item.total_amount ?? item.amount ?? 0,
    percentage: item.percentage || 0,
  }));

  const trendData = (data?.daily_trend || []).map((item) => ({
    date: formatDate(item.date),
    amount: item.amount || 0,
  }));

  return (
    <div className="space-y-5">
      {/* Timeframe Selector & Title */}
      <div className="space-y-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100">Analytics</h1>
          <p className="text-slate-400 text-xs mt-0.5">Track your spending trends and summaries.</p>
        </div>

        {/* Horizontal Scroll Pill Toggles */}
        <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/5 w-full justify-between">
          {[
            { value: 'this-month', label: 'This Month' },
            { value: 'last-30-days', label: '30 Days' },
            { value: 'this-year', label: 'This Year' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setTimeframe(item.value)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 text-center ${
                timeframe === item.value
                  ? 'bg-brand-accent text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Cards Stacks (Single Column) */}
      <div className="space-y-3">
        {/* Total Spent Card */}
        <div className="relative overflow-hidden backdrop-blur-md bg-slate-900/40 border border-white/5 rounded-2xl p-5 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Spent</span>
            <span className="text-2xl font-extrabold text-slate-100 block mt-1">
              {formatCurrency(data?.total_spent)}
            </span>
          </div>
          <div className="bg-brand-accent/15 p-3.5 rounded-xl text-brand-accent border border-brand-accent/10">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Daily Average Card */}
        <div className="relative overflow-hidden backdrop-blur-md bg-slate-900/40 border border-white/5 rounded-2xl p-5 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daily Average</span>
            <span className="text-2xl font-extrabold text-slate-100 block mt-1">
              {formatCurrency(data?.daily_average)}
            </span>
          </div>
          <div className="bg-violet-500/10 p-3.5 rounded-xl text-violet-400 border border-violet-500/10">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Daily Spending Trend Area Chart */}
      <div className="backdrop-blur-md bg-slate-900/40 border border-white/5 rounded-2xl p-4 shadow-md">
        <div className="flex items-center gap-1.5 mb-3">
          <Calendar className="h-4 w-4 text-brand-accent" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Spending Trend</h3>
        </div>
        <div className="h-[200px] w-full">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '9px' }}
                  itemStyle={{ color: '#fff', fontSize: '11px' }}
                  formatter={(value) => [formatCurrency(value), 'Spent']}
                />
                <Area type="monotone" dataKey="amount" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-[10px]">No daily trend records.</div>
          )}
        </div>
      </div>

      {/* Spending by Category Donut Chart */}
      <div className="backdrop-blur-md bg-slate-900/40 border border-white/5 rounded-2xl p-4 shadow-md">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">By Category</h3>
        <div className="h-[220px] w-full flex flex-col justify-center">
          {categoryData.length > 0 ? (
            <>
              <div className="h-[130px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={40}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff', fontSize: '11px' }}
                      formatter={(value) => [formatCurrency(value), '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Custom Legend */}
              <div className="mt-3 grid grid-cols-2 gap-1.5 max-h-[70px] overflow-y-auto pr-1">
                {categoryData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></span>
                    <span className="truncate">{item.name} ({item.percentage}%)</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-[10px]">No category records.</div>
          )}
        </div>
      </div>

      {/* Spending by Payment Method Bar Chart */}
      <div className="backdrop-blur-md bg-slate-900/40 border border-white/5 rounded-2xl p-4 shadow-md">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">By Payment Method</h3>
        <div className="h-[180px] w-full">
          {paymentData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '11px' }}
                  formatter={(value) => [formatCurrency(value), 'Total']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 1) % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-[10px]">No payment records.</div>
          )}
        </div>
      </div>

      {/* Recent Transactions Mobile List */}
      <div className="backdrop-blur-md bg-slate-900/40 border border-white/5 rounded-2xl p-4 shadow-md">
        <div className="flex items-center gap-1.5 mb-3">
          <Receipt className="h-4 w-4 text-brand-accent" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-white/5 overflow-hidden">
          {data?.recent_transactions && data.recent_transactions.length > 0 ? (
            data.recent_transactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3 text-xs first:pt-0 last:pb-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-slate-400 shrink-0">
                    {getPaymentIcon(tx.payment_method)}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-200 block truncate">{tx.merchant}</span>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      {tx.category} • {formatDate(tx.transaction_date)}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-extrabold text-slate-200 block">
                    - {formatCurrency(tx.amount)}
                  </span>
                  <span className="text-[9px] text-slate-500 block font-semibold uppercase mt-0.5">
                    {tx.payment_method}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-slate-500 text-[10px]">No transactions logged.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
