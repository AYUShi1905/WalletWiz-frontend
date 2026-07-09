import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Plus, Filter, X, Edit2, Trash2, Calendar, 
  ChevronLeft, ChevronRight, Landmark, CreditCard, 
  Banknote, DollarSign, AlertCircle, Loader, CheckCircle2 
} from 'lucide-react';

const CATEGORIES = ["Food & Dining", "Shopping", "Travel & Transport", "Bills & Utilities", "Entertainment", "Health & Medical", "Others"];
const PAYMENT_METHODS = ["Cash", "Card", "UPI"];

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total_pages: 1, total_items: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form Modal State (Bottom Sheet)
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete Modal State
  const [deleteId, setDeleteId] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Fetch Transactions
  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        limit: 10,
      };
      if (categoryFilter) params.category = categoryFilter;
      if (paymentFilter) params.payment_method = paymentFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await api.get('/transactions', { params });
      setTransactions(response.data.data || []);
      setPagination(response.data.pagination || { page: 1, limit: 10, total_pages: 1, total_items: 0 });
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.response?.data?.detail || 'Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, categoryFilter, paymentFilter, startDate, endDate]);

  // Handle Form Submit (Create or Update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !merchant) {
      setFormError('Please enter both merchant and amount.');
      return;
    }

    setFormError('');
    setFormSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        merchant,
        category,
        payment_method: paymentMethod,
        transaction_date: new Date(date).toISOString(),
        description,
      };

      if (editingId) {
        await api.put(`/transactions/${editingId}`, payload);
        showToast('Transaction updated.');
      } else {
        await api.post('/transactions', payload);
        showToast('Transaction logged.');
      }

      closeFormModal();
      fetchTransactions();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to save transaction.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleteSubmitting(true);
    try {
      await api.delete(`/transactions/${deleteId}`);
      showToast('Transaction deleted.');
      setDeleteId(null);
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete transaction.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const openAddModal = () => {
    setEditingId(null);
    setAmount('');
    setMerchant('');
    setCategory(CATEGORIES[0]);
    setPaymentMethod(PAYMENT_METHODS[0]);
    setDate(new Date().toISOString().substring(0, 10));
    setDescription('');
    setFormError('');
    setShowForm(true);
  };

  const openEditModal = (tx) => {
    setEditingId(tx.id);
    setAmount(tx.amount.toString());
    setMerchant(tx.merchant);
    setCategory(tx.category);
    setPaymentMethod(tx.payment_method);
    setDate(new Date(tx.transaction_date).toISOString().substring(0, 10));
    setDescription(tx.description || '');
    setFormError('');
    setShowForm(true);
  };

  const closeFormModal = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const resetFilters = () => {
    setCategoryFilter('');
    setPaymentFilter('');
    setStartDate('');
    setEndDate('');
    setShowFilters(false);
    setCurrentPage(1);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(val || 0);
  };

  const getPaymentIcon = (method) => {
    switch (method?.toUpperCase()) {
      case 'UPI':
        return <Landmark className="h-5 w-5 text-emerald-500" />;
      case 'CARD':
        return <CreditCard className="h-5 w-5 text-indigo-500" />;
      case 'CASH':
      default:
        return <Banknote className="h-5 w-5 text-amber-500" />;
    }
  };

  return (
    <div className="relative min-h-[75vh] space-y-4">
      {/* Success Toast Banner */}
      {successMsg && (
        <div className="fixed top-20 left-4 right-4 z-50 flex items-center gap-2 p-3 bg-emerald-500 text-white rounded-xl shadow-lg border border-emerald-400/20 text-xs font-semibold animate-slide-down">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header with Title and Filter Trigger */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Transactions</h1>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wide uppercase">
            {pagination.total_items} Logs
          </span>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl border text-xs font-semibold transition-all duration-300 active:scale-95 ${
            showFilters || categoryFilter || paymentFilter || startDate || endDate
              ? 'bg-brand-accent/20 border-brand-accent text-brand-accent'
              : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Collapsible Filter Bar */}
      {showFilters && (
        <div className="glassy-card rounded-2xl p-4 space-y-4 shadow-sm dark:shadow-xl animate-fade-in text-slate-800 dark:text-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Filters</h3>
            <button onClick={resetFilters} className="text-[10px] text-brand-accent font-semibold hover:underline">
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category Select */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-2 py-2 text-xs text-slate-700 dark:text-slate-200 focus:border-brand-accent outline-none"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Payment Method Select */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Method</label>
              <select
                value={paymentFilter}
                onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-2 py-2 text-xs text-slate-700 dark:text-slate-200 focus:border-brand-accent outline-none"
              >
                <option value="">All Methods</option>
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>

            {/* Date Filters */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-2 py-2 text-xs text-slate-700 dark:text-slate-200 focus:border-brand-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-2 py-2 text-xs text-slate-700 dark:text-slate-200 focus:border-brand-accent outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Card Feed */}
      {loading && transactions.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="animate-spin h-8 w-8 text-brand-accent" />
        </div>
      ) : error ? (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-2 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-20 text-center space-y-1">
          <p className="text-slate-400 dark:text-slate-500 text-sm">No transaction records found.</p>
          <p className="text-slate-500 dark:text-slate-600 text-xs">Tap the floating plus button to log an expense.</p>
        </div>
      ) : (
        <div className="space-y-3 pb-24">
          {transactions.map((tx) => (
            <div 
              key={tx.id} 
              className="glassy-card rounded-2xl p-4 flex items-center justify-between gap-4 active:scale-[0.98] active:bg-slate-100 dark:active:bg-zinc-800/50 transition-all duration-200 cursor-pointer"
              onClick={() => openEditModal(tx)}
            >
              {/* Left Details */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="bg-slate-100 dark:bg-zinc-850 p-2.5 rounded-xl border border-slate-200/50 dark:border-zinc-800 text-slate-500 dark:text-slate-300 shrink-0">
                  {getPaymentIcon(tx.payment_method)}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-800 dark:text-slate-100 block truncate text-sm">{tx.merchant}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block mt-0.5 uppercase tracking-wider font-semibold">
                    {tx.category} • {new Date(tx.transaction_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>

              {/* Right Side Actions & Value */}
              <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                <div className="text-right">
                  <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm block">-{formatCurrency(tx.amount)}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">{tx.payment_method}</span>
                </div>
                
                {/* Delete button */}
                <button
                  onClick={() => setDeleteId(tx.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors active:scale-90"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Simple Mobile Pagination Controls */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-zinc-800 text-slate-550 dark:text-slate-400">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="flex items-center gap-1 py-2 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>
              <span className="text-xs font-medium">
                Page {currentPage} of {pagination.total_pages}
              </span>
              <button
                disabled={currentPage === pagination.total_pages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.total_pages))}
                className="flex items-center gap-1 py-2 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold active:scale-95"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button (FAB) for adding new transaction */}
      <button
        onClick={openAddModal}
        className="fixed bottom-24 right-4 z-40 bg-gradient-to-tr from-indigoCustom-500 to-indigoCustom-700 p-4 rounded-full text-white shadow-xl shadow-indigoCustom-500/35 hover:scale-105 active:scale-95 transition-all duration-300 border border-indigoCustom-500/20"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Form Bottom Sheet Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end">
          {/* Backdrop Click Closes */}
          <div className="flex-1" onClick={closeFormModal}></div>

          {/* Bottom Sheet Drawer */}
          <div className="bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-900 rounded-t-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-900 mb-5">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {editingId ? 'Edit Transaction' : 'Log Transaction'}
              </h2>
              <button onClick={closeFormModal} className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
              {/* Merchant name */}
              <div>
                <label className="block text-xs font-semibold text-slate-550 dark:text-slate-450 uppercase tracking-wider mb-1.5">Merchant</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starbucks, Pizza Hut"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand-accent outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-550 dark:text-slate-450 uppercase tracking-wider mb-1.5">Amount (INR)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand-accent outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-550 dark:text-slate-450 uppercase tracking-wider mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 focus:border-brand-accent outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-550 dark:text-slate-450 uppercase tracking-wider mb-1.5">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 focus:border-brand-accent outline-none"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>{pm}</option>
                  ))}
                </select>
              </div>

              {/* Transaction Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-550 dark:text-slate-450 uppercase tracking-wider mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand-accent outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-550 dark:text-slate-450 uppercase tracking-wider mb-1.5">Description (Optional)</label>
                <textarea
                  placeholder="Notes about this expense..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-brand-accent outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none"
                ></textarea>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full py-3 bg-brand-accent hover:bg-brand-accent/90 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigoCustom-500/25 flex items-center justify-center gap-2 active:scale-95"
              >
                {formSubmitting && <Loader className="animate-spin h-4 w-4" />}
                {editingId ? 'Save Changes' : 'Log Expense'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Sheet */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end">
          <div className="flex-1" onClick={() => setDeleteId(null)}></div>
          <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-zinc-900 rounded-t-3xl p-6 shadow-2xl animate-slide-up text-slate-800 dark:text-slate-100">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mb-2">Delete Transaction?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">Are you sure you want to delete this record? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="w-1/2 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-305 font-semibold rounded-xl text-xs active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteSubmitting}
                className="w-1/2 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95"
              >
                {deleteSubmitting && <Loader className="animate-spin h-3.5 w-3.5" />}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
