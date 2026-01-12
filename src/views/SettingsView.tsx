
import React from 'react';
import { ArrowLeft, ChevronRight, User, Shield, Bell, HelpCircle, LogOut, Settings as SystemIcon } from 'lucide-react';

interface SettingsViewProps {
  onBack: () => void;
  onLogout: () => void;
  onSystemSettings: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onBack, onLogout, onSystemSettings }) => {
  const SettingItem = ({ icon: Icon, label, onClick, color = "text-zinc-100" }: any) => (
    <div 
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-4 cursor-pointer hover:bg-zinc-900/50 transition-colors border-b border-zinc-800/50 group"
    >
      <Icon size={20} className={color} />
      <span className={`flex-1 text-[15px] font-medium ${color}`}>{label}</span>
      <ChevronRight size={18} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-black">
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 border-b border-zinc-800 pt-[env(safe-area-inset-top,8px)]">
        <div className="flex items-center gap-6 px-4 py-2">
          <button onClick={onBack} className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><ArrowLeft size={20} /></button>
          <h2 className="text-xl font-extrabold tracking-tight">Settings</h2>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mt-4">
          <SettingItem icon={User} label="Your Account" />
          <SettingItem icon={Shield} label="Security and Account Access" />
          <SettingItem icon={SystemIcon} label="Privacy and System" onClick={onSystemSettings} />
          <SettingItem icon={Bell} label="Notifications" />
          <SettingItem icon={HelpCircle} label="Help Center" />
        </div>

        <div className="mt-8 border-t border-zinc-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-4 text-pink-500 hover:bg-pink-500/5 transition-colors font-bold text-left"
          >
            <LogOut size={20} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
