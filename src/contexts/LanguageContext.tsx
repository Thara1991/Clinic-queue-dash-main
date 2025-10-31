import { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '@/types/queue';

interface LanguageContextType {
  language: Language['code'];
  setLanguage: (lang: Language['code']) => void;
  t: (key: string) => string;
}

const translations = {
  th: {
    title: 'ระบบแสดงผลคิวห้องตรวจแพทย์',
    room: 'ห้อง',
    doctor: 'แพทย์',
    currentQueue: 'คิวปัจจุบัน',
    waitingPatients: 'ผู้ป่วยรอคิว',
    settings: 'ตั้งค่า',
    cardColors: 'สีการ์ด',
    language: 'ภาษา',
    thai: 'ไทย',
    english: 'English',
    status: {
      active: 'กำลังตรวจ',
      waiting: 'รอคิว',
      calling: 'เรียกคิว',
      completed: 'เสร็จสิ้น'
    }
  },
  en: {
    title: 'Medical Queue Dashboard System',
    room: 'Room',
    doctor: 'Doctor',
    currentQueue: 'Current Queue',
    waitingPatients: 'Waiting Patients',
    settings: 'Settings',
    cardColors: 'Card Colors',
    language: 'Language',
    thai: 'ไทย',
    english: 'English',
    status: {
      active: 'In Progress',
      waiting: 'Waiting',
      calling: 'Calling',
      completed: 'Completed'
    }
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language['code']>('th');

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}