import React, { useEffect, useState, useRef } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  ChevronDown,
  Download,
  FileText,
  Edit3,
  X,
  Clock,
  User,
  MapPin,
  Stethoscope,
  Trash2,
  ChevronUp,
  Phone,
  AlertTriangle,
  Heart,
  CreditCard,
  Building,
  FileX,
  Save,
  List,
  Grid,
  Eye
} from 'lucide-react';

// Enhanced Types
interface UpcomingCase {
  id: string;
  date: string;
  time: string;
  procedure: string;
  patient: string;
  patientAge: number;
  gender: 'Male' | 'Female' | 'Other';
  diagnosis: string;
  hospital: string;
  room: string;
  ward: string;
  surgeon: string;
  status: 'Confirmed' | 'No Authorization' | 'Delayed' | 'Cancelled' | 'Pending';
  priority: 'High' | 'Medium' | 'Low';
  contactNumber: string;
  allergies: string;
  comorbidities: string;
  medicalAidName: string;
  medicalAidNumber: string;
  specialInstructions: string;
  height: number; // in cm
  weight: number; // in kg
  order: number;
}

// Initial form state
const initialFormState: Omit<UpcomingCase, 'id' | 'order'> = {
  date: '',
  time: '',
  procedure: '',
  patient: '',
  patientAge: 0,
  gender: 'Male',
  diagnosis: '',
  hospital: 'Central Medical Center',
  room: '',
  ward: '',
  surgeon: 'Dr. Johnson',
  status: 'Pending',
  priority: 'Medium',
  contactNumber: '',
  allergies: '',
  comorbidities: '',
  medicalAidName: '',
  medicalAidNumber: '',
  specialInstructions: '',
  height: 0,
  weight: 0
};

// Mock data for demonstration
const mockCases: UpcomingCase[] = [
  {
    id: '1',
    date: 'Tomorrow',
    time: '08:00 AM',
    procedure: 'Laparoscopic Cholecystectomy',
    patient: 'Maria Garcia',
    patientAge: 45,
    gender: 'Female',
    diagnosis: 'Chronic Cholecystitis',
    hospital: 'Central Medical Center',
    room: 'Room 3',
    ward: 'Surgical Ward A',
    surgeon: 'Dr. Johnson',
    status: 'Confirmed',
    priority: 'Medium',
    contactNumber: '+27 82 123 4567',
    allergies: 'Penicillin',
    comorbidities: 'Type 2 Diabetes',
    medicalAidName: 'Discovery Health',
    medicalAidNumber: 'DH001234567',
    specialInstructions: 'Patient has diabetes - monitor glucose levels',
    height: 165,
    weight: 70,
    order: 1
  },
  {
    id: '2',
    date: 'Tomorrow',
    time: '10:30 AM',
    procedure: 'Hernia Repair',
    patient: 'David Wilson',
    patientAge: 52,
    gender: 'Male',
    diagnosis: 'Inguinal Hernia',
    hospital: 'Central Medical Center',
    room: 'Room 5',
    ward: 'Surgical Ward B',
    surgeon: 'Dr. Smith',
    status: 'No Authorization',
    priority: 'Low',
    contactNumber: '+27 83 987 6543',
    allergies: 'None known',
    comorbidities: 'Hypertension',
    medicalAidName: 'Momentum Health',
    medicalAidNumber: 'MH987654321',
    specialInstructions: 'Waiting for medical aid authorization - HIGH PRIORITY from Mayo Clinic ICU',
    height: 180,
    weight: 85,
    order: 2
  },
  {
    id: '3',
    date: 'Thursday',
    time: '14:00 PM',
    procedure: 'Appendectomy',
    patient: 'Sarah Miller',
    patientAge: 28,
    gender: 'Female',
    diagnosis: 'Acute Appendicitis',
    hospital: 'Emergency Medical Center',
    room: 'Room 2',
    ward: 'Emergency Ward',
    surgeon: 'Dr. Brown',
    status: 'Delayed',
    priority: 'High',
    contactNumber: '+27 84 555 7890',
    allergies: 'Latex, Morphine',
    comorbidities: 'None',
    medicalAidName: 'Bonitas',
    medicalAidNumber: 'BN456789123',
    specialInstructions: 'Emergency case - TO BE DONE LAST due to scheduling conflicts',
    height: 158,
    weight: 55,
    order: 3
  }
];

// Helper function to get status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Confirmed': return 'bg-green-100 text-green-700 border-green-200';
    case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
    case 'No Authorization': return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'Delayed': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Pending': return 'bg-blue-100 text-blue-700 border-blue-200';
    default: return 'bg-blue-100 text-blue-700 border-blue-200';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return 'bg-red-100 text-red-700 border-red-200';
    case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Low': return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

// Generic Dropdown Component
const GenericDropdown = ({ 
  currentValue, 
  options, 
  onValueChange, 
  caseId,
  getColorClass,
  label 
}: {
  currentValue: string;
  options: string[];
  onValueChange: (caseId: string, newValue: string) => void;
  caseId: string;
  getColorClass: (value: string) => string;
  label: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleValueChange = (newValue: string) => {
    onValueChange(caseId, newValue);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 border ${getColorClass(currentValue)} flex items-center gap-1`}
      >
        <span className="hidden sm:inline">{currentValue}</span>
        <span className="sm:hidden">{currentValue.slice(0, 3)}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 z-50 w-48 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          {options.map(option => (
            <button
              key={option}
              onClick={(e) => {
                e.stopPropagation();
                handleValueChange(option);
              }}
              className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                option === currentValue ? 'bg-blue-50' : ''
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

// Add Case Form Modal
const AddCaseModal = ({ 
  isOpen, 
  onClose, 
  onSave 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (caseData: Omit<UpcomingCase, 'id' | 'order'>) => void;
}) => {
  const [formData, setFormData] = useState(initialFormState);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient || !formData.procedure || !formData.date) {
      alert('Please fill in required fields: Patient Name, Procedure, and Date');
      return;
    }
    onSave(formData);
    setFormData(initialFormState);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-xl rounded-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Add New Case</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Patient Name */}
            <div>
              <input
                type="text"
                placeholder="Patient Name *"
                value={formData.patient}
                onChange={(e) => handleInputChange('patient', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Age, Height, Weight */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <input
                  type="number"
                  placeholder="Age"
                  value={formData.patientAge || ''}
                  onChange={(e) => handleInputChange('patientAge', parseInt(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Height (cm)"
                  value={formData.height || ''}
                  onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  value={formData.weight || ''}
                  onChange={(e) => handleInputChange('weight', parseInt(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Gender and Contact */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="tel"
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Medical Info */}
            <div>
              <input
                type="text"
                placeholder="Diagnosis"
                value={formData.diagnosis}
                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Hospital and Procedure */}
            <div>
              <input
                type="text"
                placeholder="Hospital/Medical Center"
                value={formData.hospital}
                onChange={(e) => handleInputChange('hospital', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Procedure/Operation (e.g., Laparoscopic Appendectomy) *"
                value={formData.procedure}
                onChange={(e) => handleInputChange('procedure', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Priority and Ward */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
              <input
                type="text"
                placeholder="Ward"
                value={formData.ward}
                onChange={(e) => handleInputChange('ward', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date, Time, Room */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Room"
                value={formData.room}
                onChange={(e) => handleInputChange('room', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Medical Aid Info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Medical Aid Name"
                value={formData.medicalAidName}
                onChange={(e) => handleInputChange('medicalAidName', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Medical Aid Number"
                value={formData.medicalAidNumber}
                onChange={(e) => handleInputChange('medicalAidNumber', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Allergies and Comorbidities */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Allergies (e.g., Penicillin, Latex)"
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Comorbidities"
                value={formData.comorbidities}
                onChange={(e) => handleInputChange('comorbidities', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Special Instructions */}
            <div>
              <textarea
                placeholder="Special Instructions (e.g., TO BE DONE LAST, HIGH PRIORITY from Mayo Clinic ICU)"
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                className="w-full h-24 p-3 border border-gray-300 resize-none rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col gap-3 mt-6 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-700 transition-colors bg-gray-200 rounded-xl hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center justify-center flex-1 gap-2 px-4 py-3 text-white transition-colors bg-green-600 rounded-xl hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                Add Patient
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Linear List View Component
const LinearListView = ({ 
  cases, 
  onViewDetails, 
  updateCaseStatus, 
  updateCasePriority,
  removeCase,
  moveCaseOrder 
}: {
  cases: UpcomingCase[];
  onViewDetails: (caseItem: UpcomingCase) => void;
  updateCaseStatus: (caseId: string, newStatus: string) => void;
  updateCasePriority: (caseId: string, newPriority: string) => void;
  removeCase: (caseId: string) => void;
  moveCaseOrder: (caseId: string, direction: 'up' | 'down') => void;
}) => {
  return (
    <div className="space-y-1">
      {cases.map((caseItem, index) => (
        <div 
          key={caseItem.id} 
          className="flex items-center justify-between p-2 bg-white border-l-4 border-blue-500 rounded-lg shadow-sm sm:p-3"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              {/* Order and Time */}
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-700">{index + 1}.</span>
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="font-medium text-gray-800">{caseItem.date} - {caseItem.time}</span>
              </div>
              
              {/* Status and Priority Dropdowns */}
              <div className="flex items-center gap-1">
                <GenericDropdown
                  currentValue={caseItem.status}
                  options={['Confirmed', 'No Authorization', 'Delayed', 'Cancelled', 'Pending']}
                  onValueChange={updateCaseStatus}
                  caseId={caseItem.id}
                  getColorClass={getStatusColor}
                  label="Status"
                />
                <GenericDropdown
                  currentValue={caseItem.priority}
                  options={['High', 'Medium', 'Low']}
                  onValueChange={updateCasePriority}
                  caseId={caseItem.id}
                  getColorClass={getPriorityColor}
                  label="Priority"
                />
              </div>
            </div>
            
            <div className="mt-1 text-xs sm:text-sm">
              <div className="flex items-center gap-2 mb-1">
                {/* Patient Name First, then Procedure */}
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-black" />
                  <span className="font-medium text-black">{caseItem.patient} ({caseItem.patientAge} yrs, {caseItem.gender.charAt(0)})</span>
                </div>
                <span className="text-gray-600">•</span>
                <span className="font-medium text-black">{caseItem.procedure}</span>
                <span className="text-gray-600">•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-600" />
                  <span className="text-gray-600">{caseItem.room} - {caseItem.ward}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {caseItem.allergies && (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                    <span className="text-red-600">Allergies: {caseItem.allergies}</span>
                  </div>
                )}
                {caseItem.comorbidities && (
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-orange-600" />
                    <span className="text-orange-600">{caseItem.comorbidities}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-gray-600" />
                  <span className="text-gray-600">{caseItem.contactNumber}</span>
                </div>
                {caseItem.medicalAidName && (
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-purple-600" />
                    <span className="text-purple-600">{caseItem.medicalAidName} ({caseItem.medicalAidNumber})</span>
                  </div>
                )}
              </div>
              
              {caseItem.specialInstructions && (
                <div className="p-2 mt-1 text-xs border border-yellow-200 rounded bg-yellow-50">
                  <span className="font-medium text-yellow-800">Special Instructions:</span>
                  <span className="ml-1 text-yellow-700">{caseItem.specialInstructions}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Controls */}
          <div className="flex items-center gap-1 ml-2">
            {/* Order Controls */}
            <div className="flex-col hidden sm:flex">
              <button
                onClick={() => moveCaseOrder(caseItem.id, 'up')}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30"
                title="Move up"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => moveCaseOrder(caseItem.id, 'down')}
                disabled={index === cases.length - 1}
                className="p-1 text-gray-400 rotate-180 hover:text-blue-600 disabled:opacity-30"
                title="Move down"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center">
              {/* View Details */}
              <button
                onClick={() => onViewDetails(caseItem)}
                className="px-2 py-1 text-xs text-blue-600 transition-colors bg-blue-100 rounded hover:bg-blue-200 whitespace-nowrap"
                title="View Details"
              >
                View Details
              </button>
              
              {/* Edit Schedule */}
              <button
                onClick={() => onViewDetails(caseItem)}
                className="px-2 py-1 text-xs text-purple-600 transition-colors bg-purple-100 rounded hover:bg-purple-200 whitespace-nowrap"
                title="Edit Schedule"
              >
                Edit Schedule
              </button>
              
              {/* Remove */}
              <button
                onClick={() => removeCase(caseItem.id)}
                className="px-2 py-1 text-xs text-red-600 transition-colors bg-red-100 rounded hover:bg-red-200"
                title="Remove"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Main Component
const UpcomingSlates: React.FC = () => {
  // Load cases from localStorage or use initial mock data
  const loadCasesFromStorage = (): UpcomingCase[] => {
    try {
      const saved = localStorage.getItem('upcomingCases');
      return saved ? JSON.parse(saved) : mockCases;
    } catch {
      return mockCases;
    }
  };

  const [cases, setCases] = useState<UpcomingCase[]>(loadCasesFromStorage);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'date' | 'status' | 'priority'>('date');
  const [viewMode, setViewMode] = useState<'list' | 'detailed'>('list');
  const [selectedCase, setSelectedCase] = useState<UpcomingCase | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [exportLoading, setExportLoading] = useState<'pdf' | 'excel' | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Save to localStorage whenever cases change
  useEffect(() => {
    localStorage.setItem('upcomingCases', JSON.stringify(cases));
  }, [cases]);

  // Debug log for filterBy changes
  useEffect(() => {
    console.log('Filter changed to:', filterBy);
  }, [filterBy]);

  // Update case status
  const updateCaseStatus = (caseId: string, newStatus: string) => {
    setCases(prevCases => 
      prevCases.map(c => 
        c.id === caseId ? { ...c, status: newStatus as any } : c
      )
    );
  };

  // Update case priority
  const updateCasePriority = (caseId: string, newPriority: string) => {
    setCases(prevCases => 
      prevCases.map(c => 
        c.id === caseId ? { ...c, priority: newPriority as any } : c
      )
    );
  };

  // Add new case
  const addNewCase = (caseData: Omit<UpcomingCase, 'id' | 'order'>) => {
    const newCase: UpcomingCase = {
      ...caseData,
      id: Date.now().toString(),
      order: cases.length + 1
    };
    setCases([...cases, newCase]);
  };

  // Remove case
  const removeCase = (caseId: string) => {
    if (confirm('Are you sure you want to remove this case?')) {
      setCases(prevCases => prevCases.filter(c => c.id !== caseId));
    }
  };

  // Move case up or down
  const moveCaseOrder = (caseId: string, direction: 'up' | 'down') => {
    setCases(prevCases => {
      const sortedCases = [...prevCases].sort((a, b) => a.order - b.order);
      const caseIndex = sortedCases.findIndex(c => c.id === caseId);
      
      if (direction === 'up' && caseIndex > 0) {
        const temp = sortedCases[caseIndex].order;
        sortedCases[caseIndex].order = sortedCases[caseIndex - 1].order;
        sortedCases[caseIndex - 1].order = temp;
      } else if (direction === 'down' && caseIndex < sortedCases.length - 1) {
        const temp = sortedCases[caseIndex].order;
        sortedCases[caseIndex].order = sortedCases[caseIndex + 1].order;
        sortedCases[caseIndex + 1].order = temp;
      }
      
      return sortedCases;
    });
  };

  // Filter cases with real-time filtering
  const filteredCases = cases
    .filter(caseItem => {
      // Text search filter
      const matchesSearch = caseItem.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.procedure.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.surgeon.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.hospital.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    })
    .sort((a, b) => {
      // Apply real-time sorting based on filterBy selection
      if (filterBy === 'status') {
        const statusOrder = { 
          'Confirmed': 1, 
          'Pending': 2, 
          'Delayed': 3, 
          'No Authorization': 4, 
          'Cancelled': 5 
        };
        const statusA = statusOrder[a.status as keyof typeof statusOrder] || 6;
        const statusB = statusOrder[b.status as keyof typeof statusOrder] || 6;
        if (statusA !== statusB) return statusA - statusB;
        // Secondary sort by order if status is same
        return a.order - b.order;
      } 
      
      if (filterBy === 'priority') {
        const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
        const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 4;
        const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 4;
        if (priorityA !== priorityB) return priorityA - priorityB;
        // Secondary sort by order if priority is same
        return a.order - b.order;
      }
      
      if (filterBy === 'date') {
        // Convert relative dates to comparable values
        const getDateValue = (dateStr: string) => {
          if (dateStr === 'Tomorrow') return 1;
          if (dateStr === 'Thursday') return 2;
          if (dateStr === 'Friday') return 3;
          // For actual dates, convert to timestamp
          const date = new Date(dateStr);
          return date.getTime();
        };
        
        const dateA = getDateValue(a.date);
        const dateB = getDateValue(b.date);
        if (dateA !== dateB) return dateA - dateB;
        
        // If same date, sort by time
        const timeA = a.time || '';
        const timeB = b.time || '';
        if (timeA !== timeB) return timeA.localeCompare(timeB);
        
        // Tertiary sort by order
        return a.order - b.order;
      }
      
      // Default sort by order
      return a.order - b.order;
    });

  // Mock export functions
  const exportToPDF = async () => {
    setExportLoading('pdf');
    setTimeout(() => {
      alert('PDF export completed!');
      setExportLoading(null);
    }, 2000);
  };

  const exportToExcel = () => {
    setExportLoading('excel');
    setTimeout(() => {
      alert('Excel export completed!');
      setExportLoading(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen p-4 space-y-4 sm:p-6 bg-gray-50">
      {/* Compact Header */}
      <div className="text-center">
        <h1 className="flex items-center justify-center gap-2 text-xl font-bold text-gray-800 sm:text-2xl">
          📅 Upcoming Cases/Slates
        </h1>
      </div>

      {/* Top Controls - Compact Layout */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Schedule Case</span>
        </button>
        
        <div className="flex items-center flex-1 max-w-md gap-2 p-2 bg-white border border-gray-200 rounded-lg">
          <Search className="flex-shrink-0 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterBy}
              onChange={(e) => {
                const newValue = e.target.value as 'date' | 'status' | 'priority';
                console.log('Changing filter to:', newValue);
                setFilterBy(newValue);
              }}
              className="text-sm bg-transparent outline-none"
            >
              <option value="date">Filter by Date</option>
              <option value="status">Filter by Status</option>
              <option value="priority">Filter by Priority</option>
            </select>
          </div>
          
          {/* View Toggle */}
          <div className="flex overflow-hidden border border-gray-200 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'detailed' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              title="Detailed View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Export Buttons */}
        <div className="flex gap-2">
          <button
            onClick={exportToPDF}
            className="flex items-center gap-1 px-3 py-2 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={exportLoading === 'pdf'}
          >
            <FileText className="w-3 h-3" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1 px-3 py-2 text-xs text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            disabled={exportLoading === 'excel'}
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      {/* Cases List */}
      <div ref={tableRef}>
        {filteredCases.length === 0 ? (
          <div className="py-8 text-center bg-white rounded-lg shadow-sm">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <h3 className="mb-1 text-lg font-medium text-gray-900">No Upcoming Cases</h3>
            <p className="text-sm text-gray-500">No surgeries scheduled. Click "Schedule Case" to add new procedures.</p>
          </div>
        ) : viewMode === 'list' ? (
          <LinearListView
            cases={filteredCases}
            onViewDetails={setSelectedCase}
            updateCaseStatus={updateCaseStatus}
            updateCasePriority={updateCasePriority}
            removeCase={removeCase}
            moveCaseOrder={moveCaseOrder}
          />
        ) : (
          <div className="space-y-4">
            {filteredCases.map((caseItem, index) => (
              <div key={caseItem.id} className="overflow-hidden bg-white border-l-4 border-blue-500 shadow-lg rounded-xl">
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:items-center sm:gap-3">
                        <div className="flex items-center gap-2">
                          <Clock className="flex-shrink-0 w-4 h-4 text-gray-500" />
                          <h3 className="text-base font-bold text-gray-800 truncate sm:text-lg">
                            {caseItem.date} - {caseItem.time}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <GenericDropdown
                            currentValue={caseItem.status}
                            options={['Confirmed', 'No Authorization', 'Delayed', 'Cancelled', 'Pending']}
                            onValueChange={updateCaseStatus}
                            caseId={caseItem.id}
                            getColorClass={getStatusColor}
                            label="Status"
                          />
                          <GenericDropdown
                            currentValue={caseItem.priority}
                            options={['High', 'Medium', 'Low']}
                            onValueChange={updateCasePriority}
                            caseId={caseItem.id}
                            getColorClass={getPriorityColor}
                            label="Priority"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-base font-semibold text-gray-800 sm:text-lg">{caseItem.procedure}</p>
                          <div className="flex items-center gap-2 text-blue-600">
                            <User className="flex-shrink-0 w-4 h-4" />
                            <span className="text-sm sm:text-base">{caseItem.patient} ({caseItem.patientAge} years, {caseItem.gender})</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="flex-shrink-0 w-4 h-4" />
                            <span className="text-sm">{caseItem.contactNumber}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building className="flex-shrink-0 w-4 h-4" />
                            <span className="text-sm">{caseItem.hospital}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="flex-shrink-0 w-4 h-4" />
                            <span className="text-sm">{caseItem.room} - {caseItem.ward}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Stethoscope className="flex-shrink-0 w-4 h-4" />
                            <span className="text-sm">Surgeon: {caseItem.surgeon}</span>
                          </div>
                          {caseItem.allergies && (
                            <div className="flex items-center gap-2 text-red-600">
                              <AlertTriangle className="flex-shrink-0 w-4 h-4" />
                              <span className="text-sm">Allergies: {caseItem.allergies}</span>
                            </div>
                          )}
                          {caseItem.comorbidities && (
                            <div className="flex items-center gap-2 text-orange-600">
                              <Heart className="flex-shrink-0 w-4 h-4" />
                              <span className="text-sm">Comorbidities: {caseItem.comorbidities}</span>
                            </div>
                          )}
                          {caseItem.medicalAidName && (
                            <div className="flex items-center gap-2 text-purple-600">
                              <CreditCard className="flex-shrink-0 w-4 h-4" />
                              <span className="text-sm">{caseItem.medicalAidName} ({caseItem.medicalAidNumber})</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {caseItem.specialInstructions && (
                        <div className="p-3 mb-4 border border-yellow-200 rounded-lg bg-yellow-50">
                          <p className="text-sm text-yellow-800">
                            <strong>Special Instructions:</strong> {caseItem.specialInstructions}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Order Controls */}
                    <div className="flex flex-col gap-1 ml-2">
                      <button
                        onClick={() => moveCaseOrder(caseItem.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30"
                        title="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-center text-gray-500">{index + 1}</span>
                      <button
                        onClick={() => moveCaseOrder(caseItem.id, 'down')}
                        disabled={index === filteredCases.length - 1}
                        className="p-1 text-gray-400 rotate-180 hover:text-blue-600 disabled:opacity-30"
                        title="Move down"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => setSelectedCase(caseItem)}
                      className="px-3 py-1 text-xs text-blue-600 transition-colors bg-blue-100 rounded-full hover:bg-blue-200"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => setShowNotesModal(true)}
                      className="px-3 py-1 text-xs text-green-600 transition-colors bg-green-100 rounded-full hover:bg-green-200"
                    >
                      Pre-op Notes
                    </button>
                    <button 
                      onClick={() => setSelectedCase(caseItem)}
                      className="px-3 py-1 text-xs text-purple-600 transition-colors bg-purple-100 rounded-full hover:bg-purple-200"
                    >
                      Edit Schedule
                    </button>
                    <button 
                      onClick={() => removeCase(caseItem.id)}
                      className="flex items-center gap-1 px-3 py-1 text-xs text-red-600 transition-colors bg-red-100 rounded-full hover:bg-red-200"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Case Modal */}
      <AddCaseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={addNewCase}
      />

      {/* Case Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-xl rounded-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Complete Case Details</h3>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="pb-2 font-semibold text-gray-800 border-b">Patient Information</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Full Name</span>
                      <span className="text-gray-800">{selectedCase.patient}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="block mb-1 text-sm font-medium text-gray-600">Age</span>
                        <span className="text-gray-800">{selectedCase.patientAge} years</span>
                      </div>
                      <div>
                        <span className="block mb-1 text-sm font-medium text-gray-600">Gender</span>
                        <span className="text-gray-800">{selectedCase.gender}</span>
                      </div>
                      <div>
                        <span className="block mb-1 text-sm font-medium text-gray-600">Hospital</span>
                        <span className="text-gray-800">{selectedCase.hospital}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block mb-1 text-sm font-medium text-gray-600">Height</span>
                        <span className="text-gray-800">{selectedCase.height} cm</span>
                      </div>
                      <div>
                        <span className="block mb-1 text-sm font-medium text-gray-600">Weight</span>
                        <span className="text-gray-800">{selectedCase.weight} kg</span>
                      </div>
                    </div>
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Contact Number</span>
                      <span className="text-gray-800">{selectedCase.contactNumber}</span>
                    </div>
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Diagnosis</span>
                      <span className="text-gray-800">{selectedCase.diagnosis}</span>
                    </div>
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Allergies</span>
                      <span className="text-gray-800">{selectedCase.allergies || 'None reported'}</span>
                    </div>
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Comorbidities</span>
                      <span className="text-gray-800">{selectedCase.comorbidities || 'None reported'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="pb-2 font-semibold text-gray-800 border-b">Procedure & Scheduling</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Date & Time</span>
                      <span className="text-gray-800">{selectedCase.date} - {selectedCase.time}</span>
                    </div>
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Procedure</span>
                      <span className="text-gray-800">{selectedCase.procedure}</span>
                    </div>
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Hospital</span>
                      <span className="text-gray-800">{selectedCase.hospital}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block mb-1 text-sm font-medium text-gray-600">Room</span>
                        <span className="text-gray-800">{selectedCase.room}</span>
                      </div>
                      <div>
                        <span className="block mb-1 text-sm font-medium text-gray-600">Ward</span>
                        <span className="text-gray-800">{selectedCase.ward}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Surgeon</span>
                      <span className="text-gray-800">{selectedCase.surgeon}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block mb-1 text-sm font-medium text-gray-600">Status</span>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(selectedCase.status)}`}>
                          {selectedCase.status}
                        </span>
                      </div>
                      <div>
                        <span className="block mb-1 text-sm font-medium text-gray-600">Priority</span>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getPriorityColor(selectedCase.priority)}`}>
                          {selectedCase.priority}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Medical Aid</span>
                      <span className="text-gray-800">{selectedCase.medicalAidName} ({selectedCase.medicalAidNumber})</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedCase.specialInstructions && (
                <div className="mt-6">
                  <h4 className="pb-2 mb-3 font-semibold text-gray-800 border-b">Special Instructions</h4>
                  <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <p className="text-gray-800">{selectedCase.specialInstructions}</p>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setSelectedCase(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Handle edit logic here
                    setSelectedCase(null);
                  }}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Edit3 className="inline w-4 h-4 mr-2" />
                  Edit Case
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pre-op Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-lg bg-white shadow-xl rounded-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Pre-operative Notes</h3>
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <textarea
                placeholder="Enter pre-operative notes..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle save logic here
                    setShowNotesModal(false);
                  }}
                  className="flex-1 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingSlates;