import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChevronLeft, FileSpreadsheet, ClipboardList, BarChart3, TrendingUp, Edit3, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { User, QuestionnaireResult } from '../../types';
import { QUESTIONNAIRE_HISTORY, updateQuestionnaireResult } from '../../database';

interface Props { athlete: User; currentUser: User | null; onBack: () => void; }

const QuestionnairePerformance: React.FC<Props> = ({ athlete, currentUser, onBack }) => {
    const [view, setView] = useState<'menu' | 'datos' | 'graficas' | 'todas_graficas' | 'general_grafica'>('menu');
    const [editingObs, setEditingObs] = useState<{id: string, type: 'coach' | 'athlete', text: string} | null>(null);
    const data = QUESTIONNAIRE_HISTORY.filter(q => q.athleteId === athlete.id).sort((a, b) => b.date.localeCompare(a.date));

    const handleExportExcel = () => {
        const exportData = data.map(q => ({
            'Fecha': q.date,
            'Hora': q.timestamp,
            'Calidad de Sueño': q.sleep,
            'Nivel de Fatiga': q.fatigue,
            'Dolor Muscular': q.soreness,
            'Estado de Ánimo': q.mood,
            'Observaciones Deportista': q.athleteObservations || 'Sin observaciones',
            'Fecha Obs. Deportista': q.athleteObservationTimestamp || 'N/A',
            'Observaciones Entrenador': q.coachObservations || 'Sin observaciones'
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Questionnaire Results");
        XLSX.writeFile(workbook, `Questionnaire_Report_${athlete.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleSaveObs = () => {
        if (!editingObs) return;
        const updates: Partial<QuestionnaireResult> = {};
        if (editingObs.type === 'coach') {
            updates.coachObservations = editingObs.text;
        } else {
            updates.athleteObservations = editingObs.text;
            updates.athleteObservationTimestamp = new Date().toLocaleString();
        }
        updateQuestionnaireResult(editingObs.id, updates);
        setEditingObs(null);
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
                    <p>Historial de respuestas y observaciones técnicas.</p>
                </motion.div>
                <motion.div whileHover={{y: -5}} className="huge-button group" onClick={() => setView('graficas')}>
                    <div className="w-16 h-16 bg-accent-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent-secondary/20 transition-colors">
                        <BarChart3 size={32} className="text-accent-secondary" />
                    </div>
                    <h2>GRÁFICAS</h2>
                    <p>Evolución visual del bienestar y tendencias.</p>
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
            <h2 className="text-2xl mb-6">Informe de Cuestionarios de Bienestar</h2>
            <div className="overflow-x-auto">
                <table className="report-table">
                    <thead>
                        <tr>
                            <th>Fecha/Hora</th>
                            <th>Sueño</th>
                            <th>Fatiga</th>
                            <th>Dolor</th>
                            <th>Ánimo</th>
                            <th>Obs. Deportista</th>
                            <th>Obs. Entrenador</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(q => (
                            <tr key={q.id}>
                                <td className="font-mono text-sm">{q.date} {q.timestamp}</td>
                                <td className="text-center font-bold text-success">{q.sleep}</td>
                                <td className="text-center font-bold text-danger">{q.fatigue}</td>
                                <td className="text-center font-bold text-warning">{q.soreness}</td>
                                <td className="text-center font-bold text-accent-primary">{q.mood}</td>
                                <td>
                                    {editingObs?.id === q.id && editingObs.type === 'athlete' ? (
                                        <div className="flex flex-col gap-2">
                                            <textarea 
                                                value={editingObs.text} 
                                                onChange={e => setEditingObs({...editingObs, text: e.target.value})} 
                                                className="search-input w-full min-h-[80px]"
                                            />
                                            <button onClick={handleSaveObs} className="btn-primary text-xs py-2">Guardar</button>
                                        </div>
                                    ) : (
                                        <div className="text-sm">
                                            <p className={q.athleteObservations ? 'text-white' : 'text-muted italic'}>
                                                {q.athleteObservations || 'Sin observaciones'}
                                            </p>
                                            {q.athleteObservationTimestamp && (
                                                <p className="text-[10px] text-muted mt-1 uppercase tracking-tighter">
                                                    Actualizado: {q.athleteObservationTimestamp}
                                                </p>
                                            )}
                                            {currentUser?.role === 'deportista' && (
                                                <button 
                                                    onClick={() => setEditingObs({id: q.id, type: 'athlete', text: q.athleteObservations || ''})} 
                                                    className="text-accent-primary text-xs mt-2 flex items-center gap-1 hover:underline"
                                                >
                                                    {q.athleteObservations ? <Edit3 size={12} /> : <Plus size={12} />}
                                                    {q.athleteObservations ? 'Editar' : 'Añadir'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td>
                                    {editingObs?.id === q.id && editingObs.type === 'coach' ? (
                                        <div className="flex flex-col gap-2">
                                            <textarea 
                                                value={editingObs.text} 
                                                onChange={e => setEditingObs({...editingObs, text: e.target.value})} 
                                                className="search-input w-full min-h-[80px]"
                                            />
                                            <button onClick={handleSaveObs} className="btn-primary text-xs py-2">Guardar</button>
                                        </div>
                                    ) : (
                                        <div className="text-sm">
                                            <p className={q.coachObservations ? 'text-white' : 'text-muted italic'}>
                                                {q.coachObservations || 'Sin observaciones'}
                                            </p>
                                            {currentUser?.role === 'entrenador' && (
                                                <button 
                                                    onClick={() => setEditingObs({id: q.id, type: 'coach', text: q.coachObservations || ''})} 
                                                    className="text-accent-primary text-xs mt-2 flex items-center gap-1 hover:underline"
                                                >
                                                    {q.coachObservations ? <Edit3 size={12} /> : <Plus size={12} />}
                                                    {q.coachObservations ? 'Editar' : 'Añadir'}
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
                <motion.div whileHover={{y: -5}} className="huge-button group" onClick={() => setView('todas_graficas')}>
                    <div className="w-16 h-16 bg-accent-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent-primary/20 transition-colors">
                        <BarChart3 size={32} className="text-accent-primary" />
                    </div>
                    <h2>Todas las Gráficas</h2>
                    <p>Análisis individual por parámetro de bienestar.</p>
                </motion.div>
                <motion.div whileHover={{y: -5}} className="huge-button group" onClick={() => setView('general_grafica')}>
                    <div className="w-16 h-16 bg-accent-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent-secondary/20 transition-colors">
                        <TrendingUp size={32} className="text-accent-secondary" />
                    </div>
                    <h2>Gráfica General</h2>
                    <p>Comparativa de todos los niveles en una vista unificada.</p>
                </motion.div>
            </div>
        </motion.div>
    );

    const renderTodasGraficas = () => (
        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}>
            <button onClick={() => setView('graficas')} className="edit-btn flex items-center gap-2 mb-8">
                <ChevronLeft size={18} />
                Atrás
            </button>
            <h2 className="text-2xl mb-8">Análisis Detallado de Bienestar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ChartBox title="Calidad de Sueño" data={[...data].reverse()} dataKey="sleep" color="#00ffa3" />
                <ChartBox title="Nivel de Fatiga" data={[...data].reverse()} dataKey="fatigue" color="#ff3366" />
                <ChartBox title="Dolor Muscular" data={[...data].reverse()} dataKey="soreness" color="#ffa726" />
                <ChartBox title="Estado de Ánimo" data={[...data].reverse()} dataKey="mood" color="#00f2ff" />
            </div>
        </motion.div>
    );

    const renderGeneralGrafica = () => (
        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="glass-card">
            <button onClick={() => setView('graficas')} className="edit-btn flex items-center gap-2 mb-8">
                <ChevronLeft size={18} />
                Atrás
            </button>
            <h2 className="text-2xl mb-2">Resumen General de Bienestar</h2>
            <p className="text-muted mb-10">Comparativa de todos los parámetros registrados.</p>
            <ResponsiveContainer width="100%" height={450}>
                <LineChart data={[...data].reverse()} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                        dataKey="date" 
                        stroke="#444" 
                        tickFormatter={(val) => val.split('-').slice(1).reverse().join('/')}
                        label={{ value: 'Fecha', position: 'insideBottom', offset: -20, fill: '#666', fontWeight: 'bold', fontSize: 12 }}
                    />
                    <YAxis 
                        domain={[1, 10]} 
                        stroke="#444" 
                        label={{ value: 'Puntuación', angle: -90, position: 'insideLeft', offset: 10, fill: '#666', fontWeight: 'bold', fontSize: 12 }}
                    />
                    <Tooltip contentStyle={{background: '#111', border: '1px solid #333', borderRadius: '12px'}} />
                    <Legend verticalAlign="top" height={36}/>
                    <Line type="monotone" dataKey="sleep" name="Sueño" stroke="#00ffa3" strokeWidth={3} dot={{r: 4}} />
                    <Line type="monotone" dataKey="fatigue" name="Fatiga" stroke="#ff3366" strokeWidth={3} dot={{r: 4}} />
                    <Line type="monotone" dataKey="soreness" name="Dolor" stroke="#ffa726" strokeWidth={3} dot={{r: 4}} />
                    <Line type="monotone" dataKey="mood" name="Ánimo" stroke="#00f2ff" strokeWidth={3} dot={{r: 4}} />
                </LineChart>
            </ResponsiveContainer>
        </motion.div>
    );

    return (
        <AnimatePresence mode="wait">
            {view === 'menu' && renderMenu()}
            {view === 'datos' && renderDatos()}
            {view === 'graficas' && renderGraficasMenu()}
            {view === 'todas_graficas' && renderTodasGraficas()}
            {view === 'general_grafica' && renderGeneralGrafica()}
        </AnimatePresence>
    );
};

const ChartBox = ({title, data, dataKey, color}: any) => (
    <div className="glass-card">
        <h4 className="text-lg mb-6 font-medium">{title}</h4>
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                    dataKey="date" 
                    fontSize={10} 
                    stroke="#444" 
                    tickFormatter={(val) => val.split('-').slice(1).reverse().join('/')}
                    label={{ value: 'Fecha', position: 'insideBottom', offset: -20, fill: '#666' }}
                />
                <YAxis 
                    domain={[1, 10]} 
                    stroke="#444" 
                    label={{ value: 'Puntuación', angle: -90, position: 'insideLeft', offset: 10, fill: '#666', fontSize: 10 }}
                />
                <Tooltip contentStyle={{background: '#111', fontSize: 12, border: '1px solid #333', borderRadius: '8px'}} />
                <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{r: 4, fill: color, stroke: '#000'}} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

export default QuestionnairePerformance;
