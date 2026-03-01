# 🔌 MediFlow API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 📚 Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "patient|doctor|admin",
  "phone": "+1234567890"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "patient"
  }
}
```

---

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "role": "patient"
  }
}
```

---

### Verify Token
**POST** `/auth/verify`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "valid": true,
  "user": { /* user object */ }
}
```

---

## 👨‍⚕️ Doctors Endpoints

### Get All Doctors
**GET** `/doctors`

**Response (200):**
```json
{
  "doctors": [
    {
      "_id": "doctor_id",
      "name": "Dr. Smith",
      "email": "doctor@example.com",
      "department": "Cardiology",
      "phone": "+1234567890",
      "availability": ["Monday", "Tuesday"],
      "consultationFee": 100
    }
  ]
}
```

---

### Get Doctor by ID
**GET** `/doctors/:id`

**Response (200):**
```json
{
  "doctor": { /* doctor object */ }
}
```

---

### Update Doctor Profile
**PUT** `/doctors/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Dr. Smith",
  "department": "Cardiology",
  "phone": "+1234567890",
  "availability": ["Monday", "Tuesday", "Wednesday"],
  "consultationFee": 100
}
```

**Response (200):**
```json
{
  "message": "Doctor profile updated",
  "doctor": { /* updated doctor */ }
}
```

---

## 📅 Appointments Endpoints

### Book Appointment
**POST** `/appointments`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "patientId": "patient_id",
  "doctorId": "doctor_id",
  "departmentId": "department_id",
  "dateTime": "2026-02-01T10:00:00",
  "reason": "General checkup"
}
```

**Response (201):**
```json
{
  "message": "Appointment booked successfully",
  "appointment": {
    "_id": "appointment_id",
    "patientId": "patient_id",
    "doctorId": "doctor_id",
    "dateTime": "2026-02-01T10:00:00",
    "status": "scheduled"
  }
}
```

---

### Get Patient Appointments
**GET** `/appointments/patient/:patientId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "appointments": [ /* array of appointments */ ]
}
```

---

### Get Doctor Appointments
**GET** `/appointments/doctor/:doctorId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "appointments": [ /* array of appointments */ ]
}
```

---

### Cancel Appointment
**DELETE** `/appointments/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Appointment cancelled successfully"
}
```

---

## 🏥 Queue Endpoints

### Get Current Queue
**GET** `/queue/:departmentId`

**Response (200):**
```json
{
  "queue": [
    {
      "_id": "queue_item_id",
      "patientId": "patient_id",
      "patientName": "John Doe",
      "departmentId": "department_id",
      "position": 1,
      "status": "waiting"
    }
  ]
}
```

---

### Add to Queue
**POST** `/queue`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "patientId": "patient_id",
  "departmentId": "department_id",
  "appointmentId": "appointment_id"
}
```

**Response (201):**
```json
{
  "message": "Patient added to queue",
  "queueItem": { /* queue object */ }
}
```

---

### Call Next Patient
**PUT** `/queue/:departmentId/next`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Next patient called",
  "currentPatient": { /* queue object */ }
}
```

---

## 📋 Medical Records Endpoints

### Get Patient Records
**GET** `/medical-records/patient/:patientId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "records": [
    {
      "_id": "record_id",
      "patientId": "patient_id",
      "doctorId": "doctor_id",
      "visitDate": "2026-01-15",
      "diagnosis": "Common cold",
      "prescription": "Rest and fluids",
      "notes": "Follow up in 1 week"
    }
  ]
}
```

---

### Create Medical Record
**POST** `/medical-records`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "patientId": "patient_id",
  "doctorId": "doctor_id",
  "diagnosis": "Common cold",
  "prescription": "Rest and fluids",
  "notes": "Follow up in 1 week",
  "visitDate": "2026-01-15"
}
```

**Response (201):**
```json
{
  "message": "Medical record created",
  "record": { /* record object */ }
}
```

---

## 🔐 Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## 🔄 WebSocket Events (Real-time Updates)

### Client → Server Events

**Join Doctor Queue:**
```javascript
socket.emit('joinDoctorQueue', 'doctor_id');
```

**Join Patient Room:**
```javascript
socket.emit('joinPatientRoom', 'patient_id');
```

**Call Next Patient:**
```javascript
socket.emit('callNextPatient', 'doctor_id', 'department_id');
```

**Leave Room:**
```javascript
socket.emit('leaveRoom', 'room_name');
```

---

### Server → Client Events

**Queue Updated:**
```javascript
socket.on('queueUpdated', (queueData) => {
  // Handle queue update
});
```

**Patient Called:**
```javascript
socket.on('patientCalled', (patientData) => {
  // Patient has been called
});
```

**Appointment Notification:**
```javascript
socket.on('appointmentNotification', (appointmentData) => {
  // Handle appointment notification
});
```

---

## 📝 Rate Limiting
Currently no rate limiting is implemented. Consider adding it in production.

## 🔒 Security Headers
Ensure the following headers are set in production:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

## 📧 Testing the API
Use tools like **Postman** or **cURL** to test API endpoints.

Example cURL request:
```bash
curl -X GET http://localhost:5000/api/doctors \
  -H "Authorization: Bearer your_token_here"
```
