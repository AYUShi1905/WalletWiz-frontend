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
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-brand-dark text-slate-800 dark:text-slate-100 overflow-x-hidden">
      {/* Fixed Mobile Top Header */}
      <header className="flex items-center justify-between h-16 px-4 bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-white/5 backdrop-blur-lg fixed top-0 left-0 right-0 z-30 max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-brand-accent p-1.5 rounded-lg text-white">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-brand-accent to-cyanCustom-300 bg-clip-text text-transparent">
            WalletWiz
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold bg-slate-900/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-white/5 max-w-[90px] truncate uppercase tracking-wider">
            {user?.first_name || 'My Wallet'}
          </span>
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-700" />}
          </button>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
            title="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Page Area wrapped to fit mobile screen and prevent nav bar clipping */}
      <main className="flex-1 w-full max-w-md mx-auto pt-24 pb-24 px-4 bg-slate-50 dark:bg-brand-dark">
        <Outlet />
      </main>

      {/* Fixed Mobile Bottom Navigation Bar with Center Floating Chat FAB */}
      <nav className="flex items-center justify-between h-16 bg-white/95 dark:bg-slate-950/90 border-t border-slate-200 dark:border-white/5 backdrop-blur-lg fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto px-8">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 w-20 h-full text-[10px] font-extrabold transition-all duration-300 ${
              isActive ? 'text-brand-accent' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </NavLink>

        {/* Floating AI Chat button in center */}
        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
          <NavLink
            to="/chat"
            className={({ isActive }) =>
              `absolute -top-5 flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-cyanCustom-500 to-cyanCustom-800 text-white shadow-xl shadow-cyanCustom-500/30 border-4 border-slate-50 dark:border-brand-dark transition-all duration-300 transform active:scale-95 ${
                isActive ? 'ring-2 ring-cyanCustom-500 scale-105' : 'hover:scale-105'
              }`
            }
          >
            <Bot className="h-6 w-6" />
          </NavLink>
        </div>

        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 w-20 h-full text-[10px] font-extrabold transition-all duration-300 ${
              isActive ? 'text-brand-accent' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`
          }
        >
          <ReceiptText className="h-5 w-5" />
          <span>Transactions</span>
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
