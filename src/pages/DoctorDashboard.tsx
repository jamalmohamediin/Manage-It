import React, { useState, useEffect } from 'react';
import {
  Calendar, AlertTriangle, Activity, Users, FileText,
  Search, Filter, UserPlus, User, Eye, Edit, Plus,
  AlertCircle, Mic, MicOff, Download, Camera, Video, Phone, Mail, Printer, Building2, Brain,
  Trash2, X, Save, UserMinus, SortAsc, SortDesc
} from 'lucide-react';

const DoctorDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'patients' | 'forms'>('dashboard');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'priority' | 'admission' | 'diagnosis' | 'hospital' | 'ward' | 'gender'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showInvestigationModal, setShowInvestigationModal] = useState(false);
  const [showViewInvestigations, setShowViewInvestigations] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState<number | null>(null);
  const [newPrescription, setNewPrescription] = useState('');
  const [newInvestigation, setNewInvestigation] = useState({ type: '', date: '', status: 'Pending', critical: false });
  const [doctorProfile] = useState({
    name: 'Dr. Sarah Johnson',
    specialty: 'General Surgery',
    license: 'MP12345',
    hospital: 'Central Medical Center',
    logo: null as string | null
  });

  const [patients, setPatients] = useState([
    {
      id: 1,
      name: 'John Smith',
      age: 45,
      gender: 'Male',
      mrn: 'MRN001',
      priority: 'critical',
      diagnosis: 'Acute Appendicitis',
      admissionDate: '2025-06-20',
      ward: 'ICU',
      hospital: 'Central Medical Center',
      operation: 'Laparoscopic Appendectomy',
      allergies: 'Penicillin, Latex',
      comorbidities: 'Hypertension, Type 2 Diabetes',
      height: '175 cm',
      weight: '78 kg',
      vitals: {
        bp: '85/50',
        hr: '110',
        temp: '38.5°C',
        spo2: '92%',
        rr: '24'
      },
      status: 'Post-operative complications',
      prescriptions: ['Morphine 10mg IV q4h', 'Cefazolin 1g IV q8h'],
      investigations: [
        { type: 'CBC', date: '2025-06-23', status: 'Complete', critical: true },
        { type: 'CT Abdomen', date: '2025-06-22', status: 'Complete', critical: false },
        { type: 'ECG', date: '2025-06-23', status: 'Pending', critical: false },
        { type: 'Troponin', date: '2025-06-23', status: 'Pending', critical: true }
      ],
      notes: 'Patient showing signs of post-op infection. Monitor closely.',
      documents: []
    },
    {
      id: 2,
      name: 'Maria Garcia',
      age: 34,
      gender: 'Female',
      mrn: 'MRN002',
      priority: 'high',
      diagnosis: 'Cholecystitis',
      admissionDate: '2025-06-21',
      ward: 'General Surgery',
      hospital: 'Central Medical Center',
      operation: 'Laparoscopic Cholecystectomy (Scheduled)',
      allergies: 'NKDA',
      comorbidities: 'None',
      height: '162 cm',
      weight: '65 kg',
      vitals: {
        bp: '120/80',
        hr: '88',
        temp: '37.2°C',
        spo2: '98%',
        rr: '18'
      },
      status: 'Pre-operative',
      prescriptions: ['Omeprazole 40mg PO daily'],
      investigations: [
        { type: 'Ultrasound Abdomen', date: '2025-06-21', status: 'Complete', critical: false },
        { type: 'Chest Xray', date: '2025-06-21', status: 'Complete', critical: false }
      ],
      notes: 'Scheduled for laparoscopic cholecystectomy tomorrow.',
      documents: []
    },
    {
      id: 3,
      name: 'Robert Johnson',
      age: 67,
      gender: 'Male',
      mrn: 'MRN003',
      priority: 'medium',
      diagnosis: 'Inguinal Hernia',
      admissionDate: '2025-06-19',
      ward: 'Day Surgery',
      hospital: 'Central Medical Center',
      operation: 'Inguinal Hernia Repair (Completed)',
      allergies: 'Sulfa drugs',
      comorbidities: 'Mild COPD',
      height: '180 cm',
      weight: '82 kg',
      vitals: {
        bp: '130/85',
        hr: '72',
        temp: '36.8°C',
        spo2: '99%',
        rr: '16'
      },
      status: 'Stable',
      prescriptions: ['Paracetamol 1g PO q6h PRN'],
      investigations: [
        { type: 'ECG', date: '2025-06-19', status: 'Complete', critical: false }
      ],
      notes: 'Routine hernia repair completed successfully.',
      documents: []
    }
  ]);

  const [forms] = useState([
    { id: 1, name: 'Surgical Consent Form', type: 'consent', lastUpdated: '2025-06-15' },
    { id: 2, name: 'Anesthesia Consent', type: 'consent', lastUpdated: '2025-06-10' },
    { id: 3, name: 'Operation Note Template', type: 'operation', lastUpdated: '2025-06-12' }
  ]);

  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    diagnosis: '',
    priority: 'medium',
    ward: '',
    hospital: 'Central Medical Center'
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sorting and filtering functions
  const filteredAndSortedPatients = patients
    .filter(patient => 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'critical': 3, 'high': 2, 'medium': 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'admission':
          aValue = new Date(a.admissionDate).getTime();
          bValue = new Date(b.admissionDate).getTime();
          break;
        case 'diagnosis':
          aValue = a.diagnosis.toLowerCase();
          bValue = b.diagnosis.toLowerCase();
          break;
        case 'hospital':
          aValue = a.hospital.toLowerCase();
          bValue = b.hospital.toLowerCase();
          break;
        case 'ward':
          aValue = a.ward.toLowerCase();
          bValue = b.ward.toLowerCase();
          break;
        case 'gender':
          aValue = a.gender.toLowerCase();
          bValue = b.gender.toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Patient management functions
  const addPatient = () => {
    if (newPatient.name && newPatient.age && newPatient.diagnosis) {
      const patient = {
        id: Date.now(),
        ...newPatient,
        age: parseInt(newPatient.age),
        mrn: `MRN${String(Date.now()).slice(-3)}`,
        admissionDate: new Date().toISOString().slice(0, 10),
        operation: 'TBD',
        allergies: 'To be assessed',
        comorbidities: 'To be assessed',
        height: 'To be measured',
        weight: 'To be measured',
        vitals: {
          bp: 'Pending',
          hr: 'Pending',
          temp: 'Pending',
          spo2: 'Pending',
          rr: 'Pending'
        },
        status: 'Admitted',
        prescriptions: [],
        investigations: [],
        notes: 'New admission - assessment pending',
        documents: []
      };
      setPatients([...patients, patient]);
      setNewPatient({
        name: '',
        age: '',
        gender: 'Male',
        diagnosis: '',
        priority: 'medium',
        ward: '',
        hospital: 'Central Medical Center'
      });
      setShowAddPatient(false);
    }
  };

  const deletePatient = (id: number) => {
    setPatients(patients.filter(p => p.id !== id));
  };

  // Prescription management
  const addPrescription = () => {
    if (newPrescription && currentPatientId) {
      setPatients(patients.map(p => 
        p.id === currentPatientId 
          ? { ...p, prescriptions: [...p.prescriptions, newPrescription] }
          : p
      ));
      setNewPrescription('');
    }
  };

  const removePrescription = (patientId: number, prescriptionIndex: number) => {
    setPatients(patients.map(p => 
      p.id === patientId 
        ? { ...p, prescriptions: p.prescriptions.filter((_, i) => i !== prescriptionIndex) }
        : p
    ));
  };

  // Investigation management
  const addInvestigation = () => {
    if (newInvestigation.type && currentPatientId) {
      setPatients(patients.map(p => 
        p.id === currentPatientId 
          ? { ...p, investigations: [...p.investigations, { ...newInvestigation, date: newInvestigation.date || new Date().toISOString().slice(0, 10) }] }
          : p
      ));
      setNewInvestigation({ type: '', date: '', status: 'Pending', critical: false });
    }
  };

  const removeInvestigation = (patientId: number, investigationIndex: number) => {
    setPatients(patients.map(p => 
      p.id === patientId 
        ? { ...p, investigations: p.investigations.filter((_, i) => i !== investigationIndex) }
        : p
    ));
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="text-center text-gray-600">
        <h2 className="mb-2 text-2xl font-bold">Welcome to Your Dashboard</h2>
        <p>Select "Patients" tab to view patient information and alerts</p>
      </div>
    </div>
  );

  const renderPatientCard = (patient: any) => (
    <div key={patient.id} className="overflow-hidden bg-white border-l-4 border-red-500 shadow-lg rounded-xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full">
              <User className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{patient.name}</h2>
              <p className="text-gray-600">{patient.age} yrs, {patient.gender}</p>
              <p className="text-sm text-gray-500">MRN: {patient.mrn}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
              patient.priority === 'critical' ? 'text-red-700 bg-red-100' :
              patient.priority === 'high' ? 'text-orange-700 bg-orange-100' :
              'text-yellow-700 bg-yellow-100'
            }`}>
              {patient.priority.toUpperCase()}
            </span>
            <button
              onClick={() => deletePatient(patient.id)}
              className="p-1 text-red-600 rounded hover:bg-red-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Medical Info */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-red-600">Medical Info</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Diagnosis:</span> <span className="text-red-600">{patient.diagnosis}</span></p>
              <p><span className="font-medium">Status:</span> <span className="text-red-600">{patient.status}</span></p>
              <p><span className="font-medium">Ward:</span> {patient.ward}</p>
              <p><span className="font-medium">Hospital:</span> {patient.hospital}</p>
            </div>

            {/* Current Prescriptions */}
            <div className="p-3 mt-4 border-2 border-black rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Current Prescriptions:</h4>
                <button
                  onClick={() => {
                    setCurrentPatientId(patient.id);
                    setShowPrescriptionModal(true);
                  }}
                  className="px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
                >
                  Add/Remove
                </button>
              </div>
              <div className="space-y-1">
                {patient.prescriptions.map((med: string, idx: number) => (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-blue-600">{med.split(' ')[0]}</span>
                      <span className="text-blue-600">{med.split(' ').slice(1).join(' ')}</span>
                    </div>
                    <button
                      onClick={() => removePrescription(patient.id, idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Investigations Section */}
            <div className="p-3 mt-4 border-2 border-black rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Investigations:</h4>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setCurrentPatientId(patient.id);
                      setShowViewInvestigations(true);
                    }}
                    className="px-2 py-1 text-xs text-green-600 bg-green-100 rounded hover:bg-green-200"
                  >
                    View
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPatientId(patient.id);
                      setShowInvestigationModal(true);
                    }}
                    className="px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
                  >
                    Add/Remove
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                {patient.investigations.slice(0, 3).map((inv: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className={`${inv.critical ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      {inv.type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      inv.status === 'Complete' ? 'bg-green-100 text-green-700' :
                      inv.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                ))}
                {patient.investigations.length > 3 && (
                  <p className="text-xs text-gray-500">+{patient.investigations.length - 3} more...</p>
                )}
              </div>
            </div>
          </div>

          {/* Vitals and Additional Info */}
          <div>
            <div className="mb-4 space-y-3">
              <div>
                <h4 className="mb-2 font-semibold text-gray-800">Operation/Procedure:</h4>
                <p className="text-sm text-gray-700">{patient.operation}</p>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-gray-800">Allergies:</h4>
                <p className="text-sm text-gray-700">{patient.allergies}</p>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-gray-800">Comorbidities:</h4>
                <p className="text-sm text-gray-700">{patient.comorbidities}</p>
              </div>
            </div>

            <h3 className="mb-3 text-lg font-semibold text-gray-800">Vitals</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 text-center bg-red-100 rounded">
                <div className="text-xs font-semibold text-red-700">BP</div>
                <div className="font-bold text-red-800">{patient.vitals.bp}</div>
              </div>
              <div className="p-2 text-center bg-orange-100 rounded">
                <div className="text-xs font-semibold text-orange-700">HR</div>
                <div className="font-bold text-orange-800">{patient.vitals.hr}</div>
              </div>
              <div className="p-2 text-center bg-orange-100 rounded">
                <div className="text-xs font-semibold text-orange-700">TEMP</div>
                <div className="font-bold text-orange-800">{patient.vitals.temp}</div>
              </div>
              <div className="p-2 text-center bg-red-100 rounded">
                <div className="text-xs font-semibold text-red-700">SPO2</div>
                <div className="font-bold text-red-800">{patient.vitals.spo2}</div>
              </div>
              <div className="col-span-2 p-2 text-center bg-green-100 rounded">
                <div className="text-xs font-semibold text-green-700">RR</div>
                <div className="font-bold text-green-800">{patient.vitals.rr}</div>
              </div>
            </div>
          </div>

          {/* Actions and Notes */}
          <div>
            <div className="mb-4 space-y-3">
              <div>
                <h4 className="mb-2 font-semibold text-gray-800">Height:</h4>
                <p className="text-sm text-gray-700">{patient.height}</p>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-gray-800">Weight:</h4>
                <p className="text-sm text-gray-700">{patient.weight}</p>
              </div>
            </div>

            <h3 className="mb-3 text-lg font-semibold text-gray-800">Actions</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button className="flex items-center justify-center gap-2 p-2 text-blue-700 bg-blue-100 rounded hover:bg-blue-200">
                <Eye className="w-4 h-4" />
                <span className="text-xs font-medium">View</span>
              </button>
              <button className="flex items-center justify-center gap-2 p-2 text-green-700 bg-green-100 rounded hover:bg-green-200">
                <Edit className="w-4 h-4" />
                <span className="text-xs font-medium">Edit</span>
              </button>
              <button className="flex items-center justify-center gap-2 p-2 text-purple-700 bg-purple-100 rounded hover:bg-purple-200">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-medium">Report</span>
              </button>
              <button className="flex items-center justify-center gap-2 p-2 text-orange-700 bg-orange-100 rounded hover:bg-orange-200">
                <Plus className="w-4 h-4" />
                <span className="text-xs font-medium">Investigate</span>
              </button>
            </div>

            {/* Latest Notes */}
            <div className="p-3 border-2 border-black rounded-lg bg-gray-50">
              <h4 className="mb-2 font-semibold text-gray-800">Latest Notes:</h4>
              <p className="text-sm text-gray-700">{patient.notes}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPatients = () => (
    <div className="space-y-6">
      {/* Critical Alert Section with Blinking Animation */}
      <div className="flex items-center justify-between p-6 text-white shadow-lg bg-gradient-to-br from-red-600 to-red-400 rounded-xl animate-pulse">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 animate-bounce" />
          <div>
            <div className="text-lg font-bold">Critical Alert</div>
            <div>Patient John Smith - Vital signs unstable</div>
          </div>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-red-600 transition-all duration-200 bg-white rounded-lg hover:bg-gray-100 hover:scale-105">
          Acknowledge
        </button>
      </div>

      {/* Patient Management Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <button
          onClick={() => setShowAddPatient(true)}
          className="flex items-center justify-center gap-3 p-4 text-green-700 transition-all duration-200 transform bg-green-100 shadow-lg rounded-xl hover:bg-green-200 hover:scale-105"
        >
          <UserPlus className="w-6 h-6" />
          <span className="font-medium">Add Patient</span>
        </button>
        
        <div className="flex items-center gap-2 p-4 bg-blue-100 shadow-lg rounded-xl">
          <Search className="w-5 h-5 text-blue-600" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 placeholder-blue-600 bg-transparent outline-none"
          />
        </div>
        
        <div className="flex items-center gap-2 p-4 bg-purple-100 shadow-lg rounded-xl">
          <Filter className="w-5 h-5 text-purple-600" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="flex-1 text-purple-600 bg-transparent outline-none"
          >
            <option value="name">Sort by Name</option>
            <option value="priority">Sort by Priority</option>
            <option value="admission">Sort by Admission Date</option>
            <option value="diagnosis">Sort by Diagnosis</option>
            <option value="hospital">Sort by Hospital</option>
            <option value="ward">Sort by Ward</option>
            <option value="gender">Sort by Gender</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="text-purple-600 hover:text-purple-800"
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="flex items-center gap-3 p-6 transition-transform duration-200 transform bg-white shadow-lg rounded-xl hover:scale-105">
          <Users className="w-8 h-8 text-blue-600" />
          <div>
            <div className="text-2xl font-bold text-gray-800">{patients.length}</div>
            <div className="text-sm text-gray-600">Total Patients</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-6 transition-transform duration-200 transform bg-white shadow-lg rounded-xl hover:scale-105">
          <AlertCircle className="w-8 h-8 text-red-600 animate-pulse" />
          <div>
            <div className="text-2xl font-bold text-red-600">
              {patients.filter(p => p.priority === 'critical').length}
            </div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-6 transition-transform duration-200 transform bg-white shadow-lg rounded-xl hover:scale-105">
          <Activity className="w-8 h-8 text-green-600" />
          <div>
            <div className="text-2xl font-bold text-green-600">
              {patients.filter(p => p.status === 'Stable').length}
            </div>
            <div className="text-sm text-gray-600">Stable</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-6 transition-transform duration-200 transform bg-white shadow-lg rounded-xl hover:scale-105">
          <Calendar className="w-8 h-8 text-purple-600" />
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {patients.filter(p => p.admissionDate === currentTime.toISOString().slice(0, 10)).length}
            </div>
            <div className="text-sm text-gray-600">Today's Cases</div>
          </div>
        </div>
      </div>

      {/* Patient Cards List */}
      <div className="space-y-6">
        <h2 className="pb-2 text-xl font-bold text-gray-800 border-b-2 border-blue-600">
          Patient List ({filteredAndSortedPatients.length} patients)
        </h2>
        {filteredAndSortedPatients.map(patient => renderPatientCard(patient))}
      </div>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white shadow-xl rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Add New Patient</h3>
              <button
                onClick={() => setShowAddPatient(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Patient Name"
                value={newPatient.name}
                onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Age"
                value={newPatient.age}
                onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newPatient.gender}
                onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input
                type="text"
                placeholder="Diagnosis"
                value={newPatient.diagnosis}
                onChange={(e) => setNewPatient({...newPatient, diagnosis: e.target.value})}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newPatient.priority}
                onChange={(e) => setNewPatient({...newPatient, priority: e.target.value})}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <input
                type="text"
                placeholder="Ward"
                value={newPatient.ward}
                onChange={(e) => setNewPatient({...newPatient, ward: e.target.value})}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={addPatient}
                className="flex-1 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Add Patient
              </button>
              <button
                onClick={() => setShowAddPatient(false)}
                className="flex-1 px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white shadow-xl rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Manage Prescriptions</h3>
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter prescription (e.g., Morphine 10mg IV q4h)"
                  value={newPrescription}
                  onChange={(e) => setNewPrescription(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addPrescription}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="overflow-y-auto max-h-40">
                {currentPatientId && patients.find(p => p.id === currentPatientId)?.prescriptions.map((prescription, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 mt-2 rounded bg-gray-50">
                    <span className="text-sm">{prescription}</span>
                    <button
                      onClick={() => removePrescription(currentPatientId, idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="w-full px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Investigation Modal */}
      {showInvestigationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white shadow-xl rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Manage Investigations</h3>
              <button
                onClick={() => setShowInvestigationModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <select
                  value={newInvestigation.type}
                  onChange={(e) => setNewInvestigation({...newInvestigation, type: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Investigation</option>
                  <option value="ECG">ECG</option>
                  <option value="Troponin">Troponin</option>
                  <option value="Chest Xray">Chest X-ray</option>
                  <option value="CBC">CBC</option>
                  <option value="CT Scan">CT Scan</option>
                  <option value="MRI">MRI</option>
                  <option value="Ultrasound">Ultrasound</option>
                  <option value="Blood Gas">Blood Gas</option>
                  <option value="Urine Analysis">Urine Analysis</option>
                </select>
                <input
                  type="date"
                  value={newInvestigation.date}
                  onChange={(e) => setNewInvestigation({...newInvestigation, date: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newInvestigation.status}
                  onChange={(e) => setNewInvestigation({...newInvestigation, status: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                </select>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newInvestigation.critical}
                    onChange={(e) => setNewInvestigation({...newInvestigation, critical: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Critical Investigation</span>
                </label>
                <button
                  onClick={addInvestigation}
                  className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Add Investigation
                </button>
              </div>
              <div className="overflow-y-auto max-h-40">
                {currentPatientId && patients.find(p => p.id === currentPatientId)?.investigations.map((investigation, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 mt-2 rounded bg-gray-50">
                    <div className="flex-1">
                      <span className={`text-sm ${investigation.critical ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                        {investigation.type}
                      </span>
                      <div className="text-xs text-gray-500">
                        {investigation.date} - {investigation.status}
                      </div>
                    </div>
                    <button
                      onClick={() => removeInvestigation(currentPatientId, idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setShowInvestigationModal(false)}
                className="w-full px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Investigations Modal */}
      {showViewInvestigations && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 mx-4 bg-white shadow-xl rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">All Investigations</h3>
              <button
                onClick={() => setShowViewInvestigations(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-96">
              {currentPatientId && patients.find(p => p.id === currentPatientId)?.investigations.map((investigation, idx) => (
                <div key={idx} className={`p-4 rounded-lg mb-3 ${investigation.critical ? 'bg-red-50 border-l-4 border-red-500' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${investigation.critical ? 'text-red-700' : 'text-gray-800'}`}>
                        {investigation.type}
                        {investigation.critical && <span className="px-2 py-1 ml-2 text-xs text-red-700 bg-red-100 rounded">CRITICAL</span>}
                      </h4>
                      <div className="mt-1 text-sm text-gray-600">
                        <span>Date: {investigation.date}</span>
                        <span className="ml-4">Status: <span className={`font-medium ${
                          investigation.status === 'Complete' ? 'text-green-600' :
                          investigation.status === 'Pending' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`}>{investigation.status}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {currentPatientId && patients.find(p => p.id === currentPatientId)?.investigations.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  No investigations found for this patient
                </div>
              )}
            </div>
            <div className="mt-6">
              <button
                onClick={() => setShowViewInvestigations(false)}
                className="w-full px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderForms = () => (
    <div className="space-y-6">
      {forms.map(form => (
        <div key={form.id} className="p-4 bg-white shadow-md rounded-xl">
          <h3 className="text-lg font-bold text-gray-800">{form.name}</h3>
          <p className="text-sm text-gray-600">Type: {form.type}</p>
          <p className="text-sm text-gray-500">Last Updated: {form.lastUpdated}</p>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    if (selectedPatient) return <div>/* Detailed view here */</div>;
    switch (selectedTab) {
      case 'dashboard': return renderDashboard();
      case 'patients': return renderPatients();
      case 'forms': return renderForms();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="px-6 py-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-between p-4 mb-6 bg-white shadow-lg rounded-xl">
          <div className="text-lg font-semibold text-gray-800">
            {doctorProfile.name} • {doctorProfile.specialty}
          </div>
          <div className="text-sm text-right text-gray-600">
            <div>{currentTime.toLocaleDateString()}</div>
            <div>{currentTime.toLocaleTimeString()}</div>
          </div>
        </div>

        <div className="mb-6 bg-white shadow-lg rounded-xl">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'patients', label: 'Patients', icon: Users },
              { id: 'forms', label: 'Forms', icon: FileText }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedTab(tab.id as any);
                  setSelectedPatient(null);
                }}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default DoctorDashboard;