import React from 'react';
import { motion } from 'motion/react';
import { Users, User as UserIcon, Search, ArrowRight } from 'lucide-react';
import { get_all_users, getInitials } from '../database';
import type { User } from '../types';

interface AthleteSelectorProps {
  coach: User;
  onSelect: (athlete: User) => void;
  title: string;
}

const Avatar = ({ user, size = 60 }: { user: User, size?: number }) => {
    const initials = getInitials(user.name);
    return (
        <div 
            className="avatar-circle flex items-center justify-center overflow-hidden bg-white/5 border border-white/10" 
            style={{ 
                width: size, 
                height: size, 
                fontSize: size * 0.4,
                borderRadius: size * 0.3
            }}
        >
            {user.profilePic ? (
                <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
                <span className="font-bold font-display text-accent-primary">{initials}</span>
            )}
        </div>
    );
};

const AthleteSelector: React.FC<AthleteSelectorProps> = ({ coach, onSelect, title }) => {
  const allUsers = get_all_users();
  const linkedAthletes = allUsers.filter(u => u.role === 'deportista' && coach.athleteIds?.includes(u.id));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
              <h1 className="text-4xl font-bold font-display tracking-tight mb-2">{title}</h1>
              <p className="text-muted">Selecciona un deportista de tu equipo para ver su información detallada.</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
              <Users size={20} className="text-accent-primary" />
              <span className="text-sm font-bold">{linkedAthletes.length} Atletas Vinculados</span>
          </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {linkedAthletes.map((athlete, index) => (
          <motion.div 
            key={athlete.id} 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="glass-card p-6 cursor-pointer group relative overflow-hidden"
            onClick={() => onSelect(athlete)}
          >
            {/* Hover Effect Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
                <Avatar user={athlete} size={100} />
                <h3 className="text-xl font-bold mt-4 group-hover:text-accent-primary transition-colors">{athlete.name}</h3>
                <p className="text-xs text-muted uppercase tracking-widest mt-1">{athlete.sport || 'Especialidad no definida'}</p>
                
                <div className="mt-6 w-full pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-accent-primary opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-xs font-bold uppercase tracking-widest">Ver Perfil</span>
                    <ArrowRight size={14} />
                </div>
            </div>
          </motion.div>
        ))}

        {linkedAthletes.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center glass-card border-dashed border-white/10">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 text-muted">
                <Search size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">No tienes deportistas vinculados</h3>
            <p className="text-muted mb-8 max-w-md text-center">
                Para ver el rendimiento o monitorizar a un atleta, primero debes aceptar su solicitud de vinculación.
            </p>
            <button className="btn-primary px-8">
                Gestionar Solicitudes
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AthleteSelector;
