# 📊 MediFlow Database Schema Documentation

## Overview
MediFlow uses **MongoDB** as its primary database. This document provides a comprehensive reference for all database schemas used in the application.

---

## Collections

### 1. Users Collection

**Purpose:** Stores user information for patients, doctors, and administrators.

**Schema:**
```javascript
{
  _id: ObjectId,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Not returned by default
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },
  phone: {
    type: String,
    match: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  address: String,
  city: String,
  state: String,
  zipCode: String,
  avatar: String, // URL to profile image
  
  // Doctor-specific fields
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  specialization: String,
  licenseNumber: String,
  yearsOfExperience: Number,
  consultationFee: {
    type: Number,
    min: 0
  },
  availability: {
    type: Map,
    of: [
      {
        dayOfWeek: String, // 'Monday', 'Tuesday', etc.
        startTime: String, // '09:00'
        endTime: String    // '17:00'
      }
    ]
  },
  
  // Patient-specific fields
  bloodType: String,
  allergies: [String],
  chronicDiseases: [String],
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  
  // Account metadata
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes:**
- `email` - Unique index for fast lookups
- `role` - For filtering by user type
- `department` - For finding doctors in a department

**Example Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "email": "john@example.com",
  "password": "$2a$10$encrypted_password_hash",
  "name": "John Doe",
  "role": "patient",
  "phone": "+1-555-123-4567",
  "dateOfBirth": ISODate("1990-05-15T00:00:00Z"),
  "gender": "male",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "bloodType": "O+",
  "allergies": ["Penicillin", "Shellfish"],
  "chronicDiseases": ["Diabetes"],
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "+1-555-123-4568",
    "relationship": "Sister"
  },
  "isActive": true,
  "lastLogin": ISODate("2026-01-29T10:30:00Z"),
  "emailVerified": true,
  "createdAt": ISODate("2025-12-01T08:00:00Z"),
  "updatedAt": ISODate("2026-01-29T10:30:00Z")
}
```

---

### 2. Appointments Collection

**Purpose:** Stores appointment bookings between patients and doctors.

**Schema:**
```javascript
{
  _id: ObjectId,
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  dateTime: {
    type: Date,
    required: true,
    index: true
  },
  duration: {
    type: Number,
    default: 30, // minutes
    min: 15,
    max: 120
  },
  reason: {
    type: String,
    required: true
  },
  notes: String,
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show', 'rescheduled'],
    default: 'scheduled',
    index: true
  },
  cancellationReason: String,
  cancellationTime: Date,
  confirmedByPatient: {
    type: Boolean,
    default: false
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: Date,
  
  // Prescription details (if applicable)
  prescription: {
    medicines: [
      {
        name: String,
        dosage: String,
        frequency: String,
        duration: String
      }
    ],
    notes: String
  },
  
  // Follow-up appointment
  followUpAppointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes:**
- `patientId` - For finding patient's appointments
- `doctorId` - For finding doctor's schedule
- `dateTime` - For filtering by date
- `status` - For filtering by appointment status

**Example Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "patientId": ObjectId("507f1f77bcf86cd799439011"),
  "doctorId": ObjectId("507f1f77bcf86cd799439013"),
  "departmentId": ObjectId("507f1f77bcf86cd799439014"),
  "dateTime": ISODate("2026-02-05T14:00:00Z"),
  "duration": 30,
  "reason": "Regular checkup",
  "notes": "Patient complains of fatigue",
  "status": "scheduled",
  "confirmedByPatient": true,
  "reminderSent": true,
  "reminderSentAt": ISODate("2026-02-04T14:00:00Z"),
  "prescription": {
    "medicines": [
      {
        "name": "Vitamin B12",
        "dosage": "1000 mcg",
        "frequency": "Once daily",
        "duration": "30 days"
      }
    ],
    "notes": "Take with food"
  },
  "createdAt": ISODate("2026-01-25T10:00:00Z"),
  "updatedAt": ISODate("2026-01-29T11:30:00Z")
}
```

---

### 3. Queue Collection

**Purpose:** Manages real-time patient queue for each department.

**Schema:**
```javascript
{
  _id: ObjectId,
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
    index: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  position: {
    type: Number,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['waiting', 'called', 'no-show', 'completed'],
    default: 'waiting',
    index: true
  },
  estimatedWaitTime: {
    type: Number,
    default: 0 // minutes
  },
  joinedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  calledAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancelReason: String,
  
  // Token/Ticket number
  tokenNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes:**
- `departmentId` - For finding queue by department
- `status` - For filtering by queue status
- `position` - For sorting by position
- `joinedAt` - For time-based queries

**Example Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439015"),
  "patientId": ObjectId("507f1f77bcf86cd799439011"),
  "departmentId": ObjectId("507f1f77bcf86cd799439014"),
  "appointmentId": ObjectId("507f1f77bcf86cd799439012"),
  "position": 3,
  "status": "waiting",
  "estimatedWaitTime": 15,
  "joinedAt": ISODate("2026-01-29T09:30:00Z"),
  "tokenNumber": "A-0042",
  "createdAt": ISODate("2026-01-29T09:30:00Z")
}
```

---

### 4. Medical Records Collection

**Purpose:** Stores patient medical history and consultation records.

**Schema:**
```javascript
{
  _id: ObjectId,
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  visitDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Vital signs
  vitals: {
    temperature: Number, // °F or °C
    bloodPressure: String, // e.g., "120/80"
    heartRate: Number, // bpm
    respiratoryRate: Number,
    weight: Number, // kg
    height: Number, // cm
    bmi: Number
  },
  
  // Clinical information
  symptoms: [String],
  diagnosis: String,
  icd10Code: String, // International Classification of Diseases code
  
  // Prescription
  prescription: {
    medicines: [
      {
        name: String,
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String
      }
    ],
    notes: String
  },
  
  // Tests and procedures
  labTests: [
    {
      name: String,
      type: String, // e.g., 'blood', 'imaging'
      status: String, // 'pending', 'completed'
      result: String,
      normalRange: String,
      dateOrdered: Date,
      dateCompleted: Date
    }
  ],
  
  procedures: [
    {
      name: String,
      date: Date,
      result: String
    }
  ],
  
  // Notes and follow-up
  clinicalNotes: String,
  followUpNotes: String,
  followUpDate: Date,
  followUpDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Attachments
  attachments: [
    {
      filename: String,
      url: String,
      type: String, // 'image', 'pdf', 'document'
      uploadedAt: Date
    }
  ],
  
  // Privacy and access control
  isPrivate: {
    type: Boolean,
    default: false
  },
  accessLog: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      accessedAt: Date,
      action: String // 'viewed', 'edited'
    }
  ],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Indexes:**
- `patientId` - For finding patient's medical records
- `doctorId` - For finding doctor's records
- `visitDate` - For sorting by date

**Example Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439016"),
  "patientId": ObjectId("507f1f77bcf86cd799439011"),
  "doctorId": ObjectId("507f1f77bcf86cd799439013"),
  "appointmentId": ObjectId("507f1f77bcf86cd799439012"),
  "visitDate": ISODate("2026-01-28T14:00:00Z"),
  "vitals": {
    "temperature": 98.6,
    "bloodPressure": "120/80",
    "heartRate": 72,
    "weight": 70,
    "height": 175,
    "bmi": 22.9
  },
  "symptoms": ["Mild cough", "Fatigue"],
  "diagnosis": "Common Cold",
  "icd10Code": "J00",
  "prescription": {
    "medicines": [
      {
        "name": "Paracetamol",
        "dosage": "500mg",
        "frequency": "Every 6 hours",
        "duration": "5 days",
        "instructions": "Take with food"
      }
    ],
    "notes": "Rest and stay hydrated"
  },
  "clinicalNotes": "Patient presents with common cold symptoms. Vital signs normal.",
  "followUpDate": ISODate("2026-02-04T00:00:00Z"),
  "createdAt": ISODate("2026-01-28T14:00:00Z"),
  "updatedAt": ISODate("2026-01-28T14:00:00Z")
}
```

---

### 5. Departments Collection

**Purpose:** Stores hospital departments and their information.

**Schema:**
```javascript
{
  _id: ObjectId,
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: String,
  
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  doctors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  
  phone: String,
  email: String,
  location: String,
  floor: Number,
  
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  
  services: [String], // e.g., ['OPD', 'IPD', 'Emergency']
  
  icon: String, // emoji or icon name
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

**Example Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439014"),
  "name": "Cardiology",
  "description": "Heart and cardiovascular diseases treatment",
  "head": ObjectId("507f1f77bcf86cd799439013"),
  "doctors": [
    ObjectId("507f1f77bcf86cd799439013"),
    ObjectId("507f1f77bcf86cd799439017")
  ],
  "phone": "+1-555-123-4567",
  "email": "cardiology@hospital.com",
  "location": "Building A, 3rd Floor",
  "floor": 3,
  "operatingHours": {
    "monday": { "open": "09:00", "close": "17:00" },
    "tuesday": { "open": "09:00", "close": "17:00" },
    "wednesday": { "open": "09:00", "close": "17:00" },
    "thursday": { "open": "09:00", "close": "17:00" },
    "friday": { "open": "09:00", "close": "17:00" },
    "saturday": { "open": "10:00", "close": "14:00" }
  },
  "services": ["OPD", "Emergency"],
  "icon": "🫀",
  "isActive": true,
  "createdAt": ISODate("2025-12-01T08:00:00Z"),
  "updatedAt": ISODate("2026-01-29T10:00:00Z")
}
```

---

## Relationships

### User → Appointments (One to Many)
- One user (patient) can have many appointments
- One user (doctor) can have many appointments

### User → Department (Many to Many)
- One department can have many doctors
- One doctor can belong to one department

### Appointment → MedicalRecord (One to One)
- One appointment can have one associated medical record

### Department → Queue (One to Many)
- One department can have many queue entries

---

## Indexing Strategy

To optimize query performance, the following indexes are recommended:

```javascript
// User indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ department: 1 });

// Appointment indexes
db.appointments.createIndex({ patientId: 1 });
db.appointments.createIndex({ doctorId: 1 });
db.appointments.createIndex({ dateTime: 1 });
db.appointments.createIndex({ status: 1 });
db.appointments.createIndex({ createdAt: -1 }); // Descending for latest first

// Queue indexes
db.queue.createIndex({ departmentId: 1 });
db.queue.createIndex({ status: 1 });
db.queue.createIndex({ joinedAt: 1 });

// Medical Record indexes
db.medical_records.createIndex({ patientId: 1 });
db.medical_records.createIndex({ doctorId: 1 });
db.medical_records.createIndex({ visitDate: -1 });

// Department indexes
db.departments.createIndex({ name: 1 }, { unique: true });
```

---

## Backup & Recovery

### Regular Backups
```bash
# Create a backup
mongodump --uri "mongodb://localhost:27017/mediflow" --out ./backup

# Restore from backup
mongorestore --uri "mongodb://localhost:27017/mediflow" ./backup
```

### Export/Import
```bash
# Export collection to JSON
mongoexport --uri "mongodb://localhost:27017/mediflow" --collection users --out users.json

# Import collection from JSON
mongoimport --uri "mongodb://localhost:27017/mediflow" --collection users --file users.json
```

---

## Data Validation Rules

### User Collection
- Email must be unique and valid format
- Password must be at least 6 characters (hashed with bcrypt)
- Role must be one of: 'patient', 'doctor', 'admin'
- Phone number must match international format (optional)

### Appointment Collection
- Both patientId and doctorId are required
- DateTime must be in the future
- Duration must be between 15-120 minutes
- Status must be one of: 'scheduled', 'completed', 'cancelled', 'no-show', 'rescheduled'

### Queue Collection
- Position must be unique within a department
- Status must be one of: 'waiting', 'called', 'no-show', 'completed'
- Token number must be unique across all departments

### Medical Record Collection
- PatientId and doctorId are required
- Vital signs should be within normal human ranges
- ICD-10 code should match valid codes

