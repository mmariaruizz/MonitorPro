import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Edit3, Save, X, User as UserIcon, Mail, Calendar, Ruler, Weight, Trophy, Shield, Briefcase, Info } from 'lucide-react';
import type { User } from '../types';
import { getCoachNames, getInitials } from '../database';

interface ProfileProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const Avatar = ({ user, size = 120 }: { user: User, size?: number }) => {
    const initials = getInitials(user.name);
    return (
        <div 
            className="avatar-circle flex items-center justify-center overflow-hidden bg-white/5 border-2 border-white/10" 
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

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>(user);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const calculateAge = (dob: string | undefined) => {
      if (!dob) return 'N/A';
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
      }
      return age;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onUpdateUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            const updated = { ...user, profilePic: base64String };
            onUpdateUser(updated);
            alert('Foto de perfil actualizada');
        };
        reader.readAsDataURL(file);
    }
  };

  const InfoItem = ({ icon: Icon, label, value, color = "text-accent-primary" }: any) => (
    <div className="glass-card p-4 bg-white/5 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${color}`}>
            <Icon size={20} />
        </div>
        <div>
            <p className="text-[10px] text-muted uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-sm font-medium">{value || 'N/A'}</p>
        </div>
    </div>
  );

  const renderAthleteFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InfoItem icon={Briefcase} label="Deporte" value={user.sport} />
        <InfoItem icon={UserIcon} label="Sexo" value={user.sex} />
        <InfoItem icon={Calendar} label="Edad" value={`${calculateAge(user.dob)} años`} />
        <InfoItem icon={Ruler} label="Altura" value={user.height ? `${user.height} cm` : null} />
        <InfoItem icon={Weight} label="Peso" value={user.weight ? `${user.weight} kg` : null} />
        <InfoItem icon={Shield} label="Club" value={user.club} />
        <InfoItem icon={Info} label="Categoría" value={user.category} />
        <div className="md:col-span-2 lg:col-span-3">
            <InfoItem icon={Trophy} label="Logros" value={user.achievements} />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
            <InfoItem icon={UserIcon} label="Entrenador(es)" value={getCoachNames(user.coachIds)} color="text-accent-secondary" />
        </div>
    </div>
  );
  
  const renderAthleteEditForm = () => (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="field-group">
            <label className="label-spacing text-xs text-muted uppercase tracking-widest">Fecha de Nacimiento</label>
            <input type="date" name="dob" value={formData.dob || ''} onChange={handleChange} className="search-input" />
        </div>
        <div className="field-group">
            <label className="label-spacing text-xs text-muted uppercase tracking-widest">Sexo</label>
            <select name="sex" value={formData.sex || ''} onChange={handleChange} className="search-input">
                <option value="">Seleccionar...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
            </select>
        </div>
        <div className="field-group">
            <label className="label-spacing text-xs text-muted uppercase tracking-widest">Altura (cm)</label>
            <input type="number" name="height" value={formData.height || ''} onChange={handleChange} className="search-input" />
        </div>
        <div className="field-group">
            <label className="label-spacing text-xs text-muted uppercase tracking-widest">Peso (kg)</label>
            <input type="number" name="weight" value={formData.weight || ''} onChange={handleChange} className="search-input" />
        </div>
        <div className="field-group">
            <label className="label-spacing text-xs text-muted uppercase tracking-widest">Deporte</label>
            <input type="text" name="sport" value={formData.sport || ''} onChange={handleChange} className="search-input" />
        </div>
        <div className="field-group">
            <label className="label-spacing text-xs text-muted uppercase tracking-widest">Club</label>
            <input type="text" name="club" value={formData.club || ''} onChange={handleChange} className="search-input" />
        </div>
        <div className="field-group">
            <label className="label-spacing text-xs text-muted uppercase tracking-widest">Categoría</label>
            <input type="text" name="category" value={formData.category || ''} onChange={handleChange} className="search-input" />
        </div>
        <div className="field-group md:col-span-2">
            <label className="label-spacing text-xs text-muted uppercase tracking-widest">Logros</label>
            <textarea name="achievements" value={formData.achievements || ''} onChange={handleChange} className="search-input min-h-[100px]"></textarea>
        </div>
    </div>
  );

  const renderCoachFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem icon={Briefcase} label="Especialidad" value={user.specialty} />
        <InfoItem icon={Mail} label="Correo Electrónico" value={user.email} />
        <InfoItem icon={Calendar} label="Edad" value={`${calculateAge(user.dob)} años`} />
    </div>
  );

  const renderCoachEditForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="field-group md:col-span-2">
            <label className="label-spacing text-xs text-muted uppercase tracking-widest">Especialidad</label>
            <input type="text" name="specialty" value={formData.specialty || ''} onChange={handleChange} className="search-input" />
        </div>
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <div className="glass-card p-8 md:p-12">
        <div className="flex flex-col items-center mb-16">
            <div className="relative group">
                <Avatar user={user} size={140} />
                <input type="file" id="profile-pic-upload" hidden accept="image/*" onChange={handleProfilePicChange} />
                <label 
                    htmlFor="profile-pic-upload" 
                    className="absolute bottom-2 right-2 w-10 h-10 bg-accent-primary text-white rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg"
                >
                    <Camera size={20} />
                </label>
            </div>
            <div className="text-center mt-8">
                <h2 className="text-4xl font-bold font-display">{user.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-3">
                    <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] uppercase tracking-widest text-muted border border-white/10">
                        {user.role === 'deportista' ? 'Atleta Elite' : 'Entrenador Certificado'}
                    </span>
                </div>
            </div>
        </div>
        
        <div className="mb-20">
            <AnimatePresence mode="wait">
                <motion.div
                    key={isEditing ? 'editing' : 'viewing'}
                    initial={{ opacity: 0, x: isEditing ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isEditing ? -10 : 10 }}
                    transition={{ duration: 0.2 }}
                >
                    {isEditing 
                        ? (user.role === 'deportista' ? renderAthleteEditForm() : renderCoachEditForm())
                        : (user.role === 'deportista' ? renderAthleteFields() : renderCoachFields())
                    }
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Bloque de espacio forzado para separar el botón de los rectángulos */}
        <div className="h-40 w-full"></div>

        <div className="flex justify-center gap-4 pt-20 mt-20 border-t border-white/10">
            {isEditing ? (
                <>
                    <button className="btn-primary px-8 flex items-center gap-2" onClick={handleSave}>
                        <Save size={18} />
                        Guardar Cambios
                    </button>
                    <button className="edit-btn px-8 flex items-center gap-2 border-danger/30 text-danger" onClick={handleCancel}>
                        <X size={18} />
                        Cancelar
                    </button>
                </>
            ) : (
                <button className="btn-primary px-8 flex items-center gap-2" onClick={() => setIsEditing(true)}>
                    <Edit3 size={18} />
                    Editar Perfil
                </button>
            )}
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
