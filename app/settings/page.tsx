'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { Bell, Lock, Globe, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const settingsSections = [
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          label: 'Enable notifications',
          description: 'Receive alerts for transactions and updates',
          value: notifications,
          onChange: setNotifications,
        },
      ],
    },
    {
      title: 'Security',
      icon: Lock,
      items: [
        {
          label: 'Two-factor authentication',
          description: 'Add an extra layer of security',
          value: false,
          onChange: () => {},
        },
      ],
    },
    {
      title: 'Preferences',
      icon: Globe,
      items: [
        {
          label: 'Dark mode',
          description: 'Use dark theme',
          value: darkMode,
          onChange: setDarkMode,
        },
      ],
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account preferences and security</p>
        </motion.div>

        <div className="space-y-6">
          {settingsSections.map((section, sectionIndex) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
                className="rounded-3xl glass border border-white/5 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Icon className="w-5 h-5 text-teal-400" />
                  <h2 className="text-lg font-semibold text-white">{section.title}</h2>
                </div>
                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-white/5"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium mb-1">{item.label}</p>
                        <p className="text-slate-400 text-sm">{item.description}</p>
                      </div>
                      <button
                        onClick={() => item.onChange(!item.value)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                          item.value ? 'bg-teal-500' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                            item.value ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

