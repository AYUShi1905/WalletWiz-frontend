import { BrowserRouter as Router, Routes, Route, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Chat from './pages/Chat';
import { LayoutDashboard, ReceiptText, Bot, LogOut, Wallet, Sun, Moon } from 'lucide-react';

const Layout = () => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-zinc-950 text-slate-800 dark:text-slate-100 overflow-x-hidden relative">
      {/* Full-Width Fixed Top Header (Clean boundary to hide scrolled content) */}
      <header className="flex items-center justify-between h-16 px-4 bg-white/95 dark:bg-zinc-950/95 border-x border-b border-slate-200/80 dark:border-zinc-900/80 backdrop-blur-md fixed top-0 left-0 right-0 z-30 max-w-md mx-auto shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-brand-accent p-1.5 rounded-lg text-white shadow-md shadow-brand-accent/20">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-brand-accent to-indigoCustom-300 bg-clip-text text-transparent">
            WalletWiz
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold bg-slate-100 dark:bg-zinc-900 text-slate-650 dark:text-slate-355 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-zinc-800 max-w-[90px] truncate uppercase tracking-wider">
            {user?.first_name || 'My Wallet'}
          </span>
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors active:scale-90"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-700" />}
          </button>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-500 transition-colors active:scale-90"
            title="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Page Area wrapped to fit mobile screen and prevent nav bar clipping */}
      <main className="flex-1 w-full max-w-md mx-auto pt-20 pb-24 px-4 bg-slate-50 dark:bg-brand-dark border-x border-slate-200/80 dark:border-zinc-900/80 min-h-screen">
        <Outlet />
      </main>

      {/* Full-Width Fixed Bottom Navigation Bar (No leaking scroll text below) */}
      <nav className="flex items-center justify-between h-16 bg-white/95 dark:bg-zinc-950/95 border-x border-t border-slate-200/80 dark:border-zinc-900/80 fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto px-10 shadow-lg">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 w-16 h-full text-[9px] font-extrabold transition-all duration-300 active:scale-90 ${
              isActive ? 'text-brand-accent' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </NavLink>

        {/* Highlighted Elevated Center FAB for AI Chat (Stars of the app) */}
        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
          <NavLink
            to="/chat"
            className={({ isActive }) =>
              `absolute -top-5 flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-indigoCustom-400 to-indigoCustom-700 text-white shadow-xl shadow-indigoCustom-500/40 border-4 border-slate-50 dark:border-zinc-950 transition-all duration-300 transform hover:scale-105 active:scale-90 ${
                isActive ? 'ring-2 ring-indigoCustom-500 scale-105' : ''
              }`
            }
          >
            <Bot className="h-6 w-6" />
          </NavLink>
        </div>

        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 w-16 h-full text-[9px] font-extrabold transition-all duration-300 active:scale-90 ${
              isActive ? 'text-brand-accent' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`
          }
        >
          <ReceiptText className="h-5 w-5" />
          <span>History</span>
        </NavLink>
      </nav>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default App;
