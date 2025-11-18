# API Specification for Clinic Queue Dashboard

This document describes the exact data format that your API must send to this project for it to display correctly on screen.

## Base URL
```
http://localhost:3001/api
```
(Or the URL configured in `REACT_APP_API_URL` environment variable)

---

## API Endpoints

### 1️⃣ **GET `/api/departments`**
**Purpose:** Get list of all medical departments

**Request:**
```http
GET /api/departments
Content-Type: application/json
```

**Response Format:**
```json
{
  "departments": [
    {
      "id": "dept-01",
      "name": "อายุรกรรม",
      "code": "MED"
    },
    {
      "id": "dept-02",
      "name": "ศัลยกรรม",
      "code": "SUR"
    },
    {
      "id": "dept-03",
      "name": "กุมารเวชกรรม",
      "code": "PED"
    },
    {
      "id": "dept-04",
      "name": "สูติ-นรีเวชกรรม",
      "code": "OBG"
    },
    {
      "id": "dept-05",
      "name": "จักษุวิทยา",
      "code": "EYE"
    }
  ]
}
```

**Field Requirements:**
- `id`: Unique string identifier
- `name`: Department name in Thai
- `code`: Short department code (uppercase)

---

### 2️⃣ **POST `/api/patients`**
**Purpose:** Get list of patients with appointments

**Request:**
```http
POST /api/patients
Content-Type: application/json

{
  "date": "2024-01-15",           // Required: YYYY-MM-DD format
  "departmentId": "dept-01",      // Optional: filter by department
  "database": "OcmInf"            // Required: always "OcmInf"
}
```

**Response Format:**
```json
{
  "patients": [
    {
      "id": "pat-001",
      "hn": "HN001234",
      "firstName": "สมชาย",
      "lastName": "ใจดี",
      "dateOfBirth": "1980-05-15",
      "gender": "M",
      "department": "อายุรกรรม",
      "appointmentDate": "2024-01-15",
      "appointmentTime": "09:00",
      "status": "waiting",
      "queueNumber": 1
    },
    {
      "id": "pat-002",
      "hn": "HN001235",
      "firstName": "สมหญิง",
      "lastName": "รักดี",
      "dateOfBirth": "1985-03-22",
      "gender": "F",
      "department": "อายุรกรรม",
      "appointmentDate": "2024-01-15",
      "appointmentTime": "09:15",
      "status": "waiting",
      "queueNumber": 2
    }
  ]
}
```

**Field Requirements:**
- `id`: Unique patient identifier (string)
- `hn`: Hospital number/patient ID
- `firstName`: First name (Thai)
- `lastName`: Last name (Thai)
- `dateOfBirth`: Date in YYYY-MM-DD format
- `gender`: "M" (Male) or "F" (Female)
- `department`: Department name matching `departments.name`
- `appointmentDate`: Date in YYYY-MM-DD format
- `appointmentTime`: Time in HH:MM format (24-hour)
- `status`: "waiting", "called", "in_progress", or "completed"
- `queueNumber`: Integer queue number

---

### 3️⃣ **POST `/api/rooms`**
**Purpose:** Get list of examination rooms

**Request:**
```http
POST /api/rooms
Content-Type: application/json

{
  "departmentId": "dept-01",     // Optional: filter by department
  "database": "OcmInf"           // Required: always "OcmInf"
}
```

**Response Format:**
```json
{
  "rooms": [
    {
      "id": "room-01",
      "roomNumber": "101",
      "departmentId": "dept-01",
      "doctorName": "นพ.สมชาย ใจดี",
      "isActive": true
    },
    {
      "id": "room-02",
      "roomNumber": "102",
      "departmentId": "dept-01",
      "doctorName": "นพ.วิรัช เก่งกล้า",
      "isActive": true
    },
    {
      "id": "room-03",
      "roomNumber": "103",
      "departmentId": "dept-02",
      "doctorName": "นพ.ประยุทธ์ ช่วยเหลือ",
      "isActive": true
    }
  ]
}
```

**Field Requirements:**
- `id`: Unique room identifier (string)
- `roomNumber`: Room number/name
- `departmentId`: Department ID matching `departments.id`
- `doctorName`: Doctor's full name (Thai)
- `isActive`: Boolean indicating if room is currently active

---

### 4️⃣ **POST `/api/patient-queues`**
**Purpose:** Save a new patient queue entry

**Request:**
```http
POST /api/patient-queues
Content-Type: application/json

{
  "id": "queue-123",
  "patientId": "pat-001",
  "roomId": "room-01",
  "queueNumber": 1,
  "status": "waiting",
  "startTime": "2024-01-15T09:00:00Z",
  "endTime": "2024-01-15T09:30:00Z",
  "createdAt": "2024-01-15T08:00:00Z",
  "database": "QNurse"
}
```

**Response Format:**
```json
{
  "success": true
}
```
OR simply return HTTP 200 status

---

### 5️⃣ **PUT `/api/patient-queues/:id`**
**Purpose:** Update patient queue status

**Request:**
```http
PUT /api/patient-queues/queue-123
Content-Type: application/json

{
  "status": "completed",
  "endTime": "2024-01-15T09:30:00Z",
  "database": "QNurse"
}
```

**Response Format:**
```json
{
  "success": true
}
```
OR simply return HTTP 200 status

---

## Error Handling

All endpoints should handle errors gracefully:

**Error Response Format:**
```json
{
  "success": false,
  "error": "Error message here"
}
```

**HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Not Found
- `500`: Server Error

---

## Important Notes

1. **Fallback to Mock Data:** If any API call fails, the frontend will automatically fall back to mock data for development purposes.

2. **Date Format:** Always use `YYYY-MM-DD` for dates and `HH:MM` for times.

3. **Thai Language:** All patient names, department names, and doctor names should be in Thai.

4. **Required vs Optional Fields:** 
   - Response fields marked with specific examples are **required**
   - Fields listed as "optional" in request body can be omitted

5. **Queue Status Values:**
   - `waiting`: Patient is waiting to be called
   - `called`: Patient has been called but not started
   - `in_progress`: Patient is currently being examined
   - `completed`: Patient has completed their visit

6. **Database Field:** The `database` field in requests is informational and indicates which database the query should target (OcmInf or QNurse).

---

## Testing Your API

You can test if your API is working by running:

```bash
# Test health check (if implemented)
curl http://localhost:3001/api/health

# Test departments
curl http://localhost:3001/api/departments

# Test patients
curl -X POST http://localhost:3001/api/patients \
  -H "Content-Type: application/json" \
  -d '{"date":"2024-01-15","departmentId":"dept-01","database":"OcmInf"}'

# Test rooms
curl -X POST http://localhost:3001/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"departmentId":"dept-01","database":"OcmInf"}'
```

---

## Example Integration

See `api-server-example.js` in the project root for a complete example implementation.

