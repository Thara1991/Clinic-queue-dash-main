# Manage Dashboard Queue System

## ภาพรวม (Overview)

ระบบจัดการคิวผู้ป่วยที่พัฒนาขึ้นเพื่อจัดการรายชื่อผู้ป่วยจากฐานข้อมูล OcmInf และบันทึกข้อมูลคิวลงในฐานข้อมูล QNurse

## ฟีเจอร์หลัก (Main Features)

### 1. การกรองข้อมูล (Data Filtering)
- **เลือกวันที่**: กรองผู้ป่วยตามวันที่นัดหมาย
- **เลือกแผนก**: กรองผู้ป่วยตามแผนกที่เลือก
- **เลือกห้องตรวจ**: กรองผู้ป่วยตามห้องตรวจที่เลือก

### 2. รายชื่อผู้ป่วย (Patient List)
- แสดงรายชื่อผู้ป่วยจากฐานข้อมูล OcmInf
- แสดงสถานะคิว (รอเรียก, เรียกแล้ว, กำลังตรวจ, เสร็จสิ้น)
- แสดงข้อมูลผู้ป่วย: HN, ชื่อ-นามสกุล, เพศ, แผนก, เวลานัด

### 3. การจัดการคิว (Queue Management)
- **ปุ่ม Start**: เรียกชื่อผู้ป่วยและบันทึกลงในตาราง patient_queues
- **ปุ่ม Finish**: เปลี่ยนสถานะเป็นเสร็จสิ้นหลังจากตรวจเสร็จ

## โครงสร้างไฟล์ (File Structure)

```
src/
├── components/
│   └── ManageDashboard.tsx    # หน้าจัดการคิวหลัก
├── services/
│   └── database.ts            # บริการเชื่อมต่อฐานข้อมูล
├── types/
│   └── queue.ts              # Type definitions
└── App.tsx                   # Routing configuration
```

## การติดตั้งและใช้งาน (Installation & Usage)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Environment Variables
สร้างไฟล์ `.env` และกำหนดค่า:
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### 3. เริ่มต้น Development Server
```bash
npm run dev
```

### 4. เข้าถึง Manage Dashboard
- ไปที่ URL: `http://localhost:3000/manage`
- หรือคลิกปุ่ม "จัดการคิวผู้ป่วย" ในหน้าหลัก

## การเชื่อมต่อฐานข้อมูล (Database Integration)

### OcmInf Database
ใช้สำหรับดึงข้อมูลผู้ป่วย:
- ตาราง `patients`: ข้อมูลผู้ป่วย
- ตาราง `appointments`: ข้อมูลการนัดหมาย
- ตาราง `departments`: ข้อมูลแผนก
- ตาราง `rooms`: ข้อมูลห้องตรวจ

### QNurse Database
ใช้สำหรับบันทึกข้อมูลคิว:
- ตาราง `patient_queues`: ข้อมูลคิวผู้ป่วย

## API Endpoints

### 1. ดึงข้อมูลผู้ป่วย
```
POST /api/patients
Body: {
  "date": "2024-01-15",
  "departmentId": "dept-01",
  "database": "OcmInf"
}
```

### 2. ดึงข้อมูลแผนก
```
GET /api/departments
```

### 3. ดึงข้อมูลห้องตรวจ
```
POST /api/rooms
Body: {
  "departmentId": "dept-01",
  "database": "OcmInf"
}
```

### 4. บันทึกคิวผู้ป่วย
```
POST /api/patient-queues
Body: {
  "patientId": "pat-001",
  "roomId": "room-01",
  "queueNumber": 1,
  "status": "called",
  "startTime": "2024-01-15T09:00:00Z",
  "createdAt": "2024-01-15T09:00:00Z",
  "database": "QNurse"
}
```

### 5. อัปเดตสถานะคิว
```
PUT /api/patient-queues/:id
Body: {
  "status": "completed",
  "endTime": "2024-01-15T09:30:00Z",
  "database": "QNurse"
}
```

## SQL Queries ตัวอย่าง

### ดึงข้อมูลผู้ป่วยจาก OcmInf
```sql
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
  AND d.department_id = ?
ORDER BY a.appointment_time ASC
```

### บันทึกคิวผู้ป่วยใน QNurse
```sql
INSERT INTO patient_queues (
  patient_id, 
  room_id, 
  queue_number, 
  status, 
  start_time, 
  created_at
) VALUES (?, ?, ?, ?, ?, ?)
```

### อัปเดตสถานะคิว
```sql
UPDATE patient_queues 
SET status = ?, end_time = ?
WHERE id = ?
```

## การใช้งาน (Usage Guide)

### 1. เข้าสู่ระบบ
- เปิดเบราว์เซอร์ไปที่ `http://localhost:3000/manage`

### 2. กรองข้อมูล
- เลือกวันที่ที่ต้องการดูข้อมูล
- เลือกแผนก (ถ้าต้องการกรองเฉพาะแผนก)
- เลือกห้องตรวจ (ถ้าต้องการกรองเฉพาะห้อง)

### 3. จัดการคิว
- **เรียกผู้ป่วย**: คลิกปุ่ม "เรียก" เพื่อเริ่มตรวจ
- **เสร็จสิ้น**: คลิกปุ่ม "เสร็จสิ้น" หลังจากตรวจเสร็จ

### 4. ดูสถานะ
- **รอเรียก**: ผู้ป่วยรอการเรียก
- **เรียกแล้ว**: ผู้ป่วยถูกเรียกแล้ว
- **กำลังตรวจ**: ผู้ป่วยกำลังถูกตรวจ
- **เสร็จสิ้น**: การตรวจเสร็จสิ้นแล้ว

## การแก้ไขปัญหา (Troubleshooting)

### 1. ไม่สามารถเชื่อมต่อฐานข้อมูลได้
- ตรวจสอบการตั้งค่า database connection
- ตรวจสอบว่า MySQL server ทำงานอยู่
- ตรวจสอบ username/password ของฐานข้อมูล

### 2. ไม่แสดงข้อมูลผู้ป่วย
- ตรวจสอบว่ามีข้อมูลในตาราง OcmInf
- ตรวจสอบการกรองวันที่และแผนก
- ดู console log เพื่อดู error messages

### 3. ปุ่ม Start/Finish ไม่ทำงาน
- ตรวจสอบการเชื่อมต่อ API server
- ตรวจสอบ console log เพื่อดู error messages
- ตรวจสอบว่ามีการเลือกห้องตรวจแล้ว

## การพัฒนาต่อ (Future Development)

### 1. Real-time Updates
- เพิ่ม WebSocket สำหรับอัปเดตแบบ real-time
- แสดงการเปลี่ยนแปลงสถานะทันที

### 2. Notification System
- เพิ่มการแจ้งเตือนเมื่อมีการเรียกผู้ป่วย
- เพิ่มเสียงแจ้งเตือน

### 3. Reporting
- เพิ่มรายงานสถิติการใช้งาน
- เพิ่มการ export ข้อมูล

### 4. Mobile Support
- เพิ่ม responsive design สำหรับมือถือ
- เพิ่ม PWA support

## การสนับสนุน (Support)

หากมีปัญหาหรือข้อสงสัย กรุณาติดต่อทีมพัฒนา หรือสร้าง issue ใน repository



