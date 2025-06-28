import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedPatient } from '../contexts/SelectedPatientContext';
import { uploadFileWithMetadata, getUploadsForItem } from '../firebase/storage';
import { 
  UserPlus, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Trash2, 
  Users,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Edit3,
  X,
  Clock,
  User,
  MapPin,
  Stethoscope,
  Phone,
  AlertTriangle,
  Heart,
  CreditCard,
  Building,
  Save,
  List,
  Grid,
  Eye,
  Upload,
  Plus,
  Check
} from 'lucide-react';

// Extended Patient Type that includes the additional fields we need
type ExtendedPatient = {
  id: number;
  name: string;
  age: number;
  gender: string;
  mrn: string;
  priority: string;
  diagnosis: string;
  admissionDate: string;
  ward: string;
  hospital: string;
  operation: string;
  allergies: string;
  comorbidities: string;
  height: string;
  weight: string;
  vitals: {
    bp: string;
    hr: string;
    temp: string;
    spo2: string;
    rr: string;
  };
  status: string;
  prescriptions: string[];
  investigations: any[];
  notes: string[];
  documents: any[];
  medicalAidName?: string;
  medicalAidNumber?: string;
  contactNumber?: string;
  room?: string;
  scheduledTime?: string;
  scheduledDate?: string;
  // New structured fields
  selectedAllergies?: string[];
  customAllergies?: string;
  selectedComorbidities?: string[];
  customComorbidities?: string;
};

// Structured allergy categories
const ALLERGY_CATEGORIES = {
  food: {
    title: "🍽️ Food Allergies",
    options: [
      "Peanuts",
      "Fish (e.g., hake, tuna)",
      "Eggs",
      "Milk / Dairy",
      "Soy",
      "Wheat / Gluten"
    ]
  },
  medication: {
    title: "💊 Medication Allergies",
    options: [
      "Penicillin",
      "Sulfa Drugs (e.g., Bactrim)",
      "Tramadol",
      "Codeine / Morphine / Opioids",
      "Aspirin / NSAIDs (e.g., Ibuprofen, Voltaren)",
      "Anticonvulsants (e.g., Carbamazepine, Epilim)",
      "Anesthetics (e.g., Lidocaine, Propofol)",
      "IV Contrast Dye (Iodine-based)"
    ]
  },
  contact: {
    title: "🌿 Contact Allergies",
    options: [
      "Latex (gloves, bandages, catheters)",
      "Plasters / Adhesives"
    ]
  },
  substance: {
    title: "💉 Substance & Procedure-Related Allergies",
    options: [
      "Chlorhexidine / Dettol",
      "Blood Products (transfusion reactions)",
      "IV Fluids (e.g., Gelofusine, Voluven)"
    ]
  }
};

// Comorbidities list
const COMORBIDITIES_OPTIONS = [
  "Hypertension (High Blood Pressure)",
  "Diabetes",
  "Asthma",
  "Chronic Obstructive Pulmonary Disease (COPD)",
  "Tuberculosis (Past or Current)",
  "Heart Disease (e.g., Heart Failure, Ischemic Heart Disease)",
  "Stroke / TIA (Mini-Stroke)",
  "Epilepsy / Seizures",
  "Chronic Kidney Disease / Renal Failure",
  "HIV / AIDS",
  "Depression",
  "Anxiety / PTSD",
  "Bipolar Disorder / Schizophrenia",
  "Obesity",
  "Anemia (Low Blood Count)",
  "Thyroid Problems",
  "Arthritis (Rheumatoid or Osteoarthritis)",
  "GERD / Acid Reflux",
  "Sickle Cell Disease / Trait",
  "Liver Disease (Hepatitis B/C, Cirrhosis)",
  "Bleeding Disorders (e.g., Hemophilia)",
  "Autoimmune Conditions (e.g., Lupus, MS)",
  "Chronic Pain Syndrome / Fibromyalgia",
  "Substance Use Disorder"
];

// Enhanced initial patients with comprehensive medical data
const initialPatients: ExtendedPatient[] = [
  {
    id: 1,
    name: "John Smith",
    age: 45,
    gender: "Male",
    mrn: "MRN001",
    priority: "critical",
    diagnosis: "Acute Appendicitis",
    admissionDate: "2025-06-20",
    ward: "ICU",
    hospital: "Central Medical Center",
    operation: "Laparoscopic Appendectomy",
    allergies: "Penicillin, Latex",
    comorbidities: "Hypertension, Type 2 Diabetes",
    height: "175 cm",
    weight: "78 kg",
    vitals: {
      bp: "85/50",
      hr: "110",
      temp: "38.5°C",
      spo2: "92%",
      rr: "24"
    },
    status: "Post-operative complications",
    prescriptions: ["Morphine 10mg IV q4h", "Cefazolin 1g IV q8h"],
    investigations: [
      { type: "CBC", date: "2025-06-23", status: "Complete", critical: true },
      { type: "CT Abdomen", date: "2025-06-22", status: "Complete", critical: false },
      { type: "ECG", date: "2025-06-23", status: "Pending", critical: false }
    ],
    notes: [
      "Patient showing signs of post-op infection. Monitor closely.",
      "Vitals stable. Continue current medications.",
      "Consider antibiotic adjustment if fever persists."
    ],
    documents: [],
    medicalAidName: "Discovery Health",
    medicalAidNumber: "79396663883",
    contactNumber: "+27 82 123 4567",
    room: "Room 3",
    scheduledTime: "08:00 AM",
    scheduledDate: "2025-06-27",
    selectedAllergies: ["Penicillin", "Latex (gloves, bandages, catheters)"],
    selectedComorbidities: ["Hypertension (High Blood Pressure)", "Diabetes"]
  },
  {
    id: 2,
    name: "Maria Garcia",
    age: 34,
    gender: "Female",
    mrn: "MRN002",
    priority: "high",
    diagnosis: "Cholecystitis",
    admissionDate: "2025-06-22",
    ward: "General Surgery",
    hospital: "Central Medical Center",
    operation: "Laparoscopic Cholecystectomy (Scheduled)",
    allergies: "NKDA",
    comorbidities: "None",
    height: "162 cm",
    weight: "65 kg",
    vitals: {
      bp: "120/80",
      hr: "88",
      temp: "37.2°C",
      spo2: "98%",
      rr: "18"
    },
    status: "Pre-operative",
    prescriptions: ["Omeprazole 40mg PO daily"],
    investigations: [
      { type: "Ultrasound Abdomen", date: "2025-06-21", status: "Complete", critical: false },
      { type: "Chest Xray", date: "2025-06-21", status: "Complete", critical: false }
    ],
    notes: [
      "Scheduled for laparoscopic cholecystectomy tomorrow.",
      "Patient counseled on procedure and risks."
    ],
    documents: [],
    medicalAidName: "Momentum Health",
    medicalAidNumber: "MH987654321",
    contactNumber: "+27 83 987 6543",
    room: "Room 5",
    scheduledTime: "10:30 AM",
    scheduledDate: "2025-06-27",
    selectedAllergies: [],
    selectedComorbidities: []
  },
  {
    id: 3,
    name: "Robert Johnson",
    age: 67,
    gender: "Male",
    mrn: "MRN003",
    priority: "medium",
    diagnosis: "Inguinal Hernia",
    admissionDate: "2025-06-21",
    ward: "Day Surgery",
    hospital: "Central Medical Center",
    operation: "Inguinal Hernia Repair (Completed)",
    allergies: "Sulfa drugs",
    comorbidities: "Mild COPD",
    height: "180 cm",
    weight: "82 kg",
    vitals: {
      bp: "130/85",
      hr: "72",
      temp: "36.8°C",
      spo2: "99%",
      rr: "16"
    },
    status: "Stable",
    prescriptions: ["Paracetamol 1g PO q6h PRN"],
    investigations: [
      { type: "ECG", date: "2025-06-19", status: "Complete", critical: false }
    ],
    notes: [
      "Routine hernia repair completed successfully.",
      "Patient recovering well post-surgery."
    ],
    documents: [],
    medicalAidName: "Bonitas",
    medicalAidNumber: "BN456789123",
    contactNumber: "+27 84 555 7890",
    room: "Room 2",
    scheduledTime: "14:00 PM",
    scheduledDate: "2025-06-27",
    selectedAllergies: ["Sulfa Drugs (e.g., Bactrim)"],
    selectedComorbidities: ["Chronic Obstructive Pulmonary Disease (COPD)"]
  }
];

// Helper functions for status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'critical': return 'bg-red-100 text-red-700 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-700 border-green-200';
    case 'stable': return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getStatusBorderColor = (status: string) => {
  switch (status) {
    case 'critical': return 'border-l-red-500';
    case 'high': return 'border-l-orange-500';
    case 'medium': return 'border-l-yellow-500';
    case 'low': return 'border-l-green-500';
    case 'stable': return 'border-l-green-500';
    default: return 'border-l-gray-500';
  }
};

// File Upload/Download Modal Component
const FileManagementModal = ({ 
  isOpen, 
  onClose, 
  patient 
}: {
  isOpen: boolean;
  onClose: () => void;
  patient: ExtendedPatient;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [patientFiles, setPatientFiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'download'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && patient.id) {
      loadPatientFiles();
    }
  }, [isOpen, patient.id]);

  const loadPatientFiles = async () => {
    try {
      const uploads = await getUploadsForItem('patients', patient.id.toString());
      setPatientFiles(uploads);
    } catch (error) {
      console.error('Error loading patient files:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
  if (files.length === 0) {
    alert('Please select files to upload');
    return;
  }

  setUploading(true);
  try {
    for (const file of files) {
      // FIXED: Use the correct function parameters
      await uploadFileWithMetadata(
        file,
        patient.id.toString(),        // itemId
        'default-business-id',        // businessId
        'healthcare-provider',        // role
        'patients',                   // context
        'current-user-id',           // uploadedBy
        'Current User'               // uploaderName
      );
    }
    alert('Files uploaded successfully!');
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    await loadPatientFiles();
  } catch (error) {
    console.error('Upload error:', error);
    alert('Failed to upload files');
  } finally {
    setUploading(false);
  }
};

  const handleDownload = (fileURL: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              File Management - {patient.name}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex p-1 mb-6 bg-gray-100 rounded-lg">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload className="inline w-4 h-4 mr-2" />
              Upload Files
            </button>
            <button
              onClick={() => setActiveTab('download')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'download'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Download className="inline w-4 h-4 mr-2" />
              Download Files
            </button>
          </div>

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="p-6 text-center border-2 border-gray-300 border-dashed rounded-lg">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mov,.avi"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="mb-2 text-lg font-medium text-gray-900">
                    Upload Patient Documents
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, Word documents, images, videos up to 10MB each
                  </p>
                </label>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">Selected Files:</h4>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-50">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload Files'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Download Tab */}
          {activeTab === 'download' && (
            <div className="space-y-4">
              {patientFiles.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">Patient Files:</h4>
                  {patientFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{file.fileName}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded {file.uploadedAt?.toDate().toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(file.fileURL, file.fileName)}
                        className="px-3 py-1 text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No files uploaded for this patient yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Allergies Modal Component
const AllergiesModal = ({ 
  isOpen, 
  onClose, 
  patient,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  patient: ExtendedPatient;
  onSave: (allergies: string[], customAllergies: string) => void;
}) => {
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(patient.selectedAllergies || []);
  const [customAllergies, setCustomAllergies] = useState<string>(patient.customAllergies || '');
  const [customFields, setCustomFields] = useState<{[key: string]: string}>({
    foodOther: '',
    antibioticsOther: '',
    medicationOther: '',
    vaccinesOther: '',
    cancerType: '',
    otherAllergy: ''
  });

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies(prev => 
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const handleSave = () => {
    // Combine selected allergies with custom fields
    let finalAllergies = [...selectedAllergies];
    
    // Add custom entries
    if (customFields.foodOther) finalAllergies.push(`Other Food Allergy: ${customFields.foodOther}`);
    if (customFields.antibioticsOther) finalAllergies.push(`Antibiotics (Other): ${customFields.antibioticsOther}`);
    if (customFields.medicationOther) finalAllergies.push(`Other Medication Allergy: ${customFields.medicationOther}`);
    if (customFields.vaccinesOther) finalAllergies.push(`Vaccines: ${customFields.vaccinesOther}`);
    if (customFields.otherAllergy) finalAllergies.push(`Other: ${customFields.otherAllergy}`);
    
    onSave(finalAllergies, customAllergies);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-xl rounded-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Edit Allergies - {patient.name}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-800">🩺 ALLERGIES (Tick all that apply)</h4>
            
            {/* Food Allergies */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h5 className="mb-3 font-medium text-gray-800">{ALLERGY_CATEGORIES.food.title}</h5>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {ALLERGY_CATEGORIES.food.options.map(option => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAllergies.includes(option)}
                      onChange={() => toggleAllergy(option)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
                <div className="col-span-full">
                  <label className="flex items-center gap-2">
                    <span className="text-sm">Other Food Allergy – specify:</span>
                    <input
                      type="text"
                      value={customFields.foodOther}
                      onChange={(e) => setCustomFields(prev => ({ ...prev, foodOther: e.target.value }))}
                      className="flex-1 p-1 text-sm border border-gray-300 rounded"
                      placeholder="Specify other food allergy..."
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Medication Allergies */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h5 className="mb-3 font-medium text-gray-800">{ALLERGY_CATEGORIES.medication.title}</h5>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ALLERGY_CATEGORIES.medication.options.map(option => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAllergies.includes(option)}
                      onChange={() => toggleAllergy(option)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
                <div className="space-y-2 col-span-full">
                  <label className="flex items-center gap-2">
                    <span className="text-sm">Antibiotics (Other – specify):</span>
                    <input
                      type="text"
                      value={customFields.antibioticsOther}
                      onChange={(e) => setCustomFields(prev => ({ ...prev, antibioticsOther: e.target.value }))}
                      className="flex-1 p-1 text-sm border border-gray-300 rounded"
                      placeholder="Specify other antibiotics..."
                    />
                  </label>
                  <label className="flex items-center gap-2">
                    <span className="text-sm">Other Medication Allergy – specify:</span>
                    <input
                      type="text"
                      value={customFields.medicationOther}
                      onChange={(e) => setCustomFields(prev => ({ ...prev, medicationOther: e.target.value }))}
                      className="flex-1 p-1 text-sm border border-gray-300 rounded"
                      placeholder="Specify other medication allergy..."
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Contact Allergies */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h5 className="mb-3 font-medium text-gray-800">{ALLERGY_CATEGORIES.contact.title}</h5>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ALLERGY_CATEGORIES.contact.options.map(option => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAllergies.includes(option)}
                      onChange={() => toggleAllergy(option)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Substance & Procedure-Related Allergies */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h5 className="mb-3 font-medium text-gray-800">{ALLERGY_CATEGORIES.substance.title}</h5>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm">Vaccines (specify):</span>
                  <input
                    type="text"
                    value={customFields.vaccinesOther}
                    onChange={(e) => setCustomFields(prev => ({ ...prev, vaccinesOther: e.target.value }))}
                    className="flex-1 p-1 text-sm border border-gray-300 rounded"
                    placeholder="Specify vaccines..."
                  />
                </label>
                
                {ALLERGY_CATEGORIES.substance.options.map(option => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAllergies.includes(option)}
                      onChange={() => toggleAllergy(option)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
                
                <div className="col-span-full">
                  <label className="flex items-center gap-2">
                    <span className="text-sm">Other – specify:</span>
                    <input
                      type="text"
                      value={customFields.otherAllergy}
                      onChange={(e) => setCustomFields(prev => ({ ...prev, otherAllergy: e.target.value }))}
                      className="flex-1 p-1 text-sm border border-gray-300 rounded"
                      placeholder="Specify other allergy..."
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h5 className="mb-3 font-medium text-gray-800">Additional Allergy Notes</h5>
              <textarea
                value={customAllergies}
                onChange={(e) => setCustomAllergies(e.target.value)}
                placeholder="Any additional allergy information..."
                className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              Save Allergies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Comorbidities Modal Component
const ComorbiditiesModal = ({ 
  isOpen, 
  onClose, 
  patient,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  patient: ExtendedPatient;
  onSave: (comorbidities: string[], customComorbidities: string) => void;
}) => {
  const [selectedComorbidities, setSelectedComorbidities] = useState<string[]>(patient.selectedComorbidities || []);
  const [customComorbidities, setCustomComorbidities] = useState<string>(patient.customComorbidities || '');
  const [customFields, setCustomFields] = useState<{[key: string]: string}>({
    cancerType: '',
    otherConditions: ''
  });

  const toggleComorbidity = (comorbidity: string) => {
    setSelectedComorbidities(prev => 
      prev.includes(comorbidity) 
        ? prev.filter(c => c !== comorbidity)
        : [...prev, comorbidity]
    );
  };

  const handleSave = () => {
    let finalComorbidities = [...selectedComorbidities];
    
    // Add custom entries
    if (customFields.cancerType) finalComorbidities.push(`Cancer: ${customFields.cancerType}`);
    if (customFields.otherConditions) finalComorbidities.push(`Other Chronic Conditions: ${customFields.otherConditions}`);
    
    onSave(finalComorbidities, customComorbidities);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-xl rounded-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Edit Comorbidities - {patient.name}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-800">🩺 COMORBIDITIES (Tick all that apply)</h4>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {COMORBIDITIES_OPTIONS.map(option => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedComorbidities.includes(option)}
                      onChange={() => toggleComorbidity(option)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
                
                {/* Cancer with specify field */}
                <div className="col-span-full">
                  <label className="flex items-center gap-2">
                    <span className="text-sm">Cancer (specify type):</span>
                    <input
                      type="text"
                      value={customFields.cancerType}
                      onChange={(e) => setCustomFields(prev => ({ ...prev, cancerType: e.target.value }))}
                      className="flex-1 p-1 text-sm border border-gray-300 rounded"
                      placeholder="Specify cancer type..."
                    />
                  </label>
                </div>
                
                {/* Other conditions */}
                <div className="col-span-full">
                  <label className="flex items-center gap-2">
                    <span className="text-sm">Other Chronic Conditions – specify:</span>
                    <input
                      type="text"
                      value={customFields.otherConditions}
                      onChange={(e) => setCustomFields(prev => ({ ...prev, otherConditions: e.target.value }))}
                      className="flex-1 p-1 text-sm border border-gray-300 rounded"
                      placeholder="Specify other conditions..."
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h5 className="mb-3 font-medium text-gray-800">Additional Comorbidity Notes</h5>
              <textarea
                value={customComorbidities}
                onChange={(e) => setCustomComorbidities(e.target.value)}
                placeholder="Any additional comorbidity information..."
                className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              Save Comorbidities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Priority Dropdown Component
const PriorityDropdown = ({ 
  currentStatus, 
  onStatusChange, 
  patientId 
}: {
  currentStatus: string;
  onStatusChange: (patientId: number, newStatus: string) => void;
  patientId: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const priorities = ['critical', 'high', 'medium', 'low', 'stable'];
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'critical': return 'CRITICAL';
      case 'high': return 'HIGH';
      case 'medium': return 'MEDIUM';
      case 'low': return 'LOW';
      case 'stable': return 'STABLE';
      default: return status.toUpperCase();
    }
  };

  const getPriorityColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200';
      case 'stable': return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200';
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" style={{ zIndex: isOpen ? 9999 : 1 }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 border transition-colors ${getPriorityColor(currentStatus)} flex items-center gap-1 min-w-[70px] sm:min-w-[80px] justify-center touch-manipulation`}
        style={{ position: 'relative', zIndex: isOpen ? 9999 : 1 }}
      >
        <span className="text-[10px] sm:text-xs">{getStatusLabel(currentStatus)}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 sm:hidden" 
            style={{ zIndex: 9998 }} 
            onClick={() => setIsOpen(false)} 
          />
          
          <div 
            className="absolute right-0 w-32 mt-1 overflow-y-auto bg-white border-2 border-gray-300 rounded-lg shadow-2xl sm:w-36 max-h-48"
            style={{ 
              zIndex: 10000,
              position: 'absolute',
              top: '100%',
              right: 0,
              transform: 'translateZ(0)'
            }}
          >
            {priorities.map(priority => (
              <button
                key={priority}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(patientId, priority);
                  setIsOpen(false);
                }}
                className={`block w-full px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium hover:bg-gray-100 transition-colors touch-manipulation ${
                  priority === currentStatus ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
                style={{ zIndex: 10001 }}
              >
                {getStatusLabel(priority)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Patient Status Dropdown Component  
const PatientStatusDropdown = ({ 
  currentStatus, 
  onStatusChange, 
  patientId,
  inline = false
}: {
  currentStatus: string;
  onStatusChange: (patientId: number, newStatus: string) => void;
  patientId: number;
  inline?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const statuses = ['Pre-operative', 'Post-operative', 'Post-operative complications', 'Stable', 'Critical', 'Recovering', 'Discharged'];
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'post-operative complications': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pre-operative': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'post-operative': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'stable': return 'bg-green-100 text-green-800 border-green-200';
      case 'recovering': return 'bg-green-100 text-green-800 border-green-200';
      case 'discharged': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  const buttonClass = inline 
    ? `px-2 py-1 ml-1 sm:ml-2 text-xs font-medium rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 border ${getStatusColor(currentStatus)} inline-flex items-center gap-1 touch-manipulation`
    : `px-2 sm:px-3 py-1 text-xs font-medium rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 border ${getStatusColor(currentStatus)} flex items-center gap-1 touch-manipulation`;

  return (
    <div className="relative inline-block text-left" style={{ zIndex: isOpen ? 9999 : 1 }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={buttonClass}
        style={{ position: 'relative', zIndex: isOpen ? 9999 : 1 }}
      >
        <span className="text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-none">{currentStatus}</span>
        <ChevronDown className="flex-shrink-0 w-3 h-3" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 sm:hidden" 
            style={{ zIndex: 9998 }} 
            onClick={() => setIsOpen(false)} 
          />
          
          <div 
            className="absolute right-0 w-48 mt-1 overflow-y-auto bg-white border-2 border-gray-300 rounded-lg shadow-2xl sm:w-56 max-h-48"
            style={{ 
              zIndex: 10000,
              position: 'absolute',
              top: '100%',
              right: 0,
              transform: 'translateZ(0)'
            }}
          >
            {statuses.map(status => (
              <button
                key={status}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(patientId, status);
                  setIsOpen(false);
                }}
                className={`block w-full px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm hover:bg-gray-100 transition-colors touch-manipulation ${
                  status === currentStatus ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                }`}
                style={{ zIndex: 10001 }}
              >
                {status}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Add/Edit Patient Modal
const PatientModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  editingPatient = null
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patientData: any) => void;
  editingPatient?: ExtendedPatient | null;
}) => {
  const [formData, setFormData] = useState<ExtendedPatient>({
    id: 0,
    name: '',
    age: 0,
    gender: 'Male',
    mrn: '',
    priority: 'medium',
    diagnosis: '',
    admissionDate: new Date().toISOString().split('T')[0],
    ward: '',
    hospital: 'Central Medical Center',
    operation: '',
    allergies: '',
    comorbidities: '',
    height: '',
    weight: '',
    vitals: { bp: '', hr: '', temp: '', spo2: '', rr: '' },
    status: 'Pre-operative',
    prescriptions: [],
    investigations: [],
    notes: [],
    documents: [],
    medicalAidName: '',
    medicalAidNumber: '',
    contactNumber: '',
    room: '',
    scheduledTime: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    selectedAllergies: [],
    selectedComorbidities: []
  });

  // Add modal states for allergies and comorbidities
  const [showAllergiesModal, setShowAllergiesModal] = useState(false);
  const [showComorbiditiesModal, setShowComorbiditiesModal] = useState(false);

  useEffect(() => {
    if (editingPatient) {
      setFormData({
        ...editingPatient,
        selectedAllergies: editingPatient.selectedAllergies || [],
        selectedComorbidities: editingPatient.selectedComorbidities || []
      });
    } else {
      setFormData({
        id: 0,
        name: '',
        age: 0,
        gender: 'Male',
        mrn: '',
        priority: 'medium',
        diagnosis: '',
        admissionDate: new Date().toISOString().split('T')[0],
        ward: '',
        hospital: 'Central Medical Center',
        operation: '',
        allergies: '',
        comorbidities: '',
        height: '',
        weight: '',
        vitals: { bp: '', hr: '', temp: '', spo2: '', rr: '' },
        status: 'Pre-operative',
        prescriptions: [],
        investigations: [],
        notes: [],
        documents: [],
        medicalAidName: '',
        medicalAidNumber: '',
        contactNumber: '',
        room: '',
        scheduledTime: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        selectedAllergies: [],
        selectedComorbidities: []
      });
    }
  }, [editingPatient]);

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('vitals.')) {
      const vitalField = field.split('.')[1];
      setFormData((prev: ExtendedPatient) => ({
        ...prev,
        vitals: { ...prev.vitals, [vitalField]: value }
      }));
    } else {
      setFormData((prev: ExtendedPatient) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mrn) {
      alert('Please fill in required fields: Patient Name and MRN');
      return;
    }
    onSave({ ...formData, id: editingPatient?.id });
    onClose();
  };

  // Handlers for allergy and comorbidity modals
  const handleAllergiesSave = (allergies: string[], customAllergies: string) => {
    const allergiesText = allergies.length > 0 ? allergies.join(', ') : 'NKDA';
    setFormData((prev: ExtendedPatient) => ({
      ...prev,
      selectedAllergies: allergies,
      customAllergies: customAllergies,
      allergies: allergiesText
    }));
  };

  const handleComorbiditiesSave = (comorbidities: string[], customComorbidities: string) => {
    const comorbiditiesText = comorbidities.length > 0 ? comorbidities.join(', ') : 'None';
    setFormData((prev: ExtendedPatient) => ({
      ...prev,
      selectedComorbidities: comorbidities,
      customComorbidities: customComorbidities,
      comorbidities: comorbiditiesText
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black bg-opacity-50 sm:p-4">
      <div className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-white shadow-xl rounded-xl">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg font-bold text-gray-800 sm:text-xl">
              {editingPatient ? 'Edit Patient' : 'Add New Patient'}
            </h3>
            <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 touch-manipulation">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Row 1: Patient Name and Age */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Patient Name *"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-3 text-base border border-gray-300 sm:p-4 sm:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="number"
                placeholder="Age"
                value={formData.age || ''}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                className="w-full p-3 text-base border border-gray-300 sm:p-4 sm:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Row 2: Gender and Contact Number */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full p-3 text-base border border-gray-300 sm:p-4 sm:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full p-3 text-base border border-gray-300 sm:p-4 sm:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Row 3: Diagnosis - Full Width */}
            <input
              type="text"
              placeholder="Diagnosis"
              value={formData.diagnosis}
              onChange={(e) => handleInputChange('diagnosis', e.target.value)}
              className="w-full p-3 text-base border border-gray-300 sm:p-4 sm:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Row 4: Hospital/Medical Center - Full Width */}
            <input
              type="text"
              placeholder="Central Medical Center"
              value={formData.hospital}
              onChange={(e) => handleInputChange('hospital', e.target.value)}
              className="w-full p-3 text-base border border-gray-300 sm:p-4 sm:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Row 5: Procedure/Operation - Full Width */}
            <input
              type="text"
              placeholder="Procedure/Operation (e.g., Laparoscopic Appendectomy) *"
              value={formData.operation}
              onChange={(e) => handleInputChange('operation', e.target.value)}
              className="w-full p-3 text-base border border-gray-300 sm:p-4 sm:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Row 6: Priority and Ward */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full p-3 text-base border border-gray-300 sm:p-4 sm:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="critical">Critical Priority</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
                <option value="stable">Stable</option>
              </select>
              <input
                type="text"
                placeholder="Ward"
                value={formData.ward}
                onChange={(e) => handleInputChange('ward', e.target.value)}
                className="w-full p-3 text-base border border-gray-300 sm:p-4 sm:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Row 7: Date, Time, Room */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                className="w-full p-3 text-base border border-gray-300 sm:p-4 sm:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                className="w-full p-3 text-base border border-gray-300 sm:p-4 sm:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Room"
                value={formData.room}
                onChange={(e) => handleInputChange('room', e.target.value)}
                className="w-full p-3 text-base border border-gray-300 sm:p-4 sm:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Row 8: Medical Aid Info */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Medical Aid Name"
                value={formData.medicalAidName}
                onChange={(e) => handleInputChange('medicalAidName', e.target.value)}
                className="w-full p-3 text-base border border-gray-300 sm:p-4 sm:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Medical Aid Number"
                value={formData.medicalAidNumber}
                onChange={(e) => handleInputChange('medicalAidNumber', e.target.value)}
                className="w-full p-3 text-base border border-gray-300 sm:p-4 sm:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Row 9: Allergies and Comorbidities - NOW WITH CLICKABLE BUTTONS */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setShowAllergiesModal(true)}
                className="p-4 text-left transition-colors border-2 border-blue-300 rounded-xl bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-blue-700">
                    SELECT ALLERGIES ({formData.selectedAllergies?.length || 0})
                  </label>
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-sm text-blue-600">
                  {formData.selectedAllergies && formData.selectedAllergies.length > 0 ? (
                    <div className="space-y-1">
                      {formData.selectedAllergies.slice(0, 2).map((allergy: string, index: number) => (
                        <div key={index} className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-600" />
                          <span className="truncate">{allergy}</span>
                        </div>
                      ))}
                      {formData.selectedAllergies.length > 2 && (
                        <div className="text-xs text-blue-500">
                          +{formData.selectedAllergies.length - 2} more...
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="italic text-blue-500">Click to select allergies</span>
                  )}
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setShowComorbiditiesModal(true)}
                className="p-4 text-left transition-colors border-2 border-purple-300 rounded-xl bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-purple-700">
                    SELECT COMORBIDITIES ({formData.selectedComorbidities?.length || 0})
                  </label>
                  <Plus className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-sm text-purple-600">
                  {formData.selectedComorbidities && formData.selectedComorbidities.length > 0 ? (
                    <div className="space-y-1">
                      {formData.selectedComorbidities.slice(0, 2).map((comorbidity: string, index: number) => (
                        <div key={index} className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-600" />
                          <span className="truncate">{comorbidity}</span>
                        </div>
                      ))}
                      {formData.selectedComorbidities.length > 2 && (
                        <div className="text-xs text-purple-500">
                          +{formData.selectedComorbidities.length - 2} more...
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="italic text-purple-500">Click to select comorbidities</span>
                  )}
                </div>
              </button>
            </div>

            {/* Row 10: Special Instructions - Full Width */}
            <textarea
              placeholder="Special Instructions (e.g., TO BE DONE LAST, HIGH PRIORITY from Mayo Clinic ICU)"
              value={formData.notes ? formData.notes.join('\n') : ''}
              onChange={(e) => handleInputChange('notes', e.target.value.split('\n'))}
              className="w-full h-24 p-3 text-base border border-gray-300 resize-none sm:h-32 sm:p-4 sm:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Submit Buttons */}
            <div className="flex flex-col gap-3 mt-6 sm:gap-4 sm:mt-8 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-base text-gray-700 transition-colors bg-gray-200 sm:px-6 sm:py-4 sm:text-lg rounded-xl hover:bg-gray-300 touch-manipulation"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center justify-center flex-1 gap-2 px-4 py-3 text-base text-white transition-colors bg-green-600 sm:gap-3 sm:px-6 sm:py-4 sm:text-lg rounded-xl hover:bg-green-700 touch-manipulation"
              >
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                {editingPatient ? 'Save Changes' : 'Add Patient'}
              </button>
            </div>
          </form>

          {/* Allergies Modal */}
          <AllergiesModal
            isOpen={showAllergiesModal}
            onClose={() => setShowAllergiesModal(false)}
            patient={formData}
            onSave={handleAllergiesSave}
          />

          {/* Comorbidities Modal */}
          <ComorbiditiesModal
            isOpen={showComorbiditiesModal}
            onClose={() => setShowComorbiditiesModal(false)}
            patient={formData}
            onSave={handleComorbiditiesSave}
          />
        </div>
      </div>
    </div>
  );
};

// Linear Patient Card Component
const LinearPatientCard = ({ 
  patient, 
  index,
  isExpanded,
  onToggleExpand,
  onStatusChange,
  onDelete,
  onEditPatient,
  onOpenNotesModal,
  onUpdatePatient
}: {
  patient: ExtendedPatient;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onStatusChange: (patientId: number, newStatus: string) => void;
  onDelete: (id: number) => void;
  onEditPatient: (patient: ExtendedPatient) => void;
  onOpenNotesModal: (patient: ExtendedPatient) => void;
  onUpdatePatient: (patientId: number, updates: Partial<ExtendedPatient>) => void;
}) => {
  // Get priority color for the left border and background
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      case 'stable': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getAllergiesDisplay = () => {
    if (patient.selectedAllergies && patient.selectedAllergies.length > 0) {
      return patient.selectedAllergies.slice(0, 2).join(', ') + 
        (patient.selectedAllergies.length > 2 ? `+${patient.selectedAllergies.length - 2} more` : '');
    }
    return 'NKDA';
  };

  const getComorbiditiesDisplay = () => {
    if (patient.selectedComorbidities && patient.selectedComorbidities.length > 0) {
      return patient.selectedComorbidities.slice(0, 2).join(', ') + 
        (patient.selectedComorbidities.length > 2 ? `+${patient.selectedComorbidities.length - 2} more` : '');
    }
    return 'Nil';
  };

  return (
    <div className={`border-l-4 shadow-lg rounded-lg overflow-hidden transition-all duration-200 ${getPriorityStyles(patient.priority)}`}>
      {/* Linear Summary Line */}
      <div 
        className="flex items-center justify-between p-3 transition-colors cursor-pointer hover:bg-opacity-80"
        onClick={onToggleExpand}
      >
        <div className="flex items-center flex-1 gap-4 text-sm">
          <span className="font-bold text-gray-900 min-w-[20px]">{index + 1}.</span>
          <span className="font-semibold text-blue-800 min-w-[120px]">{patient.name}</span>
          <span className="text-gray-600 min-w-[60px]">{patient.age} Yrs</span>
          <span className="text-gray-600 min-w-[20px]">{patient.gender.charAt(0)}</span>
          <span className="text-gray-800 min-w-[150px] truncate">{patient.operation}</span>
          <span className="text-gray-600 min-w-[100px] truncate">{getComorbiditiesDisplay()}</span>
          <span className="text-gray-600 min-w-[120px] truncate">{getAllergiesDisplay()}</span>
          <span className="text-gray-600 min-w-[100px]">{patient.contactNumber || 'N/A'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <PriorityDropdown
            currentStatus={patient.priority}
            onStatusChange={onStatusChange}
            patientId={patient.id}
          />
          <button className="p-1 text-gray-400 hover:text-gray-600">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Detailed View */}
      {isExpanded && (
        <div className="bg-white border-t border-gray-200">
          <PatientDetailCard
            patient={patient}
            onStatusChange={onStatusChange}
            onViewDetails={() => {}}
            onDelete={onDelete}
            onEditPatient={onEditPatient}
            onOpenNotesModal={onOpenNotesModal}
            onUpdatePatient={onUpdatePatient}
          />
        </div>
      )}
    </div>
  );
};

// Patient Detail Card Component
const PatientDetailCard = ({ 
  patient, 
  onStatusChange, 
  onViewDetails,
  onDelete,
  onEditPatient,
  onOpenNotesModal,
  onUpdatePatient,
  highlightRef 
}: {
  patient: ExtendedPatient;
  onStatusChange: (patientId: number, newStatus: string) => void;
  onViewDetails: (patient: ExtendedPatient) => void;
  onDelete: (id: number) => void;
  onEditPatient: (patient: ExtendedPatient) => void;
  onOpenNotesModal: (patient: ExtendedPatient) => void;
  onUpdatePatient: (patientId: number, updates: Partial<ExtendedPatient>) => void;
  highlightRef?: React.RefObject<HTMLDivElement | null>;
}) => {
  // Navigation and context hooks
  const navigate = useNavigate();
  const { setPatient, setPendingAction } = useSelectedPatient();

  // States for editing different sections
  const [editingBasicInfo, setEditingBasicInfo] = useState(false);
  const [editingMedicalInfo, setEditingMedicalInfo] = useState(false);
  const [editingOperations, setEditingOperations] = useState(false);
  const [editingVitals, setEditingVitals] = useState(false);
  const [editingHeight, setEditingHeight] = useState(false);
  const [editingWeight, setEditingWeight] = useState(false);
  const [showAllInvestigations, setShowAllInvestigations] = useState(false);
  const [showPrescriptionsModal, setShowPrescriptionsModal] = useState(false);
  const [showInvestigationsModal, setShowInvestigationsModal] = useState(false);
  const [showAllergiesModal, setShowAllergiesModal] = useState(false);
  const [showComorbiditiesModal, setShowComorbiditiesModal] = useState(false);
  
  // Form states
  const [basicInfoForm, setBasicInfoForm] = useState({
    medicalAidName: patient.medicalAidName || '',
    medicalAidNumber: patient.medicalAidNumber || ''
  });
  
  const [medicalInfoForm, setMedicalInfoForm] = useState({
    diagnosis: patient.diagnosis || '',
    status: patient.status || '',
    ward: patient.ward || '',
    hospital: patient.hospital || ''
  });
  
  const [operationsForm, setOperationsForm] = useState(patient.operation || '');
  const [heightForm, setHeightForm] = useState(patient.height || '');
  const [weightForm, setWeightForm] = useState(patient.weight || '');
  const [vitalsForm, setVitalsForm] = useState(patient.vitals || { bp: '', hr: '', temp: '', spo2: '', rr: '' });
  const [newPrescription, setNewPrescription] = useState('');
  const [newInvestigation, setNewInvestigation] = useState({ type: '', date: '', status: 'Pending' });

  // NEW HANDLER FUNCTIONS FOR CONNECTED BUTTONS:

  const handleOrderBloods = (patient: ExtendedPatient) => {
    // Set selected patient in context
    setPatient({
      id: patient.id.toString(),
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      mrn: patient.mrn,
      contactNumber: patient.contactNumber,
      diagnosis: patient.diagnosis
    });
    
    // Set pending action to auto-trigger form
    setPendingAction('order-bloods');
    
    // Navigate to diagnostics page
    navigate('/diagnostics');
  };

  const handleOrderXrays = (patient: ExtendedPatient) => {
    setPatient({
      id: patient.id.toString(),
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      mrn: patient.mrn,
      contactNumber: patient.contactNumber,
      diagnosis: patient.diagnosis
    });
    
    setPendingAction('order-xrays');
    navigate('/diagnostics');
  };

  const handleOrderOtherInvestigations = (patient: ExtendedPatient) => {
    setPatient({
      id: patient.id.toString(),
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      mrn: patient.mrn,
      contactNumber: patient.contactNumber,
      diagnosis: patient.diagnosis
    });
    
    setPendingAction('order-investigations');
    navigate('/diagnostics');
  };

  const handleReferPatient = (patient: ExtendedPatient) => {
    setPatient({
      id: patient.id.toString(),
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      mrn: patient.mrn,
      contactNumber: patient.contactNumber,
      diagnosis: patient.diagnosis
    });
    
    setPendingAction('create-referral');
    navigate('/referrals');
  };

  // Helper functions for saving changes
  const saveBasicInfo = () => {
    onUpdatePatient(patient.id, basicInfoForm);
    setEditingBasicInfo(false);
  };

  const saveMedicalInfo = () => {
    onUpdatePatient(patient.id, medicalInfoForm);
    setEditingMedicalInfo(false);
  };

  const saveOperations = () => {
    onUpdatePatient(patient.id, { operation: operationsForm });
    setEditingOperations(false);
  };

  const saveVitals = () => {
    onUpdatePatient(patient.id, { vitals: vitalsForm });
    setEditingVitals(false);
  };

  const saveHeight = () => {
    onUpdatePatient(patient.id, { height: heightForm });
    setEditingHeight(false);
  };

  const saveWeight = () => {
    onUpdatePatient(patient.id, { weight: weightForm });
    setEditingWeight(false);
  };

  const addPrescription = () => {
    if (newPrescription.trim()) {
      const updatedPrescriptions = [...(patient.prescriptions || []), newPrescription.trim()];
      onUpdatePatient(patient.id, { prescriptions: updatedPrescriptions });
      setNewPrescription('');
    }
  };

  const removePrescription = (index: number) => {
    const updatedPrescriptions = patient.prescriptions?.filter((_, i) => i !== index) || [];
    onUpdatePatient(patient.id, { prescriptions: updatedPrescriptions });
  };

  const addInvestigation = () => {
    if (newInvestigation.type.trim()) {
      const updatedInvestigations = [...(patient.investigations || []), { 
        ...newInvestigation, 
        date: newInvestigation.date || new Date().toISOString().split('T')[0] 
      }];
      onUpdatePatient(patient.id, { investigations: updatedInvestigations });
      setNewInvestigation({ type: '', date: '', status: 'Pending' });
    }
  };

  const removeInvestigation = (index: number) => {
    const updatedInvestigations = patient.investigations?.filter((_, i) => i !== index) || [];
    onUpdatePatient(patient.id, { investigations: updatedInvestigations });
  };

  const handleAllergiesSave = (allergies: string[], customAllergies: string) => {
    const allergiesText = allergies.length > 0 ? allergies.join(', ') : 'NKDA';
    onUpdatePatient(patient.id, { 
      selectedAllergies: allergies,
      customAllergies: customAllergies,
      allergies: allergiesText
    });
  };

  const handleComorbiditiesSave = (comorbidities: string[], customComorbidities: string) => {
    const comorbiditiesText = comorbidities.length > 0 ? comorbidities.join(', ') : 'None';
    onUpdatePatient(patient.id, { 
      selectedComorbidities: comorbidities,
      customComorbidities: customComorbidities,
      comorbidities: comorbiditiesText
    });
  };

  const visibleInvestigations = showAllInvestigations 
    ? (patient.investigations || [])
    : (patient.investigations || []).slice(0, 3);

  return (
    <div 
      ref={highlightRef}
      className={`bg-white rounded-lg shadow-lg border-l-4 ${getStatusBorderColor(patient.priority)} overflow-hidden`}
    >
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header - Updated with Medical Aid Info */}
        <div className="flex flex-col items-start justify-between gap-3 mb-4 sm:flex-row sm:gap-4">
          <div className="flex items-center flex-1 gap-3">
            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full sm:w-12 sm:h-12">
              <User className="w-5 h-5 text-gray-600 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-800 truncate sm:text-lg">{patient.name}</h3>
              <p className="text-sm text-gray-600">{patient.age} yrs, {patient.gender}</p>
              {editingBasicInfo ? (
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    value={basicInfoForm.medicalAidName}
                    onChange={(e) => setBasicInfoForm(prev => ({ ...prev, medicalAidName: e.target.value }))}
                    placeholder="Medical Aid Name"
                    className="w-full p-2 text-sm border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={basicInfoForm.medicalAidNumber}
                    onChange={(e) => setBasicInfoForm(prev => ({ ...prev, medicalAidNumber: e.target.value }))}
                    placeholder="Medical Aid Number"
                    className="w-full p-2 text-sm border border-gray-300 rounded"
                  />
                  <div className="flex gap-2">
                    <button onClick={saveBasicInfo} className="px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700 touch-manipulation">
                      Save
                    </button>
                    <button onClick={() => setEditingBasicInfo(false)} className="px-2 py-1 text-xs text-white bg-gray-600 rounded hover:bg-gray-700 touch-manipulation">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1 mt-1 sm:flex-row sm:items-center sm:gap-2">
                  <div className="text-xs text-gray-500">
                    <p>Medical Aid: {patient.medicalAidName || 'Not provided'}</p>
                    <p>Aid Number: {patient.medicalAidNumber || 'Not provided'}</p>
                  </div>
                  <button 
                    onClick={() => setEditingBasicInfo(true)}
                    className="self-start text-xs text-blue-600 hover:text-blue-800 sm:self-center touch-manipulation"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center flex-shrink-0 gap-2">
            <PriorityDropdown
              currentStatus={patient.priority}
              onStatusChange={onStatusChange}
              patientId={patient.id}
            />
            <button
              onClick={() => onDelete(patient.id)}
              className="p-1 text-red-600 transition-colors hover:text-red-800 touch-manipulation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Three Column Layout - Now Responsive */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 sm:gap-6">
          {/* Left Column - Medical Info */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-red-600 sm:text-base">Medical Info</h4>
                {!editingMedicalInfo && (
                  <button 
                    onClick={() => setEditingMedicalInfo(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 touch-manipulation"
                  >
                    Edit
                  </button>
                )}
              </div>
              {editingMedicalInfo ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={medicalInfoForm.diagnosis}
                    onChange={(e) => setMedicalInfoForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                    placeholder="Diagnosis"
                    className="w-full p-2 text-sm border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={medicalInfoForm.status}
                    onChange={(e) => setMedicalInfoForm(prev => ({ ...prev, status: e.target.value }))}
                    placeholder="Status"
                    className="w-full p-2 text-sm border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={medicalInfoForm.ward}
                    onChange={(e) => setMedicalInfoForm(prev => ({ ...prev, ward: e.target.value }))}
                    placeholder="Ward"
                    className="w-full p-2 text-sm border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={medicalInfoForm.hospital}
                    onChange={(e) => setMedicalInfoForm(prev => ({ ...prev, hospital: e.target.value }))}
                    placeholder="Hospital"
                    className="w-full p-2 text-sm border border-gray-300 rounded"
                  />
                  <div className="flex gap-2">
                    <button onClick={saveMedicalInfo} className="px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700">
                      Save
                    </button>
                    <button onClick={() => setEditingMedicalInfo(false)} className="px-2 py-1 text-xs text-white bg-gray-600 rounded hover:bg-gray-700">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Diagnosis:</span>{' '}
                    <span className="text-red-600">{patient.diagnosis}</span>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    <PatientStatusDropdown
                      currentStatus={patient.status}
                      onStatusChange={(patientId, newStatus) => onUpdatePatient(patientId, { status: newStatus })}
                      patientId={patient.id}
                      inline={true}
                    />
                  </div>
                  <div>
                    <span className="font-medium">Ward:</span> {patient.ward}
                  </div>
                  <div>
                    <span className="font-medium">Hospital:</span> {patient.hospital}
                  </div>
                </div>
              )}
            </div>

            {/* Current Prescriptions - With border like Latest Notes */}
            <div className="p-4 bg-white border-2 border-gray-300 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-800">Current Prescriptions:</h5>
                <button 
                  onClick={() => setShowPrescriptionsModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Add/Remove
                </button>
              </div>
              <div className="space-y-1">
                {patient.prescriptions && patient.prescriptions.length > 0 ? (
                  patient.prescriptions.map((prescription, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-blue-600">{prescription}</span>
                      <button 
                        onClick={() => removePrescription(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">No current prescriptions</p>
                )}
              </div>
            </div>

            {/* Investigations - With border like Latest Notes */}
            <div className="p-4 bg-white border-2 border-gray-300 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-800">Investigations:</h5>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setShowAllInvestigations(!showAllInvestigations)}
                    className="text-xs text-green-600 hover:text-green-800"
                  >
                    {showAllInvestigations ? 'View Less' : 'View All'}
                  </button>
                  <button 
                    onClick={() => setShowInvestigationsModal(true)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Add/Remove
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {visibleInvestigations.length > 0 ? (
                  visibleInvestigations.map((investigation: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-800">{investigation.type || investigation}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          (investigation.status || 'Complete') === 'Complete' ? 'bg-green-100 text-green-700' :
                          (investigation.status || 'Pending') === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {investigation.status || 'Complete'}
                        </span>
                        <button 
                          onClick={() => removeInvestigation(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-800">CBC</span>
                      <span className="px-2 py-1 text-xs text-green-700 bg-green-100 rounded-full">Complete</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-800">CT Abdomen</span>
                      <span className="px-2 py-1 text-xs text-green-700 bg-green-100 rounded-full">Complete</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-800">ECG</span>
                      <span className="px-2 py-1 text-xs text-yellow-700 bg-yellow-100 rounded-full">Pending</span>
                    </div>
                  </>
                )}
                {!showAllInvestigations && (patient.investigations || []).length > 3 && (
                  <button 
                    onClick={() => setShowAllInvestigations(true)}
                    className="text-xs text-gray-500"
                  >
                    +{(patient.investigations || []).length - 3} more...
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Center Column - Operation, Allergies, Comorbidities, Vitals */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Operation/Procedure:</h4>
                {!editingOperations && (
                  <button 
                    onClick={() => setEditingOperations(true)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                )}
              </div>
              {editingOperations ? (
                <div className="space-y-2">
                  <textarea
                    value={operationsForm}
                    onChange={(e) => setOperationsForm(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button onClick={saveOperations} className="px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700">
                      Save
                    </button>
                    <button onClick={() => setEditingOperations(false)} className="px-2 py-1 text-xs text-white bg-gray-600 rounded hover:bg-gray-700">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-600">{patient.operation}</p>
              )}
            </div>

            {/* NEW: Structured Allergies Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Allergies:</h4>
                <button 
                  onClick={() => setShowAllergiesModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Edit Structured
                </button>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                {patient.selectedAllergies && patient.selectedAllergies.length > 0 ? (
                  <div className="space-y-1">
                    {patient.selectedAllergies.slice(0, 3).map((allergy, index) => (
                      <div key={index} className="flex items-center gap-1 text-sm">
                        <Check className="w-3 h-3 text-green-600" />
                        <span className="text-gray-700">{allergy}</span>
                      </div>
                    ))}
                    {patient.selectedAllergies.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{patient.selectedAllergies.length - 3} more allergies...
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">NKDA (No Known Drug Allergies)</p>
                )}
              </div>
            </div>

            {/* NEW: Structured Comorbidities Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Comorbidities:</h4>
                <button 
                  onClick={() => setShowComorbiditiesModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Edit Structured
                </button>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                {patient.selectedComorbidities && patient.selectedComorbidities.length > 0 ? (
                  <div className="space-y-1">
                    {patient.selectedComorbidities.slice(0, 3).map((comorbidity, index) => (
                      <div key={index} className="flex items-center gap-1 text-sm">
                        <Check className="w-3 h-3 text-green-600" />
                        <span className="text-gray-700">{comorbidity}</span>
                      </div>
                    ))}
                    {patient.selectedComorbidities.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{patient.selectedComorbidities.length - 3} more conditions...
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">None reported</p>
                )}
              </div>
            </div>

            {/* Vitals */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Vitals</h4>
                {!editingVitals && (
                  <button 
                    onClick={() => setEditingVitals(true)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                )}
              </div>
              {editingVitals ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={vitalsForm.bp}
                      onChange={(e) => setVitalsForm(prev => ({ ...prev, bp: e.target.value }))}
                      placeholder="BP"
                      className="p-2 text-xs border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={vitalsForm.hr}
                      onChange={(e) => setVitalsForm(prev => ({ ...prev, hr: e.target.value }))}
                      placeholder="HR"
                      className="p-2 text-xs border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={vitalsForm.temp}
                      onChange={(e) => setVitalsForm(prev => ({ ...prev, temp: e.target.value }))}
                      placeholder="TEMP"
                      className="p-2 text-xs border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={vitalsForm.spo2}
                      onChange={(e) => setVitalsForm(prev => ({ ...prev, spo2: e.target.value }))}
                      placeholder="SPO2"
                      className="p-2 text-xs border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={vitalsForm.rr}
                      onChange={(e) => setVitalsForm(prev => ({ ...prev, rr: e.target.value }))}
                      placeholder="RR"
                      className="col-span-2 p-2 text-xs border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveVitals} className="px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700">
                      Save
                    </button>
                    <button onClick={() => setEditingVitals(false)} className="px-2 py-1 text-xs text-white bg-gray-600 rounded hover:bg-gray-700">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="p-3 text-center bg-red-100 rounded-lg">
                    <div className="text-xs font-medium text-gray-600">BP</div>
                    <div className="text-lg font-bold text-red-700">{patient.vitals?.bp || '85/50'}</div>
                  </div>
                  <div className="p-3 text-center bg-orange-100 rounded-lg">
                    <div className="text-xs font-medium text-gray-600">HR</div>
                    <div className="text-lg font-bold text-orange-700">{patient.vitals?.hr || '110'}</div>
                  </div>
                  <div className="p-3 text-center bg-yellow-100 rounded-lg">
                    <div className="text-xs font-medium text-gray-600">TEMP</div>
                    <div className="text-lg font-bold text-yellow-700">{patient.vitals?.temp || '38.5°C'}</div>
                  </div>
                  <div className="p-3 text-center bg-pink-100 rounded-lg">
                    <div className="text-xs font-medium text-gray-600">SPO2</div>
                    <div className="text-lg font-bold text-pink-700">{patient.vitals?.spo2 || '92%'}</div>
                  </div>
                  <div className="col-span-2 p-3 text-center bg-green-100 rounded-lg">
                    <div className="text-xs font-medium text-gray-600">RR</div>
                    <div className="text-lg font-bold text-green-700">{patient.vitals?.rr || '24'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Height, Weight, Actions, Notes */}
          <div className="space-y-4">
            {/* Height and Weight on same line */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">Height:</h4>
                  {!editingHeight && (
                    <button 
                      onClick={() => setEditingHeight(true)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {editingHeight ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={heightForm}
                      onChange={(e) => setHeightForm(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                    />
                    <div className="flex gap-1">
                      <button onClick={saveHeight} className="px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700">
                        Save
                      </button>
                      <button onClick={() => setEditingHeight(false)} className="px-1 py-1 text-xs text-white bg-gray-600 rounded hover:bg-gray-700">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-800">{patient.height || '175 cm'}</p>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">Weight:</h4>
                  {!editingWeight && (
                    <button 
                      onClick={() => setEditingWeight(true)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {editingWeight ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={weightForm}
                      onChange={(e) => setWeightForm(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded"
                    />
                    <div className="flex gap-1">
                      <button onClick={saveWeight} className="px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700">
                        Save
                      </button>
                      <button onClick={() => setEditingWeight(false)} className="px-1 py-1 text-xs text-white bg-gray-600 rounded hover:bg-gray-700">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-800">{patient.weight || '78 kg'}</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-gray-800">Actions</h4>
              <div className="mt-3 space-y-2">
                {/* Row 1: View/Order Bloods & Results & View/Order Xrays & Imaging - CONNECTED BUTTONS */}
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleOrderBloods(patient)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-xs">View/Order Bloods<br />& Results</span>
                  </button>
                  <button 
                    onClick={() => handleOrderXrays(patient)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 bg-green-100 rounded-lg hover:bg-green-200"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-xs">View/Order Xrays<br />& Imaging</span>
                  </button>
                </div>

                {/* Row 2: Generate Report & View or Order Other Investigations - CONNECTED BUTTON */}
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 bg-purple-100 rounded-lg hover:bg-purple-200">
                    <FileText className="w-4 h-4" />
                    Generate Report
                  </button>
                  <button 
                    onClick={() => handleOrderOtherInvestigations(patient)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-orange-600 bg-orange-100 rounded-lg hover:bg-orange-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-xs">View or Order Other<br />Investigations</span>
                  </button>
                </div>

                {/* Row 3: Upload & Download Patient Media - FILE MANAGEMENT BUTTONS */}
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200">
                    <Upload className="w-4 h-4" />
                    <span className="text-xs">Upload Patient Pictures/<br />Videos/Documents</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-teal-600 bg-teal-100 rounded-lg hover:bg-teal-200">
                    <Download className="w-4 h-4" />
                    <span className="text-xs">Download Patient Pictures/<br />Videos/Documents</span>
                  </button>
                </div>

                {/* Row 4: Refer Patient (full width) - CONNECTED BUTTON */}
                <button 
                  onClick={() => handleReferPatient(patient)}
                  className="flex items-center justify-center w-full gap-2 px-3 py-2 text-sm text-red-600 bg-red-100 rounded-lg hover:bg-red-200"
                >
                  <User className="w-4 h-4" />
                  Refer Patient
                </button>
              </div>
            </div>

            {/* Latest Notes - Exactly as in image with proper border */}
            <div className="p-4 bg-white border-2 border-gray-300 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-800">Latest Notes:</h5>
                <button 
                  onClick={() => onOpenNotesModal(patient)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Add/Remove Notes
                </button>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                {patient.notes && patient.notes.length > 0 ? (
                  patient.notes.map((note: string, index: number) => (
                    <p key={index}>• {note}</p>
                  ))
                ) : (
                  <p className="text-xs italic text-gray-500">No notes available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Allergies Modal */}
      <AllergiesModal
        isOpen={showAllergiesModal}
        onClose={() => setShowAllergiesModal(false)}
        patient={patient}
        onSave={handleAllergiesSave}
      />

      {/* Comorbidities Modal */}
      <ComorbiditiesModal
        isOpen={showComorbiditiesModal}
        onClose={() => setShowComorbiditiesModal(false)}
        patient={patient}
        onSave={handleComorbiditiesSave}
      />

      {/* Prescriptions Modal */}
      {showPrescriptionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Manage Prescriptions</h3>
                <button onClick={() => setShowPrescriptionsModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPrescription}
                    onChange={(e) => setNewPrescription(e.target.value)}
                    placeholder="Add new prescription..."
                    className="flex-1 p-2 border border-gray-300 rounded"
                  />
                  <button 
                    onClick={addPrescription}
                    className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                
                <div className="space-y-2 overflow-y-auto max-h-40">
                  {patient.prescriptions?.map((prescription, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-50">
                      <span className="text-sm">{prescription}</span>
                      <button 
                        onClick={() => removePrescription(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Investigations Modal */}
      {showInvestigationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Manage Investigations</h3>
                <button onClick={() => setShowInvestigationsModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newInvestigation.type}
                    onChange={(e) => setNewInvestigation(prev => ({ ...prev, type: e.target.value }))}
                    placeholder="Investigation type..."
                    className="p-2 border border-gray-300 rounded"
                  />
                  <input
                    type="date"
                    value={newInvestigation.date}
                    onChange={(e) => setNewInvestigation(prev => ({ ...prev, date: e.target.value }))}
                    className="p-2 border border-gray-300 rounded"
                  />
                  <select
                    value={newInvestigation.status}
                    onChange={(e) => setNewInvestigation(prev => ({ ...prev, status: e.target.value }))}
                    className="p-2 border border-gray-300 rounded"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Complete">Complete</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                  <button 
                    onClick={addInvestigation}
                    className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                
                <div className="space-y-2 overflow-y-auto max-h-40">
                  {patient.investigations?.map((investigation: any, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-50">
                      <div className="flex-1">
                        <span className="text-sm font-medium">{investigation.type}</span>
                        <span className="ml-2 text-xs text-gray-500">({investigation.date})</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          investigation.status === 'Complete' ? 'bg-green-100 text-green-700' :
                          investigation.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {investigation.status}
                        </span>
                      </div>
                      <button 
                        onClick={() => removeInvestigation(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Load patients from storage (in-memory for demo)
const loadPatientsFromStorage = (): ExtendedPatient[] => {
  return initialPatients;
};

// Save patients to storage (in-memory for demo)
const savePatientsToStorage = (patients: ExtendedPatient[]) => {
  // In a real app, this would save to localStorage or backend
  console.log('Saving patients:', patients);
};

// Main Component
const Patients: React.FC = () => {
  // Navigation and context hooks
  const navigate = useNavigate();
  const { setPatient, setPendingAction } = useSelectedPatient();

  // Use local state for patients to avoid context type conflicts
  const [patients, setPatients] = useState<ExtendedPatient[]>([]);
  const highlightRef = useRef<HTMLDivElement>(null);

  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<string>('asc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddPatient, setShowAddPatient] = useState<boolean>(false);
  const [highlightPatient, setHighlightPatient] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detailed'>('detailed');
  const [selectedPatient, setSelectedPatient] = useState<ExtendedPatient | null>(null);
  const [editingPatient, setEditingPatient] = useState<ExtendedPatient | null>(null);
  const [showNotesModal, setShowNotesModal] = useState<boolean>(false);
  const [currentPatientForNotes, setCurrentPatientForNotes] = useState<ExtendedPatient | null>(null);
  const [newNote, setNewNote] = useState<string>('');
  const [expandedPatients, setExpandedPatients] = useState<Set<number>>(new Set());

  // NEW FILE MANAGEMENT STATE
  const [showFileModal, setShowFileModal] = useState(false);
  const [currentPatientForFiles, setCurrentPatientForFiles] = useState<ExtendedPatient | null>(null);

  // Load patients from storage on component mount
  useEffect(() => {
    const savedPatients = loadPatientsFromStorage();
    setPatients(savedPatients);
  }, []);

  // Save patients to storage whenever patients change
  useEffect(() => {
    if (patients.length > 0) {
      savePatientsToStorage(patients);
    }
  }, [patients]);

  // NEW HANDLER FUNCTIONS FOR CONNECTED BUTTONS:

  const handleOrderBloods = (patient: ExtendedPatient) => {
    // Set selected patient in context
    setPatient({
      id: patient.id.toString(),
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      mrn: patient.mrn,
      contactNumber: patient.contactNumber,
      diagnosis: patient.diagnosis
    });
    
    // Set pending action to auto-trigger form
    setPendingAction('order-bloods');
    
    // Navigate to diagnostics page
    navigate('/diagnostics');
  };

  const handleOrderXrays = (patient: ExtendedPatient) => {
    setPatient({
      id: patient.id.toString(),
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      mrn: patient.mrn,
      contactNumber: patient.contactNumber,
      diagnosis: patient.diagnosis
    });
    
    setPendingAction('order-xrays');
    navigate('/diagnostics');
  };

  const handleOrderOtherInvestigations = (patient: ExtendedPatient) => {
    setPatient({
      id: patient.id.toString(),
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      mrn: patient.mrn,
      contactNumber: patient.contactNumber,
      diagnosis: patient.diagnosis
    });
    
    setPendingAction('order-investigations');
    navigate('/diagnostics');
  };

  const handleUploadDocuments = (patient: ExtendedPatient) => {
    setCurrentPatientForFiles(patient);
    setShowFileModal(true);
  };

  const handleDownloadDocuments = (patient: ExtendedPatient) => {
    setCurrentPatientForFiles(patient);
    setShowFileModal(true);
  };

  const handleReferPatient = (patient: ExtendedPatient) => {
    setPatient({
      id: patient.id.toString(),
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      mrn: patient.mrn,
      contactNumber: patient.contactNumber,
      diagnosis: patient.diagnosis
    });
    
    setPendingAction('create-referral');
    navigate('/referrals');
  };

  const updatePatientStatus = (patientId: number, newStatus: string) => {
    const updatedPatients = patients.map(p => 
      p.id === patientId ? { ...p, priority: newStatus } : p
    );
    setPatients(updatedPatients);
  };

  const updatePatientCurrentStatus = (patientId: number, newStatus: string) => {
    const updatedPatients = patients.map(p => 
      p.id === patientId ? { ...p, status: newStatus } : p
    );
    setPatients(updatedPatients);
  };

  const updatePatient = (patientId: number, updates: Partial<ExtendedPatient>) => {
    const updatedPatients = patients.map(p => 
      p.id === patientId ? { ...p, ...updates } : p
    );
    setPatients(updatedPatients);
  };

  const addNewPatient = (patientData: any) => {
    const newPatient: ExtendedPatient = {
      ...patientData,
      id: Math.max(...patients.map(p => p.id), 0) + 1
    };
    setPatients([...patients, newPatient]);
  };

  const editPatient = (patientData: any) => {
    const updatedPatients = patients.map(p => 
      p.id === patientData.id ? { ...p, ...patientData } : p
    );
    setPatients(updatedPatients);
    setEditingPatient(null);
  };

  const deletePatient = (id: number) => {
    const updatedPatients = patients.filter(p => p.id !== id);
    setPatients(updatedPatients);
  };

  const handleEditPatient = (patient: ExtendedPatient) => {
    setEditingPatient(patient);
    setShowAddPatient(true);
  };

  const openNotesModal = (patient: ExtendedPatient) => {
    setCurrentPatientForNotes(patient);
    setShowNotesModal(true);
  };

  const togglePatientExpansion = (patientId: number) => {
    setExpandedPatients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(patientId)) {
        newSet.delete(patientId);
      } else {
        newSet.add(patientId);
      }
      return newSet;
    });
  };

  const addNote = () => {
    if (newNote.trim() && currentPatientForNotes) {
      const updatedPatients = patients.map(p => 
        p.id === currentPatientForNotes.id 
          ? { ...p, notes: [...(p.notes || []), newNote.trim()] }
          : p
      );
      setPatients(updatedPatients);
      setNewNote('');
    }
  };

  const removeNote = (noteIndex: number) => {
    if (currentPatientForNotes) {
      const updatedPatients = patients.map(p => 
        p.id === currentPatientForNotes.id 
          ? { ...p, notes: p.notes?.filter((_, index) => index !== noteIndex) || [] }
          : p
      );
      setPatients(updatedPatients);
      setCurrentPatientForNotes({
        ...currentPatientForNotes,
        notes: currentPatientForNotes.notes?.filter((_, index) => index !== noteIndex) || []
      });
    }
  };

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.mrn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Real-time sorting functionality
  const sorted = [...filtered].sort((a, b) => {
    let valA: any, valB: any;
    
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { 'critical': 1, 'high': 2, 'medium': 3, 'low': 4, 'stable': 5 };
        valA = priorityOrder[a.priority as keyof typeof priorityOrder] || 6;
        valB = priorityOrder[b.priority as keyof typeof priorityOrder] || 6;
        break;
      case 'admissionDate':
        valA = new Date(a.admissionDate).getTime();
        valB = new Date(b.admissionDate).getTime();
        break;
      case 'diagnosis':
        valA = a.diagnosis || '';
        valB = b.diagnosis || '';
        break;
      default: // name
        valA = a.name || '';
        valB = b.name || '';
    }

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    } else {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
  });

  return (
    <div className="relative min-h-screen p-3 space-y-4 sm:p-4 lg:p-6 sm:space-y-6 bg-gray-50">
      {/* Header */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-5">
        <button
          onClick={() => {
            setEditingPatient(null);
            setShowAddPatient(true);
          }}
          className="flex items-center justify-center gap-2 p-3 text-green-700 transition-all duration-200 transform bg-green-100 shadow-lg sm:gap-3 sm:p-4 rounded-xl hover:bg-green-200 hover:scale-105 touch-manipulation"
        >
          <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-sm font-medium sm:text-base">Add Patient</span>
        </button>

        <div className="flex items-center col-span-1 gap-2 p-3 bg-blue-100 shadow-lg md:col-span-2 sm:p-4 rounded-xl">
          <Search className="flex-shrink-0 w-4 h-4 text-blue-600 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 text-sm placeholder-blue-600 bg-transparent outline-none sm:text-base"
          />
        </div>

        <div className="flex items-center gap-2 p-3 bg-purple-100 shadow-lg sm:p-4 rounded-xl">
          <Filter className="flex-shrink-0 w-4 h-4 text-purple-600 sm:w-5 sm:h-5" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 text-xs text-purple-600 bg-transparent outline-none sm:text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="priority">Sort by Priority</option>
            <option value="admissionDate">Sort by Admission Date</option>
            <option value="diagnosis">Sort by Diagnosis</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="text-purple-600 hover:text-purple-800 touch-manipulation"
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 px-3 py-3 sm:py-4 text-sm font-medium transition-colors touch-manipulation ${
              viewMode === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <List className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`flex-1 px-3 py-3 sm:py-4 text-sm font-medium transition-colors touch-manipulation ${
              viewMode === 'detailed' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Grid className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      {/* Patient List */}
      <div className="relative space-y-3 sm:space-y-4">
        {sorted.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-white shadow-lg sm:p-8 rounded-xl">
            <Users className="w-10 h-10 mx-auto mb-4 text-gray-400 sm:w-12 sm:h-12" />
            <p className="text-base font-medium sm:text-lg">No patients found</p>
            <p className="text-sm">Add a new patient or adjust your search criteria</p>
          </div>
        ) : viewMode === 'detailed' ? (
          <div className="space-y-4 sm:space-y-6">
            {sorted.map((patient) => (
              <PatientDetailCard
                key={patient.id}
                patient={patient}
                onStatusChange={updatePatientStatus}
                onViewDetails={setSelectedPatient}
                onDelete={deletePatient}
                onEditPatient={handleEditPatient}
                onOpenNotesModal={openNotesModal}
                onUpdatePatient={updatePatient}
                highlightRef={highlightPatient === patient.name ? highlightRef : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header row for list view */}
            <div className="flex items-center gap-4 p-3 text-xs font-medium text-gray-500 bg-gray-100 rounded-lg">
              <span className="min-w-[20px]">#</span>
              <span className="min-w-[120px]">Patient Name</span>
              <span className="min-w-[60px]">Age</span>
              <span className="min-w-[20px]">Sex</span>
              <span className="min-w-[150px]">Procedure</span>
              <span className="min-w-[100px]">Comorbidities</span>
              <span className="min-w-[120px]">Allergies</span>
              <span className="min-w-[100px]">Contact</span>
              <span className="ml-auto">Priority</span>
            </div>
            
            {sorted.map((patient, index) => (
              <LinearPatientCard
                key={patient.id}
                patient={patient}
                index={index}
                isExpanded={expandedPatients.has(patient.id)}
                onToggleExpand={() => togglePatientExpansion(patient.id)}
                onStatusChange={updatePatientStatus}
                onDelete={deletePatient}
                onEditPatient={handleEditPatient}
                onOpenNotesModal={openNotesModal}
                onUpdatePatient={updatePatient}
              />
            ))}
          </div>
        )}
      </div>

      {/* Patient Modal */}
      <PatientModal
        isOpen={showAddPatient}
        onClose={() => {
          setShowAddPatient(false);
          setEditingPatient(null);
        }}
        onSave={editingPatient ? editPatient : addNewPatient}
        editingPatient={editingPatient}
      />

      {/* Notes Modal */}
      {showNotesModal && currentPatientForNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-xl rounded-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Manage Notes - {currentPatientForNotes.name}
                </h3>
                <button
                  onClick={() => {
                    setShowNotesModal(false);
                    setCurrentPatientForNotes(null);
                    setNewNote('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Existing Notes */}
              <div className="mb-6">
                <h4 className="mb-3 text-lg font-semibold text-gray-800">Current Notes:</h4>
                <div className="space-y-2">
                  {currentPatientForNotes.notes && currentPatientForNotes.notes.length > 0 ? (
                    currentPatientForNotes.notes.map((note: string, index: number) => (
                      <div key={index} className="flex items-start justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <span className="flex-1 text-sm text-gray-700">• {note}</span>
                        <button
                          onClick={() => removeNote(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                          title="Remove note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm italic text-gray-500">No notes available</p>
                  )}
                </div>
              </div>

              {/* Add New Note */}
              <div className="mb-6">
                <h4 className="mb-3 text-lg font-semibold text-gray-800">Add New Note:</h4>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter new note..."
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowNotesModal(false);
                    setCurrentPatientForNotes(null);
                    setNewNote('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
                <button
                  onClick={addNote}
                  disabled={!newNote.trim()}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-xl rounded-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Complete Patient Details</h3>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">Patient Information</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Full Name</span>
                      <span className="text-gray-800">{selectedPatient.name}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="block mb-1 text-sm font-medium text-gray-600">Age</span>
                        <span className="text-gray-800">{selectedPatient.age} years</span>
                      </div>
                      <div>
                        <span className="block mb-1 text-sm font-medium text-gray-600">Gender</span>
                        <span className="text-gray-800">{selectedPatient.gender}</span>
                      </div>
                      <div>
                        <span className="block mb-1 text-sm font-medium text-gray-600">MRN</span>
                        <span className="text-gray-800">{selectedPatient.mrn}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Contact Number</span>
                      <span className="text-gray-800">{selectedPatient.contactNumber || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Diagnosis</span>
                      <span className="text-gray-800">{selectedPatient.diagnosis}</span>
                    </div>
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Selected Allergies</span>
                      {selectedPatient.selectedAllergies && selectedPatient.selectedAllergies.length > 0 ? (
                        <div className="space-y-1">
                          {selectedPatient.selectedAllergies.map((allergy, index) => (
                            <div key={index} className="flex items-center gap-1 text-sm">
                              <Check className="w-3 h-3 text-green-600" />
                              <span className="text-gray-700">{allergy}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-800">NKDA (No Known Drug Allergies)</span>
                      )}
                    </div>
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Selected Comorbidities</span>
                      {selectedPatient.selectedComorbidities && selectedPatient.selectedComorbidities.length > 0 ? (
                        <div className="space-y-1">
                          {selectedPatient.selectedComorbidities.map((comorbidity, index) => (
                            <div key={index} className="flex items-center gap-1 text-sm">
                              <Check className="w-3 h-3 text-green-600" />
                              <span className="text-gray-700">{comorbidity}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-800">None reported</span>
                      )}
                    </div>
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Medical Aid Name</span>
                      <span className="text-gray-800">{selectedPatient.medicalAidName || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Medical Aid Number</span>
                      <span className="text-gray-800">{selectedPatient.medicalAidNumber || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">Medical Details</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Priority</span>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(selectedPatient.priority)}`}>
                        {selectedPatient.priority}
                      </span>
                    </div>
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Ward</span>
                      <span className="text-gray-800">{selectedPatient.ward}</span>
                    </div>
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Hospital</span>
                      <span className="text-gray-800">{selectedPatient.hospital}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block mb-1 text-sm font-medium text-gray-600">Height</span>
                        <span className="text-gray-800">{selectedPatient.height}</span>
                      </div>
                      <div>
                        <span className="block mb-1 text-sm font-medium text-gray-600">Weight</span>
                        <span className="text-gray-800">{selectedPatient.weight}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Operation/Procedure</span>
                      <span className="text-gray-800">{selectedPatient.operation}</span>
                    </div>
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Room</span>
                      <span className="text-gray-800">{selectedPatient.room || 'Not assigned'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedPatient.notes && selectedPatient.notes.length > 0 && (
                <div className="mt-6">
                  <h4 className="pb-2 mb-3 font-semibold text-gray-800">Latest Notes</h4>
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    {selectedPatient.notes.map((note: string, index: number) => (
                      <p key={index} className="text-gray-800">• {note}</p>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleEditPatient(selectedPatient);
                    setSelectedPatient(null);
                  }}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Edit3 className="inline w-4 h-4 mr-2" />
                  Edit Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Management Modal */}
      {currentPatientForFiles && (
        <FileManagementModal
          isOpen={showFileModal}
          onClose={() => {
            setShowFileModal(false);
            setCurrentPatientForFiles(null);
          }}
          patient={currentPatientForFiles}
        />
      )}
    </div>
  );
};

export default Patients;