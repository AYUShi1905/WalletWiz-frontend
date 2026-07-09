import { BrowserRouter as Router, Routes, Route, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
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
    <div className="flex flex-col min-h-screen bg-brand-dark text-slate-100 overflow-x-hidden">
      {/* Fixed Mobile Top Header */}
      <header className="flex items-center justify-between h-16 px-4 bg-slate-900/80 border-b border-white/10 backdrop-blur-lg fixed top-0 left-0 right-0 z-30 max-w-md mx-auto">
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
            title="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Page Area wrapped to fit mobile screen and prevent nav bar clipping */}
      <main className="flex-1 w-full max-w-md mx-auto pt-16 pb-20 px-4 bg-brand-dark">
        <Outlet />
      </main>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <nav className="flex items-center justify-around h-16 bg-slate-900/90 border-t border-white/10 backdrop-blur-lg fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 w-full h-full text-xs font-semibold transition-all duration-300 ${
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
            `flex flex-col items-center justify-center gap-1 w-full h-full text-xs font-semibold transition-all duration-300 ${
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
            `flex flex-col items-center justify-center gap-1 w-full h-full text-xs font-semibold transition-all duration-300 ${
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
      <ChatProvider>
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
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
