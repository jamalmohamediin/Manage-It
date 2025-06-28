import React, { useState, useEffect } from 'react';
import {
  Search, 
  Filter, 
  Plus, 
  ChevronDown, 
  Stethoscope,
  Calendar,
  Clock,
  User,
  FileText,
  AlertTriangle,
  Phone,
  Mail,
  X,
  Save,
  Edit,
  Trash2,
  Mic,
  MicOff,
  MapPin,
  Heart,
  Pill,
  UserCheck,
  CreditCard,
  Archive
} from 'lucide-react';

// Enhanced Types
interface Consultation {
  id: number;
  type: string;
  patient: string;
  patientId: string;
  doctorName: string;
  status: string;
  date: string;
  time: string;
  notes: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  contactNumber: string;
  email: string;
  duration: string;
  followUpRequired: boolean;
  // Enhanced patient details
  age: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  insuranceProvider: string;
  insuranceNumber: string;
  medicalHistory: string;
  allergies: string;
  currentMedications: string;
  chiefComplaint: string;
  customConsultationType?: string;
}

// Mock escalation hook
const useEscalation = () => {
  const escalate = async (data: any) => {
    console.log('Escalating consultation:', data);
    alert(`Escalation sent for ${data.patientName}!\n- Email: ${data.doctorEmail}\n- WhatsApp: ${data.phoneNumber}\n- Reason: ${data.reason}`);
  };
  
  return { escalate };
};

// Mock business ID hook
const useBusinessId = () => "business-123";

// Helper Components
const SearchFilterControls = ({ 
  searchTerm, 
  setSearchTerm, 
  filterBy, 
  setFilterBy, 
  filterOptions, 
  onAdd, 
  addButtonText,
  placeholder = "Search..."
}: any) => (
  <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
    <button
      onClick={onAdd}
      className="flex items-center justify-center gap-3 p-4 text-green-700 transition-all duration-200 transform bg-green-100 shadow-lg rounded-xl hover:bg-green-200 hover:scale-105"
    >
      <Plus className="w-6 h-6" />
      <span className="font-medium">{addButtonText}</span>
    </button>
    
    <div className="flex items-center col-span-2 gap-2 p-4 bg-blue-100 shadow-lg rounded-xl">
      <Search className="w-5 h-5 text-blue-600" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 placeholder-blue-600 bg-transparent outline-none"
      />
    </div>
    
    <div className="flex items-center gap-2 p-4 bg-purple-100 shadow-lg rounded-xl">
      <Filter className="w-5 h-5 text-purple-600" />
      <select
        value={filterBy}
        onChange={(e) => setFilterBy(e.target.value)}
        className="flex-1 text-sm text-purple-600 bg-transparent outline-none"
      >
        {filterOptions.map((option: any) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  </div>
);

const StatusDropdown = ({ 
  currentStatus, 
  options, 
  onStatusChange, 
  getColorClass = getStatusColor 
}: {
  currentStatus: string;
  options: string[];
  onStatusChange: (newStatus: string) => void;
  getColorClass?: (status: string) => string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleStatusChange = (newStatus: string) => {
    onStatusChange(newStatus);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`px-3 py-1 text-xs font-medium rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${getColorClass(currentStatus)} flex items-center gap-1`}
      >
        {currentStatus}
        <ChevronDown className="w-3 h-3" />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-48 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          {options.map(option => (
            <button
              key={option}
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(option);
              }}
              className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                option === currentStatus ? 'bg-blue-50' : ''
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper functions
function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'complete':
      return 'bg-green-100 text-green-700';
    case 'scheduled':
      return 'bg-blue-100 text-blue-700';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'in progress':
      return 'bg-purple-100 text-purple-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    case 'rescheduled':
      return 'bg-orange-100 text-orange-700';
    case 'urgent':
      return 'bg-red-200 text-red-800';
    default: 
      return 'bg-gray-100 text-gray-700';
  }
}

function getPriorityColor(priority: string) {
  switch (priority.toLowerCase()) {
    case 'urgent':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

// Enhanced Consultation Modal with comprehensive patient details
const ConsultationModal = ({ 
  isOpen, 
  onClose, 
  consultation, 
  onSave, 
  isEditing = false 
}: {
  isOpen: boolean;
  onClose: () => void;
  consultation?: Consultation;
  onSave: (consultation: Consultation) => void;
  isEditing?: boolean;
}) => {
  const [formData, setFormData] = useState<Consultation>({
    id: consultation?.id || Date.now(),
    type: consultation?.type || 'General Consultation',
    patient: consultation?.patient || '',
    patientId: consultation?.patientId || '',
    doctorName: consultation?.doctorName || '',
    status: consultation?.status || 'Scheduled',
    date: consultation?.date || new Date().toISOString().split('T')[0],
    time: consultation?.time || '09:00',
    notes: consultation?.notes || '',
    priority: consultation?.priority || 'medium',
    contactNumber: consultation?.contactNumber || '',
    email: consultation?.email || '',
    duration: consultation?.duration || '30 min',
    followUpRequired: consultation?.followUpRequired || false,
    // Enhanced fields
    age: consultation?.age || '',
    gender: consultation?.gender || '',
    dateOfBirth: consultation?.dateOfBirth || '',
    address: consultation?.address || '',
    emergencyContact: consultation?.emergencyContact || '',
    emergencyPhone: consultation?.emergencyPhone || '',
    insuranceProvider: consultation?.insuranceProvider || '',
    insuranceNumber: consultation?.insuranceNumber || '',
    medicalHistory: consultation?.medicalHistory || '',
    allergies: consultation?.allergies || '',
    currentMedications: consultation?.currentMedications || '',
    chiefComplaint: consultation?.chiefComplaint || '',
    customConsultationType: consultation?.customConsultationType || ''
  });

  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setFormData(prev => ({
          ...prev,
          customConsultationType: transcript
        }));
        setIsRecording(false);
      };
      
      recognitionInstance.onerror = () => {
        setIsRecording(false);
      };
      
      recognitionInstance.onend = () => {
        setIsRecording(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const startRecording = () => {
    if (recognition) {
      setIsRecording(true);
      recognition.start();
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-6xl max-h-screen p-6 m-4 overflow-y-auto bg-white rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Edit Consultation' : 'Schedule New Consultation'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Patient Information Section */}
          <div className="p-4 border rounded-lg bg-blue-50">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-blue-800">
              <User className="w-5 h-5" />
              Patient Information
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.patient}
                  onChange={(e) => setFormData({...formData, patient: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Patient ID *
                </label>
                <input
                  type="text"
                  value={formData.patientId}
                  onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Age
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+27711234567"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="patient@example.com"
                />
              </div>

              <div className="md:col-span-3">
                <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full address including street, city, postal code"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="p-4 border rounded-lg bg-red-50">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-red-800">
              <AlertTriangle className="w-5 h-5" />
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full name of emergency contact"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+27711234567"
                />
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div className="p-4 border rounded-lg bg-green-50">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-green-800">
              <CreditCard className="w-5 h-5" />
              Insurance Information
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Insurance Provider
                </label>
                <input
                  type="text"
                  value={formData.insuranceProvider}
                  onChange={(e) => setFormData({...formData, insuranceProvider: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Discovery Health, Momentum Health"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Insurance/Member Number
                </label>
                <input
                  type="text"
                  value={formData.insuranceNumber}
                  onChange={(e) => setFormData({...formData, insuranceNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Member number or policy number"
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="p-4 border rounded-lg bg-purple-50">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-purple-800">
              <Heart className="w-5 h-5" />
              Medical Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Chief Complaint / Reason for Visit
                </label>
                <textarea
                  value={formData.chiefComplaint}
                  onChange={(e) => setFormData({...formData, chiefComplaint: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Main symptoms or reason for consultation"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Medical History
                </label>
                <textarea
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Previous surgeries, chronic conditions, significant medical events"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Known Allergies
                </label>
                <textarea
                  value={formData.allergies}
                  onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Drug allergies, food allergies, environmental allergies"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                  <Pill className="w-4 h-4" />
                  Current Medications
                </label>
                <textarea
                  value={formData.currentMedications}
                  onChange={(e) => setFormData({...formData, currentMedications: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="List current medications with dosages and frequency"
                />
              </div>
            </div>
          </div>

          {/* Consultation Details Section */}
          <div className="p-4 border rounded-lg bg-yellow-50">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-yellow-800">
              <Stethoscope className="w-5 h-5" />
              Consultation Details
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Doctor Name *
                </label>
                <input
                  type="text"
                  value={formData.doctorName}
                  onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Consultation Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="General Consultation">General Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Emergency Consult">Emergency Consult</option>
                  <option value="Pre-op Consultation">Pre-op Consultation</option>
                  <option value="Post-op Consultation">Post-op Consultation</option>
                  <option value="Second Opinion">Second Opinion</option>
                  <option value="Specialist Referral">Specialist Referral</option>
                  <option value="Telemedicine">Telemedicine</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Priority Level
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Custom Consultation Type Input */}
              {formData.type === 'Other' && (
                <div className="md:col-span-3">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Specify Other Consultation Type
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.customConsultationType}
                      onChange={(e) => setFormData({...formData, customConsultationType: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe the consultation type"
                    />
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        isRecording 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      {isRecording ? 'Stop' : 'Voice'}
                    </button>
                  </div>
                  {isRecording && (
                    <p className="mt-2 text-sm text-red-600 animate-pulse">
                      🎤 Recording... Speak now to describe the consultation type
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Time *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Duration
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="15 min">15 minutes</option>
                  <option value="30 min">30 minutes</option>
                  <option value="45 min">45 minutes</option>
                  <option value="1 hour">1 hour</option>
                  <option value="1.5 hours">1.5 hours</option>
                  <option value="2 hours">2 hours</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional notes or special instructions"
                />
              </div>

              <div className="flex items-center md:col-span-3">
                <input
                  type="checkbox"
                  id="followUp"
                  checked={formData.followUpRequired}
                  onChange={(e) => setFormData({...formData, followUpRequired: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="followUp" className="ml-2 text-sm text-gray-700">
                  Follow-up consultation required
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Update' : 'Schedule'} Consultation
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotesModal = ({ 
  isOpen, 
  onClose, 
  consultation 
}: {
  isOpen: boolean;
  onClose: () => void;
  consultation?: Consultation;
}) => {
  if (!isOpen || !consultation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-4xl max-h-screen p-6 m-4 overflow-y-auto bg-white rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Consultation Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Patient Information */}
          <div className="p-4 rounded-lg bg-blue-50">
            <h3 className="flex items-center gap-2 mb-4 font-semibold text-blue-800">
              <User className="w-5 h-5" />
              Patient Information
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p><strong>Name:</strong> {consultation.patient}</p>
                <p><strong>ID:</strong> {consultation.patientId}</p>
                <p><strong>Age:</strong> {consultation.age || 'N/A'}</p>
                <p><strong>Gender:</strong> {consultation.gender || 'N/A'}</p>
              </div>
              <div>
                <p><strong>Phone:</strong> {consultation.contactNumber || 'N/A'}</p>
                <p><strong>Email:</strong> {consultation.email || 'N/A'}</p>
                <p><strong>Insurance:</strong> {consultation.insuranceProvider || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Consultation Information */}
          <div className="p-4 rounded-lg bg-green-50">
            <h3 className="flex items-center gap-2 mb-4 font-semibold text-green-800">
              <Stethoscope className="w-5 h-5" />
              Consultation Information
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p><strong>Type:</strong> {consultation.type}</p>
                <p><strong>Date:</strong> {consultation.date}</p>
                <p><strong>Time:</strong> {consultation.time}</p>
                <p><strong>Duration:</strong> {consultation.duration}</p>
              </div>
              <div>
                <p><strong>Doctor:</strong> {consultation.doctorName}</p>
                <p><strong>Priority:</strong> {consultation.priority}</p>
                <p><strong>Status:</strong> {consultation.status}</p>
                <p><strong>Follow-up:</strong> {consultation.followUpRequired ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          {(consultation.chiefComplaint || consultation.medicalHistory || consultation.allergies || consultation.currentMedications) && (
            <div className="p-4 rounded-lg bg-purple-50">
              <h3 className="flex items-center gap-2 mb-4 font-semibold text-purple-800">
                <Heart className="w-5 h-5" />
                Medical Information
              </h3>
              <div className="space-y-3">
                {consultation.chiefComplaint && (
                  <div>
                    <strong>Chief Complaint:</strong>
                    <p className="text-gray-700">{consultation.chiefComplaint}</p>
                  </div>
                )}
                {consultation.medicalHistory && (
                  <div>
                    <strong>Medical History:</strong>
                    <p className="text-gray-700">{consultation.medicalHistory}</p>
                  </div>
                )}
                {consultation.allergies && (
                  <div>
                    <strong>Allergies:</strong>
                    <p className="text-gray-700">{consultation.allergies}</p>
                  </div>
                )}
                {consultation.currentMedications && (
                  <div>
                    <strong>Current Medications:</strong>
                    <p className="text-gray-700">{consultation.currentMedications}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="mb-2 font-semibold text-gray-800">Consultation Notes</h3>
            <p className="text-gray-700">{consultation.notes || 'No notes available for this consultation.'}</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Draggable Consultation Card Component
const DraggableConsultationCard = ({ 
  consultation, 
  onStatusChange, 
  onPriorityChange,
  onEdit, 
  onDelete, 
  onViewNotes, 
  onEscalate 
}: {
  consultation: Consultation;
  onStatusChange: (id: number, status: string) => void;
  onPriorityChange: (id: number, priority: 'low' | 'medium' | 'high' | 'urgent') => void;
  onEdit: (consultation: Consultation) => void;
  onDelete: (id: number) => void;
  onViewNotes: (consultation: Consultation) => void;
  onEscalate: (consultation: Consultation) => void;
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      id: consultation.id,
      currentStatus: consultation.status
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Store touch data for mobile drag
    const card = e.currentTarget as HTMLElement;
    card.setAttribute('data-dragging', 'true');
    card.setAttribute('data-consultation-id', consultation.id.toString());
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      onTouchStart={handleTouchStart}
      className="p-4 transition-shadow bg-white border border-gray-200 rounded-lg cursor-move hover:shadow-md touch-manipulation"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-semibold text-gray-800">{consultation.type}</p>
          <p className="flex items-center gap-1 text-sm text-gray-600">
            <User className="w-3 h-3" />
            {consultation.patient}
          </p>
          <p className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar className="w-3 h-3" />
            {consultation.date}
          </p>
          <p className="flex items-center gap-1 text-sm text-gray-600">
            <Clock className="w-3 h-3" />
            {consultation.time} ({consultation.duration})
          </p>
          <p className="text-xs text-gray-500">Dr. {consultation.doctorName}</p>
        </div>
        <div className="flex flex-col gap-1">
          <StatusDropdown
            currentStatus={consultation.priority}
            options={['low', 'medium', 'high', 'urgent']}
            onStatusChange={(newPriority) => onPriorityChange(consultation.id, newPriority as 'low' | 'medium' | 'high' | 'urgent')}
            getColorClass={getPriorityColor}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(consultation);
            }}
            className="p-1 text-blue-600 rounded hover:bg-blue-100"
          >
            <Edit className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <StatusDropdown
          currentStatus={consultation.status}
          options={['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Rescheduled', 'Pending']}
          onStatusChange={(newStatus) => onStatusChange(consultation.id, newStatus)}
        />
      </div>
      
      <div className="flex flex-wrap gap-1">
        {consultation.status === 'Scheduled' && (
          <>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(consultation.id, 'In Progress');
              }}
              className="px-2 py-1 text-xs text-green-600 bg-green-100 rounded hover:bg-green-200"
            >
              Start
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(consultation.id, 'Rescheduled');
              }}
              className="px-2 py-1 text-xs text-orange-600 bg-orange-100 rounded hover:bg-orange-200"
            >
              Reschedule
            </button>
          </>
        )}
        
        {consultation.status === 'Completed' && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onViewNotes(consultation);
            }}
            className="px-2 py-1 text-xs text-green-600 bg-green-100 rounded hover:bg-green-200"
          >
            <FileText className="inline w-3 h-3 mr-1" />
            View Notes
          </button>
        )}
        
        {consultation.status === 'Pending' && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(consultation.id, 'Scheduled');
            }}
            className="px-2 py-1 text-xs text-green-600 bg-green-100 rounded hover:bg-green-200"
          >
            Confirm
          </button>
        )}
        
        {consultation.contactNumber && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              window.open(`tel:${consultation.contactNumber}`, '_self');
            }}
            className="px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
          >
            <Phone className="inline w-3 h-3 mr-1" />
            Call
          </button>
        )}
        
        {consultation.priority === 'urgent' && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEscalate(consultation);
            }}
            className="px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
          >
            🚨 Escalate
          </button>
        )}
      </div>
    </div>
  );
};

// Drop Zone Component
const DropZone = ({ 
  title, 
  count, 
  color, 
  children, 
  onDrop, 
  targetStatus 
}: {
  title: string;
  count: number;
  color: string;
  children: React.ReactNode;
  onDrop: (consultationId: number, newStatus: string) => void;
  targetStatus: string;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.id && data.currentStatus !== targetStatus) {
        onDrop(data.id, targetStatus);
      }
    } catch (error) {
      console.error('Error parsing drop data:', error);
    }
  };

  // Handle touch events for mobile
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = elementBelow?.closest('[data-drop-zone]');
    
    if (dropZone) {
      setIsDragOver(true);
    } else {
      setIsDragOver(false);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = elementBelow?.closest('[data-drop-zone]');
    
    if (dropZone) {
      const newStatus = dropZone.getAttribute('data-status');
      const draggedElement = document.querySelector('[data-dragging="true"]');
      
      if (draggedElement && newStatus) {
        const consultationId = parseInt(draggedElement.getAttribute('data-consultation-id') || '0');
        if (consultationId) {
          onDrop(consultationId, newStatus);
        }
      }
    }
    
    // Clean up
    setIsDragOver(false);
    const draggedElements = document.querySelectorAll('[data-dragging="true"]');
    draggedElements.forEach(el => {
      el.removeAttribute('data-dragging');
      el.removeAttribute('data-consultation-id');
    });
  };

  return (
    <div 
      className={`p-6 bg-white shadow-lg rounded-xl transition-all duration-200 ${
        isDragOver ? 'ring-2 ring-blue-500 bg-blue-50 transform scale-105' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      data-drop-zone="true"
      data-status={targetStatus}
    >
      <h3 className={`mb-4 text-xl font-bold ${color}`}>
        {title} ({count})
      </h3>
      
      {isDragOver && (
        <div className="p-4 mb-4 bg-blue-100 border-2 border-blue-400 border-dashed rounded-lg">
          <p className="font-medium text-center text-blue-700">
            Drop consultation here to move to {title}
          </p>
        </div>
      )}
      
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};

const ConsultationsPage: React.FC = () => {
  // Default data for first-time users
  const defaultConsultations: Consultation[] = [
    {
      id: 1,
      type: 'Pre-op Consultation',
      patient: 'Maria Garcia',
      patientId: 'P001',
      doctorName: 'Dr. Smith',
      status: 'Scheduled',
      date: '2025-06-27',
      time: '14:00',
      notes: 'Pre-operative consultation for gallbladder surgery',
      priority: 'high',
      contactNumber: '+27711234567',
      email: 'maria@example.com',
      duration: '45 min',
      followUpRequired: true,
      age: '45',
      gender: 'Female',
      dateOfBirth: '1980-03-15',
      address: '123 Main Street, Cape Town, 8001',
      emergencyContact: 'Carlos Garcia',
      emergencyPhone: '+27711234568',
      insuranceProvider: 'Discovery Health',
      insuranceNumber: 'DH123456789',
      medicalHistory: 'Previous appendectomy in 2015, hypertension controlled with medication',
      allergies: 'Penicillin, shellfish',
      currentMedications: 'Amlodipine 5mg daily, Metformin 500mg twice daily',
      chiefComplaint: 'Recurring gallbladder pain, especially after fatty meals'
    },
    {
      id: 2,
      type: 'Second Opinion',
      patient: 'Lisa Brown',
      patientId: 'P002',
      doctorName: 'Dr. Johnson',
      status: 'Scheduled',
      date: '2025-06-28',
      time: '11:00',
      notes: 'Second opinion consultation for cardiac procedure',
      priority: 'medium',
      contactNumber: '+27712345678',
      email: 'lisa@example.com',
      duration: '1 hour',
      followUpRequired: false,
      age: '62',
      gender: 'Female',
      dateOfBirth: '1963-07-22',
      address: '456 Oak Avenue, Johannesburg, 2001',
      emergencyContact: 'Michael Brown',
      emergencyPhone: '+27712345679',
      insuranceProvider: 'Momentum Health',
      insuranceNumber: 'MH987654321',
      medicalHistory: 'Type 2 diabetes, mild coronary artery disease',
      allergies: 'None known',
      currentMedications: 'Metformin 1000mg twice daily, Atorvastatin 20mg daily',
      chiefComplaint: 'Chest pain during exercise, shortness of breath'
    },
    {
      id: 3,
      type: 'Follow-up',
      patient: 'Robert Johnson',
      patientId: 'P003',
      doctorName: 'Dr. Davis',
      status: 'Completed',
      date: '2025-06-26',
      time: '09:00',
      notes: 'Post-surgery follow-up, patient recovering well',
      priority: 'low',
      contactNumber: '+27713456789',
      email: 'robert@example.com',
      duration: '30 min',
      followUpRequired: true,
      age: '58',
      gender: 'Male',
      dateOfBirth: '1967-11-08',
      address: '789 Pine Street, Durban, 4001',
      emergencyContact: 'Sarah Johnson',
      emergencyPhone: '+27713456790',
      insuranceProvider: 'Bonitas',
      insuranceNumber: 'BN456789123',
      medicalHistory: 'Recent knee replacement surgery, osteoarthritis',
      allergies: 'Latex',
      currentMedications: 'Ibuprofen 400mg as needed, Calcium + Vitamin D',
      chiefComplaint: 'Post-operative follow-up for knee replacement'
    },
    {
      id: 4,
      type: 'Emergency Consult',
      patient: 'John Smith',
      patientId: 'P004',
      doctorName: 'Dr. Wilson',
      status: 'Pending',
      date: '2025-06-26',
      time: '16:00',
      notes: 'Urgent consultation required for chest pain',
      priority: 'urgent',
      contactNumber: '+27714567890',
      email: 'john@example.com',
      duration: '30 min',
      followUpRequired: false,
      age: '42',
      gender: 'Male',
      dateOfBirth: '1983-01-20',
      address: '321 Elm Street, Pretoria, 0001',
      emergencyContact: 'Jane Smith',
      emergencyPhone: '+27714567891',
      insuranceProvider: 'Medshield',
      insuranceNumber: 'MS789123456',
      medicalHistory: 'No significant medical history',
      allergies: 'Aspirin',
      currentMedications: 'None',
      chiefComplaint: 'Sudden onset chest pain, radiating to left arm'
    }
  ];

  // Load consultations from localStorage or use default data
  const [consultations, setConsultations] = useState<Consultation[]>(() => {
    try {
      const saved = localStorage.getItem('consultations');
      return saved ? JSON.parse(saved) : defaultConsultations;
    } catch {
      return defaultConsultations;
    }
  });

  // Save consultations to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('consultations', JSON.stringify(consultations));
    } catch (error) {
      console.error('Failed to save consultations:', error);
    }
  }, [consultations]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'status' | 'date' | 'type' | 'priority'>('status');
  const [showModal, setShowModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | undefined>();
  const [isEditing, setIsEditing] = useState(false);

  // Hooks
  const { escalate } = useEscalation();
  const businessId = useBusinessId();

  // Functions
  const updateConsultationStatus = (consultationId: number, newStatus: string) => {
    setConsultations(prev => prev.map(c => 
      c.id === consultationId ? { ...c, status: newStatus } : c
    ));
  };

  const updateConsultationPriority = (consultationId: number, newPriority: 'low' | 'medium' | 'high' | 'urgent') => {
    setConsultations(prev => prev.map(c => 
      c.id === consultationId ? { ...c, priority: newPriority } : c
    ));
  };

  const addConsultation = () => {
    setSelectedConsultation(undefined);
    setIsEditing(false);
    setShowModal(true);
  };

  const editConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setIsEditing(true);
    setShowModal(true);
  };

  const deleteConsultation = (consultationId: number) => {
    if (window.confirm('Are you sure you want to delete this consultation?')) {
      setConsultations(prev => prev.filter(c => c.id !== consultationId));
    }
  };

  const saveConsultation = (consultation: Consultation) => {
    if (isEditing) {
      setConsultations(prev => prev.map(c => 
        c.id === consultation.id ? consultation : c
      ));
    } else {
      setConsultations(prev => [...prev, consultation]);
    }
  };

  const handleEscalate = (consultation: Consultation) => {
    escalate({
      patientName: consultation.patient,
      reason: `Urgent consultation required: ${consultation.type}`,
      doctorEmail: consultation.email || 'doctor@example.com',
      phoneNumber: consultation.contactNumber || '+27711234567',
      severity: consultation.priority === 'urgent' ? 'critical' : 'high',
      businessId: businessId,
      alertId: consultation.id.toString(),
      escalatedBy: 'system@yourapp.com'
    });
  };

  const viewNotes = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setShowNotesModal(true);
  };

  // Enhanced drag and drop handler
  const handleDrop = (consultationId: number, newStatus: string) => {
    updateConsultationStatus(consultationId, newStatus);
    
    // Show success feedback
    const toast = document.createElement('div');
    toast.className = 'fixed z-50 px-4 py-2 text-white bg-green-600 rounded-lg shadow-lg top-4 right-4';
    toast.textContent = `Consultation moved to ${newStatus}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  // Enhanced filtering logic
  const filteredConsultations = consultations.filter(consultation => {
    // First apply search term filter
    const matchesSearch = consultation.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Then apply specific filter
    switch (filterBy) {
      case 'status':
        return true; // Show all statuses by default
      case 'date':
        // Filter by today's date
        const today = new Date().toISOString().split('T')[0];
        return consultation.date === today;
      case 'type':
        // Group by consultation type (show all for now, could be enhanced)
        return true;
      case 'priority':
        // Filter by high priority and urgent
        return consultation.priority === 'high' || consultation.priority === 'urgent';
      default:
        return true;
    }
  });

  // Apply additional filter for specific status if needed
  const getFilteredByStatus = (status: string) => {
    if (filterBy === 'status') {
      return filteredConsultations.filter(c => c.status === status);
    }
    return filteredConsultations.filter(c => c.status === status);
  };

  const groupedConsultations = {
    scheduled: getFilteredByStatus('Scheduled'),
    completed: getFilteredByStatus('Completed'),
    pending: getFilteredByStatus('Pending'),
    inProgress: getFilteredByStatus('In Progress'),
    urgent: filteredConsultations.filter(c => c.priority === 'urgent')
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50 md:p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">Consultations</h1>
          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            <span>Total: {consultations.length}</span>
            <span>•</span>
            <span>Showing: {filteredConsultations.length}</span>
            <span>•</span>
            <span>Today: {consultations.filter(c => c.date === new Date().toISOString().split('T')[0]).length}</span>
            <span>•</span>
            <span>Urgent: {groupedConsultations.urgent.length}</span>
            {filterBy !== 'status' && (
              <>
                <span>•</span>
                <span className="px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded-full">
                  {filterBy === 'date' ? 'Today Only' : 
                   filterBy === 'priority' ? 'High Priority' : 
                   filterBy === 'type' ? 'All Types' : 'All'}
                </span>
              </>
            )}
          </div>
        </div>
        
        <SearchFilterControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterBy={filterBy}
          setFilterBy={setFilterBy}
          filterOptions={[
            { value: 'status', label: 'All Consultations' },
            { value: 'date', label: 'Today Only' },
            { value: 'priority', label: 'High Priority Only' },
            { value: 'type', label: 'All Types' }
          ]}
          onAdd={addConsultation}
          addButtonText="Schedule Consultation"
          placeholder="Search consultations..."
        />

        {/* Urgent Consultations Alert */}
        {groupedConsultations.urgent.length > 0 && (
          <div className="p-4 border-l-4 border-red-500 rounded-lg bg-red-50">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              <h3 className="text-lg font-semibold text-red-800">
                Urgent Consultations ({groupedConsultations.urgent.length})
              </h3>
            </div>
            <div className="mt-2 space-y-2">
              {groupedConsultations.urgent.map(consultation => (
                <div key={consultation.id} className="flex items-center justify-between p-2 bg-white rounded">
                  <div>
                    <p className="font-medium text-red-800">{consultation.patient}</p>
                    <p className="text-sm text-red-600">{consultation.type} - {consultation.date} {consultation.time}</p>
                  </div>
                  <button
                    onClick={() => handleEscalate(consultation)}
                    className="px-3 py-1 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-700"
                  >
                    🚨 Escalate
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Status and Controls */}
        {(searchTerm || filterBy !== 'status') && (
          <div className="flex flex-wrap items-center gap-3 p-3 border border-yellow-200 rounded-lg bg-yellow-50">
            <span className="text-sm font-medium text-yellow-800">Active Filters:</span>
            {searchTerm && (
              <span className="px-2 py-1 text-xs text-yellow-800 bg-yellow-200 rounded-full">
                Search: "{searchTerm}"
              </span>
            )}
            {filterBy !== 'status' && (
              <span className="px-2 py-1 text-xs text-yellow-800 bg-yellow-200 rounded-full">
                {filterBy === 'date' ? 'Today Only' : 
                 filterBy === 'priority' ? 'High Priority Only' : 
                 filterBy === 'type' ? 'All Types' : 'Custom Filter'}
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterBy('status');
              }}
              className="px-3 py-1 text-xs text-yellow-700 bg-yellow-300 rounded hover:bg-yellow-400"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Developer Tools */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all data? This will restore the default consultations and cannot be undone.')) {
                setConsultations(defaultConsultations);
              }
            }}
            className="px-3 py-1 text-xs text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
          >
            Reset Demo Data
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all consultation data? This cannot be undone.')) {
                setConsultations([]);
              }
            }}
            className="px-3 py-1 text-xs text-red-600 bg-red-100 rounded hover:bg-red-200"
          >
            Clear All Data
          </button>
        </div>

        {/* Drag and Drop Instructions */}
        <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> Drag and drop consultations between columns to change their status instantly! 
            Use priority dropdowns to change urgency levels. Works on both desktop and mobile devices.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:gap-6">
          {/* Scheduled Consultations */}
          <DropZone 
            title="Scheduled" 
            count={groupedConsultations.scheduled.length} 
            color="text-blue-600"
            onDrop={handleDrop}
            targetStatus="Scheduled"
          >
            {groupedConsultations.scheduled.map(consultation => (
              <DraggableConsultationCard
                key={consultation.id}
                consultation={consultation}
                onStatusChange={updateConsultationStatus}
                onPriorityChange={updateConsultationPriority}
                onEdit={editConsultation}
                onDelete={deleteConsultation}
                onViewNotes={viewNotes}
                onEscalate={handleEscalate}
              />
            ))}
            {groupedConsultations.scheduled.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No scheduled consultations</p>
                <p className="mt-1 text-xs text-gray-400">Drop consultations here to schedule them</p>
              </div>
            )}
          </DropZone>
          
          {/* Completed Consultations */}
          <DropZone 
            title="Completed" 
            count={groupedConsultations.completed.length} 
            color="text-green-600"
            onDrop={handleDrop}
            targetStatus="Completed"
          >
            {groupedConsultations.completed.map(consultation => (
              <DraggableConsultationCard
                key={consultation.id}
                consultation={consultation}
                onStatusChange={updateConsultationStatus}
                onPriorityChange={updateConsultationPriority}
                onEdit={editConsultation}
                onDelete={deleteConsultation}
                onViewNotes={viewNotes}
                onEscalate={handleEscalate}
              />
            ))}
            {groupedConsultations.completed.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                <Stethoscope className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No completed consultations</p>
                <p className="mt-1 text-xs text-gray-400">Drop consultations here to mark as completed</p>
              </div>
            )}
          </DropZone>
          
          {/* Pending Consultations */}
          <DropZone 
            title="Pending" 
            count={groupedConsultations.pending.length} 
            color="text-orange-600"
            onDrop={handleDrop}
            targetStatus="Pending"
          >
            {groupedConsultations.pending.map(consultation => (
              <DraggableConsultationCard
                key={consultation.id}
                consultation={consultation}
                onStatusChange={updateConsultationStatus}
                onPriorityChange={updateConsultationPriority}
                onEdit={editConsultation}
                onDelete={deleteConsultation}
                onViewNotes={viewNotes}
                onEscalate={handleEscalate}
              />
            ))}
            {groupedConsultations.pending.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No pending consultations</p>
                <p className="mt-1 text-xs text-gray-400">Drop consultations here to mark as pending</p>
              </div>
            )}
          </DropZone>
        </div>
        
        {/* In Progress Section */}
        {groupedConsultations.inProgress.length > 0 && (
          <DropZone 
            title="In Progress" 
            count={groupedConsultations.inProgress.length} 
            color="text-purple-600"
            onDrop={handleDrop}
            targetStatus="In Progress"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groupedConsultations.inProgress.map(consultation => (
                <div key={consultation.id} className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{consultation.type}</p>
                      <p className="text-sm text-gray-600">{consultation.patient}</p>
                      <p className="text-xs text-gray-500">Dr. {consultation.doctorName}</p>
                      <p className="text-xs font-medium text-purple-600">Started: {consultation.time}</p>
                    </div>
                    <span className="px-2 py-1 text-xs text-purple-800 bg-purple-200 rounded-full animate-pulse">
                      ACTIVE
                    </span>
                  </div>
                  
                  <div className="flex gap-1">
                    <button 
                      onClick={() => updateConsultationStatus(consultation.id, 'Completed')}
                      className="px-2 py-1 text-xs text-green-600 bg-green-100 rounded hover:bg-green-200"
                    >
                      Complete
                    </button>
                    <button 
                      onClick={() => viewNotes(consultation)}
                      className="px-2 py-1 text-xs text-purple-600 bg-purple-100 rounded hover:bg-purple-200"
                    >
                      Notes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </DropZone>
        )}
        
        {/* Empty State */}
        {filteredConsultations.length === 0 && (
          <div className="py-12 text-center">
            <Stethoscope className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-xl font-medium text-gray-900">No Consultations Found</h3>
            <p className="mb-4 text-gray-500">
              {searchTerm 
                ? `No consultations match "${searchTerm}". Try adjusting your search.`
                : 'No consultations scheduled. Click "Schedule Consultation" to add new appointments.'
              }
            </p>
            <button
              onClick={addConsultation}
              className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Schedule First Consultation
            </button>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <ConsultationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        consultation={selectedConsultation}
        onSave={saveConsultation}
        isEditing={isEditing}
      />
      
      <NotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        consultation={selectedConsultation}
      />
    </div>
  );
};

export default ConsultationsPage;