import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { QueueCard } from './QueueCard';
import { SettingsPanel } from './SettingsPanel';
import { useLanguage } from '@/contexts/LanguageContext';
import { QueueRoom, QueueSettings } from '@/types/queue';
import { Settings, RefreshCw, ListOrdered } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for demonstration
const mockRooms: QueueRoom[] = [
  {
    id: 'room-01',
    roomNumber: '101',
    doctorName: {
      th: 'นพ.สมชาย ใจดี',
      en: 'Dr. Somchai Jaidee'
    },
    currentQueue: 25,
    status: 'calling',
    station: 'OPD-1'
  },
  {
    id: 'room-02',
    roomNumber: '102',
    doctorName: {
      th: 'นพ.วิรัช เก่งกล้า',
      en: 'Dr. Wirach Kengkla'
    },
    currentQueue: 18,
    status: 'active',
    station: 'OPD-2'
  },
  {
    id: 'room-03',
    roomNumber: '103',
    doctorName: {
      th: 'นพ.ประยุทธ์ ช่วยเหลือ',
      en: 'Dr. Prayuth Chuaylua'
    },
    currentQueue: 33,
    status: 'waiting',
    station: 'OPD-3'
  },
  {
    id: 'room-04',
    roomNumber: '104',
    doctorName: {
      th: 'นพ.อนุชา รักษ์ดี',
      en: 'Dr. Anucha Raksadee'
    },
    currentQueue: 12,
    status: 'active',
    station: 'OPD-4'
  },
  {
    id: 'room-05',
    roomNumber: '105',
    doctorName: {
      th: 'นพ.สุรชัย มั่นคง',
      en: 'Dr. Surachai Mankong'
    },
    currentQueue: 8,
    status: 'waiting',
    station: 'OPD-5'
  },
  {
    id: 'room-06',
    roomNumber: '106',
    doctorName: {
      th: 'นพ.วีระ ช่วยคน',
      en: 'Dr. Veera Chuaykhon'
    },
    currentQueue: 15,
    status: 'active',
    station: 'OPD-6'
  }
];

export function QueueDashboard() {
  const { t } = useLanguage();
  const [rooms, setRooms] = useState<QueueRoom[]>(mockRooms);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<QueueSettings>({
    cardColors: {
      'room-01': '#3B82F6',
      'room-02': '#10B981',
      'room-03': '#F59E0B',
      'room-04': '#EF4444',
      'room-05': '#8B5CF6',
      'room-06': '#06B6D4'
    },
    language: 'th',
    refreshInterval: 5000
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRooms(prevRooms => 
        prevRooms.map(room => ({
          ...room,
          currentQueue: room.currentQueue + Math.floor(Math.random() * 2),
          status: Math.random() > 0.8 ? 'calling' : 
                 Math.random() > 0.6 ? 'active' : 'waiting'
        }))
      );
      setLastUpdated(new Date());
    }, settings.refreshInterval);

    return () => clearInterval(interval);
  }, [settings.refreshInterval]);

  const handleRefresh = () => {
    // Simulate manual refresh
    setRooms(prevRooms => 
      prevRooms.map(room => ({
        ...room,
        currentQueue: room.currentQueue + 1
      }))
    );
    setLastUpdated(new Date());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-surface to-medical-surface-variant">
      {/* Header */}
      <header className="bg-medical-surface shadow-lg border-b-4 border-medical-primary">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-medical-primary mb-2">
                {t('title')}
              </h1>
              <p className="text-medical-on-surface-variant text-lg">
                NR Dashboard Queue System
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm text-medical-on-surface-variant">
                <p>Last Updated: {lastUpdated.toLocaleTimeString()}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Link to="/manage">
                <Button variant="secondary" size="sm" className="flex items-center gap-2">
                  <ListOrdered className="w-4 h-4" /> จัดการคิวผู้ป่วย
                </Button>
              </Link>
              <Button
                variant="default"
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                {t('settings')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Grid */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-8">
          {rooms.map((room) => (
            <QueueCard
              key={room.id}
              room={room}
              customColor={settings.cardColors[room.id]}
            />
          ))}
        </div>
      </main>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  );
}