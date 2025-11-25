export interface QueueRoom {
  id: string;
  roomNumber: string;
  doctorName: {
    th: string;
    en: string;
  };
  currentQueue: number;
  status: 'active' | 'waiting' | 'calling' | 'completed';
  color?: string;
  station?: string;
}

export interface Language {
  code: 'th' | 'en';
  label: string;
}

export interface QueueSettings {
  cardColors: Record<string, string>;
  language: Language['code'];
  refreshInterval: number;
}

// Patient and Queue Management Types
export interface Patient {
  id: string;
  hn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  department: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'waiting' | 'called' | 'in_progress' | 'completed';
  queueNumber?: number;
  roomId?: string;
}

export interface PatientQueue {
  id: string;
  patientId: string;
  roomId: string;
  queueNumber: number;
  status: 'waiting' | 'called' | 'in_progress' | 'completed';
  startTime?: string;
  endTime?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  departmentId: string;
  doctorName: string;
  isActive: boolean;
}