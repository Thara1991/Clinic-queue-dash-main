import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/contexts/LanguageContext';
import { Patient, Room, Department, PatientQueue } from '@/types/queue';
import { DatabaseService } from '@/services/database';
import { Calendar, Clock, User, MapPin, Play, Square, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for demonstration
const mockDepartments: Department[] = [
  { id: 'dept-01', name: 'อายุรกรรม', code: 'MED' },
  { id: 'dept-02', name: 'ศัลยกรรม', code: 'SUR' },
  { id: 'dept-03', name: 'กุมารเวชกรรม', code: 'PED' },
  { id: 'dept-04', name: 'สูติ-นรีเวชกรรม', code: 'OBG' },
  { id: 'dept-05', name: 'จักษุวิทยา', code: 'EYE' }
];

const mockRooms: Room[] = [
  { id: 'room-01', roomNumber: '101', departmentId: 'dept-01', doctorName: 'นพ.สมชาย ใจดี', isActive: true },
  { id: 'room-02', roomNumber: '102', departmentId: 'dept-01', doctorName: 'นพ.วิรัช เก่งกล้า', isActive: true },
  { id: 'room-03', roomNumber: '103', departmentId: 'dept-02', doctorName: 'นพ.ประยุทธ์ ช่วยเหลือ', isActive: true },
  { id: 'room-04', roomNumber: '104', departmentId: 'dept-03', doctorName: 'นพ.อนุชา รักษ์ดี', isActive: true },
  { id: 'room-05', roomNumber: '105', departmentId: 'dept-04', doctorName: 'นพ.สุรชัย มั่นคง', isActive: true }
];

const mockPatients: Patient[] = [
  {
    id: 'pat-001',
    hn: 'HN001234',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    dateOfBirth: '1980-05-15',
    gender: 'M',
    department: 'อายุรกรรม',
    appointmentDate: '2024-01-15',
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
    appointmentDate: '2024-01-15',
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
    appointmentDate: '2024-01-15',
    appointmentTime: '09:30',
    status: 'called',
    queueNumber: 3,
    roomId: 'room-01'
  },
  {
    id: 'pat-004',
    hn: 'HN001237',
    firstName: 'มาลี',
    lastName: 'สวยงาม',
    dateOfBirth: '1990-08-05',
    gender: 'F',
    department: 'กุมารเวชกรรม',
    appointmentDate: '2024-01-15',
    appointmentTime: '10:00',
    status: 'in_progress',
    queueNumber: 4,
    roomId: 'room-02'
  }
];

export function ManageDashboard() {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load patients when date or department changes
  useEffect(() => {
    if (selectedDate) {
      loadPatients();
    }
  }, [selectedDate, selectedDepartment]);

  // Load rooms when department changes
  useEffect(() => {
    if (selectedDepartment) {
      loadRooms();
    }
  }, [selectedDepartment]);

  // Filter patients based on selected criteria
  useEffect(() => {
    let filtered = patients;

    if (selectedDepartment) {
      const dept = departments.find(d => d.id === selectedDepartment);
      if (dept) {
        filtered = filtered.filter(p => p.department === dept.name);
      }
    }

    if (selectedRoom) {
      filtered = filtered.filter(p => p.roomId === selectedRoom);
    }

    // Filter by date
    filtered = filtered.filter(p => p.appointmentDate === selectedDate);

    setFilteredPatients(filtered);
  }, [selectedDate, selectedDepartment, selectedRoom, patients, departments]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [departmentsData] = await Promise.all([
        DatabaseService.getDepartments()
      ]);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    setLoading(true);
    try {
      const patientsData = await DatabaseService.getPatientsFromOcmInf(selectedDate, selectedDepartment);
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      const roomsData = await DatabaseService.getRooms(selectedDepartment);
      setRooms(roomsData);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  // Get available rooms for selected department
  const availableRooms = selectedDepartment 
    ? rooms.filter(room => room.departmentId === selectedDepartment && room.isActive)
    : rooms.filter(room => room.isActive);

  const handleStartPatient = async (patientId: string) => {
    try {
      const patient = patients.find(p => p.id === patientId);
      if (!patient || !selectedRoom) return;

      // Create queue data
      const queueData: PatientQueue = {
        id: `queue-${Date.now()}`,
        patientId,
        roomId: selectedRoom,
        queueNumber: patient.queueNumber || 0,
        status: 'called',
        startTime: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      // Save to QNurse database
      const success = await DatabaseService.savePatientQueue(queueData);
      
      if (success) {
        // Update patient status to 'called'
        setPatients(prev => prev.map(p => 
          p.id === patientId 
            ? { ...p, status: 'called' as const, roomId: selectedRoom }
            : p
        ));
        
        console.log(`Patient ${patientId} started successfully`);
      } else {
        console.error('Failed to save patient queue');
      }
      
    } catch (error) {
      console.error('Error starting patient:', error);
    }
  };

  const handleFinishPatient = async (patientId: string) => {
    try {
      const patient = patients.find(p => p.id === patientId);
      if (!patient) return;

      // Update patient queue status in QNurse database
      const success = await DatabaseService.updatePatientQueueStatus(
        `queue-${patientId}`, // This should be the actual queue ID from database
        'completed',
        new Date().toISOString()
      );

      if (success) {
        // Update patient status to 'completed'
        setPatients(prev => prev.map(p => 
          p.id === patientId 
            ? { ...p, status: 'completed' as const }
            : p
        ));
        
        console.log(`Patient ${patientId} finished successfully`);
      } else {
        console.error('Failed to update patient queue status');
      }
      
    } catch (error) {
      console.error('Error finishing patient:', error);
    }
  };

  const getStatusBadge = (status: Patient['status']) => {
    const statusConfig = {
      waiting: { label: 'รอเรียก', variant: 'secondary' as const },
      called: { label: 'เรียกแล้ว', variant: 'default' as const },
      in_progress: { label: 'กำลังตรวจ', variant: 'destructive' as const },
      completed: { label: 'เสร็จสิ้น', variant: 'outline' as const }
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatTime = (time: string) => {
    return time;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-surface to-medical-surface-variant">
      {/* Header */}
      <header className="bg-medical-surface shadow-lg border-b-4 border-medical-primary">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  กลับหน้าหลัก
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-medical-primary mb-2">
                  จัดการคิวผู้ป่วย
                </h1>
                <p className="text-medical-on-surface-variant text-lg">
                  Manage Dashboard Queue System
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                รีเฟรช
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="container mx-auto px-6 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              ตัวกรองข้อมูล
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="date">วันที่</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="department">แผนก</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="เลือกแผนก" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">ทั้งหมด</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="room">ห้องตรวจ</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="เลือกห้องตรวจ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">ทั้งหมด</SelectItem>
                    {availableRooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>
                        ห้อง {room.roomNumber} - {room.doctorName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedDepartment('');
                    setSelectedRoom('');
                  }}
                  className="w-full"
                >
                  ล้างตัวกรอง
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              รายชื่อผู้ป่วย ({filteredPatients.length} คน)
              {loading && <Badge variant="outline">กำลังโหลด...</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    กำลังโหลดข้อมูล...
                  </div>
                </div>
              ) : (
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>คิว</TableHead>
                    <TableHead>HN</TableHead>
                    <TableHead>ชื่อ-นามสกุล</TableHead>
                    <TableHead>เพศ</TableHead>
                    <TableHead>แผนก</TableHead>
                    <TableHead>เวลานัด</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>ห้องตรวจ</TableHead>
                    <TableHead>การดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">
                        {patient.queueNumber}
                      </TableCell>
                      <TableCell>{patient.hn}</TableCell>
                      <TableCell>
                        {patient.firstName} {patient.lastName}
                      </TableCell>
                      <TableCell>
                        {patient.gender === 'M' ? 'ชาย' : 'หญิง'}
                      </TableCell>
                      <TableCell>{patient.department}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(patient.appointmentTime)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(patient.status)}
                      </TableCell>
                      <TableCell>
                        {patient.roomId ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {rooms.find(r => r.id === patient.roomId)?.roomNumber}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {patient.status === 'waiting' && (
                            <Button
                              size="sm"
                              onClick={() => handleStartPatient(patient.id)}
                              className="flex items-center gap-1"
                              disabled={!selectedRoom}
                            >
                              <Play className="w-4 h-4" />
                              เรียก
                            </Button>
                          )}
                          {patient.status === 'called' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleFinishPatient(patient.id)}
                              className="flex items-center gap-1"
                            >
                              <Square className="w-4 h-4" />
                              เสร็จสิ้น
                            </Button>
                          )}
                          {patient.status === 'completed' && (
                            <Badge variant="outline">เสร็จสิ้นแล้ว</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
