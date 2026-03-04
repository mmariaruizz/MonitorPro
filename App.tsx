import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  Users, 
  Activity, 
  ClipboardList, 
  TrendingUp, 
  LogOut,
  Bell
} from 'lucide-react';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import UserManager from './components/UserManager';
import EcgRoom from './components/EcgRoom';
import Questionnaire from './components/Questionnaire';
import PerformanceHub from './components/Performance/PerformanceHub';
import AthleteSelector from './components/AthleteSelector';
import { get_all_users, addUser, updateUser, getInitials } from './database';
import type { User } from './types';

type Page = 'perfil' | 'users' | 'ecg' | 'questionnaire' | 'performance';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [page, setPage] = useState<Page>('perfil');
  const [view, setView] = useState<'login' | 'register'>('login');
  
  const [isEcgActive, setIsEcgActive] = useState(false);
  const [ecgStartTime, setEcgStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (currentUser?.role === 'deportista') setActiveUser(currentUser);
    else if (currentUser?.role === 'entrenador') setActiveUser(null);
  }, [currentUser]);

  const handleLogin = (email: string, password: string, role: 'deportista' | 'entrenador'): { success: boolean, message?: string } => {
    const allUsers = get_all_users();
    const foundUser = allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase() && u.role === role);
    
    if (!foundUser) {
      return { success: false, message: 'Usuario no encontrado.' };
    }
    
    if (foundUser.password !== password) {
      return { success: false, message: 'La contraseña es incorrecta.' };
    }

    setCurrentUser(foundUser);
    return { success: true };
  };

  const handleRegister = (details: { name: string; email: string; role: 'deportista' | 'entrenador'; password?: string; }): boolean => {
    if (get_all_users().some(u => u.email?.toLowerCase() === details.email.toLowerCase())) {
        return false;
    }
    setCurrentUser(addUser(details));
    return true;
  };

  const handleUpdateUser = (updatedUser: User) => {
    updateUser(updatedUser.id, updatedUser);
    if (currentUser?.id === updatedUser.id) setCurrentUser(updatedUser);
    if (activeUser?.id === updatedUser.id) setActiveUser(updatedUser);
  };

  if (!currentUser) {
    return (
      <AnimatePresence mode="wait">
        <motion.div 
          key={view}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {view === 'register' 
              ? <Register onRegister={handleRegister} onNavigateToLogin={() => setView('login')} />
              : <Login onLogin={handleLogin} onNavigateToRegister={() => setView('register')} />}
        </motion.div>
      </AnimatePresence>
    );
  }

  const renderContent = () => {
    if (currentUser.role === 'entrenador' && !activeUser && (page === 'ecg' || page === 'performance')) {
        return (
            <AthleteSelector 
                coach={currentUser} 
                onSelect={setActiveUser} 
                title={page === 'ecg' ? 'Monitorización ECG' : 'Análisis de Rendimiento'} 
            />
        );
    }

    switch (page) {
      case 'perfil': return <Profile user={currentUser} onUpdateUser={handleUpdateUser} />;
      case 'users': return <UserManager currentUser={currentUser} setActiveUser={setActiveUser} />;
      case 'ecg': return <EcgRoom user={activeUser || currentUser} isCoach={currentUser.role === 'entrenador'} sessionState={{isEcgActive, setIsEcgActive, ecgStartTime, setEcgStartTime}} />;
      case 'questionnaire': return <Questionnaire activeUser={activeUser} />;
      case 'performance': return <PerformanceHub activeUser={activeUser} currentUser={currentUser} />;
      default: return <h1>Selecciona una opción</h1>;
    }
  };

  const handleNavClick = (newPage: Page) => {
    setPage(newPage);
    if (currentUser.role === 'entrenador' && (newPage === 'ecg' || newPage === 'performance')) {
        setActiveUser(null);
    }
  };

  const navItems = [
    { id: 'perfil', label: 'Perfil', icon: <UserIcon size={20} /> },
    { id: 'users', label: 'Usuarios', icon: <Users size={20} /> },
    { id: 'ecg', label: 'ECG', icon: <Activity size={20} /> },
    { id: 'questionnaire', label: 'Cuestionarios', icon: <ClipboardList size={20} />, athleteOnly: true },
    { id: 'performance', label: 'Rendimiento', icon: <TrendingUp size={20} /> },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar flex flex-col h-full">
        <div className="sidebar-brand">
          <h2>MonitorPro</h2>
          <div className="brand-dot" />
        </div>

        <div className="user-profile-summary">
          <div className="summary-avatar overflow-hidden border border-white/10">
            {currentUser.profilePic ? (
              <img src={currentUser.profilePic} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              getInitials(currentUser.name)
            )}
          </div>
          <div className="summary-info">
            <p className="summary-name">{currentUser.name}</p>
            <p className="summary-role">{currentUser.role.toUpperCase()}</p>
          </div>
        </div>

        <nav className="flex-grow flex flex-col gap-1 overflow-y-auto pr-2">
          {navItems.map(item => {
            if (item.athleteOnly && currentUser.role !== 'deportista') return null;
            return (
              <a 
                key={item.id}
                onClick={() => handleNavClick(item.id as Page)} 
                className={page === item.id ? 'active' : ''}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="sidebar-footer border-t border-white/5 pt-6 mt-6">
          <button 
            onClick={() => {
              setCurrentUser(null);
              setPage('perfil');
            }} 
            className="logout-button w-full"
            id="logout-btn-sidebar"
          >
            <LogOut size={20} />
            <span>Salir</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-header">
           <div className="header-title">
             <p className="breadcrumb">MonitorPro / {page.charAt(0).toUpperCase() + page.slice(1)}</p>
             <h1>{navItems.find(i => i.id === page)?.label}</h1>
           </div>
           <div className="header-actions">
              {/* Bell removed as requested */}
           </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={page + (activeUser?.id || '')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="page-wrapper"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
