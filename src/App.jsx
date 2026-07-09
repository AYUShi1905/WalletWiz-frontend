import { BrowserRouter as Router, Routes, Route, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Chat from './pages/Chat';
import { LayoutDashboard, ReceiptText, Bot, LogOut, Wallet } from 'lucide-react';

const Layout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-brand-dark text-slate-100 overflow-hidden">
      {/* Mobile Top Header (hidden on desktop) */}
      <header className="flex md:hidden items-center justify-between h-16 px-4 bg-slate-900/60 border-b border-white/10 backdrop-blur-lg fixed top-0 w-full z-30">
        <div className="flex items-center gap-2">
          <div className="bg-brand-accent p-1.5 rounded-lg text-white">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-brand-accent to-cyan-400 bg-clip-text text-transparent">
            WalletWiz
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300 font-semibold bg-white/5 px-2.5 py-1 rounded-full border border-white/10 max-w-[100px] truncate">
            {user?.first_name || 'My Wallet'}
          </span>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar Navigation (hidden on mobile) */}
      <aside className="hidden md:flex w-64 bg-slate-900/60 border-r border-white/10 flex-col justify-between backdrop-blur-lg z-20">
        <div>
          {/* Brand Logo */}
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <div className="bg-brand-accent p-2 rounded-xl text-white shadow-lg shadow-brand-accent/30">
              <Wallet className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-brand-accent to-cyan-400 bg-clip-text text-transparent">
              WalletWiz
            </h2>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-brand-accent/15 text-brand-accent border border-brand-accent/20'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </NavLink>
            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-brand-accent/15 text-brand-accent border border-brand-accent/20'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <ReceiptText className="h-5 w-5" />
              Transactions
            </NavLink>
            <NavLink
              to="/chat"
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-brand-accent/15 text-brand-accent border border-brand-accent/20'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Bot className="h-5 w-5" />
              AI Assistant
            </NavLink>
          </nav>
        </div>

        {/* User Footer Panel */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-slate-950/20">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-xs font-semibold text-slate-300 truncate">
              {user?.first_name || 'My Wallet'}
            </span>
            <span className="text-[10px] text-slate-500 truncate">
              {user?.email || 'user@walletwiz.com'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Main Page Area */}
      <main className="flex-1 overflow-y-auto bg-brand-dark pt-16 pb-16 md:pt-0 md:pb-0 relative">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar (hidden on desktop) */}
      <nav className="flex md:hidden items-center justify-around h-16 bg-slate-900/80 border-t border-white/10 backdrop-blur-lg fixed bottom-0 w-full z-30">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 w-full h-full text-xs font-medium transition-all duration-300 ${
              isActive ? 'text-brand-accent' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 w-full h-full text-xs font-medium transition-all duration-300 ${
              isActive ? 'text-brand-accent' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <ReceiptText className="h-5 w-5" />
          <span>Transactions</span>
        </NavLink>
        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 w-full h-full text-xs font-medium transition-all duration-300 ${
              isActive ? 'text-brand-accent' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Bot className="h-5 w-5" />
          <span>AI Chat</span>
        </NavLink>
      </nav>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes (nested inside layout) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="chat" element={<Chat />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
