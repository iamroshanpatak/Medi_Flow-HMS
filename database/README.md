# Database Structure

This folder contains database-related files for the MediFlow Hospital Management System.

## 📁 Folder Organization

### schemas/
Contains Mongoose database models defining the structure of MongoDB collections.

**Files:**
- **User.js** - User accounts (patients, doctors, admin, staff)
- **Appointment.js** - Medical appointments
- **MedicalRecord.js** - Patient medical records
- **Queue.js** - Patient queue management
- **Department.js** - Hospital departments

> **Note:** These are copies of the models from `backend/models/` kept here for reference and organization. The backend still uses its own `models/` folder.

### seeders/
Scripts to populate the database with initial or test data.

**Files:**
- **seedDoctors.js** - Seeds doctor accounts with specializations
- **updateDoctors.js** - Updates existing doctor information

**Usage:**
```bash
cd database/seeders
node seedDoctors.js
```

### migrations/
Database migration scripts for schema changes (currently empty, ready for future use).

## 🗄️ Database Information

- **Database:** MongoDB
- **Connection:** Managed through backend server
- **URI:** Set in `backend/.env` as `MONGODB_URI`

## 📋 Collections

### users
Stores all user accounts with role-based fields:
- Common fields: email, password, name, phone, role
- Patient fields: dateOfBirth, gender, bloodGroup, address
- Doctor fields: specialization, qualification, experience, availableSlots
- Staff fields: department, position

### appointments
Tracks medical appointments:
- patient (ref: User)
- doctor (ref: User)
- date, time, reason, status
- notes, prescription

### medicalRecords
Patient health records:
- patient (ref: User)
- doctor (ref: User)
- recordType, recordDate
- vitalSigns, diagnosis, prescription
- laboratoryResults, notes

### queue
Real-time patient queue:
- patient (ref: User)
- doctor (ref: User)
- position, status, priority
- estimatedWaitTime

### departments
Hospital departments:
- name, description
- head (ref: User)
- doctors (array of User refs)

## 🔧 Running Seeders

1. Ensure MongoDB is running:
   ```bash
   mongod
   ```

2. Ensure backend dependencies are installed:
   ```bash
   cd backend
   npm install
   ```

3. Run seeder:
   ```bash
   cd database/seeders
   node seedDoctors.js
   ```

## 📝 Creating New Schemas

1. Create model in `backend/models/`
2. Copy to `database/schemas/` for documentation
3. Update this README with collection information

## ⚠️ Important Notes

- Always update schemas in `backend/models/` first
- Keep `database/schemas/` in sync for documentation
- Test migrations before running in production
- Back up database before running seeders in production
