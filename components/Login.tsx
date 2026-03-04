import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ShieldCheck, ArrowRight, User, Briefcase } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string, role: 'deportista' | 'entrenador') => { success: boolean, message?: string };
  onNavigateToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToRegister }) => {
  const [role, setRole] = useState<'deportista' | 'entrenador'>('deportista');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (email && password) {
      const result = onLogin(email, password, role);
      if (!result.success) {
        setError(result.message || "Error al iniciar sesión.");
      }
    } else {
        setError("Por favor, rellena todos los campos.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-deep relative overflow-hidden">
      {/* Background Accents - More subtle to avoid "superimposed" feel */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-secondary/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] relative z-10"
      >
        <div className="text-center mb-40">
            <motion.div 
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-accent-primary/10 rounded-3xl mb-6 border border-accent-primary/20 shadow-[0_0_30px_rgba(0,242,255,0.1)]"
            >
                <ShieldCheck size={40} className="text-accent-primary" />
            </motion.div>
            <h1 className="text-5xl font-bold font-display tracking-tight mb-3">MonitorPro</h1>
            <p className="text-muted text-lg">Gestión de Alto Rendimiento</p>
        </div>

        <div className="glass-card p-8 md:p-10 border-white/10">
            <div className="text-center mb-20">
                <h2 className="text-2xl font-bold mb-3">Inicia sesión en tu cuenta</h2>
                <label className="text-[10px] text-muted uppercase tracking-widest font-bold block">¿Cómo vas a entrar hoy?</label>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-12">
                <div className="role-selection-grid">
                        <div 
                            className={`role-card ${role === 'deportista' ? 'active' : ''}`}
                            onClick={() => setRole('deportista')}
                        >
                            <div className="role-icon-wrapper">
                                <User size={24} />
                            </div>
                            <h3>Deportista</h3>
                            <p>Accede a tus datos y entrenamientos</p>
                        </div>
                        <div 
                            className={`role-card ${role === 'entrenador' ? 'active' : ''}`}
                            onClick={() => setRole('entrenador')}
                        >
                            <div className="role-icon-wrapper">
                                <Briefcase size={24} />
                            </div>
                            <h3>Entrenador</h3>
                            <p>Gestiona tu equipo y atletas</p>
                        </div>
                    </div>

                <div className="space-y-6">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl text-center font-medium"
                        >
                            {error}
                        </motion.div>
                    )}
                    <div className="field-group">
                        <label className="label-spacing text-[10px] text-muted uppercase tracking-widest font-bold ml-1">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                className="search-input search-input-icon py-4 bg-white/[0.03] border-white/10 focus:border-accent-primary focus:bg-white/[0.06]"
                                required
                            />
                        </div>
                    </div>

                    <div className="field-group">
                        <label className="label-spacing text-[10px] text-muted uppercase tracking-widest font-bold ml-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="search-input search-input-icon py-4 bg-white/[0.03] border-white/10 focus:border-accent-primary focus:bg-white/[0.06]"
                                required
                            />
                        </div>
                    </div>
                </div>

                <button type="submit" className="btn-primary w-full py-4 flex items-center justify-center gap-3 group text-lg shadow-[0_10px_30px_rgba(112,0,255,0.3)] mt-20">
                    <span>Entrar al Panel</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </form>

            <div className="mt-32 pt-8 border-t border-white/5 text-center">
                <p className="text-sm text-muted">
                    ¿Aún no eres parte de MonitorPro? {' '}
                    <button 
                        onClick={onNavigateToRegister}
                        className="text-accent-primary font-bold hover:underline underline-offset-4"
                    >
                        Crea tu cuenta
                    </button>
                </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
