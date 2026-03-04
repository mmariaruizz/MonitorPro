import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, UserPlus, Check, X, Clock, User as UserIcon, Shield } from 'lucide-react';
import { get_all_users, sendCoachRequest, getCoachRequestsForAthlete, getCoachRequestsForCoach, updateCoachRequestStatus, getInitials } from '../database';
import type { User, CoachRequest } from '../types';

interface UserManagerProps {
  currentUser: User;
  setActiveUser: (user: User) => void;
}

const Avatar = ({ user, size = 60 }: { user: User, size?: number }) => {
    const initials = getInitials(user.name);
    return (
        <div 
            className="avatar-circle flex items-center justify-center overflow-hidden bg-white/5" 
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

const UserManager: React.FC<UserManagerProps> = ({ currentUser, setActiveUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<CoachRequest[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [activeNotification, setActiveNotification] = useState<CoachRequest | null>(null);

  useEffect(() => {
    const users = get_all_users();
    setAllUsers(users);
    
    if (currentUser.role === 'deportista') {
        setRequests(getCoachRequestsForAthlete(currentUser.id));
    } else if (currentUser.role === 'entrenador') {
        const coachRequests = getCoachRequestsForCoach(currentUser.id);
        setRequests(coachRequests);
        
        const pending = coachRequests.find(r => r.status === 'pending');
        if (pending) {
            setActiveNotification(pending);
        }
    }
  }, [currentUser.id]);

  const coaches = allUsers.filter(u => u.role === 'entrenador');
  const athletes = allUsers.filter(u => u.role === 'deportista');

  const filteredCoaches = coaches.filter(c => {
    const search = searchTerm.toLowerCase();
    const nameMatch = c.name.toLowerCase().includes(search);
    const specialtyMatch = c.specialty?.toLowerCase().includes(search);
    const combined = `${c.name} ${c.specialty} ${c.age}`.toLowerCase();
    return nameMatch || specialtyMatch || combined.includes(search);
  });

  const isLinked = (id: string) => {
    if (currentUser.role === 'deportista') return currentUser.coachIds?.includes(id);
    return currentUser.athleteIds?.includes(id);
  };

  const hasPendingRequest = (coachId: string) => {
    return requests.some(r => r.coachId === coachId && r.status === 'pending');
  };

  const handleSendRequest = () => {
    if (selectedUser) {
        sendCoachRequest(currentUser.id, selectedUser.id);
        setRequests(getCoachRequestsForAthlete(currentUser.id));
        setShowConfirm(false);
        setSelectedUser(null);
        alert('Solicitud enviada correctamente.');
    }
  };

  const handleRequestAction = (requestId: string, status: 'accepted' | 'rejected') => {
    updateCoachRequestStatus(requestId, status);
    const updatedRequests = getCoachRequestsForCoach(currentUser.id);
    setRequests(updatedRequests);
    setActiveNotification(null);
    setAllUsers(get_all_users());
    alert(status === 'accepted' ? 'Solicitud aceptada' : 'Solicitud denegada');
  };

  if (currentUser.role === 'entrenador') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="user-manager-coach">
        <div className="flex justify-between items-center mb-10">
            <div>
                <h1 className="text-3xl font-bold mb-1">Mis Deportistas</h1>
                <p className="text-muted">Gestiona y monitoriza a tus atletas vinculados.</p>
            </div>
            <button className="btn-primary flex items-center gap-2 relative" onClick={() => setShowRequestsModal(true)}>
                <Bell size={20} />
                <span>Solicitudes</span>
                {requests.filter(r => r.status === 'pending').length > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-danger text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-bg-deep">
                        {requests.filter(r => r.status === 'pending').length}
                    </span>
                )}
            </button>
        </div>

        <AnimatePresence>
            {activeNotification && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="glass-card border-accent-primary/30 mb-10 p-4 flex flex-col md:flex-row justify-between items-center gap-4"
                >
                    <div className="flex items-center gap-4">
                        <Avatar user={allUsers.find(u => u.id === activeNotification.athleteId)!} size={48} />
                        <div>
                            <p className="text-sm">
                                <span className="font-bold text-white">{allUsers.find(u => u.id === activeNotification.athleteId)?.name}</span>
                                <span className="text-muted"> ha solicitado ser su deportista.</span>
                            </p>
                            <p className="text-xs text-accent-primary uppercase tracking-widest mt-1">
                                {allUsers.find(u => u.id === activeNotification.athleteId)?.sport}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleRequestAction(activeNotification.id, 'accepted')} className="btn-primary py-2 px-4 text-xs bg-success text-black shadow-none">Aceptar</button>
                        <button onClick={() => handleRequestAction(activeNotification.id, 'rejected')} className="edit-btn py-2 px-4 text-xs border-danger/30 text-danger">Denegar</button>
                        <button onClick={() => setActiveNotification(null)} className="edit-btn py-2 px-4 text-xs">Más tarde</button>
                        <button onClick={() => setSelectedUser(allUsers.find(u => u.id === activeNotification.athleteId)!)} className="edit-btn py-2 px-4 text-xs border-accent-primary/30 text-accent-primary">Ver Perfil</button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {athletes.filter(a => isLinked(a.id)).map(athlete => (
                <motion.div 
                    key={athlete.id} 
                    whileHover={{ y: -5 }}
                    className="coach-card group cursor-pointer" 
                    onClick={() => {
                        setActiveUser(athlete);
                        alert(`Ahora gestionando a: ${athlete.name}`);
                    }}
                >
                    <div className="flex flex-col items-center text-center">
                        <Avatar user={athlete} size={80} />
                        <h3 className="text-xl font-bold mt-4 group-hover:text-accent-primary transition-colors">{athlete.name}</h3>
                        <p className="text-muted text-sm mt-1 uppercase tracking-widest">{athlete.sport}</p>
                        <div className="mt-6 pt-6 border-t border-white/5 w-full flex justify-around">
                            <div className="text-center">
                                <p className="text-xs text-muted uppercase">Edad</p>
                                <p className="font-mono">{athlete.age || '--'}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-muted uppercase">Sexo</p>
                                <p className="font-mono">{athlete.sex === 'Masculino' ? 'M' : 'F'}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
            {athletes.filter(a => isLinked(a.id)).length === 0 && (
                <div className="col-span-full glass-card p-12 text-center">
                    <UserPlus size={48} className="text-muted mx-auto mb-4 opacity-20" />
                    <p className="text-muted">Aún no tienes deportistas enlazados.</p>
                </div>
            )}
        </div>

        <AnimatePresence>
            {showRequestsModal && (
                <div className="modal-overlay">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="modal-content max-w-2xl w-full"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold">Solicitudes Pendientes</h2>
                            <button className="icon-btn" onClick={() => setShowRequestsModal(false)}><X size={20} /></button>
                        </div>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {requests.filter(r => r.status === 'pending').map(req => {
                                const athlete = allUsers.find(u => u.id === req.athleteId);
                                return (
                                    <div key={req.id} className="glass-card p-4 flex justify-between items-center bg-white/5">
                                        <div className="flex items-center gap-4">
                                            <Avatar user={athlete!} size={48} />
                                            <div>
                                                <p className="font-bold">{athlete?.name}</p>
                                                <p className="text-xs text-muted uppercase tracking-widest">{athlete?.sport}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleRequestAction(req.id, 'accepted')} className="btn-primary py-2 px-4 text-xs bg-success text-black shadow-none">Aceptar</button>
                                            <button onClick={() => handleRequestAction(req.id, 'rejected')} className="edit-btn py-2 px-4 text-xs border-danger/30 text-danger">Rechazar</button>
                                        </div>
                                    </div>
                                );
                            })}
                            {requests.filter(r => r.status === 'pending').length === 0 && (
                                <div className="text-center py-12">
                                    <Clock size={48} className="text-muted mx-auto mb-4 opacity-20" />
                                    <p className="text-muted">No tienes solicitudes pendientes.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {selectedUser && (
                <div className="modal-overlay">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="modal-content max-w-lg w-full text-center"
                    >
                        <button className="absolute top-6 right-6 icon-btn" onClick={() => setSelectedUser(null)}><X size={20} /></button>
                        <div className="flex flex-col items-center">
                            <Avatar user={selectedUser} size={120} />
                            <h2 className="text-3xl font-bold mt-6">{selectedUser.name}</h2>
                            <p className="text-accent-primary uppercase tracking-[0.2em] text-sm mt-2">
                                {selectedUser.role === 'entrenador' ? selectedUser.specialty : selectedUser.sport}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 w-full mt-10 text-left">
                                <div className="glass-card p-4 bg-white/5">
                                    <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Email</p>
                                    <p className="text-sm truncate">{selectedUser.email}</p>
                                </div>
                                <div className="glass-card p-4 bg-white/5">
                                    <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Edad</p>
                                    <p className="text-sm">{selectedUser.age} años</p>
                                </div>
                                <div className="glass-card p-4 bg-white/5">
                                    <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Sexo</p>
                                    <p className="text-sm">{selectedUser.sex}</p>
                                </div>
                                {selectedUser.role === 'deportista' && (
                                    <div className="glass-card p-4 bg-white/5">
                                        <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Club</p>
                                        <p className="text-sm">{selectedUser.club || 'N/A'}</p>
                                    </div>
                                )}
                            </div>

                            {activeNotification?.athleteId === selectedUser.id && (
                                <div className="flex gap-4 w-full mt-10">
                                    <button onClick={() => handleRequestAction(activeNotification.id, 'accepted')} className="btn-primary flex-1 bg-success text-black">Aceptar</button>
                                    <button onClick={() => handleRequestAction(activeNotification.id, 'rejected')} className="edit-btn flex-1 border-danger text-danger">Denegar</button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="user-manager-athlete">
        <section className="mb-16">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-1">Mis Entrenadores</h1>
                <p className="text-muted">Tus mentores y guías de entrenamiento vinculados.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {coaches.filter(c => isLinked(c.id)).map(coach => (
                    <motion.div 
                        key={coach.id} 
                        whileHover={{ y: -5 }}
                        className="coach-card linked group cursor-pointer" 
                        onClick={() => setSelectedUser(coach)}
                    >
                        <div className="flex flex-col items-center text-center">
                            <Avatar user={coach} size={80} />
                            <h3 className="text-xl font-bold mt-4 group-hover:text-accent-primary transition-colors">{coach.name}</h3>
                            <p className="text-muted text-sm mt-1 uppercase tracking-widest">{coach.specialty}</p>
                            <div className="mt-4 px-3 py-1 bg-accent-primary/10 rounded-full">
                                <span className="text-[10px] text-accent-primary font-bold uppercase tracking-widest">Vinculado</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {coaches.filter(c => isLinked(c.id)).length === 0 && (
                    <div className="col-span-full glass-card p-12 text-center border-dashed">
                        <Shield size={48} className="text-muted mx-auto mb-4 opacity-20" />
                        <p className="text-muted">Aún no tienes entrenadores enlazados.</p>
                    </div>
                )}
            </div>
        </section>

        <section className="search-coaches">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-1">Explorar Entrenadores</h1>
                <p className="text-muted">Encuentra al profesional perfecto para tu especialidad.</p>
            </div>
            
            <div className="relative mb-10">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={20} />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre, especialidad o experiencia..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input search-input-icon w-full py-4"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCoaches.filter(c => !isLinked(c.id)).map(coach => (
                    <motion.div 
                        key={coach.id} 
                        whileHover={{ y: -5 }}
                        className="coach-card group cursor-pointer" 
                        onClick={() => setSelectedUser(coach)}
                    >
                        <div className="flex flex-col items-center text-center">
                            <Avatar user={coach} size={80} />
                            <h3 className="text-xl font-bold mt-4 group-hover:text-accent-primary transition-colors">{coach.name}</h3>
                            <p className="text-muted text-sm mt-1 uppercase tracking-widest">{coach.specialty}</p>
                            {hasPendingRequest(coach.id) && (
                                <div className="mt-4 px-3 py-1 bg-warning/10 rounded-full flex items-center gap-2">
                                    <Clock size={12} className="text-warning" />
                                    <span className="text-[10px] text-warning font-bold uppercase tracking-widest">Pendiente</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>

        <AnimatePresence>
            {selectedUser && (
                <div className="modal-overlay">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="modal-content max-w-lg w-full text-center"
                    >
                        <button className="absolute top-6 right-6 icon-btn" onClick={() => setSelectedUser(null)}><X size={20} /></button>
                        <div className="flex flex-col items-center">
                            <Avatar user={selectedUser} size={120} />
                            <h2 className="text-3xl font-bold mt-6">{selectedUser.name}</h2>
                            <p className="text-accent-primary uppercase tracking-[0.2em] text-sm mt-2">{selectedUser.specialty}</p>
                            
                            <div className="grid grid-cols-2 gap-4 w-full mt-10 text-left">
                                <div className="glass-card p-4 bg-white/5">
                                    <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Email</p>
                                    <p className="text-sm truncate">{selectedUser.email}</p>
                                </div>
                                <div className="glass-card p-4 bg-white/5">
                                    <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Edad</p>
                                    <p className="text-sm">{selectedUser.age} años</p>
                                </div>
                                <div className="glass-card p-4 bg-white/5">
                                    <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Sexo</p>
                                    <p className="text-sm">{selectedUser.sex}</p>
                                </div>
                                <div className="glass-card p-4 bg-white/5">
                                    <p className="text-[10px] text-muted uppercase tracking-widest mb-1">Especialidad</p>
                                    <p className="text-sm">{selectedUser.specialty}</p>
                                </div>
                            </div>

                            {!isLinked(selectedUser.id) && !hasPendingRequest(selectedUser.id) && (
                                <button className="btn-primary w-full mt-10 flex items-center justify-center gap-2" onClick={() => setShowConfirm(true)}>
                                    <UserPlus size={20} />
                                    Solicitar ser su deportista
                                </button>
                            )}
                            {hasPendingRequest(selectedUser.id) && (
                                <div className="w-full mt-10 p-4 bg-warning/10 rounded-2xl border border-warning/20">
                                    <p className="text-warning text-sm font-medium">Solicitud enviada y pendiente de aprobación.</p>
                                </div>
                            )}
                            {isLinked(selectedUser.id) && (
                                <div className="w-full mt-10 p-4 bg-success/10 rounded-2xl border border-success/20 flex items-center justify-center gap-2">
                                    <Check size={20} className="text-success" />
                                    <p className="text-success text-sm font-medium">Ya estás enlazado con este entrenador.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {showConfirm && (
                <div className="modal-overlay" style={{zIndex: 1100}}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="modal-content max-w-sm text-center"
                    >
                        <div className="w-16 h-16 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <UserPlus size={32} className="text-accent-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Confirmar Solicitud</h3>
                        <p className="text-muted mb-8">¿Estás seguro de que quieres solicitar ser deportista de <span className="text-white font-medium">{selectedUser?.name}</span>?</p>
                        <div className="flex gap-4">
                            <button onClick={handleSendRequest} className="btn-primary flex-1">Sí, solicitar</button>
                            <button onClick={() => setShowConfirm(false)} className="edit-btn flex-1">Cancelar</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </motion.div>
  );
};

export default UserManager;
