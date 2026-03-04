import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, ClipboardList } from 'lucide-react';
import type { User } from '../../types';
import EcgPerformance from './EcgPerformance';
import QuestionnairePerformance from './QuestionnairePerformance';

interface PerformanceHubProps {
  activeUser: User | null;
  currentUser: User;
}

const PerformanceHub: React.FC<PerformanceHubProps> = ({ activeUser, currentUser }) => {
    const [view, setView] = useState<'hub' | 'ecg' | 'questionnaire'>('hub');

    if (!activeUser) return <h1 className="text-muted">Selecciona un deportista para ver su rendimiento.</h1>;

    if (view === 'ecg') return <EcgPerformance athlete={activeUser} currentUser={currentUser} onBack={() => setView('hub')} />;
    if (view === 'questionnaire') return <QuestionnairePerformance athlete={activeUser} currentUser={currentUser} onBack={() => setView('hub')} />;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="performance-hub"
        >
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-2">Panel de Rendimiento</h1>
                <p className="text-muted">Análisis detallado y seguimiento profesional para <span className="text-white font-medium">{activeUser.name}</span></p>
            </div>

            <div className="huge-buttons-grid">
                <motion.div 
                    whileHover={{ y: -10 }}
                    className="huge-button group" 
                    onClick={() => setView('ecg')}
                >
                    <div className="w-16 h-16 bg-accent-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent-primary/20 transition-colors">
                        <Activity size={32} className="text-accent-primary" />
                    </div>
                    <h2>ECG</h2>
                    <p>Análisis de sesiones cardíacas, informes técnicos y gráficas de frecuencia.</p>
                </motion.div>

                <motion.div 
                    whileHover={{ y: -10 }}
                    className="huge-button group" 
                    onClick={() => setView('questionnaire')}
                >
                    <div className="w-16 h-16 bg-accent-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent-secondary/20 transition-colors">
                        <ClipboardList size={32} className="text-accent-secondary" />
                    </div>
                    <h2>CUESTIONARIOS</h2>
                    <p>Evolución de bienestar, fatiga y estado de ánimo del deportista.</p>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default PerformanceHub;
