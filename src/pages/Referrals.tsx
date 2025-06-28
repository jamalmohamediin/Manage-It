import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Plus, ChevronDown, Send, User, Calendar, 
  Clock, Phone, Mail, FileText, MapPin, Star, AlertCircle,
  CheckCircle, XCircle, Eye, Edit, Trash2, Download
} from 'lucide-react';
import { useSelectedPatient } from '../contexts/SelectedPatientContext';

// Types
interface Referral {
  id: number;
  patient: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  direction: 'Outgoing' | 'Incoming';
  specialty: string;
  doctor: string;
  doctorPhone: string;
  hospital: string;
  date: string;
  urgency: 'Routine' | 'Urgent' | 'Emergency';
  status: 'Pending' | 'Accepted' | 'Complete' | 'Declined' | 'Cancelled';
  reason: string;
  notes: string;
  attachments: string[];
}

// Initial sample data
const initialReferrals: Referral[] = [
  {
    id: 1,
    patient: 'John Smith',
    patientAge: 45,
    patientGender: 'Male',
    patientPhone: '+27 82 123 4567',
    direction: 'Outgoing',
    specialty: 'Cardiology',
    doctor: 'Dr. Anderson',
    doctorPhone: '+27 11 234 5678',
    hospital: 'Heart Care Center',
    date: '2 days ago',
    urgency: 'Urgent',
    status: 'Pending',
    reason: 'Chest pain, possible cardiac event',
    notes: 'Patient has history of hypertension. ECG shows abnormalities.',
    attachments: ['ECG_Report.pdf', 'Blood_Work.pdf']
  },
  {
    id: 2,
    patient: 'Maria Garcia',
    patientAge: 32,
    patientGender: 'Female',
    patientPhone: '+27 83 987 6543',
    direction: 'Outgoing',
    specialty: 'Radiology',
    doctor: 'Dr. Wilson',
    doctorPhone: '+27 11 345 6789',
    hospital: 'Advanced Imaging',
    date: '1 day ago',
    urgency: 'Routine',
    status: 'Complete',
    reason: 'Follow-up MRI scan',
    notes: 'Post-surgery follow-up required',
    attachments: ['Surgery_Notes.pdf']
  },
  {
    id: 3,
    patient: 'Lisa Brown',
    patientAge: 28,
    patientGender: 'Female',
    patientPhone: '+27 84 456 7890',
    direction: 'Incoming',
    specialty: 'Emergency',
    doctor: 'Dr. Peterson',
    doctorPhone: '+27 11 456 7890',
    hospital: 'City General ER',
    date: '1 hour ago',
    urgency: 'Emergency',
    status: 'Accepted',
    reason: 'Motor vehicle accident, trauma assessment needed',
    notes: 'Multiple injuries, stable but requires specialist attention',
    attachments: ['Trauma_Assessment.pdf', 'X-Ray_Images.zip']
  },
  {
    id: 4,
    patient: 'David Johnson',
    patientAge: 67,
    patientGender: 'Male',
    patientPhone: '+27 85 234 5678',
    direction: 'Incoming',
    specialty: 'Neurology',
    doctor: 'Dr. Smith',
    doctorPhone: '+27 11 567 8901',
    hospital: 'Neuro Specialists',
    date: '3 hours ago',
    urgency: 'Urgent',
    status: 'Pending',
    reason: 'Sudden onset headache with neurological symptoms',
    notes: 'Patient shows signs of possible stroke. Urgent evaluation needed.',
    attachments: ['CT_Scan.pdf']
  }
];

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
  <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 md:grid-cols-4">
    <button
      onClick={onAdd}
      className="flex items-center justify-center gap-2 p-3 text-green-700 transition-all duration-200 transform bg-green-100 shadow-md rounded-xl hover:bg-green-200 hover:scale-105 active:scale-95"
    >
      <Plus className="w-5 h-5" />
      <span className="text-sm font-medium">{addButtonText}</span>
    </button>
    
    <div className="flex items-center col-span-1 gap-2 p-3 bg-blue-100 shadow-md sm:col-span-2 rounded-xl">
      <Search className="flex-shrink-0 w-4 h-4 text-blue-600" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 text-sm placeholder-blue-600 bg-transparent outline-none"
      />
    </div>
    
    <div className="flex items-center gap-2 p-3 bg-purple-100 shadow-md rounded-xl">
      <Filter className="flex-shrink-0 w-4 h-4 text-purple-600" />
      <select
        value={filterBy}
        onChange={(e) => setFilterBy(e.target.value)}
        className="flex-1 text-xs text-purple-600 bg-transparent outline-none"
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
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
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
        </>
      )}
    </div>
  );
};

// Helper function to get status colors
function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'complete':
    case 'accepted':
      return 'bg-green-100 text-green-700';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    case 'declined':
      return 'bg-orange-100 text-orange-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function getUrgencyColor(urgency: string) {
  switch (urgency.toLowerCase()) {
    case 'emergency':
      return 'bg-red-500 text-white';
    case 'urgent':
      return 'bg-orange-500 text-white';
    case 'routine':
      return 'bg-blue-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
}

// ENHANCED Create Referral Modal with Auto-Patient Detection
const CreateReferralModal = ({ isOpen, onClose, onSave }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (referral: Omit<Referral, 'id'>) => void;
}) => {
  // ENHANCED: Get selected patient from context
  const { patient: selectedPatient } = useSelectedPatient();
  
  // ENHANCED: Initialize form with selected patient data
  const [formData, setFormData] = useState({
    patient: selectedPatient?.name || '',
    patientAge: selectedPatient?.age?.toString() || '',
    patientGender: selectedPatient?.gender || 'Male',
    patientPhone: selectedPatient?.contactNumber || '',
    direction: 'Outgoing' as 'Outgoing' | 'Incoming',
    specialty: '',
    doctor: '',
    doctorPhone: '',
    hospital: '',
    urgency: 'Routine' as 'Routine' | 'Urgent' | 'Emergency',
    reason: selectedPatient?.diagnosis ? `Follow-up for ${selectedPatient.diagnosis}` : '',
    notes: '',
    attachments: [] as string[]
  });

  // ENHANCED: Update form when selected patient changes
  useEffect(() => {
    if (selectedPatient) {
      setFormData(prev => ({
        ...prev,
        patient: selectedPatient.name,
        patientAge: selectedPatient.age?.toString() || '',
        patientGender: selectedPatient.gender || 'Male',
        patientPhone: selectedPatient.contactNumber || '',
        reason: selectedPatient.diagnosis ? `Follow-up for ${selectedPatient.diagnosis}` : prev.reason
      }));
    }
  }, [selectedPatient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      patientAge: parseInt(formData.patientAge) || 0,
      date: 'Just now',
      status: 'Pending'
    });
    onClose();
    setFormData({
      patient: '',
      patientAge: '',
      patientGender: 'Male',
      patientPhone: '',
      direction: 'Outgoing',
      specialty: '',
      doctor: '',
      doctorPhone: '',
      hospital: '',
      urgency: 'Routine',
      reason: '',
      notes: '',
      attachments: []
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Create New Referral</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* ENHANCED: Patient Name with auto-selection indicator */}
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Patient Name</label>
                <input
                  type="text"
                  required
                  value={formData.patient}
                  onChange={(e) => setFormData({...formData, patient: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    backgroundColor: selectedPatient ? '#f0f9ff' : 'white',
                    borderColor: selectedPatient ? '#0ea5e9' : '#d1d5db'
                  }}
                />
                {selectedPatient && (
                  <p className="mt-1 text-sm text-blue-600">
                    ✓ Patient auto-selected from Patients page
                  </p>
                )}
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  required
                  value={formData.patientAge}
                  onChange={(e) => setFormData({...formData, patientAge: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Gender</label>
                <select
                  value={formData.patientGender}
                  onChange={(e) => setFormData({...formData, patientGender: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Patient Phone</label>
                <input
                  type="tel"
                  value={formData.patientPhone}
                  onChange={(e) => setFormData({...formData, patientPhone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Direction</label>
                <select
                  value={formData.direction}
                  onChange={(e) => setFormData({...formData, direction: e.target.value as 'Outgoing' | 'Incoming'})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Outgoing">Outgoing</option>
                  <option value="Incoming">Incoming</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Specialty</label>
                <input
                  type="text"
                  required
                  value={formData.specialty}
                  onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Doctor Name</label>
                <input
                  type="text"
                  required
                  value={formData.doctor}
                  onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Doctor Phone</label>
                <input
                  type="tel"
                  value={formData.doctorPhone}
                  onChange={(e) => setFormData({...formData, doctorPhone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Hospital/Clinic</label>
                <input
                  type="text"
                  required
                  value={formData.hospital}
                  onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Urgency</label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({...formData, urgency: e.target.value as 'Routine' | 'Urgent' | 'Emergency'})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Routine">Routine</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Reason for Referral</label>
              <textarea
                required
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 font-medium text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Create Referral
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Referrals Component
const Referrals: React.FC = () => {
  const [referralsList, setReferralsList] = useState<Referral[]>(initialReferrals);
  const [referralsSearchTerm, setReferralsSearchTerm] = useState('');
  const [referralsFilterBy, setReferralsFilterBy] = useState<'direction' | 'date' | 'specialty'>('direction');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);

  // ENHANCED: Add context hooks for auto-referral creation
  const { patient: selectedPatient, pendingAction, clearPendingAction } = useSelectedPatient();

  // ENHANCED: Auto-handle patient referral creation
  useEffect(() => {
    if (selectedPatient && pendingAction === 'create-referral') {
      // Auto-open the create referral modal
      setShowCreateModal(true);
      
      // Clear the pending action
      clearPendingAction();
    }
  }, [selectedPatient, pendingAction, clearPendingAction]);

  // Status update function
  const updateReferralStatus = (referralId: number, newStatus: string) => {
    setReferralsList(referralsList.map(r => 
      r.id === referralId ? { ...r, status: newStatus as any } : r
    ));
  };

  const addReferral = (newReferral: Omit<Referral, 'id'>) => {
    const referral: Referral = {
      ...newReferral,
      id: Date.now()
    };
    setReferralsList([referral, ...referralsList]);
  };

  // Filtering
  const filteredReferrals = referralsList.filter(referral =>
    referral.patient.toLowerCase().includes(referralsSearchTerm.toLowerCase()) ||
    referral.specialty.toLowerCase().includes(referralsSearchTerm.toLowerCase()) ||
    referral.doctor.toLowerCase().includes(referralsSearchTerm.toLowerCase()) ||
    referral.hospital.toLowerCase().includes(referralsSearchTerm.toLowerCase())
  );

  const outgoingReferrals = filteredReferrals.filter(r => r.direction === 'Outgoing');
  const incomingReferrals = filteredReferrals.filter(r => r.direction === 'Incoming');

  return (
    <div className="min-h-screen p-4 bg-gray-50 sm:p-6">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Referrals Management</h2>
        
        <SearchFilterControls
          searchTerm={referralsSearchTerm}
          setSearchTerm={setReferralsSearchTerm}
          filterBy={referralsFilterBy}
          setFilterBy={setReferralsFilterBy}
          filterOptions={[
            { value: 'direction', label: 'Filter by Direction' },
            { value: 'date', label: 'Filter by Date' },
            { value: 'specialty', label: 'Filter by Specialty' }
          ]}
          onAdd={() => setShowCreateModal(true)}
          addButtonText="Create Referral"
          placeholder="Search referrals..."
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Outgoing Referrals */}
          <div className="p-4 bg-white shadow-lg rounded-xl sm:p-6">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-blue-600">
              <Send className="w-5 h-5" />
              Outgoing Referrals ({outgoingReferrals.length})
            </h3>
            <div className="space-y-3">
              {outgoingReferrals.map(referral => (
                <div key={referral.id} className="p-4 transition-colors border rounded-lg bg-blue-50 hover:bg-blue-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="mb-1 font-semibold text-gray-800">
                        {referral.patient} → {referral.specialty}
                      </p>
                      <p className="mb-1 text-sm text-gray-600">
                        <MapPin className="inline w-3 h-3 mr-1" />
                        {referral.hospital}
                      </p>
                      <p className="mb-1 text-sm text-gray-600">
                        Referred to {referral.doctor}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(referral.urgency)}`}>
                          {referral.urgency}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {referral.date}
                        </span>
                      </div>
                    </div>
                    <StatusDropdown
                      currentStatus={referral.status}
                      options={['Pending', 'Accepted', 'Complete', 'Declined', 'Cancelled']}
                      onStatusChange={(newStatus) => updateReferralStatus(referral.id, newStatus)}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <p className="mb-1 text-sm text-gray-700">
                      <strong>Reason:</strong> {referral.reason}
                    </p>
                    {referral.notes && (
                      <p className="text-xs text-gray-600">
                        <strong>Notes:</strong> {referral.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => alert('Checking referral status...')}
                      className="flex items-center gap-1 px-3 py-1 text-xs text-blue-600 transition-colors bg-blue-100 rounded-full hover:bg-blue-200"
                    >
                      <Eye className="w-3 h-3" />
                      Check Status
                    </button>
                    <button 
                      onClick={() => updateReferralStatus(referral.id, 'Pending')}
                      className="flex items-center gap-1 px-3 py-1 text-xs text-green-600 transition-colors bg-green-100 rounded-full hover:bg-green-200"
                    >
                      <Phone className="w-3 h-3" />
                      Follow Up
                    </button>
                    {referral.doctorPhone && (
                      <a 
                        href={`tel:${referral.doctorPhone}`}
                        className="flex items-center gap-1 px-3 py-1 text-xs text-purple-600 transition-colors bg-purple-100 rounded-full hover:bg-purple-200"
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </a>
                    )}
                    <button 
                      onClick={() => updateReferralStatus(referral.id, 'Cancelled')}
                      className="flex items-center gap-1 px-3 py-1 text-xs text-red-600 transition-colors bg-red-100 rounded-full hover:bg-red-200"
                    >
                      <XCircle className="w-3 h-3" />
                      Cancel
                    </button>
                  </div>
                  
                  {referral.attachments.length > 0 && (
                    <div className="pt-2 mt-2 border-t border-blue-200">
                      <p className="mb-1 text-xs text-gray-600">Attachments:</p>
                      <div className="flex flex-wrap gap-1">
                        {referral.attachments.map((file, index) => (
                          <span key={index} className="flex items-center gap-1 px-2 py-1 text-xs text-gray-700 bg-white border rounded">
                            <FileText className="w-3 h-3" />
                            {file}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {outgoingReferrals.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  <Send className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">No outgoing referrals</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Incoming Referrals */}
          <div className="p-4 bg-white shadow-lg rounded-xl sm:p-6">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-green-600">
              <Download className="w-5 h-5" />
              Incoming Referrals ({incomingReferrals.length})
            </h3>
            <div className="space-y-3">
              {incomingReferrals.map(referral => (
                <div key={referral.id} className="p-4 transition-colors border rounded-lg bg-green-50 hover:bg-green-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="mb-1 font-semibold text-gray-800">
                        {referral.patient} ← {referral.specialty}
                      </p>
                      <p className="mb-1 text-sm text-gray-600">
                        <MapPin className="inline w-3 h-3 mr-1" />
                        From {referral.hospital}
                      </p>
                      <p className="mb-1 text-sm text-gray-600">
                        By {referral.doctor}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(referral.urgency)}`}>
                          {referral.urgency}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {referral.date}
                        </span>
                      </div>
                    </div>
                    <StatusDropdown
                      currentStatus={referral.status}
                      options={['Pending', 'Accepted', 'Complete', 'Declined']}
                      onStatusChange={(newStatus) => updateReferralStatus(referral.id, newStatus)}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <p className="mb-1 text-sm text-gray-700">
                      <strong>Reason:</strong> {referral.reason}
                    </p>
                    {referral.notes && (
                      <p className="text-xs text-gray-600">
                        <strong>Notes:</strong> {referral.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => updateReferralStatus(referral.id, 'Accepted')}
                      className="flex items-center gap-1 px-3 py-1 text-xs text-green-600 transition-colors bg-green-100 rounded-full hover:bg-green-200"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Accept
                    </button>
                    <button 
                      onClick={() => alert('Scheduling appointment...')}
                      className="flex items-center gap-1 px-3 py-1 text-xs text-blue-600 transition-colors bg-blue-100 rounded-full hover:bg-blue-200"
                    >
                      <Calendar className="w-3 h-3" />
                      Schedule
                    </button>
                    {referral.patientPhone && (
                      <a 
                        href={`tel:${referral.patientPhone}`}
                        className="flex items-center gap-1 px-3 py-1 text-xs text-purple-600 transition-colors bg-purple-100 rounded-full hover:bg-purple-200"
                      >
                        <Phone className="w-3 h-3" />
                        Call Patient
                      </a>
                    )}
                    {referral.doctorPhone && (
                      <a 
                        href={`tel:${referral.doctorPhone}`}
                        className="flex items-center gap-1 px-3 py-1 text-xs text-orange-600 transition-colors bg-orange-100 rounded-full hover:bg-orange-200"
                      >
                        <Phone className="w-3 h-3" />
                        Call Referrer
                      </a>
                    )}
                    <button 
                      onClick={() => updateReferralStatus(referral.id, 'Declined')}
                      className="flex items-center gap-1 px-3 py-1 text-xs text-red-600 transition-colors bg-red-100 rounded-full hover:bg-red-200"
                    >
                      <XCircle className="w-3 h-3" />
                      Decline
                    </button>
                  </div>
                  
                  {referral.attachments.length > 0 && (
                    <div className="pt-2 mt-2 border-t border-green-200">
                      <p className="mb-1 text-xs text-gray-600">Attachments:</p>
                      <div className="flex flex-wrap gap-1">
                        {referral.attachments.map((file, index) => (
                          <button
                            key={index} 
                            onClick={() => alert(`Opening ${file}...`)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-700 transition-colors bg-white border rounded hover:bg-gray-50"
                          >
                            <FileText className="w-3 h-3" />
                            {file}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {incomingReferrals.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  <Download className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">No incoming referrals</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="p-4 text-center bg-white shadow-md rounded-xl">
            <div className="text-2xl font-bold text-blue-600">{outgoingReferrals.length}</div>
            <div className="text-sm text-gray-600">Outgoing</div>
          </div>
          <div className="p-4 text-center bg-white shadow-md rounded-xl">
            <div className="text-2xl font-bold text-green-600">{incomingReferrals.length}</div>
            <div className="text-sm text-gray-600">Incoming</div>
          </div>
          <div className="p-4 text-center bg-white shadow-md rounded-xl">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredReferrals.filter(r => r.status === 'Pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="p-4 text-center bg-white shadow-md rounded-xl">
            <div className="text-2xl font-bold text-red-600">
              {filteredReferrals.filter(r => r.urgency === 'Emergency').length}
            </div>
            <div className="text-sm text-gray-600">Emergency</div>
          </div>
        </div>

        {/* Empty State */}
        {filteredReferrals.length === 0 && referralsSearchTerm && (
          <div className="py-12 text-center">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No referrals found</h3>
            <p className="text-gray-500">Try adjusting your search terms or filters.</p>
            <button
              onClick={() => setReferralsSearchTerm('')}
              className="px-4 py-2 mt-4 text-blue-600 transition-colors bg-blue-100 rounded-lg hover:bg-blue-200"
            >
              Clear Search
            </button>
          </div>
        )}

        {filteredReferrals.length === 0 && !referralsSearchTerm && (
          <div className="py-12 text-center">
            <Send className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No Referrals Yet</h3>
            <p className="mb-4 text-gray-500">Start by creating your first referral to manage patient care coordination.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 mx-auto text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Create First Referral
            </button>
          </div>
        )}
      </div>

      {/* ENHANCED Create Referral Modal with Auto-Patient Detection */}
      <CreateReferralModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={addReferral}
      />
    </div>
  );
};

export default Referrals;