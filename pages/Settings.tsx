import React, { useState } from 'react';
import { User, Wallet, Bell, Shield, Save, Moon, Sun } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, setTheme } = useOutletContext<{ theme: string, setTheme: (t: string) => void }>();
  const [saveStatus, setSaveStatus] = useState('Save Changes');

  const handleSave = () => {
    setSaveStatus('Saving...');
    setTimeout(() => {
      setSaveStatus('Saved Successfully!');
      setTimeout(() => setSaveStatus('Save Changes'), 2000);
    }, 800);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'budget', label: 'Budget Config', icon: Wallet },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your account and application preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="glass-panel p-2 rounded-2xl flex flex-row lg:flex-col gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="glass-panel p-8 rounded-3xl animate-slide-up">
            
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-white/20 dark:border-white/10">
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-slate-700 shadow-lg"
                    />
                    <button className="absolute bottom-0 right-0 p-2 bg-brand-500 text-white rounded-full shadow-lg hover:scale-105 transition-transform">
                      <User className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Alex M.</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">alex.m@example.com</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-bold rounded-full">Pro Member</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                    <input type="text" defaultValue="Alex M." className="w-full px-4 py-3 rounded-xl glass-input font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                    <input type="email" defaultValue="alex.m@example.com" className="w-full px-4 py-3 rounded-xl glass-input font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                    <input type="tel" defaultValue="+1 (555) 000-0000" className="w-full px-4 py-3 rounded-xl glass-input font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Location</label>
                    <input type="text" defaultValue="New York, USA" className="w-full px-4 py-3 rounded-xl glass-input font-medium" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'budget' && (
              <div className="space-y-8">
                 <div>
                   <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Monthly Budget Limits</h3>
                   <p className="text-slate-500 dark:text-slate-400 text-sm">Set your spending thresholds per category.</p>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                         <label>Total Monthly Limit</label>
                         <span className="text-brand-600 dark:text-brand-400">$4,500</span>
                       </div>
                       <input type="range" className="w-full accent-brand-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {['Housing', 'Food', 'Transport', 'Entertainment'].map((cat) => (
                         <div key={cat} className="space-y-2 p-4 bg-white/40 dark:bg-slate-800/40 rounded-2xl border border-white/50 dark:border-slate-700/50">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{cat}</label>
                            <div className="flex items-center gap-2">
                               <span className="text-slate-500 dark:text-slate-400 font-bold">$</span>
                               <input type="number" defaultValue="500" className="w-full bg-transparent font-bold text-slate-800 dark:text-white border-b border-slate-300 dark:border-slate-600 focus:border-brand-500 outline-none pb-1" />
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                   <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Notifications</h3>
                   <div className="space-y-3">
                     {[
                       'Email me about weekly spending reports',
                       'Alert me when I exceed 80% of budget',
                       'Notify me about upcoming bill payments',
                       'Send marketing tips and tricks'
                     ].map((item, i) => (
                       <label key={i} className="flex items-center gap-3 p-3 hover:bg-white/40 dark:hover:bg-slate-800/40 rounded-xl transition-colors cursor-pointer">
                         <input type="checkbox" defaultChecked={i < 3} className="w-5 h-5 rounded text-brand-500 focus:ring-brand-500 border-gray-300 dark:border-gray-600 dark:bg-slate-800" />
                         <span className="font-medium text-slate-700 dark:text-slate-300">{item}</span>
                       </label>
                     ))}
                   </div>
                </div>
                
                <div className="pt-6 border-t border-white/20 dark:border-white/10">
                   <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Appearance</h3>
                   <div className="flex gap-4">
                      <button 
                        onClick={() => setTheme('dark')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold shadow-lg transition-all ${
                          theme === 'dark' 
                          ? 'bg-slate-800 text-white ring-2 ring-brand-500' 
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        <Moon className="w-4 h-4" /> Dark Mode
                      </button>
                      <button 
                         onClick={() => setTheme('light')}
                         className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold shadow-sm transition-all ${
                          theme === 'light' 
                          ? 'bg-white text-brand-600 ring-2 ring-brand-500' 
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                         }`}
                      >
                        <Sun className="w-4 h-4" /> Light Mode
                      </button>
                   </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-white/20 dark:border-white/10 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={saveStatus !== 'Save Changes'}
                className="flex items-center gap-2 px-8 py-3 bg-brand-500 text-white font-bold rounded-full hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/30 active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" /> {saveStatus}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;