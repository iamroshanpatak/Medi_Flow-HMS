export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor' | 'admin' | 'staff';
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  profileImage?: string;
  isActive: boolean;
}

export interface Patient extends User {
  bloodGroup?: string;
  medicalHistory?: MedicalHistory[];
  allergies?: string[];
  emergencyContact?: EmergencyContact;
}

export interface Doctor extends User {
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  availability: Availability[];
  department: string;
  licenseNumber: string;
}

export interface MedicalHistory {
  condition: string;
  diagnosedDate: Date;
  notes: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Availability {
  day: string;
  slots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  patient: User;
  doctor: Doctor;
  department: string;
  appointmentDate: Date;
  timeSlot: TimeSlot;
  appointmentType: 'consultation' | 'follow-up' | 'emergency' | 'routine-checkup';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  symptoms?: string[];
  notes?: string;
  prescription?: Prescription;
  payment?: Payment;
  rating?: number;
  feedback?: string;
}

export interface Prescription {
  medications: Medication[];
  instructions?: string;
  diagnosis?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Payment {
  amount: number;
  status: 'pending' | 'paid' | 'refunded';
  method?: string;
  transactionId?: string;
}

export interface Queue {
  id: string;
  patient: User;
  doctor: Doctor;
  appointment?: Appointment;
  tokenNumber: string;
  department: string;
  visitType: 'appointment' | 'walk-in' | 'emergency';
  status: 'waiting' | 'in-consultation' | 'completed' | 'cancelled' | 'no-show';
  priority: 'normal' | 'high' | 'emergency';
  estimatedWaitTime?: number;
  position?: number;
  checkedInAt: Date;
  calledAt?: Date;
  consultationStartedAt?: Date;
  consultationEndedAt?: Date;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  head?: Doctor;
  doctors: Doctor[];
  location?: Location;
  workingHours?: WorkingHours;
  services?: string[];
  emergencyAvailable: boolean;
  isActive: boolean;
}

export interface Location {
  floor: string;
  wing: string;
  roomNumber: string;
}

export interface WorkingHours {
  weekdays: { start: string; end: string };
  weekends: { start: string; end: string };
}
