import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ChevronLeft, FileSpreadsheet, Activity, BarChart3, TrendingUp, Edit3, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { User, EcgSession } from '../../types';
import { ECG_SESSIONS, updateEcgSession } from '../../database';

interface Props { 
    athlete: User; 
    currentUser: User;
    onBack: () => void; 
}

const EcgPerformance: React.FC<Props> = ({ athlete, currentUser, onBack }) => {
    const [view, setView] = useState<'menu' | 'datos' | 'graficas' | 'todas_menu' | 'graficas_ecg' | 'histograma' | 'general'>('menu');
    const [editingObs, setEditingObs] = useState<{id: string, text: string} | null>(null);
    
    const sessions = [...ECG_SESSIONS].filter(s => s.athleteId === athlete.id).sort((a, b) => b.date.localeCompare(a.date));

    const handleExportExcel = () => {
        const exportData = sessions.map(s => ({
            'Fecha': s.date,
            'Horario': `${s.startTime}-${s.endTime}`,
            'Duración': s.duration,
            'BPM Máximo': s.maxBpm,
            'BPM Mínimo': s.minBpm,
            'BPM Promedio': s.avgBpm,
            'Observaciones Entrenador': s.coachObservations || 'Sin observaciones',
            'Observaciones Deportista': s.athleteObservations || 'Sin observaciones',
            'Fecha Obs. Deportista': s.athleteObservationTimestamp || 'N/A'
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "ECG Sessions");
        XLSX.writeFile(workbook, `ECG_Report_${athlete.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleSaveObservation = () => {
        if (editingObs) {
            const now = new Date();
            const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
            
            if (currentUser.role === 'deportista') {
                updateEcgSession(editingObs.id, { 
                    athleteObservations: editingObs.text,
                    athleteObservationTimestamp: timestamp
                });
            } else {
                updateEcgSession(editingObs.id, { 
                    coachObservations: editingObs.text 
                });
            }
            setEditingObs(null);
        }
    };

    const formatDateDisplay = (s: EcgSession) => {
        const dateParts = s.date.split('-');
        const shortDate = `${dateParts[0].slice(-2)}/${dateParts[1]}/${dateParts[2]}`;
        return `${shortDate} de ${s.startTime}-${s.endTime} duración ${s.duration}`;
    };

    const getMockEcgWave = () => {
        return Array.from({length: 100}, (_, i) => ({
            time: i,
            mv: Math.sin(i * 0.3) * 0.15 + (i % 20 === 0 ? 1.4 : 0) + (Math.random() - 0.5) * 0.05
        }));
    };

    const renderMenu = () => (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
            <button onClick={onBack} className="edit-btn flex items-center gap-2 mb-8">
                <ChevronLeft size={18} />
                Atrás
            </button>
            <div className="huge-buttons-grid">
                <motion.div whileHover={{y: -5}} className="huge-button group" onClick={() => setView('datos')}>
                    <div className="w-16 h-16 bg-accent-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent-primary/20 transition-colors">
                        <FileSpreadsheet size={32} className="text-accent-primary" />
                    </div>
                    <h2>DATOS</h2>
                    <p>Informes técnicos profesionales de cada sesión.</p>
                </motion.div>
                <motion.div whileHover={{y: -5}} className="huge-button group" onClick={() => setView('graficas')}>
                    <div className="w-16 h-16 bg-accent-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent-secondary/20 transition-colors">
                        <BarChart3 size={32} className="text-accent-secondary" />
                    </div>
                    <h2>GRÁFICAS</h2>
                    <p>Visualización histórica y resumen de tendencias.</p>
                </motion.div>
            </div>
        </motion.div>
    );

    const renderDatos = () => (
        <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} className="report-container">
            <div className="flex justify-between items-center mb-8">
                <button onClick={() => setView('menu')} className="edit-btn flex items-center gap-2">
                    <ChevronLeft size={18} />
                    Atrás
                </button>
                <button onClick={handleExportExcel} className="btn-primary flex items-center gap-2" style={{background: 'var(--success)', color: 'black'}}>
                    <FileSpreadsheet size={18} />
                    Exportar Excel
                </button>
            </div>
            <h2 className="text-2xl mb-6">Informe Profesional de Sesiones ECG</h2>
            <div className="overflow-x-auto">
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>FECHA/HORA</th>
                            <th>BPM Máx</th>
                            <th>BPM Mín</th>
                            <th>BPM Promedio</th>
                            <th>Obs. Entrenador</th>
                            <th>Obs. Deportista</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map(s => (
                            <tr key={s.id}>
                                <td className="font-mono text-sm">{formatDateDisplay(s)}</td>
                                <td className="text-danger font-bold">{s.maxBpm}</td>
                                <td className="text-accent-primary font-bold">{s.minBpm}</td>
                                <td className="font-bold">{s.avgBpm}</td>
                                <td>
                                    {editingObs?.id === s.id && currentUser.role === 'entrenador' ? (
                                        <div className="flex flex-col gap-2">
                                            <textarea 
                                                value={editingObs.text} 
                                                onChange={(e) => setEditingObs({...editingObs, text: e.target.value})}
                                                className="search-input w-full min-h-[80px]"
                                            />
                                            <button onClick={handleSaveObservation} className="btn-primary text-xs py-2">Guardar</button>
                                        </div>
                                    ) : (
                                        <div className="text-sm">
                                            <p className={s.coachObservations ? 'text-white' : 'text-muted italic'}>
                                                {s.coachObservations || 'Sin observaciones'}
                                            </p>
                                            {currentUser.role === 'entrenador' && (
                                                <button 
                                                    onClick={() => setEditingObs({id: s.id, text: s.coachObservations || ''})} 
                                                    className="text-accent-primary text-xs mt-2 flex items-center gap-1 hover:underline"
                                                >
                                                    {s.coachObservations ? <Edit3 size={12} /> : <Plus size={12} />}
                                                    {s.coachObservations ? 'Editar' : 'Añadir'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td>
                                    {editingObs?.id === s.id && currentUser.role === 'deportista' ? (
                                        <div className="flex flex-col gap-2">
                                            <textarea 
                                                value={editingObs.text} 
                                                onChange={(e) => setEditingObs({...editingObs, text: e.target.value})}
                                                className="search-input w-full min-h-[80px]"
                                            />
                                            <button onClick={handleSaveObservation} className="btn-primary text-xs py-2">Guardar</button>
                                        </div>
                                    ) : (
                                        <div className="text-sm">
                                            <p className={s.athleteObservations ? 'text-white' : 'text-muted italic'}>
                                                {s.athleteObservations || 'Sin observaciones'}
                                            </p>
                                            {s.athleteObservationTimestamp && (
                                                <p className="text-[10px] text-muted mt-1 uppercase tracking-tighter">
                                                    Actualizado: {s.athleteObservationTimestamp}
                                                </p>
                                            )}
                                            {currentUser.role === 'deportista' && (
                                                <button 
                                                    onClick={() => setEditingObs({id: s.id, text: s.athleteObservations || ''})} 
                                                    className="text-accent-primary text-xs mt-2 flex items-center gap-1 hover:underline"
                                                >
                                                    {s.athleteObservations ? <Edit3 size={12} /> : <Plus size={12} />}
                                                    {s.athleteObservations ? 'Editar' : 'Añadir'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );

    const renderGraficasMenu = () => (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
            <button onClick={() => setView('menu')} className="edit-btn flex items-center gap-2 mb-8">
                <ChevronLeft size={18} />
                Atrás
            </button>
            <div className="huge-buttons-grid">
                <motion.div whileHover={{y: -5}} className="huge-button group" onClick={() => setView('todas_menu')}>
                    <div className="w-16 h-16 bg-accent-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent-primary/20 transition-colors">
                        <Activity size={32} className="text-accent-primary" />
                    </div>
                    <h2>Todas las Gráficas</h2>
                    <p>Accede a los registros de ondas ECG e histogramas analíticos de cada sesión.</p>
                </motion.div>
                <motion.div whileHover={{y: -5}} className="huge-button group" onClick={() => setView('general')}>
                    <div className="w-16 h-16 bg-accent-cyan/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent-cyan/20 transition-colors">
                        <TrendingUp size={32} className="text-accent-cyan" />
                    </div>
                    <h2>Gráfica General</h2>
                    <p>Progreso histórico de BPM promedio con análisis de tendencia.</p>
                </motion.div>
            </div>
        </motion.div>
    );

    const renderTodasMenu = () => (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
            <button onClick={() => setView('graficas')} className="edit-btn flex items-center gap-2 mb-8">
                <ChevronLeft size={18} />
                Atrás
            </button>
            <div className="huge-buttons-grid">
                <motion.div whileHover={{y: -5}} className="huge-button group" onClick={() => setView('graficas_ecg')}>
                    <div className="w-16 h-16 bg-accent-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent-primary/20 transition-colors">
                        <Activity size={32} className="text-accent-primary" />
                    </div>
                    <h2>Gráficas ECG</h2>
                    <p>Visualización de la onda cardíaca registrada en cada sesión.</p>
                </motion.div>
                <motion.div whileHover={{y: -5}} className="huge-button group" onClick={() => setView('histograma')}>
                    <div className="w-16 h-16 bg-accent-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent-secondary/20 transition-colors">
                        <BarChart3 size={32} className="text-accent-secondary" />
                    </div>
                    <h2>Histograma analítico</h2>
                    <p>Análisis de BPM Máximo, Mínimo y Promedio por sesión.</p>
                </motion.div>
            </div>
        </motion.div>
    );

    const renderGraficasEcg = () => (
        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}>
            <button onClick={() => setView('todas_menu')} className="edit-btn flex items-center gap-2 mb-8">
                <ChevronLeft size={18} />
                Atrás
            </button>
            <h2 className="text-2xl mb-8">Registros de Ondas ECG</h2>
            <div className="grid grid-cols-1 gap-8">
                {sessions.map(s => (
                    <div key={s.id} className="glass-card">
                        <h3 className="text-accent-primary mb-6">{formatDateDisplay(s)}</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={getMockEcgWave()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="time" stroke="#444" label={{ value: 'Tiempo (s)', position: 'insideBottom', offset: -10, fill: '#666', fontSize: 10 }} />
                                <YAxis domain={[-0.5, 2.0]} stroke="#444" label={{ value: 'mV', angle: -90, position: 'insideLeft', fill: '#666', fontSize: 10 }} />
                                <Line type="monotone" dataKey="mv" stroke="var(--accent-primary)" strokeWidth={2} dot={false} isAnimationActive={false}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ))}
            </div>
        </motion.div>
    );

    const renderHistograma = () => (
        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}>
            <button onClick={() => setView('todas_menu')} className="edit-btn flex items-center gap-2 mb-8">
                <ChevronLeft size={18} />
                Atrás
            </button>
            <h2 className="text-2xl mb-8">Histogramas Analíticos de Sesión</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {sessions.map(s => (
                    <div key={s.id} className="glass-card">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-accent-primary text-lg">{formatDateDisplay(s)}</h3>
                            <div className="text-right">
                                <p className="text-2xl font-bold font-mono">{s.avgBpm}</p>
                                <p className="text-[10px] text-muted uppercase tracking-widest">BPM Promedio</p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={[{v: s.maxBpm, l: 'Máx'}, {v: s.avgBpm, l: 'Avg'}, {v: s.minBpm, l: 'Mín'}]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="l" stroke="#444" fontSize={10} />
                                <YAxis stroke="#444" fontSize={10} />
                                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{background: '#111', border: '1px solid #333', borderRadius: '8px'}} />
                                <Bar dataKey="v" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ))}
            </div>
        </motion.div>
    );

    const renderGeneral = () => (
        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="glass-card">
            <button onClick={() => setView('graficas')} className="edit-btn flex items-center gap-2 mb-8">
                <ChevronLeft size={18} />
                Atrás
            </button>
            <h2 className="text-2xl mb-2">Progreso General: Promedio de BPM por Sesión</h2>
            <p className="text-muted mb-10">Evolución del rendimiento cardíaco a lo largo del tiempo.</p>
            <ResponsiveContainer width="100%" height={450}>
                <LineChart data={[...sessions].reverse()} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                        dataKey="date" 
                        stroke="#444" 
                        tickFormatter={(val) => {
                            const parts = val.split('-');
                            return `${parts[2]}/${parts[1]}`;
                        }}
                        label={{ value: 'Fecha', position: 'insideBottom', offset: -20, fill: '#666', fontWeight: 'bold', fontSize: 12 }}
                    />
                    <YAxis 
                        stroke="#444" 
                        domain={['dataMin - 10', 'dataMax + 10']}
                        label={{ value: 'BPM promedio', angle: -90, position: 'insideLeft', offset: 10, fill: '#666', fontWeight: 'bold', fontSize: 12 }}
                    />
                    <Tooltip contentStyle={{background: '#111', border: '1px solid #333', borderRadius: '12px'}} labelFormatter={(label) => `Sesión: ${label}`} />
                    <Line type="monotone" dataKey="avgBpm" stroke="var(--accent-cyan)" strokeWidth={4} dot={{ r: 6, fill: 'var(--accent-cyan)', strokeWidth: 2, stroke: 'var(--accent-cyan)' }} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </motion.div>
    );

    return (
        <AnimatePresence mode="wait">
            {view === 'menu' && renderMenu()}
            {view === 'datos' && renderDatos()}
            {view === 'graficas' && renderGraficasMenu()}
            {view === 'todas_menu' && renderTodasMenu()}
            {view === 'graficas_ecg' && renderGraficasEcg()}
            {view === 'histograma' && renderHistograma()}
            {view === 'general' && renderGeneral()}
        </AnimatePresence>
    );
};

export default EcgPerformance;
