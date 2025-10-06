import { useState, useCallback } from 'react';

export const useProfileModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'health' | 'settings'>('info');

  const openProfile = useCallback((tab: 'info' | 'health' | 'settings' = 'info') => {
    setActiveTab(tab);
    setIsVisible(true);
  }, []);

  const closeProfile = useCallback(() => {
    setIsVisible(false);
    // Resetar para tab padrão após fechar
    setTimeout(() => setActiveTab('info'), 300);
  }, []);

  const switchTab = useCallback((tab: 'info' | 'health' | 'settings') => {
    setActiveTab(tab);
  }, []);

  return {
    isVisible,
    activeTab,
    openProfile,
    closeProfile,
    switchTab,
  };
};