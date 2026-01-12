
import React, { useState } from 'react';
import { ArrowLeft, Moon, Languages, ShieldAlert, Database, Info, CheckCircle2, Loader2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SystemSettingsViewProps {
  onBack: () => void;
}

const SystemSettingsView: React.FC<SystemSettingsViewProps> = ({ onBack }) => {
  const [isClearing, setIsClearing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [language, setLanguage] = useState('English');
  const [reduceMotion, setReduceMotion] = useState(false);

  const handleClearCache = () => {
    setIsClearing(true);
    setTimeout(() => {
      setIsClearing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 1500);
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="px-4 pt-6 pb-2 text-[13px] font-bold text-zinc-500 uppercase tracking-wider">
      {title}
    </h3>
  );

  const ToggleItem = ({ icon: Icon, label, value, onToggle }: any) => (
    <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-900">
      <div className="flex items-center gap-4">
        <Icon size={20} className="text-zinc-400" />
        <span className="text-[15px] font-medium">{label}</span>
      </div>
      <button 
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${value ? 'bg-sky-500' : 'bg-zinc-700'}`}
      >
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  const LinkItem = ({ icon: Icon, label, value, onClick }: any) => (
    <div 
      onClick={onClick}
      className="flex items-center justify-between px-4 py-4 border-b border-zinc-900 cursor-pointer hover:bg-zinc-900/30 transition-colors"
    >
      <div className="flex items-center gap-4">
        <Icon size={20} className="text-zinc-400" />
        <span className="text-[15px] font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[14px] text-zinc-500">{value}</span>
        <ChevronRight size={16} className="text-zinc-700" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-black">
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-50 border-b border-zinc-800 pt-[env(safe-area-inset-top,8px)]">
        <div className="flex items-center gap-6 px-4 py-2">
          <button onClick={onBack} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-extrabold tracking-tight">System Settings</h2>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-10">
        <SectionHeader title="Display" />
        <ToggleItem 
          icon={Moon} 
          label="Reduce Motion" 
          value={reduceMotion} 
          onToggle={() => setReduceMotion(!reduceMotion)} 
        />
        <LinkItem 
          icon={Languages} 
          label="Display Language" 
          value={language} 
          onClick={() => setLanguage(language === 'English' ? 'Chinese (Simplified)' : 'English')}
        />

        <SectionHeader title="Privacy & Security" />
        <LinkItem icon={ShieldAlert} label="Content Filtering" value="Standard" />
        <LinkItem icon={ShieldAlert} label="Blocked Accounts" value="0" />

        <SectionHeader title="Data & Storage" />
        <div className="px-4 py-4 border-b border-zinc-900">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <Database size={20} className="text-zinc-400" />
              <span className="text-[15px] font-medium">Clear Cache</span>
            </div>
            <button 
              onClick={handleClearCache}
              disabled={isClearing}
              className="text-sky-500 font-bold text-sm hover:bg-sky-500/10 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
            >
              {isClearing ? 'Clearing...' : 'Clear now'}
            </button>
          </div>
          <p className="text-[12px] text-zinc-600 ml-9">
            Clear locally stored temporary files to free up space. This won't affect your posts or profile.
          </p>
        </div>

        <SectionHeader title="Application" />
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-900">
          <div className="flex items-center gap-4">
            <Info size={20} className="text-zinc-400" />
            <span className="text-[15px] font-medium">Version</span>
          </div>
          <span className="text-[14px] text-zinc-600 font-mono">v1.2.4-stable</span>
        </div>
        <LinkItem icon={Info} label="Terms of Service" />
        <LinkItem icon={Info} label="Privacy Policy" />
      </div>

      <AnimatePresence>
        {(isClearing || showSuccess) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-sky-500 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 z-[100]"
          >
            {isClearing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span className="font-bold text-sm">Clearing local data...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                <span className="font-bold text-sm">Cache cleared successfully!</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SystemSettingsView;
