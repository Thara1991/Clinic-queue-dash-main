import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/contexts/LanguageContext';
import { QueueSettings } from '@/types/queue';
import { Settings, X, Sun, Moon } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: QueueSettings;
  onSettingsChange: (settings: QueueSettings) => void;
}

const colorOptions = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#EF4444', label: 'Red' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#06B6D4', label: 'Cyan' }
];

export function SettingsPanel({ isOpen, onClose, settings, onSettingsChange }: SettingsPanelProps) {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [localSettings, setLocalSettings] = useState<QueueSettings>({
    ...settings,
    voiceLanguage: settings.voiceLanguage || 'th'
  });

  if (!isOpen) return null;

  const handleLanguageChange = (newLang: 'th' | 'en') => {
    setLanguage(newLang);
    setLocalSettings(prev => ({ ...prev, language: newLang }));
    onSettingsChange({ ...localSettings, language: newLang });
  };

  const handleVoiceLanguageChange = (newVoiceLang: 'th' | 'en') => {
    const newSettings = { ...localSettings, voiceLanguage: newVoiceLang };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleColorChange = (roomId: string, color: string) => {
    const newColors = { ...localSettings.cardColors, [roomId]: color };
    const newSettings = { ...localSettings, cardColors: newColors };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6" />
            {t('settings')}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Settings */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              {t('language')}
            </Label>
            <RadioGroup
              value={language}
              onValueChange={handleLanguageChange}
              className="flex flex-row space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="th" id="thai" />
                <Label htmlFor="thai">{t('thai')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="en" id="english" />
                <Label htmlFor="english">{t('english')}</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Voice Language Settings */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Voice Language
            </Label>
            <RadioGroup
              value={localSettings.voiceLanguage || 'th'}
              onValueChange={(value) => handleVoiceLanguageChange(value as 'th' | 'en')}
              className="flex flex-row space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="th" id="voice-th" />
                <Label htmlFor="voice-th">Thai</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="en" id="voice-en" />
                <Label htmlFor="voice-en">English</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Theme Settings */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Theme
            </Label>
            <div className="flex gap-4">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="flex items-center gap-2"
              >
                <Sun className="w-4 h-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="flex items-center gap-2"
              >
                <Moon className="w-4 h-4" />
                Dark
              </Button>
            </div>
          </div>

          {/* Color Settings */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              {t('cardColors')}
            </Label>
            <div className="grid gap-4">
              {['room-01', 'room-02', 'room-03', 'room-04', 'room-05', 'room-06'].map((roomId) => (
                <div key={roomId} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Room {roomId.split('-')[1]}</span>
                  <div className="flex gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        className="w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform"
                        style={{ 
                          backgroundColor: color.value,
                          borderColor: localSettings.cardColors[roomId] === color.value ? '#000' : '#ccc'
                        }}
                        onClick={() => handleColorChange(roomId, color.value)}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}