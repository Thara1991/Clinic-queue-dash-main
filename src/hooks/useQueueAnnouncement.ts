import { useEffect, useRef } from 'react';
import { QueueRoom } from '@/types/queue';
import { announceQueue, stopSpeech } from '@/utils/speech';
import dashboardAPI from '@/components/dashboardAPI';

/**
 * Custom hook to automatically announce queue numbers when they are called
 * Compares previous state with current state to detect new calls
 */
interface QueueAnnouncementOptions {
  onAnnouncementStart?: () => void;
  onAnnouncementEnd?: () => void;
}

export function useQueueAnnouncement(
  rooms: QueueRoom[],
  voiceEnabled: boolean,
  voiceLanguage: 'th' | 'en' = 'th',
  options: QueueAnnouncementOptions = {}
) {
  const previousRoomsRef = useRef<QueueRoom[]>([]);
  const announcedQueuesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!voiceEnabled) {
      // Reset tracking when voice is disabled
      previousRoomsRef.current = rooms.map((room) => ({ ...room }));
      announcedQueuesRef.current.clear();
      return;
    }

    // Get current rooms that should be announced
    // Condition: Call_yon = 'Y' AND queue_status is not empty/null
    const currentCallingRooms = rooms.filter((room) => {
      const callYon = room.Call_yon?.trim().toUpperCase();
      const queueStatus = room.queue_status?.trim() || '';
      
      return callYon === 'Y' && queueStatus !== '';
    });

    // Get previous rooms for comparison
    const previousRooms = previousRoomsRef.current;

    // Helper to find previous room state
    const findPreviousRoom = (roomId: string) =>
      previousRooms.find((prevRoom) => prevRoom.id === roomId);

    // Find newly called queues (rooms that just met the announcement condition or changed call state)
    const newlyCalledRooms = currentCallingRooms.filter((currentRoom) => {
      const previousRoom = findPreviousRoom(currentRoom.id);
      const previousCallYon = previousRoom?.Call_yon?.trim().toUpperCase();
      const previousQueueStatus = previousRoom?.queue_status?.trim() || '';
      const previousCalledTimes = previousRoom?.called_times ?? -1;
      const previousQueueNumber = previousRoom?.currentQueue ?? -1;

      const currentCallYon = currentRoom.Call_yon?.trim().toUpperCase();
      const currentQueueStatus = currentRoom.queue_status?.trim() || '';
      const currentCalledTimes = currentRoom.called_times ?? -1;
      const currentQueueNumber = currentRoom.currentQueue ?? -1;

      // Determine if this is a new announcement scenario
      const callStatusChanged = previousCallYon !== currentCallYon;
      const queueStatusChanged = previousQueueStatus !== currentQueueStatus;
      const calledTimesChanged = previousCalledTimes !== currentCalledTimes;
      const queueNumberChanged = previousQueueNumber !== currentQueueNumber;
      const isFirstAnnouncement = !previousRoom;

      // Check if we haven't already announced this specific queue call
      const queueKey = `${currentRoom.id}-${currentQueueNumber}-${currentCalledTimes}-${currentCallYon}-${currentQueueStatus}`;
      const alreadyAnnounced = announcedQueuesRef.current.has(queueKey);

      return (
        !alreadyAnnounced &&
        (isFirstAnnouncement ||
          callStatusChanged ||
          queueStatusChanged ||
          calledTimesChanged ||
          queueNumberChanged)
      );
    });

    if (newlyCalledRooms.length > 0) {
      options.onAnnouncementStart?.();

      const announcementPromises = newlyCalledRooms.map((room) => {
        const queueNumber = room.queue_caption
          ? `${room.queue_caption}${room.currentQueue.toString().padStart(3, '0')}`
          : room.currentQueue.toString().padStart(3, '0');

        const roomNumber = room.roomNumber;

        // Mark as announced
        const queueKey = `${room.id}-${room.currentQueue ?? -1}-${room.called_times ?? -1}-${room.Call_yon?.trim().toUpperCase() ?? ''}-${room.queue_status?.trim() ?? ''}`;
        announcedQueuesRef.current.add(queueKey);

        console.log('Announcing queue:', queueNumber, 'for room:', roomNumber);
        return announceQueue(queueNumber, roomNumber, 1, voiceLanguage)
          .then(async () => {
            const targetRoomId = room.roomIdRaw ?? room.id;
            try {
              await dashboardAPI.callQueue(targetRoomId, 'N');
            } catch (error) {
              console.error('Failed to notify backend to reset call flag:', error);
            }
          })
          .catch((error) => {
            console.error('Failed to announce queue:', error);
          });
      });

      Promise.all(announcementPromises)
        .catch((error) => {
          console.error('Failed to complete announcements:', error);
        })
        .finally(() => {
          options.onAnnouncementEnd?.();
        });
    }

    // Clean up old announcements (keep only recent ones to prevent memory leak)
    if (announcedQueuesRef.current.size > 100) {
      const keysArray = Array.from(announcedQueuesRef.current);
      announcedQueuesRef.current = new Set(keysArray.slice(-50));
    }

    // Update previous rooms reference
    previousRoomsRef.current = rooms.map((room) => ({ ...room }));
  }, [rooms, voiceEnabled, voiceLanguage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);
}

