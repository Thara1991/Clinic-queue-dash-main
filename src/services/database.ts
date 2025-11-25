// Database service for handling OcmInf and patient_queues integration
import { Patient, PatientQueue, Room, Department } from '@/types/queue';

// Mock database configuration
const DB_CONFIG = {
  OcmInf: {
    host: 'bithis.ddns.net',
    port: 1433,
    database: 'OcmInf',
    username: 'root',
    password: 'password'
  },
  QNurse: {
    host: 'bithis.ddns.net', 
    port: 1433,
    database: 'QNurse',
    username: 'bit',
    password: 'bitbit'
  }
};

console.log(import.meta.env.VITE_API_URL || 'http://localhost:3001/api');
// Mock API endpoints - replace with actual API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';


export class DatabaseService {
  // Fetch patients from OcmInf database
  static async getPatientsFromOcmInf(date: string, departmentId?: string): Promise<Patient[]> {
    try {
      // Mock API call - replace with actual implementation
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          departmentId,
          database: 'OcmInf'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.patients || [];
    } catch (error) {
      console.error('Error fetching patients from OcmInf:', error);
      // Return mock data for development
      return this.getMockPatients(date, departmentId);
    }
  }

  // Save patient queue to QNurse database
  static async savePatientQueue(queueData: PatientQueue): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/patient-queues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...queueData,
          database: 'QNurse'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error saving patient queue:', error);
      return false;
    }
  }

  // Update patient queue status
  static async updatePatientQueueStatus(queueId: string, status: string, endTime?: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/patient-queues/${queueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          endTime,
          database: 'QNurse'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating patient queue:', error);
      return false;
    }
  }

  // Get departments from OcmInf
  static async getDepartments(): Promise<Department[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/departments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.departments || [];
    } catch (error) {
      console.error('Error fetching departments:', error);
      return this.getMockDepartments();
    }
  }

  // Get rooms from OcmInf
  static async getRooms(departmentId?: string): Promise<Room[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          departmentId,
          database: 'OcmInf'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.rooms || [];
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return this.getMockRooms();
    }
  }

  // Mock data for development
  private static getMockPatients(date: string, departmentId?: string): Patient[] {
    const mockPatients: Patient[] = [
      {
        id: 'pat-001',
        hn: 'HN001234',
        firstName: 'สมชาย',
        lastName: 'ใจดี',
        dateOfBirth: '1980-05-15',
        gender: 'M',
        department: 'อายุรกรรม',
        appointmentDate: date,
        appointmentTime: '09:00',
        status: 'waiting',
        queueNumber: 1
      },
      {
        id: 'pat-002',
        hn: 'HN001235',
        firstName: 'สมหญิง',
        lastName: 'รักดี',
        dateOfBirth: '1985-03-22',
        gender: 'F',
        department: 'อายุรกรรม',
        appointmentDate: date,
        appointmentTime: '09:15',
        status: 'waiting',
        queueNumber: 2
      },
      {
        id: 'pat-003',
        hn: 'HN001236',
        firstName: 'วิชัย',
        lastName: 'เก่งกล้า',
        dateOfBirth: '1975-12-10',
        gender: 'M',
        department: 'ศัลยกรรม',
        appointmentDate: date,
        appointmentTime: '09:30',
        status: 'waiting',
        queueNumber: 3
      }
    ];

    if (departmentId) {
      const departments = this.getMockDepartments();
      const dept = departments.find(d => d.id === departmentId);
      if (dept) {
        return mockPatients.filter(p => p.department === dept.name);
      }
    }

    return mockPatients;
  }

  private static getMockDepartments(): Department[] {
    return [
      { id: 'dept-01', name: 'อายุรกรรม', code: 'MED' },
      { id: 'dept-02', name: 'ศัลยกรรม', code: 'SUR' },
      { id: 'dept-03', name: 'กุมารเวชกรรม', code: 'PED' },
      { id: 'dept-04', name: 'สูติ-นรีเวชกรรม', code: 'OBG' },
      { id: 'dept-05', name: 'จักษุวิทยา', code: 'EYE' }
    ];
  }

  private static getMockRooms(): Room[] {
    return [
      { id: 'room-01', roomNumber: '101', departmentId: 'dept-01', doctorName: 'นพ.สมชาย ใจดี', isActive: true },
      { id: 'room-02', roomNumber: '102', departmentId: 'dept-01', doctorName: 'นพ.วิรัช เก่งกล้า', isActive: true },
      { id: 'room-03', roomNumber: '103', departmentId: 'dept-02', doctorName: 'นพ.ประยุทธ์ ช่วยเหลือ', isActive: true },
      { id: 'room-04', roomNumber: '104', departmentId: 'dept-03', doctorName: 'นพ.อนุชา รักษ์ดี', isActive: true },
      { id: 'room-05', roomNumber: '105', departmentId: 'dept-04', doctorName: 'นพ.สุรชัย มั่นคง', isActive: true }
    ];
  }
}

// SQL queries for reference (to be implemented in backend)
export const SQL_QUERIES = {
  // Base query to get patients from OcmInf
  GET_PATIENTS_BASE: `
    SELECT 
      p.patient_id as id,
      p.hn,
      p.first_name as firstName,
      p.last_name as lastName,
      p.date_of_birth as dateOfBirth,
      p.gender,
      d.department_name as department,
      a.appointment_date as appointmentDate,
      a.appointment_time as appointmentTime
    FROM patients p
    JOIN appointments a ON p.patient_id = a.patient_id
    JOIN departments d ON a.department_id = d.department_id
    WHERE a.appointment_date = ?
  `,

  // Function to generate the complete query with optional department filter
  getPatientsQuery: (departmentId?: string) => {
    const baseQuery = SQL_QUERIES.GET_PATIENTS_BASE;
    const departmentFilter = departmentId ? 'AND d.department_id = ?' : '';
    return `${baseQuery} ${departmentFilter} ORDER BY a.appointment_time ASC`;
  },

  // Query to insert patient queue
  INSERT_PATIENT_QUEUE: `
    INSERT INTO patient_queues (
      patient_id, 
      room_id, 
      queue_number, 
      status, 
      start_time, 
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `,

  // Query to update patient queue status
  UPDATE_PATIENT_QUEUE: `
    UPDATE patient_queues 
    SET status = ?, end_time = ?
    WHERE id = ?
  `
};

