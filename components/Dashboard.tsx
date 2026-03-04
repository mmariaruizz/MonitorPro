import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { User } from '../types';
import Profile from './Profile';

interface DashboardProps {
  currentUser: User;
  activeUser: User | null;
  onUpdateUser: (user: User) => void;
}

const generateEcgDataPoint = (time: number) => {
    const baseSignal = Math.sin(time * 2 * Math.PI * 1.2) * 0.2;
    const noise = (Math.random() - 0.5) * 0.1;
    const peakSignal = Math.sin(time * 1.0 * 2 * Math.PI);
    const qrs = peakSignal > 0.98 ? 1.5 : 0;
    return {
        time: time,
        mv: baseSignal + noise + qrs,
    };
};

const initialData = Array.from({ length: 100 }, (_, i) => generateEcgDataPoint(i / 50));

const Dashboard: React.FC<DashboardProps> = ({ currentUser, activeUser, onUpdateUser }) => {
    const [ecgData, setEcgData] = useState(initialData);
    const [bpm, setBpm] = useState(0);
    
    const userForProfile = activeUser || currentUser;

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;
        if (activeUser) {
            interval = setInterval(() => {
                setEcgData(currentData => {
                    const lastTime = currentData.length > 0 ? currentData[currentData.length - 1].time : 0;
                    const newData = [...currentData.slice(1), generateEcgDataPoint(lastTime + 0.02)];
                    return newData;
                });
                setBpm(Math.floor(Math.random() * (120 - 60 + 1)) + 60);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activeUser]);

  return (
    <div>
      <h1>Dashboard</h1>
      <Profile user={userForProfile} onUpdateUser={onUpdateUser} />
      
      {currentUser.role === 'entrenador' && !activeUser && (
        <p>Selecciona un atleta desde la sección de Usuarios para ver sus datos en tiempo real.</p>
      )}

      {activeUser && (
        <>
            <div className="dashboard-cards">
                <div className="stat-card">
                <h4>Frecuencia Cardíaca</h4>
                <p>{bpm} BPM</p>
                </div>
                <div className="stat-card">
                <h4>Variabilidad (HRV)</h4>
                <p>42 ms</p>
                </div>
                <div className="stat-card">
                <h4>Tiempo Sesión</h4>
                <p>00:45:12</p>
                </div>
            </div>
            <div className="ecg-chart-container">
                <h2>Señal ECG (En Vivo): {activeUser.name}</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={ecgData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="time" hide={true} />
                        <YAxis domain={[-0.5, 2.0]} stroke="#a0a0a0" />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }} 
                            labelStyle={{ color: '#e0e0e0' }}
                        />
                        <Line type="monotone" dataKey="mv" stroke="#00ffff" strokeWidth={2} dot={false} isAnimationActive={false}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
