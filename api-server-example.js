// Example API server for Clinic Queue Dashboard
// This demonstrates how to integrate with OcmInf and QNurse databases

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connections
const ocmInfConnection = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'OcmInf',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const qNurseConnection = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'QNurse',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// API Routes

// Get patients from OcmInf database
app.post('/api/patients', async (req, res) => {
  try {
    const { date, departmentId, database } = req.body;
    
    let query = `
      SELECT 
        p.patient_id as id,
        p.hn,
        p.first_name as firstName,
        p.last_name as lastName,
        p.date_of_birth as dateOfBirth,
        p.gender,
        d.department_name as department,
        a.appointment_date as appointmentDate,
        a.appointment_time as appointmentTime,
        'waiting' as status,
        ROW_NUMBER() OVER (ORDER BY a.appointment_time) as queueNumber
      FROM patients p
      JOIN appointments a ON p.patient_id = a.patient_id
      JOIN departments d ON a.department_id = d.department_id
      WHERE a.appointment_date = ?
    `;
    
    let params = [date];
    
    if (departmentId) {
      query += ' AND d.department_id = ?';
      params.push(departmentId);
    }
    
    query += ' ORDER BY a.appointment_time ASC';
    
    const [rows] = await ocmInfConnection.execute(query, params);
    
    res.json({
      success: true,
      patients: rows
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patients'
    });
  }
});

// Get departments from OcmInf
app.get('/api/departments', async (req, res) => {
  try {
    const query = 'SELECT department_id as id, department_name as name, department_code as code FROM departments ORDER BY department_name';
    const [rows] = await ocmInfConnection.execute(query);
    
    res.json({
      success: true,
      departments: rows
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch departments'
    });
  }
});

// Get rooms from OcmInf
app.post('/api/rooms', async (req, res) => {
  try {
    const { departmentId, database } = req.body;
    
    let query = `
      SELECT 
        r.room_id as id,
        r.room_number as roomNumber,
        r.department_id as departmentId,
        r.doctor_name as doctorName,
        r.is_active as isActive
      FROM rooms r
    `;
    
    let params = [];
    
    if (departmentId) {
      query += ' WHERE r.department_id = ?';
      params.push(departmentId);
    }
    
    query += ' ORDER BY r.room_number';
    
    const [rows] = await ocmInfConnection.execute(query, params);
    
    res.json({
      success: true,
      rooms: rows
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rooms'
    });
  }
});

// Save patient queue to QNurse database
app.post('/api/patient-queues', async (req, res) => {
  try {
    const { patientId, roomId, queueNumber, status, startTime, createdAt, database } = req.body;
    
    const query = `
      INSERT INTO patient_queues (
        patient_id, 
        room_id, 
        queue_number, 
        status, 
        start_time, 
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const params = [patientId, roomId, queueNumber, status, startTime, createdAt];
    
    const [result] = await qNurseConnection.execute(query, params);
    
    res.json({
      success: true,
      queueId: result.insertId,
      message: 'Patient queue saved successfully'
    });
  } catch (error) {
    console.error('Error saving patient queue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save patient queue'
    });
  }
});

// Update patient queue status in QNurse
app.put('/api/patient-queues/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, endTime, database } = req.body;
    
    const query = `
      UPDATE patient_queues 
      SET status = ?, end_time = ?
      WHERE id = ?
    `;
    
    const params = [status, endTime, id];
    
    await qNurseConnection.execute(query, params);
    
    res.json({
      success: true,
      message: 'Patient queue updated successfully'
    });
  } catch (error) {
    console.error('Error updating patient queue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update patient queue'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;

