import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, Users, Phone, MessageSquare, AlertTriangle,
  CheckCircle, UserPlus, Search, Bell, Settings, LogOut,
  Plus, X, Mail, Printer, Building, UserCheck, Timer
} from 'lucide-react';

// Types
interface Patient {
  id: number;
  name: string;
  phone: string;
  email: string;
  insurance: string;
  lastVisit: string;
  status: 'active' | 'inactive' | 'new';
  emergencyContact: string;
  address: string;
}

interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  time: string;
  duration: number;
  type: string;
  doctor: string;
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'no-show' | 'cancelled';
  notes?: string;
  insurance: string;
}

interface WaitingRoomPatient {
  id: number;
  name: string;
  checkInTime: string;
  appointmentTime: string;
  waitTime: number;
  doctor: string;
  urgency: 'normal' | 'urgent' | 'emergency';
}

interface Message {
  id: number;
  from: string;
  to: string;
  subject: string;
  content: string;
  time: string;
  priority: 'low' | 'normal' | 'high';
  read: boolean;
}

// Sample Data
const initialPatients: Patient[] = [
  {
    id: 1,
    name: 'John Smith',
    phone: '+1-555-0123',
    email: 'john.smith@email.com',
    insurance: 'Blue Cross Blue Shield',
    lastVisit: '2025-06-20',
    status: 'active',
    emergencyContact: 'Jane Smith +1-555-0124',
    address: '123 Main St, City, State 12345'
  },
  {
    id: 2,
    name: 'Maria Garcia',
    phone: '+1-555-0456',
    email: 'maria.garcia@email.com',
    insurance: 'Aetna',
    lastVisit: '2025-06-15',
    status: 'active',
    emergencyContact: 'Carlos Garcia +1-555-0457',
    address: '456 Oak Ave, City, State 12345'
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    phone: '+1-555-0789',
    email: 'sarah.j@email.com',
    insurance: 'Medicare',
    lastVisit: '2025-05-28',
    status: 'active',
    emergencyContact: 'Mike Johnson +1-555-0790',
    address: '789 Pine St, City, State 12345'
  }
];

const initialAppointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    patientName: 'John Smith',
    time: '09:00',
    duration: 30,
    type: 'Consultation',
    doctor: 'Dr. Williams',
    status: 'checked-in',
    insurance: 'Blue Cross Blue Shield',
    notes: 'Follow-up for blood pressure'
  },
  {
    id: 2,
    patientId: 2,
    patientName: 'Maria Garcia',
    time: '09:30',
    duration: 45,
    type: 'Physical Exam',
    doctor: 'Dr. Johnson',
    status: 'in-progress',
    insurance: 'Aetna'
  },
  {
    id: 3,
    patientId: 3,
    patientName: 'Sarah Johnson',
    time: '10:15',
    duration: 30,
    type: 'Lab Results Review',
    doctor: 'Dr. Williams',
    status: 'scheduled',
    insurance: 'Medicare'
  },
  {
    id: 4,
    patientId: 1,
    patientName: 'Robert Brown',
    time: '11:00',
    duration: 60,
    type: 'Procedure',
    doctor: 'Dr. Davis',
    status: 'scheduled',
    insurance: 'United Healthcare'
  },
  {
    id: 5,
    patientId: 2,
    patientName: 'Lisa Wilson',
    time: '14:00',
    duration: 30,
    type: 'Follow-up',
    doctor: 'Dr. Johnson',
    status: 'scheduled',
    insurance: 'Cigna'
  }
];

const initialWaitingRoom: WaitingRoomPatient[] = [
  {
    id: 1,
    name: 'John Smith',
    checkInTime: '08:55',
    appointmentTime: '09:00',
    waitTime: 15,
    doctor: 'Dr. Williams',
    urgency: 'normal'
  },
  {
    id: 2,
    name: 'Emergency Walk-in',
    checkInTime: '09:10',
    appointmentTime: 'Walk-in',
    waitTime: 20,
    doctor: 'Next Available',
    urgency: 'emergency'
  }
];

const initialMessages: Message[] = [
  {
    id: 1,
    from: 'Dr. Williams',
    to: 'Reception',
    subject: 'Patient Needs Rescheduling',
    content: 'Please reschedule John Smith to next week. Family emergency.',
    time: '08:45',
    priority: 'high',
    read: false
  },
  {
    id: 2,
    from: 'Laboratory',
    to: 'Reception',
    subject: 'Lab Results Ready',
    content: 'Sarah Johnson\'s lab results are ready for pickup.',
    time: '08:30',
    priority: 'normal',
    read: true
  }
];

// Helper Components
const QuickActionButton = ({ icon: Icon, label, onClick, color = 'blue', urgent = false }: any) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
      urgent 
        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
        : `bg-${color}-100 text-${color}-700 hover:bg-${color}-200`
    }`}
  >
    {urgent && (
      <div className="absolute w-3 h-3 bg-red-500 rounded-full -top-1 -right-1 animate-pulse"></div>
    )}
    <Icon className="w-6 h-6" />
    <span className="text-sm font-medium text-center">{label}</span>
  </button>
);

const StatusBadge = ({ status, size = 'sm' }: { status: string, size?: 'sm' | 'md' }) => {
  const colors = {
    'scheduled': 'bg-blue-100 text-blue-700',
    'checked-in': 'bg-yellow-100 text-yellow-700',
    'in-progress': 'bg-green-100 text-green-700',
    'completed': 'bg-gray-100 text-gray-700',
    'no-show': 'bg-red-100 text-red-700',
    'cancelled': 'bg-red-100 text-red-700',
    'active': 'bg-green-100 text-green-700',
    'inactive': 'bg-gray-100 text-gray-700',
    'new': 'bg-blue-100 text-blue-700',
    'normal': 'bg-blue-100 text-blue-700',
    'urgent': 'bg-yellow-100 text-yellow-700',
    'emergency': 'bg-red-100 text-red-700'
  };

  const sizeClasses = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-1 text-xs';

  return (
    <span className={`${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700'} ${sizeClasses} rounded-full font-medium`}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </span>
  );
};

// Patient Registration Modal
const PatientRegistrationModal = ({ isOpen, onClose, onSave, patient = null }: any) => {
  const [formData, setFormData] = useState({
    name: patient?.name || '',
    phone: patient?.phone || '',
    email: patient?.email || '',
    insurance: patient?.insurance || '',
    emergencyContact: patient?.emergencyContact || '',
    address: patient?.address || ''
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) {
      alert('Please fill in required fields (Name and Phone)');
      return;
    }

    const newPatient: Patient = {
      id: patient?.id || Date.now(),
      ...formData,
      status: patient?.status || 'new',
      lastVisit: patient?.lastVisit || new Date().toISOString().split('T')[0]
    };

    onSave(newPatient);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md overflow-y-auto bg-white shadow-xl rounded-xl max-h-[90vh]">
        <div className="sticky top-0 flex items-center justify-between p-4 bg-white border-b">
          <h3 className="text-lg font-bold text-gray-800">
            {patient ? 'Edit Patient' : 'Register New Patient'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter patient's full name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1-555-0123"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="email@example.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Insurance Provider</label>
            <select
              value={formData.insurance}
              onChange={(e) => setFormData({...formData, insurance: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Insurance</option>
              <option value="Blue Cross Blue Shield">Blue Cross Blue Shield</option>
              <option value="Aetna">Aetna</option>
              <option value="Cigna">Cigna</option>
              <option value="United Healthcare">United Healthcare</option>
              <option value="Medicare">Medicare</option>
              <option value="Medicaid">Medicaid</option>
              <option value="Self-Pay">Self-Pay</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Emergency Contact</label>
            <input
              type="text"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Name and phone number"
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Street address, city, state, zip"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {patient ? 'Update Patient' : 'Register Patient'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 font-medium text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Appointment Booking Modal
const AppointmentModal = ({ isOpen, onClose, onSave, appointment = null, patients }: any) => {
  const [formData, setFormData] = useState({
    patientId: appointment?.patientId || '',
    patientName: appointment?.patientName || '',
    date: appointment?.date || new Date().toISOString().split('T')[0],
    time: appointment?.time || '',
    duration: appointment?.duration || 30,
    type: appointment?.type || '',
    doctor: appointment?.doctor || '',
    notes: appointment?.notes || '',
    insurance: appointment?.insurance || ''
  });

  const handleSubmit = () => {
    if (!formData.patientId || !formData.time || !formData.doctor) {
      alert('Please fill in required fields');
      return;
    }

    const selectedPatient = patients.find((p: Patient) => p.id === Number(formData.patientId));
    
    const newAppointment: Appointment = {
      id: appointment?.id || Date.now(),
      patientId: Number(formData.patientId),
      patientName: selectedPatient?.name || formData.patientName,
      time: formData.time,
      duration: formData.duration,
      type: formData.type,
      doctor: formData.doctor,
      status: appointment?.status || 'scheduled',
      notes: formData.notes,
      insurance: selectedPatient?.insurance || formData.insurance
    };

    onSave(newAppointment);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md overflow-y-auto bg-white shadow-xl rounded-xl max-h-[90vh]">
        <div className="sticky top-0 flex items-center justify-between p-4 bg-white border-b">
          <h3 className="text-lg font-bold text-gray-800">
            {appointment ? 'Edit Appointment' : 'Book New Appointment'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Patient *</label>
            <select
              value={formData.patientId}
              onChange={(e) => {
                const selectedPatient = patients.find((p: Patient) => p.id === Number(e.target.value));
                setFormData({
                  ...formData, 
                  patientId: e.target.value,
                  patientName: selectedPatient?.name || '',
                  insurance: selectedPatient?.insurance || ''
                });
              }}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Patient</option>
              {patients.map((patient: Patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} - {patient.phone}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Time *</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Duration (min)</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Doctor *</label>
              <select
                value={formData.doctor}
                onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Doctor</option>
                <option value="Dr. Williams">Dr. Williams</option>
                <option value="Dr. Johnson">Dr. Johnson</option>
                <option value="Dr. Davis">Dr. Davis</option>
                <option value="Dr. Brown">Dr. Brown</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Appointment Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Type</option>
              <option value="Consultation">Consultation</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Physical Exam">Physical Exam</option>
              <option value="Procedure">Procedure</option>
              <option value="Lab Results Review">Lab Results Review</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Additional notes or special instructions"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {appointment ? 'Update Appointment' : 'Book Appointment'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 font-medium text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Receptionist Dashboard
const ReceptionistDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [waitingRoom, setWaitingRoom] = useState<WaitingRoomPatient[]>(initialWaitingRoom);
  const [messages] = useState<Message[]>(initialMessages);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Filter patients based on search
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Today's appointments
  const todaysAppointments = appointments.filter(_apt => 
    // For demo purposes, showing all appointments as "today"
    true
  ).sort((a, b) => a.time.localeCompare(b.time));

  // Statistics
  const stats = {
    totalPatientsToday: todaysAppointments.length,
    waitingPatients: waitingRoom.length,
    completedToday: todaysAppointments.filter(apt => apt.status === 'completed').length,
    emergencyWaiting: waitingRoom.filter(p => p.urgency === 'emergency').length,
    unreadMessages: messages.filter(m => !m.read).length
  };

  // Handlers
  const handlePatientSave = (patientData: Patient) => {
    if (editingPatient) {
      setPatients(patients.map(p => p.id === patientData.id ? patientData : p));
    } else {
      setPatients([...patients, patientData]);
    }
    setEditingPatient(null);
  };

  const handleAppointmentSave = (appointmentData: Appointment) => {
    if (editingAppointment) {
      setAppointments(appointments.map(a => a.id === appointmentData.id ? appointmentData : a));
    } else {
      setAppointments([...appointments, appointmentData]);
    }
    setEditingAppointment(null);
  };

  const handleCheckIn = (appointmentId: number) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? {...apt, status: 'checked-in'} : apt
    ));
    
    // Add to waiting room
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      const waitingPatient: WaitingRoomPatient = {
        id: Date.now(),
        name: appointment.patientName,
        checkInTime: currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        appointmentTime: appointment.time,
        waitTime: 0,
        doctor: appointment.doctor,
        urgency: 'normal'
      };
      setWaitingRoom([...waitingRoom, waitingPatient]);
    }
  };

  const handleStatusChange = (appointmentId: number, newStatus: string) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? {...apt, status: newStatus as any} : apt
    ));
    
    if (newStatus === 'completed' || newStatus === 'no-show') {
      // Remove from waiting room
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (appointment) {
        setWaitingRoom(waitingRoom.filter(p => p.name !== appointment.patientName));
      }
    }
  };

  const handleEmergency = () => {
    alert('Emergency protocol activated!\n\n1. Clear next available slot\n2. Notify doctor immediately\n3. Prepare emergency room\n4. Contact emergency services if needed');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Building className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">Reception Desk</h1>
            </div>
            <div className="items-center hidden gap-2 text-sm text-gray-600 md:flex">
              <Clock className="w-4 h-4" />
              {currentTime.toLocaleString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-600 transition-colors hover:text-blue-600">
              <Bell className="w-5 h-5" />
              {stats.unreadMessages > 0 && (
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
                  {stats.unreadMessages}
                </span>
              )}
            </button>
            <button className="p-2 text-gray-600 transition-colors hover:text-blue-600">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 transition-colors hover:text-red-600">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 mx-auto md:p-6 max-w-7xl">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-5">
          <div className="p-4 bg-white shadow-sm rounded-xl">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalPatientsToday}</p>
                <p className="text-sm text-gray-600">Today's Appointments</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-white shadow-sm rounded-xl">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.waitingPatients}</p>
                <p className="text-sm text-gray-600">Waiting</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-white shadow-sm rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.completedToday}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-white shadow-sm rounded-xl">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.emergencyWaiting}</p>
                <p className="text-sm text-gray-600">Emergencies</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-white shadow-sm rounded-xl">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.unreadMessages}</p>
                <p className="text-sm text-gray-600">New Messages</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 mb-6 bg-white shadow-sm rounded-xl">
          <h2 className="mb-4 text-lg font-bold text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            <QuickActionButton
              icon={UserPlus}
              label="Register Patient"
              onClick={() => setShowPatientModal(true)}
              color="green"
            />
            <QuickActionButton
              icon={Calendar}
              label="Book Appointment"
              onClick={() => setShowAppointmentModal(true)}
              color="blue"
            />
            <QuickActionButton
              icon={UserCheck}
              label="Check-in Patient"
              onClick={() => alert('Scan QR code or search patient to check in')}
              color="yellow"
            />
            <QuickActionButton
              icon={AlertTriangle}
              label="Emergency"
              onClick={handleEmergency}
              urgent={true}
            />
            <QuickActionButton
              icon={Phone}
              label="Phone Log"
              onClick={() => alert('Opening phone call log...')}
              color="purple"
            />
            <QuickActionButton
              icon={Printer}
              label="Print Forms"
              onClick={() => alert('Printing patient forms...')}
              color="gray"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <div className="p-4 bg-white shadow-sm rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Today's Schedule</h2>
                <button
                  onClick={() => setShowAppointmentModal(true)}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 transition-colors bg-blue-100 rounded-lg hover:bg-blue-200"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              
              <div className="space-y-3 overflow-y-auto max-h-96">
                {todaysAppointments.map(appointment => (
                  <div key={appointment.id} className="p-4 transition-colors border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-gray-800">{appointment.time}</div>
                        <div>
                          <p className="font-medium text-gray-800">{appointment.patientName}</p>
                          <p className="text-sm text-gray-600">{appointment.type} • {appointment.doctor}</p>
                        </div>
                      </div>
                      <StatusBadge status={appointment.status} />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {appointment.status === 'scheduled' && (
                        <button
                          onClick={() => handleCheckIn(appointment.id)}
                          className="px-3 py-1 text-xs text-green-600 transition-colors bg-green-100 rounded hover:bg-green-200"
                        >
                          Check In
                        </button>
                      )}
                      {appointment.status === 'checked-in' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'in-progress')}
                          className="px-3 py-1 text-xs text-blue-600 transition-colors bg-blue-100 rounded hover:bg-blue-200"
                        >
                          Start Visit
                        </button>
                      )}
                      {appointment.status === 'in-progress' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          className="px-3 py-1 text-xs text-green-600 transition-colors bg-green-100 rounded hover:bg-green-200"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingAppointment(appointment);
                          setShowAppointmentModal(true);
                        }}
                        className="px-3 py-1 text-xs text-purple-600 transition-colors bg-purple-100 rounded hover:bg-purple-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                        className="px-3 py-1 text-xs text-red-600 transition-colors bg-red-100 rounded hover:bg-red-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
                
                {todaysAppointments.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No appointments scheduled for today</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Waiting Room */}
            <div className="p-4 bg-white shadow-sm rounded-xl">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-800">
                <Timer className="w-5 h-5" />
                Waiting Room ({waitingRoom.length})
              </h3>
              
              <div className="space-y-3">
                {waitingRoom.map(patient => (
                  <div key={patient.id} className={`p-3 rounded-lg border-l-4 ${
                    patient.urgency === 'emergency' ? 'border-red-500 bg-red-50' :
                    patient.urgency === 'urgent' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-800">{patient.name}</p>
                      <StatusBadge status={patient.urgency} size="sm" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Checked in: {patient.checkInTime} • Wait: {patient.waitTime}min
                    </p>
                    <p className="text-sm text-gray-600">{patient.doctor}</p>
                  </div>
                ))}
                
                {waitingRoom.length === 0 && (
                  <div className="py-4 text-center text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-1 text-gray-300" />
                    <p className="text-sm">No patients waiting</p>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="p-4 bg-white shadow-sm rounded-xl">
              <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-800">
                <MessageSquare className="w-5 h-5" />
                Recent Messages
              </h3>
              
              <div className="space-y-3">
                {messages.slice(0, 3).map(message => (
                  <div key={message.id} className={`p-3 rounded-lg border ${
                    !message.read ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-800">{message.from}</p>
                      <span className="text-xs text-gray-500">{message.time}</span>
                    </div>
                    <p className="mb-1 text-sm text-gray-600">{message.subject}</p>
                    <p className="text-xs text-gray-500">{message.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Patient Search & Management */}
        <div className="p-4 mt-6 bg-white shadow-sm rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Patient Management</h2>
            <button
              onClick={() => setShowPatientModal(true)}
              className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 transition-colors bg-green-100 rounded-lg hover:bg-green-200"
            >
              <UserPlus className="w-4 h-4" />
              Register New
            </button>
          </div>
          
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search patients by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-3 pl-10 pr-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPatients.slice(0, 6).map(patient => (
              <div key={patient.id} className="p-4 transition-colors border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-800">{patient.name}</h3>
                  <StatusBadge status={patient.status} size="sm" />
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {patient.phone}
                  </p>
                  <p className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {patient.email}
                  </p>
                  <p>Insurance: {patient.insurance}</p>
                  <p>Last visit: {patient.lastVisit}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setEditingPatient(patient);
                      setShowPatientModal(true);
                    }}
                    className="flex-1 px-2 py-1 text-xs text-blue-600 transition-colors bg-blue-100 rounded hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      const appointment = {
                        patientId: patient.id,
                        patientName: patient.name,
                        insurance: patient.insurance
                      };
                      setEditingAppointment(appointment as any);
                      setShowAppointmentModal(true);
                    }}
                    className="flex-1 px-2 py-1 text-xs text-green-600 transition-colors bg-green-100 rounded hover:bg-green-200"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modals */}
        <PatientRegistrationModal
          isOpen={showPatientModal}
          onClose={() => {
            setShowPatientModal(false);
            setEditingPatient(null);
          }}
          onSave={handlePatientSave}
          patient={editingPatient}
        />

        <AppointmentModal
          isOpen={showAppointmentModal}
          onClose={() => {
            setShowAppointmentModal(false);
            setEditingAppointment(null);
          }}
          onSave={handleAppointmentSave}
          appointment={editingAppointment}
          patients={patients}
        />
      </div>
    </div>
  );
};

export default ReceptionistDashboard;