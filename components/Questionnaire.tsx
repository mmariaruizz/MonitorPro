import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardCheck, Save, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { User, QuestionnaireResult } from '../types';
import { saveQuestionnaireResult } from '../database';

interface QuestionnaireProps {
  activeUser: User | null;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ activeUser }) => {
    const [sleep, setSleep] = useState(5);
    const [fatigue, setFatigue] = useState(5);
    const [soreness, setSoreness] = useState(5);
    const [mood, setMood] = useState(5);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!activeUser) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-muted">
                    <AlertCircle size={40} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Atleta no seleccionado</h2>
                <p className="text-muted max-w-md">Por favor, selecciona un atleta desde la sección de Usuarios para rellenar un cuestionario de bienestar.</p>
            </div>
        );
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirm(true);
    }

    const confirmSubmit = () => {
        const now = new Date();
        const result: QuestionnaireResult = {
            id: `q-${Date.now()}`,
            athleteId: activeUser.id,
            date: now.toISOString().split('T')[0],
            timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sleep,
            fatigue,
            soreness,
            mood
        };
        saveQuestionnaireResult(result);
        setShowConfirm(false);
        setIsSuccess(true);
        
        // Reset form after a delay
        setTimeout(() => {
            setIsSuccess(false);
            setSleep(5);
            setFatigue(5);
            setSoreness(5);
            setMood(5);
        }, 3000);
    };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-accent-primary/10 rounded-xl flex items-center justify-center text-accent-primary">
              <ClipboardCheck size={24} />
          </div>
          <div>
              <h1 className="text-3xl font-bold font-display">Cuestionario de Bienestar</h1>
              <p className="text-muted">Atleta: <span className="text-white font-medium">{activeUser.name}</span></p>
          </div>
      </div>

      <div className="glass-card p-8">
        <form className="space-y-12" onSubmit={handleSubmit}>
          <div className="space-y-12">
            <QuestionSlider label="1. ¿Cómo fue tu calidad de sueño anoche?" value={sleep} onChange={setSleep} />
            <QuestionSlider label="2. ¿Cuál es tu nivel de fatiga general hoy?" value={fatigue} onChange={setFatigue} />
            <QuestionSlider label="3. ¿Qué nivel de dolor muscular sientes?" value={soreness} onChange={setSoreness} />
            <QuestionSlider label="4. ¿Cómo calificarías tu estado de ánimo?" value={mood} onChange={setMood} />
          </div>

          <div className="pt-12 border-t border-white/5">
            <button type="submit" className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg">
                <Save size={20} />
                Enviar Cuestionario
            </button>
          </div>
        </form>
      </div>

      <AnimatePresence>
        {showConfirm && (
            <div className="modal-overlay">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="modal-content max-w-md text-center"
                >
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-accent-primary">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Confirmar Envío</h3>
                        <p className="text-muted mb-10">¿Estás seguro de que quieres enviar el cuestionario? Los datos se guardarán en el historial del atleta.</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={confirmSubmit} className="btn-primary flex-1 py-3">Sí, enviar</button>
                        <button onClick={() => setShowConfirm(false)} className="edit-btn flex-1 py-3">Cancelar</button>
                    </div>
                </motion.div>
            </div>
        )}

        {isSuccess && (
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 right-8 bg-accent-primary text-black px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
            >
                <CheckCircle2 size={24} />
                <span className="font-bold">Cuestionario guardado con éxito</span>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const QuestionSlider = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <label className="text-sm font-medium text-white/90 max-w-[80%]">{label}</label>
                <span className="text-2xl font-bold font-display text-accent-primary">{value}</span>
            </div>
            <div className="relative pt-2">
                <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={value} 
                    onChange={(e) => onChange(Number(e.target.value))} 
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
                <div className="flex justify-between mt-2 text-[10px] text-muted uppercase tracking-widest font-bold">
                    <span>Muy Mal</span>
                    <span>Neutral</span>
                    <span>Excelente</span>
                </div>
            </div>
        </div>
    );
};

export default Questionnaire;
