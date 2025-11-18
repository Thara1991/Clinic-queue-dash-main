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
  // Check queue_status with case-insensitive comparison and trim whitespace
  const queueStatus = room.queue_status?.trim() || '';
  const queueStatusUpper = queueStatus.toUpperCase();
  const isCalling = queueStatusUpper === 'CALL';
  const isIn = queueStatusUpper === 'IN';
  const isEmptyStatus = !queueStatus || queueStatus === '';
  // Use red color if called_times is 2 or more
  const isMultipleCalls = isCalling && room.called_times !== undefined && room.called_times >= 2;
  
  // Debug log to check if calling status is detected
  if (isCalling) {
    console.log('Queue is calling:', room.roomNumber, 'queue_status:', room.queue_status, 'called_times:', room.called_times);
  }

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
              {room.roomNumber}
            </h2>
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
              {room.queue_status === 'CALL' && room.called_times !== undefined
                ? `กำลังเรียกคิวครั้งที่ ${room.called_times}`
                : t('currentQueue')}
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div 
                className={cn(
                  "text-6xl font-bold text-white rounded-lg px-8 py-5 flex items-center justify-center",
                  isCalling 
                    ? (isMultipleCalls ? "bg-medical-error queue-blink" : "bg-queue-calling queue-blink")
                    : isIn
                    ? "bg-queue-active"
                    : "bg-medical-primary"
                )}
                style={{
                  width: '220px',
                  minWidth: '220px',
                  maxWidth: '220px',
                  ...(!isCalling && !isIn && customColor ? { backgroundColor: customColor } : {})
                }}
              >
                {isEmptyStatus 
                  ? '-'
                  : (room.queue_caption ? `${room.queue_caption}${room.currentQueue.toString().padStart(3, '0')}` : room.currentQueue.toString().padStart(3, '0'))
                }
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}