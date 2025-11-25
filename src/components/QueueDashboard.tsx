import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { QueueCard } from './QueueCard';
import { SettingsPanel } from './SettingsPanel';
import { useLanguage } from '@/contexts/LanguageContext';
import { QueueRoom, QueueSettings } from '@/types/queue';
import { Settings, RefreshCw, Maximize, Minimize, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import dashboardAPI from './dashboardAPI';
import { useQueueAnnouncement } from '@/hooks/useQueueAnnouncement';
import { speakText } from '@/utils/speech';

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
    refreshInterval: 5000,
    voiceLanguage: 'th'
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Default to 2025-10-08 on initial load
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 10, 3));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(settings.refreshInterval / 1000);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'enabling' | 'error'>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isAnnouncing, setIsAnnouncing] = useState(false);

  const loadDashboardData = async () => {
    try {
      console.log('Loading dashboard data...');
      const response = await dashboardAPI.DashboardList('OPD-1', format(selectedDate, 'yyyyMMdd'));
      console.log('Dashboard API Response:', response);
      
      if (response.success && response.data && Array.isArray(response.data)) {
        const mappedRooms = response.data.map((item: any, index: number) => {
          console.log('Mapping item:', item);
          return {
            id: `room-${item.id?.[0] || index}`,
            roomIdRaw: item.room_id ?? item.roomId ?? item.roomID ?? item.id ?? '',
            roomNumber: item.room_name || item.room_number || '',
            doctorName: {
              th: item.uidnam || item.UidNam || '',
              en: item.uidnam || item.UidNam || '' // You can add English translation if available
            },
            currentQueue: item.queue_number || 0,
            status: 'active' as const,
            queue_status: item.queue_status || item.Queue_status || item.queueStatus || item.QUEUE_STATUS || '',
            called_times: item.Called_times || item.called_times || item.calledTimes || 0,
            queue_caption: item.queue_caption || item.queueCaption || '',
            Call_yon: item.Call_yon || item.CallYon || item.call_yon || item.callYon || '',
            // station removed as requested
          };
        });
        
        console.log('Mapped rooms:', mappedRooms);
        setRooms(mappedRooms);
        setLastUpdated(new Date());
        // Reset countdown when data is refreshed
        setRefreshCountdown(settings.refreshInterval / 1000);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error('Error attempting to enable fullscreen:', error);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (error) {
        console.error('Error attempting to exit fullscreen:', error);
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Countdown timer for auto-refresh
  useEffect(() => {
    if (isAnnouncing) return;

    const countdownInterval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 0) {
          return settings.refreshInterval / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [settings.refreshInterval, isAnnouncing]);

  // Auto-refresh from API
  useEffect(() => {
    if (isAnnouncing) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, settings.refreshInterval);

    // Reset countdown when interval changes
    setRefreshCountdown(settings.refreshInterval / 1000);

    return () => clearInterval(interval);
  }, [settings.refreshInterval, isAnnouncing]);

  // Auto-announce queue numbers when called
  useQueueAnnouncement(rooms, voiceEnabled, settings.voiceLanguage || 'th', {
    onAnnouncementStart: () => setIsAnnouncing(true),
    onAnnouncementEnd: () => {
      setIsAnnouncing(false);
      setRefreshCountdown(settings.refreshInterval / 1000);
    }
  });

  const handleRefresh = () => {
    // Load fresh data from API
    loadDashboardData();
    // Reset countdown when manually refreshed
    setRefreshCountdown(settings.refreshInterval / 1000);
  };

  const getVoiceLanguageCode = (lang: 'th' | 'en' = 'th') => (lang === 'th' ? 'th-TH' : 'en-US');

  const handleEnableVoice = async () => {
    try {
      setVoiceStatus('enabling');
      setVoiceError(null);
      const sampleText =
        (settings.voiceLanguage || 'th') === 'th'
          ? 'ระบบเปิดเสียงประกาศคิวแล้ว'
          : 'Voice announcements enabled';
      await speakText(sampleText, {
        language: getVoiceLanguageCode(settings.voiceLanguage || 'th'),
        rate: (settings.voiceLanguage || 'th') === 'th' ? 0.9 : 1
      });
      setVoiceEnabled(true);
      setVoiceStatus('idle');
    } catch (error) {
      console.error('Failed to enable voice:', error);
      setVoiceStatus('error');
      setVoiceError('ไม่สามารถเปิดเสียงได้ กรุณาลองอีกครั้ง');
    }
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
                <p className="text-xs text-medical-primary font-medium">
                  Next refresh in: {refreshCountdown}s
                </p>
              </div>
              {/* Date Picker */}
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <div className="flex items-center gap-2">
                  <div 
                    className="relative w-[180px] cursor-pointer"
                    onClick={() => setIsDatePickerOpen(true)}
                  >
                    <Input
                      type="text"
                      value={format(selectedDate, 'MM/dd/yyyy')}
                      readOnly
                      className="w-full cursor-pointer pr-12"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                  <PopoverTrigger asChild>
                    <Button
                      variant="default"
                      size="icon"
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => setSelectedDate(new Date())}
                    >
                      <CalendarIcon className="h-4 w-4 text-white" />
                    </Button>
                  </PopoverTrigger>
                </div>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setIsDatePickerOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="flex items-center gap-2"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                {isFullscreen ? "Exit" : "Fullscreen"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-2"
                disabled={isAnnouncing}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <div className="flex flex-col items-start">
                <Button
                  variant={voiceEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleEnableVoice}
                  disabled={voiceEnabled || voiceStatus === 'enabling'}
                  className={`flex items-center gap-2 ${voiceEnabled ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                >
                  {voiceEnabled
                    ? 'Voice Enabled'
                    : voiceStatus === 'enabling'
                    ? 'Enabling...'
                    : 'Enable Voice'}
                </Button>
                {voiceError && (
                  <p className="text-xs text-red-500 mt-1">{voiceError}</p>
                )}
              </div>
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