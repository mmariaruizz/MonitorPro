import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Play, Square, Save, Trash2, Activity } from 'lucide-react';
import type { User, EcgSession } from '../types';
import { saveEcgSession } from '../database';

interface EcgRoomProps {
  user: User | null;
  isCoach: boolean;
  sessionState: {
    isEcgActive: boolean;
    setIsEcgActive: (v: boolean) => void;
    ecgStartTime: number | null;
    setEcgStartTime: (t: number | null) => void;
  }
}

const generateEcgDataPoint = (time: number) => {
    const base = Math.sin(time * 2 * Math.PI * 1.2) * 0.2;
    const qrs = Math.sin(time * 1.0 * 2 * Math.PI) > 0.98 ? 1.5 : 0;
    return { time, mv: base + qrs + (Math.random() - 0.5) * 0.1 };
};

const EcgRoom: React.FC<EcgRoomProps> = ({ user, isCoach, sessionState }) => {
    const [ecgData, setEcgData] = useState<any[]>([]);
    const [elapsedTime, setElapsedTime] = useState('00:00:00');
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [lastSessionData, setLastSessionData] = useState<{startTime: number, endTime: number} | null>(null);

    useEffect(() => {
        let interval: any;
        if (sessionState.isEcgActive) {
            interval = setInterval(() => {
                const now = Date.now();
                const diff = now - (sessionState.ecgStartTime || now);
                const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
                const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
                const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
                setElapsedTime(`${h}:${m}:${s}`);
                
                setEcgData(prev => {
                    const last = prev.length > 0 ? prev[prev.length-1].time : 0;
                    return [...prev.slice(-49), generateEcgDataPoint(last + 0.02)];
                });
            }, 50);
        } else {
            setElapsedTime('00:00:00');
            setEcgData([]);
        }
        return () => clearInterval(interval);
    }, [sessionState.isEcgActive, sessionState.ecgStartTime]);

    const handleStart = () => {
        sessionState.setEcgStartTime(Date.now());
        sessionState.setIsEcgActive(true);
    };

    const handleStop = () => {
        const endTime = Date.now();
        const startTime = sessionState.ecgStartTime || endTime;
        
        setLastSessionData({ startTime, endTime });
        sessionState.setIsEcgActive(false);
        sessionState.setEcgStartTime(null);
        setShowSaveModal(true);
    };

    const confirmSaveSession = () => {
        if (lastSessionData && user) {
            const { startTime, endTime } = lastSessionData;
            const durationMs = endTime - startTime;
            const start = new Date(startTime);
            const end = new Date(endTime);
            
            const formatTime = (d: Date) => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
            const formatDate = (d: Date) => d.toISOString().split('T')[0];
            
            const durationMinutes = Math.round(durationMs / 60000);
            const durationStr = durationMinutes >= 60 
                ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}min`
                : `${durationMinutes}min`;

            const avgBpm = Math.floor(Math.random() * (160 - 130) + 130);
            const maxBpm = avgBpm + Math.floor(Math.random() * 30);
            const minBpm = avgBpm - Math.floor(Math.random() * 30);

            const newSession: EcgSession = {
                id: `s-${Date.now()}`,
                athleteId: user.id,
                date: formatDate(start),
                startTime: formatTime(start),
                endTime: formatTime(end),
                duration: durationStr,
                maxBpm,
                minBpm,
                avgBpm,
                dataPoints: []
            };

            saveEcgSession(newSession);
            alert('Sesión guardada correctamente.');
        }
        setShowSaveModal(false);
        setLastSessionData(null);
    };

    const discardSession = () => {
        setShowSaveModal(false);
        setLastSessionData(null);
    };

    if (!user) return <h2 className="text-muted">Selecciona un usuario para monitorizar.</h2>;

    return (
        <div className="ecg-room-container">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Monitorización ECG</h1>
                    <p className="text-muted flex items-center gap-2">
                        <Activity size={16} className="text-accent-primary" />
                        Paciente: <span className="text-white font-medium">{user.name}</span>
                    </p>
                </div>
                
                {!isCoach && (
                    <div className="flex gap-4">
                        {!sessionState.isEcgActive ? (
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-primary flex items-center gap-2" 
                                onClick={handleStart}
                                style={{ background: 'var(--success)', color: 'black' }}
                            >
                                <Play size={20} fill="black" />
                                <span>INICIAR SESIÓN</span>
                            </motion.button>
                        ) : (
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-primary flex items-center gap-2" 
                                onClick={handleStop}
                                style={{ background: 'var(--danger)', color: 'white' }}
                            >
                                <Square size={20} fill="white" />
                                <span>DETENER</span>
                            </motion.button>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-12">
                <div className="glass-card p-6 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <div className="text-center px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-1">Tiempo Transcurrido</p>
                                <div className="text-4xl font-mono text-accent-primary font-bold">{elapsedTime}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${sessionState.isEcgActive ? 'bg-success animate-pulse' : 'bg-muted'}`} />
                            <span className="text-xs font-mono text-muted uppercase tracking-widest">
                                {sessionState.isEcgActive ? 'Live Stream' : 'Standby'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={ecgData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="time" hide />
                                <YAxis domain={[-0.5, 2.0]} hide />
                                <Line 
                                    type="monotone" 
                                    dataKey="mv" 
                                    stroke="var(--accent-primary)" 
                                    strokeWidth={2.5} 
                                    dot={false} 
                                    isAnimationActive={false}
                                    filter="drop-shadow(0 0 8px rgba(0, 242, 255, 0.5))"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="glass-card p-6 flex flex-col justify-center">
                        <h3 className="text-lg mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-accent-secondary" />
                            Frecuencia Cardíaca
                        </h3>
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-mono text-accent-primary font-bold">{sessionState.isEcgActive ? '142' : '--'}</span>
                            <span className="text-muted text-sm mb-2 font-bold uppercase tracking-widest">BPM</span>
                        </div>
                    </div>

                    <div className="glass-card p-6 flex flex-col justify-center">
                        <h3 className="text-lg mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-accent-secondary" />
                            Variabilidad (HRV)
                        </h3>
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-mono text-accent-secondary font-bold">{sessionState.isEcgActive ? '45' : '--'}</span>
                            <span className="text-muted text-sm mb-2 font-bold uppercase tracking-widest">ms</span>
                        </div>
                    </div>

                    <div className="glass-card p-6 flex flex-col justify-center">
                        <h3 className="text-lg mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-accent-secondary" />
                            Calidad de Señal
                        </h3>
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-mono text-success font-bold">{sessionState.isEcgActive ? '98' : '--'}</span>
                            <span className="text-muted text-sm mb-2 font-bold uppercase tracking-widest">%</span>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showSaveModal && (
                    <div className="modal-overlay">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="modal-content max-w-md text-center"
                        >
                            <div className="w-16 h-16 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Save size={32} className="text-accent-primary" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Sesión Finalizada</h2>
                            <p className="text-muted mb-10">¿Deseas guardar los datos de esta sesión en el historial de rendimiento profesional?</p>
                            
                            <div className="flex gap-4">
                                <button className="btn-primary flex-1 flex items-center justify-center gap-2" onClick={confirmSaveSession}>
                                    <Save size={18} />
                                    GUARDAR
                                </button>
                                <button className="edit-btn flex-1 flex items-center justify-center gap-2" onClick={discardSession} style={{ color: 'var(--danger)' }}>
                                    <Trash2 size={18} />
                                    DESCARTAR
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EcgRoom;
