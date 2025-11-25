import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QueueRoom } from '@/types/queue';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface QueueCardProps {
  room: QueueRoom;
  customColor?: string;
}

export function QueueCard({ room, customColor }: QueueCardProps) {
  const { language, t } = useLanguage();

  const getStatusColor = (status: QueueRoom['status']) => {
    switch (status) {
      case 'active':
        return 'bg-queue-active text-white';
      case 'calling':
        return 'bg-queue-calling text-white';
      case 'waiting':
        return 'bg-queue-waiting text-white';
      case 'completed':
        return 'bg-queue-completed text-medical-on-surface';
      default:
        return 'bg-medical-surface-variant text-medical-on-surface-variant';
    }
  };

  const pulseAnimation = room.status === 'calling' ? 'animate-pulse' : '';

  return (
    <Card 
      className={cn(
        'relative overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300',
        pulseAnimation,
        room.status === 'calling' && 'ring-4 ring-queue-calling ring-opacity-50'
      )}
      style={customColor ? { borderColor: customColor } : {}}
    >
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Room Number */}
          <div className="text-center">
            <h2 className="text-4xl font-bold text-medical-primary mb-2">
              {t('room')} {room.roomNumber}
            </h2>
            {room.station && (
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {room.station}
              </Badge>
            )}
          </div>

          {/* Doctor Name */}
          <div className="text-center border-t pt-4">
            <p className="text-xl text-medical-on-surface-variant mb-2">
              {t('doctor')}
            </p>
            <h3 className="text-3xl font-semibold text-medical-on-surface">
              {room.doctorName[language]}
            </h3>
          </div>

          {/* Current Queue */}
          <div className="text-center border-t pt-4">
            <p className="text-xl text-medical-on-surface-variant mb-2">
              {t('currentQueue')}
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div 
                className="text-6xl font-bold text-white bg-medical-primary rounded-lg px-6 py-4 min-w-[120px] flex items-center justify-center"
                style={customColor ? { backgroundColor: customColor } : {}}
              >
                {room.currentQueue.toString().padStart(3, '0')}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="text-center">
            <Badge 
              className={cn(
                'text-lg px-6 py-2 font-semibold',
                getStatusColor(room.status)
              )}
            >
              {t(`status.${room.status}`)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}