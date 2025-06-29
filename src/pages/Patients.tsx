import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedPatient } from '../contexts/SelectedPatientContext';
import { uploadFileWithMetadata, getUploadsForItem } from '../firebase/storage';
import { addNotification } from '../firebase/notifications';
import localforage from 'localforage';
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
  Check,
  Play,
  Image,
  FileImage,
  Activity,
  Thermometer,
  Zap,
  CalendarClock
} from 'lucide-react';

// Vitals thresholds for auto-escalation
const vitalThresholds = {
  heartRate: { min: 60, max: 100 },
  systolicBP: { min: 90, max: 120 },
  diastolicBP: { min: 60, max: 80 },
  respiratoryRate: { min: 12, max: 20 },
  oxygenSaturation: { min: 95, max: 100 },
  temperature: { min: 36.1, max: 37.5 },
};

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
    // Enhanced vitals for auto-escalation
    heartRate?: number;
    systolicBP?: number;
    diastolicBP?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    temperature?: number;
    lastUpdated?: string;
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
  // Triage fields
  triageStatus?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  lastTriageUpdate?: string;
  abnormalVitals?: string[];
};

// Vitals evaluation function
const evaluateVitals = (vitals: ExtendedPatient['vitals']): {
  triageStatus: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  abnormalVitals: string[];
  criticalityScore: number;
} => {
  const abnormalVitals: string[] = [];
  let criticalityScore = 0;

  // Check heart rate
  if (vitals.heartRate) {
    if (vitals.heartRate < vitalThresholds.heartRate.min || vitals.heartRate > vitalThresholds.heartRate.max) {
      abnormalVitals.push('Heart Rate');
      criticalityScore += vitals.heartRate < 50 || vitals.heartRate > 120 ? 2 : 1;
    }
  }

  // Check blood pressure
  if (vitals.systolicBP && vitals.diastolicBP) {
    if (vitals.systolicBP < vitalThresholds.systolicBP.min || vitals.systolicBP > vitalThresholds.systolicBP.max) {
      abnormalVitals.push('Systolic BP');
      criticalityScore += vitals.systolicBP < 80 || vitals.systolicBP > 140 ? 2 : 1;
    }
    if (vitals.diastolicBP < vitalThresholds.diastolicBP.min || vitals.diastolicBP > vitalThresholds.diastolicBP.max) {
      abnormalVitals.push('Diastolic BP');
      criticalityScore += vitals.diastolicBP < 50 || vitals.diastolicBP > 90 ? 2 : 1;
    }
  }

  // Check respiratory rate
  if (vitals.respiratoryRate) {
    if (vitals.respiratoryRate < vitalThresholds.respiratoryRate.min || vitals.respiratoryRate > vitalThresholds.respiratoryRate.max) {
      abnormalVitals.push('Respiratory Rate');
      criticalityScore += vitals.respiratoryRate < 10 || vitals.respiratoryRate > 25 ? 2 : 1;
    }
  }

  // Check oxygen saturation
  if (vitals.oxygenSaturation) {
    if (vitals.oxygenSaturation < vitalThresholds.oxygenSaturation.min) {
      abnormalVitals.push('Oxygen Saturation');
      criticalityScore += vitals.oxygenSaturation < 90 ? 3 : 1;
    }
  }

  // Check temperature
  if (vitals.temperature) {
    if (vitals.temperature < vitalThresholds.temperature.min || vitals.temperature > vitalThresholds.temperature.max) {
      abnormalVitals.push('Temperature');
      criticalityScore += vitals.temperature < 35 || vitals.temperature > 39 ? 2 : 1;
    }
  }

  // Determine triage status
  let triageStatus: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  
  if (criticalityScore >= 5 || abnormalVitals.length >= 3) {
    triageStatus = 'CRITICAL';
  } else if (criticalityScore >= 3 || abnormalVitals.length >= 2) {
    triageStatus = 'HIGH';
  } else if (criticalityScore >= 1 || abnormalVitals.length >= 1) {
    triageStatus = 'MEDIUM';
  }

  return { triageStatus, abnormalVitals, criticalityScore };
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

// Enhanced initial patients with comprehensive medical data and real vitals
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
      rr: "24",
      // Enhanced vitals for auto-escalation
      heartRate: 110,
      systolicBP: 85,
      diastolicBP: 50,
      respiratoryRate: 24,
      oxygenSaturation: 92,
      temperature: 38.5,
      lastUpdated: new Date().toISOString()
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
    selectedComorbidities: ["Hypertension (High Blood Pressure)", "Diabetes"],
    triageStatus: 'CRITICAL',
    abnormalVitals: ['Heart Rate', 'Systolic BP', 'Diastolic BP', 'Oxygen Saturation', 'Temperature']
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
      rr: "18",
      // Enhanced vitals for auto-escalation
      heartRate: 88,
      systolicBP: 120,
      diastolicBP: 80,
      respiratoryRate: 18,
      oxygenSaturation: 98,
      temperature: 37.2,
      lastUpdated: new Date().toISOString()
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
    selectedComorbidities: [],
    triageStatus: 'MEDIUM',
    abnormalVitals: ['Temperature']
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
      rr: "16",
      // Enhanced vitals for auto-escalation
      heartRate: 72,
      systolicBP: 130,
      diastolicBP: 85,
      respiratoryRate: 16,
      oxygenSaturation: 99,
      temperature: 36.8,
      lastUpdated: new Date().toISOString()
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
    selectedComorbidities: ["Chronic Obstructive Pulmonary Disease (COPD)"],
    triageStatus: 'MEDIUM',
    abnormalVitals: ['Systolic BP', 'Diastolic BP']
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

// Triage status colors
const getTriageColor = (triageStatus?: string) => {
  switch (triageStatus) {
    case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200 animate-pulse';
    case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'LOW': return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getTriageBorderColor = (triageStatus?: string) => {
  switch (triageStatus) {
    case 'CRITICAL': return 'border-l-red-500';
    case 'HIGH': return 'border-l-orange-500';
    case 'MEDIUM': return 'border-l-yellow-500';
    case 'LOW': return 'border-l-green-500';
    default: return 'border-l-gray-500';
  }
};

// Get vital status for styling
const getVitalStatus = (vitalName: string, value?: number) => {
  if (value === undefined) return 'normal';
  
  switch (vitalName) {
    case 'heartRate':
      return (value < vitalThresholds.heartRate.min || value > vitalThresholds.heartRate.max) ? 'abnormal' : 'normal';
    case 'systolicBP':
      return (value < vitalThresholds.systolicBP.min || value > vitalThresholds.systolicBP.max) ? 'abnormal' : 'normal';
    case 'diastolicBP':
      return (value < vitalThresholds.diastolicBP.min || value > vitalThresholds.diastolicBP.max) ? 'abnormal' : 'normal';
    case 'respiratoryRate':
      return (value < vitalThresholds.respiratoryRate.min || value > vitalThresholds.respiratoryRate.max) ? 'abnormal' : 'normal';
    case 'oxygenSaturation':
      return (value < vitalThresholds.oxygenSaturation.min) ? 'abnormal' : 'normal';
    case 'temperature':
      return (value < vitalThresholds.temperature.min || value > vitalThresholds.temperature.max) ? 'abnormal' : 'normal';
    default:
      return 'normal';
  }
};

const getVitalColor = (status: string) => {
  return status === 'abnormal' ? 'bg-red-100 text-red-700 animate-pulse border-red-300' : 'bg-green-100 text-green-700 border-green-300';
};

// File preview component
const FilePreview = ({ file }: { file: any }) => {
  const getFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension || '')) return 'image';
    if (['mp4', 'mov', 'avi', 'wmv', 'flv'].includes(extension || '')) return 'video';
    if (['pdf'].includes(extension || '')) return 'pdf';
    return 'document';
  };

  const fileType = getFileType(file.fileName);

  switch (fileType) {
    case 'image':
      return (
        <div className="relative group">
          <img 
            src={file.fileURL} 
            alt={file.fileName}
            className="object-cover w-full h-32 rounded-lg"
          />
          <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100">
            <Eye className="w-6 h-6 text-white" />
          </div>
        </div>
      );
    case 'video':
      return (
        <div className="relative group">
          <video 
            src={file.fileURL}
            className="object-cover w-full h-32 rounded-lg"
            controls={false}
          />
          <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>
      );
    case 'pdf':
      return (
        <div className="flex items-center justify-center w-full h-32 bg-red-100 rounded-lg">
          <div className="text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <p className="text-xs text-red-600">PDF Document</p>
          </div>
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center w-full h-32 bg-blue-100 rounded-lg">
          <div className="text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-xs text-blue-600">Document</p>
          </div>
        </div>
      );
  }
};

// Enhanced File Upload/Download/View Modal Component - UNLIMITED UPLOADS + VIEW FUNCTIONALITY
const FileManagementModal = ({ 
  isOpen, 
  onClose, 
  patient,
  fileType = 'documents' // 'documents' or 'consent'
}: {
  isOpen: boolean;
  onClose: () => void;
  patient: ExtendedPatient;
  fileType?: 'documents' | 'consent';
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [patientFiles, setPatientFiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'view' | 'download'>('view');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && patient.id) {
      loadPatientFiles();
    }
  }, [isOpen, patient.id]);

  const loadPatientFiles = async () => {
    try {
      const context = fileType === 'consent' ? 'consent-forms' : 'patients';
      const uploads = await getUploadsForItem(context, patient.id.toString());
      setPatientFiles(uploads);
    } catch (error) {
      console.error('Error loading patient files:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      // REMOVED LIMIT: Now allows unlimited files for both document types
      setFiles(selectedFiles);
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
        const context = fileType === 'consent' ? 'consent-forms' : 'patients';
        await uploadFileWithMetadata(
          file,
          patient.id.toString(),
          'default-business-id',
          'healthcare-provider',
          context,
          'current-user-id',
          'Current User'
        );
      }
      const fileTypeText = fileType === 'consent' ? 'Consent forms' : 'Files';
      alert(`${fileTypeText} uploaded successfully!`);
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

  const handlePreview = (file: any) => {
    setSelectedFile(file);
    setShowPreviewModal(true);
  };

  const openFileInNewTab = (fileURL: string) => {
    window.open(fileURL, '_blank');
  };

  if (!isOpen) return null;

  const modalTitle = fileType === 'consent' ? 'Documents & Consent Forms' : 'Images/Videos';
  const uploadText = fileType === 'consent' ? 'Upload Documents & Consent Forms' : 'Upload Images/Videos';
  const viewText = fileType === 'consent' ? 'View Documents & Consent Forms' : 'View Images/Videos';
  const downloadText = fileType === 'consent' ? 'Download Documents & Consent Forms' : 'Download Images/Videos';
  const acceptTypes = fileType === 'consent' ? '.pdf,.doc,.docx' : '.pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mov,.avi';
  const uploadDescription = fileType === 'consent' ? 'PDF documents and consent forms (unlimited)' : 'Images, videos, and documents (unlimited)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {modalTitle} - {patient.name}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Enhanced Tab Navigation - WITH VIEW TAB */}
          <div className="flex p-1 mb-6 bg-gray-100 rounded-lg">
            <button
              onClick={() => setActiveTab('view')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'view'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="inline w-4 h-4 mr-2" />
              {viewText}
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload className="inline w-4 h-4 mr-2" />
              {uploadText}
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
              {downloadText}
            </button>
          </div>

          {/* View Tab - NEW FEATURE FOR DOCUMENT VIEWING */}
          {activeTab === 'view' && (
            <div className="space-y-4">
              {patientFiles.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {patientFiles.map((file, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div 
                        className="mb-3 cursor-pointer"
                        onClick={() => handlePreview(file)}
                      >
                        <FilePreview file={file} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-800 truncate" title={file.fileName}>
                          {file.fileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Uploaded {file.uploadedAt?.toDate?.()?.toLocaleDateString?.() || 'Recently'}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openFileInNewTab(file.fileURL)}
                            className="flex-1 px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
                          >
                            <Eye className="inline w-3 h-3 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleDownload(file.fileURL, file.fileName)}
                            className="flex-1 px-2 py-1 text-xs text-green-600 bg-green-100 rounded hover:bg-green-200"
                          >
                            <Download className="inline w-3 h-3 mr-1" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="mb-4">
                    {fileType === 'consent' ? (
                      <FileText className="w-16 h-16 mx-auto text-gray-400" />
                    ) : (
                      <Image className="w-16 h-16 mx-auto text-gray-400" />
                    )}
                  </div>
                  <p className="mb-2 text-lg font-medium text-gray-600">No files uploaded yet</p>
                  <p className="mb-4 text-gray-500">
                    {fileType === 'consent' 
                      ? 'Upload documents and consent forms to view them here' 
                      : 'Upload images and videos to view them here'
                    }
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-4 py-2 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200"
                  >
                    <Upload className="inline w-4 h-4 mr-2" />
                    Upload Files
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Upload Tab - UNLIMITED UPLOADS */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="p-6 text-center border-2 border-gray-300 border-dashed rounded-lg">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple // REMOVED LIMIT: Now always allows multiple files
                  accept={acceptTypes}
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="mb-2 text-lg font-medium text-gray-900">
                    {fileType === 'consent' ? 'Upload Documents & Consent Forms' : 'Upload Images/Videos'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {uploadDescription}
                  </p>
                </label>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">Selected Files ({files.length}):</h4>
                  <div className="space-y-2 overflow-y-auto max-h-32">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-50">
                        <div className="flex items-center gap-2">
                          <div className="text-lg">
                            {file.type.startsWith('image/') ? '🖼️' : 
                             file.type.startsWith('video/') ? '🎥' : 
                             file.type === 'application/pdf' ? '📄' : '📁'}
                          </div>
                          <span className="text-sm text-gray-700">{file.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? `Uploading ${files.length} files...` : `Upload ${files.length} Files`}
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
                  <h4 className="font-medium text-gray-800">Patient Files ({patientFiles.length}):</h4>
                  <div className="space-y-2 overflow-y-auto max-h-64">
                    {patientFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="text-xl">
                            {file.fileName.toLowerCase().includes('.pdf') ? '📄' :
                             file.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i) ? '🖼️' :
                             file.fileName.toLowerCase().match(/\.(mp4|mov|avi)$/i) ? '🎥' : '📁'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{file.fileName}</p>
                            <p className="text-xs text-gray-500">
                              Uploaded {file.uploadedAt?.toDate?.()?.toLocaleDateString?.() || 'Recently'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openFileInNewTab(file.fileURL)}
                            className="px-3 py-1 text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(file.fileURL, file.fileName)}
                            className="px-3 py-1 text-green-600 bg-green-100 rounded hover:bg-green-200"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
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

      {/* File Preview Modal */}
      {showPreviewModal && selectedFile && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-75 z-60">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">{selectedFile.fileName}</h3>
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-auto">
              {selectedFile.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp)$/i) ? (
                <img 
                  src={selectedFile.fileURL} 
                  alt={selectedFile.fileName}
                  className="h-auto max-w-full mx-auto"
                />
              ) : selectedFile.fileName.toLowerCase().match(/\.(mp4|mov|avi|wmv)$/i) ? (
                <video 
                  src={selectedFile.fileURL}
                  controls
                  className="h-auto max-w-full mx-auto"
                />
              ) : selectedFile.fileName.toLowerCase().includes('.pdf') ? (
                <iframe
                  src={selectedFile.fileURL}
                  className="w-full h-96"
                  title={selectedFile.fileName}
                />
              ) : (
                <div className="py-12 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Cannot preview this file type</p>
                  <button
                    onClick={() => openFileInNewTab(selectedFile.fileURL)}
                    className="px-4 py-2 mt-4 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200"
                  >
                    Open in New Tab
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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

// Enhanced Triage Status Dropdown Component with Auto-Escalation
const TriageStatusDropdown = ({ 
  currentTriageStatus, 
  onTriageChange, 
  patientId,
  patient,
  inline = false
}: {
  currentTriageStatus?: string;
  onTriageChange: (patientId: number, newStatus: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') => void;
  patientId: number;
  patient: ExtendedPatient;
  inline?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const statuses = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  
  const getTriageColor = (status?: string) => {
    switch (status) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200 animate-pulse';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
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
    ? `px-2 py-1 ml-1 sm:ml-2 text-xs font-medium rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 border ${getTriageColor(currentTriageStatus)} inline-flex items-center gap-1 touch-manipulation`
    : `px-2 sm:px-3 py-1 text-xs font-medium rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 border ${getTriageColor(currentTriageStatus)} flex items-center gap-1 touch-manipulation`;

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
        <span className="text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-none">
          {currentTriageStatus || 'LOW'}
        </span>
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
            className="absolute right-0 w-32 mt-1 overflow-y-auto bg-white border-2 border-gray-300 rounded-lg shadow-2xl sm:w-36 max-h-48"
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
                  onTriageChange(patientId, status as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW');
                  setIsOpen(false);
                }}
                className={`block w-full px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm hover:bg-gray-100 transition-colors touch-manipulation ${
                  status === currentTriageStatus ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
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

// Add/Edit Patient Modal - ENHANCED WITH UNLIMITED FILE UPLOADS
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
    vitals: { 
      bp: '', 
      hr: '', 
      temp: '', 
      spo2: '', 
      rr: '',
      heartRate: undefined,
      systolicBP: undefined,
      diastolicBP: undefined,
      respiratoryRate: undefined,
      oxygenSaturation: undefined,
      temperature: undefined
    },
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
    selectedComorbidities: [],
    triageStatus: 'LOW'
  });

  // Add modal states for allergies and comorbidities
  const [showAllergiesModal, setShowAllergiesModal] = useState(false);
  const [showComorbiditiesModal, setShowComorbiditiesModal] = useState(false);
  
  // FILE MANAGEMENT STATES FOR ADD PATIENT FORM - UNLIMITED UPLOADS
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

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
        vitals: { 
          bp: '', 
          hr: '', 
          temp: '', 
          spo2: '', 
          rr: '',
          heartRate: undefined,
          systolicBP: undefined,
          diastolicBP: undefined,
          respiratoryRate: undefined,
          oxygenSaturation: undefined,
          temperature: undefined
        },
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
        selectedComorbidities: [],
        triageStatus: 'LOW'
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
{/* Row 3: Height, Weight, BMI */} 
<div className="grid grid-cols-1 gap-3 mt-2 sm:grid-cols-3">
  {/* Height */}
  <input
    type="number"
    placeholder="Height (cm)"
    value={formData.height}
    onChange={(e) => handleInputChange('height', e.target.value)}
    className="w-full p-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
  />

  {/* Weight */}
  <input
    type="number"
    placeholder="Weight (kg)"
    value={formData.weight}
    onChange={(e) => handleInputChange('weight', e.target.value)}
    className="w-full p-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
  />

  {/* BMI (calculated) */}
  <input
    type="text"
    placeholder="BMI (auto)"
    value={
      formData.height && formData.weight
        ? (
            parseFloat(formData.height) > 0 && parseFloat(formData.weight) > 0
              ? (
                  parseFloat(formData.weight) /
                  Math.pow(parseFloat(formData.height) / 100, 2)
                ).toFixed(1)
              : ''
          )
        : ''
    }
    readOnly
    className="w-full p-3 text-base text-gray-600 bg-gray-100 border border-gray-300 cursor-not-allowed rounded-xl"
  />
</div>
            

            {/* Row 4: Hospital/Medical Center - Full Width */}
            <input
              type="text"
              placeholder="Central Medical Center"
              value={formData.hospital}
              onChange={(e) => handleInputChange('hospital', e.target.value)}
              className="w-full p-3 text-base border border-gray-300 sm:p-4 sm:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
{/* Row 5: Diagnosis - Full Width */}
            <input
              type="text"
              placeholder="Diagnosis"
              value={formData.diagnosis}
              onChange={(e) => handleInputChange('diagnosis', e.target.value)}
              className="w-full p-3 text-base border border-gray-300 sm:p-4 sm:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* Row 6: Procedure/Operation - Full Width */}
            <input
              type="text"
              placeholder="Procedure/Operation (e.g., Laparoscopic Appendectomy) *"
              value={formData.operation}
              onChange={(e) => handleInputChange('operation', e.target.value)}
              className="w-full p-3 text-base border border-gray-300 sm:p-4 sm:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

         {/* Row 6: Ward Only (Priority Removed – Triage is Auto) */}
<div className="grid grid-cols-1 gap-3 sm:gap-4">
  <input
    type="text"
    placeholder="Ward"
    value={formData.ward}
    onChange={(e) => handleInputChange('ward', e.target.value)}
    className="w-full p-3 text-base border border-gray-300 sm:p-4 sm:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>

            {/* Row 8: Date, Time, Room */}
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

            {/* Row 9: Medical Aid Info */}
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


            {/* Row 10: Allergies and Comorbidities - CLICKABLE BUTTONS */}
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

           

            {/* Row 11: Enhanced File Management Buttons - UNLIMITED UPLOADS */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
              {/* Images/Videos Management - UNLIMITED UPLOADS */}
              <button
                type="button"
                onClick={() => setShowDocumentsModal(true)}
                className="w-full p-3 text-left transition-colors border-2 border-blue-300 rounded-xl bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <label className="text-sm font-medium text-blue-700">
                    Images/Videos
                  </label>
                </div>
                <p className="text-xs text-blue-600">Upload, view & download unlimited patient media files</p>
              </button>

              {/* Documents & Consent Forms - UNLIMITED UPLOADS */}
              <button
                type="button"
                onClick={() => setShowConsentModal(true)}
                className="w-full p-3 text-left transition-colors border-2 border-green-300 rounded-xl bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <label className="text-sm font-medium text-green-700">
                    Documents & Consent Forms
                  </label>
                </div>
                <p className="text-xs text-green-600">Manage unlimited PDF documents and consent forms</p>
              </button>
            </div>


 {/* Row 12: Special Instructions - Full Width */}
            <textarea
              placeholder="Special Instructions (e.g., TO BE DONE LAST, HIGH PRIORITY from Mayo Clinic ICU)"
              value={formData.notes ? formData.notes.join('\n') : ''}
              onChange={(e) => handleInputChange('notes', e.target.value.split('\n'))}
              className="w-full h-24 p-3 text-base border border-gray-300 resize-none sm:h-32 sm:p-4 sm:text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
{/* Action Note - Displayed before Submit */}
<div className="p-4 mt-4 text-sm text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-xl">
  <strong className="block mb-1 font-semibold">Please Note:</strong>
  The following actions can be performed <span className="font-semibold">only after adding the patient</span>:
  <ul className="mt-2 space-y-1 text-yellow-900 list-disc list-inside">
    <li>Referring Patient</li>
    <li>Booking Appointments</li>
    <li>Booking Consultations</li>
    <li>Adding / Removing Prescriptions</li>
    <li>Booking Operations / Procedures</li>
    <li>Ordering Diagnostics & Viewing Results</li>
  </ul>
</div>

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

          {/* Documents Management Modal - UNLIMITED UPLOADS */}
          {showDocumentsModal && (
            <FileManagementModal
              isOpen={showDocumentsModal}
              onClose={() => setShowDocumentsModal(false)}
              patient={formData}
              fileType="documents"
            />
          )}

          {/* Consent Forms Management Modal - UNLIMITED UPLOADS */}
          {showConsentModal && (
            <FileManagementModal
              isOpen={showConsentModal}
              onClose={() => setShowConsentModal(false)}
              patient={formData}
              fileType="consent"
            />
          )}
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
  onUpdatePatient,
  onManageDocuments,
  onManageConsent,
  onTriageChange
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
  onManageDocuments: (patient: ExtendedPatient) => void;
  onManageConsent: (patient: ExtendedPatient) => void;
  onTriageChange: (patientId: number, newStatus: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') => void;
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
          <TriageStatusDropdown
            currentTriageStatus={patient.triageStatus}
            onTriageChange={onTriageChange}
            patientId={patient.id}
            patient={patient}
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
            onManageDocuments={onManageDocuments}
            onManageConsent={onManageConsent}
            onTriageChange={onTriageChange}
          />
        </div>
      )}
    </div>
  );
};

// Enhanced Patient Detail Card Component with Vitals Auto-Escalation
const PatientDetailCard = ({ 
  patient, 
  onStatusChange, 
  onViewDetails,
  onDelete,
  onEditPatient,
  onOpenNotesModal,
  onUpdatePatient,
  highlightRef,
  onManageDocuments,
  onManageConsent,
  onTriageChange
}: {
  patient: ExtendedPatient;
  onStatusChange: (patientId: number, newStatus: string) => void;
  onViewDetails: (patient: ExtendedPatient) => void;
  onDelete: (id: number) => void;
  onEditPatient: (patient: ExtendedPatient) => void;
  onOpenNotesModal: (patient: ExtendedPatient) => void;
  onUpdatePatient: (patientId: number, updates: Partial<ExtendedPatient>) => void;
  highlightRef?: React.RefObject<HTMLDivElement | null>;
  onManageDocuments: (patient: ExtendedPatient) => void;
  onManageConsent: (patient: ExtendedPatient) => void;
  onTriageChange: (patientId: number, newStatus: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') => void;
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
  const [vitalsForm, setVitalsForm] = useState(patient.vitals || { 
    bp: '', hr: '', temp: '', spo2: '', rr: '',
    heartRate: undefined,
    systolicBP: undefined,
    diastolicBP: undefined,
    respiratoryRate: undefined,
    oxygenSaturation: undefined,
    temperature: undefined
  });
  const [newPrescription, setNewPrescription] = useState('');
  const [newInvestigation, setNewInvestigation] = useState({ type: '', date: '', status: 'Pending' });

  // Auto-escalation effect for vitals monitoring
  useEffect(() => {
    if (patient.vitals) {
      const evaluation = evaluateVitals(patient.vitals);
      
      // Update triage status if it has changed
      if (evaluation.triageStatus !== patient.triageStatus) {
        onTriageChange(patient.id, evaluation.triageStatus);
        
        // Generate notification for critical/high status
        if (['CRITICAL', 'HIGH'].includes(evaluation.triageStatus)) {
          try {
            addNotification({
              userId: 'current-user-id',
              title: `🚨 ${evaluation.triageStatus} Alert - ${patient.name}`,
              body: `Patient vitals indicate ${evaluation.triageStatus.toLowerCase()} condition. Abnormal vitals: ${evaluation.abnormalVitals.join(', ')}`
            }, {
              metaType: 'vitals-alert',
              role: 'healthcare-provider'
            }).catch(console.error);
          } catch (error) {
            console.error('Failed to send notification:', error);
          }
        }
      }
    }
  }, [patient.vitals, patient.triageStatus, patient.id, patient.name, onTriageChange]);

  // CONNECTED BUTTON HANDLERS:

  const handleOrderBloods = (patient: ExtendedPatient) => {
    setPatient({
      id: patient.id.toString(),
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      mrn: patient.mrn,
      contactNumber: patient.contactNumber,
      diagnosis: patient.diagnosis
    });
    
    setPendingAction('order-bloods');
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
    // Parse BP values
    if (vitalsForm.bp) {
      const bpParts = vitalsForm.bp.split('/');
      if (bpParts.length === 2) {
        vitalsForm.systolicBP = parseInt(bpParts[0]);
        vitalsForm.diastolicBP = parseInt(bpParts[1]);
      }
    }

    // Parse other vitals
    if (vitalsForm.hr) vitalsForm.heartRate = parseInt(vitalsForm.hr);
    if (vitalsForm.rr) vitalsForm.respiratoryRate = parseInt(vitalsForm.rr);
    if (vitalsForm.spo2) vitalsForm.oxygenSaturation = parseInt(vitalsForm.spo2.replace('%', ''));
    if (vitalsForm.temp) vitalsForm.temperature = parseFloat(vitalsForm.temp.replace('°C', ''));

    vitalsForm.lastUpdated = new Date().toISOString();

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
      className={`bg-white rounded-lg shadow-lg border-l-4 ${getTriageBorderColor(patient.triageStatus)} overflow-hidden`}
    >
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header - REMOVED TriageStatusDropdown from next to patient name */}
        <div className="flex flex-col items-start justify-between gap-3 mb-4 sm:flex-row sm:gap-4">
          <div className="flex items-center flex-1 gap-3">
            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full sm:w-12 sm:h-12">
              <User className="w-5 h-5 text-gray-600 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-gray-800 truncate sm:text-lg">{patient.name}</h3>
                {/* REMOVED: TriageStatusDropdown from here per instructions */}
              </div>
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
                    <span className="font-medium">Hospital:</span> {patient.hospital}
                  </div>
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

          {/* Center Column - Operation, Allergies, Comorbidities, Enhanced Vitals */}
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

            {/* Structured Allergies Section */}
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

            {/* Structured Comorbidities Section */}
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

            {/* Enhanced Vitals with Auto-Escalation Styling */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Real-time Vitals</h4>
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
                      placeholder="BP (e.g., 120/80)"
                      className="p-2 text-xs border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={vitalsForm.hr}
                      onChange={(e) => setVitalsForm(prev => ({ ...prev, hr: e.target.value }))}
                      placeholder="HR (e.g., 72)"
                      className="p-2 text-xs border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={vitalsForm.temp}
                      onChange={(e) => setVitalsForm(prev => ({ ...prev, temp: e.target.value }))}
                      placeholder="TEMP (e.g., 36.8°C)"
                      className="p-2 text-xs border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={vitalsForm.spo2}
                      onChange={(e) => setVitalsForm(prev => ({ ...prev, spo2: e.target.value }))}
                      placeholder="SPO2 (e.g., 98%)"
                      className="p-2 text-xs border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={vitalsForm.rr}
                      onChange={(e) => setVitalsForm(prev => ({ ...prev, rr: e.target.value }))}
                      placeholder="RR (e.g., 16)"
                      className="col-span-2 p-2 text-xs border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveVitals} className="px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700">
                      Save & Auto-Assess
                    </button>
                    <button onClick={() => setEditingVitals(false)} className="px-2 py-1 text-xs text-white bg-gray-600 rounded hover:bg-gray-700">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className={`p-3 text-center rounded-lg border-2 ${getVitalColor(getVitalStatus('systolicBP', patient.vitals?.systolicBP))}`}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Heart className="w-3 h-3" />
                      <div className="text-xs font-medium text-gray-600">BP</div>
                    </div>
                    <div className="text-lg font-bold">{patient.vitals?.bp || '85/50'}</div>
                    {getVitalStatus('systolicBP', patient.vitals?.systolicBP) === 'abnormal' && (
                      <div className="text-xs font-medium text-red-600">⚠️ ABNORMAL</div>
                    )}
                  </div>
                  <div className={`p-3 text-center rounded-lg border-2 ${getVitalColor(getVitalStatus('heartRate', patient.vitals?.heartRate))}`}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Activity className="w-3 h-3" />
                      <div className="text-xs font-medium text-gray-600">HR</div>
                    </div>
                    <div className="text-lg font-bold">{patient.vitals?.hr || '110'}</div>
                    {getVitalStatus('heartRate', patient.vitals?.heartRate) === 'abnormal' && (
                      <div className="text-xs font-medium text-red-600">⚠️ ABNORMAL</div>
                    )}
                  </div>
                  <div className={`p-3 text-center rounded-lg border-2 ${getVitalColor(getVitalStatus('temperature', patient.vitals?.temperature))}`}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Thermometer className="w-3 h-3" />
                      <div className="text-xs font-medium text-gray-600">TEMP</div>
                    </div>
                    <div className="text-lg font-bold">{patient.vitals?.temp || '38.5°C'}</div>
                    {getVitalStatus('temperature', patient.vitals?.temperature) === 'abnormal' && (
                      <div className="text-xs font-medium text-red-600">⚠️ ABNORMAL</div>
                    )}
                  </div>
                  <div className={`p-3 text-center rounded-lg border-2 ${getVitalColor(getVitalStatus('oxygenSaturation', patient.vitals?.oxygenSaturation))}`}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Zap className="w-3 h-3" />
                      <div className="text-xs font-medium text-gray-600">SPO2</div>
                    </div>
                    <div className="text-lg font-bold">{patient.vitals?.spo2 || '92%'}</div>
                    {getVitalStatus('oxygenSaturation', patient.vitals?.oxygenSaturation) === 'abnormal' && (
                      <div className="text-xs font-medium text-red-600">⚠️ ABNORMAL</div>
                    )}
                  </div>
                  <div className={`col-span-2 p-3 text-center rounded-lg border-2 ${getVitalColor(getVitalStatus('respiratoryRate', patient.vitals?.respiratoryRate))}`}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Activity className="w-3 h-3" />
                      <div className="text-xs font-medium text-gray-600">RR</div>
                    </div>
                    <div className="text-lg font-bold">{patient.vitals?.rr || '24'}</div>
                    {getVitalStatus('respiratoryRate', patient.vitals?.respiratoryRate) === 'abnormal' && (
                      <div className="text-xs font-medium text-red-600">⚠️ ABNORMAL</div>
                    )}
                  </div>
                </div>
              )}
              {patient.vitals?.lastUpdated && (
                <div className="mt-2 text-xs text-center text-gray-500">
                  Last updated: {new Date(patient.vitals.lastUpdated).toLocaleString()}
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

                {/* Row 3: Enhanced File Management Buttons - UNLIMITED UPLOADS */}
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => onManageDocuments(patient)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-xs">Images/Videos</span>
                  </button>
                  <button 
                    onClick={() => onManageConsent(patient)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 bg-green-100 rounded-lg hover:bg-green-200"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-xs">Documents & Consent Forms</span>
                  </button>
                </div>

                {/* Row 4: Refer Patient (full width) - CONNECTED BUTTON */}
                {/* Middle row: Escalate + Refer Patient */}
<div className="grid grid-cols-2 gap-2 mt-2">
  <button
    onClick={() => {
      setPatient({
        id: patient.id.toString(),
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        mrn: patient.mrn,
        contactNumber: patient.contactNumber,
        diagnosis: patient.diagnosis
      });
      setPendingAction('escalate');
      navigate('/alerts');
    }}
    className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-100 rounded-lg hover:bg-red-200"
  >
    <AlertTriangle className="w-4 h-4" />
    Escalate
  </button>

  <button
    onClick={() => handleReferPatient(patient)}
    className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-100 rounded-lg hover:bg-red-200"
  >
    <User className="w-4 h-4" />
    Refer Patient
  </button>
</div>
{/* Bottom row: Full width Discharge */}
<div className="mt-2">
  <button
    onClick={() => {
      setPatient({
        id: patient.id.toString(),
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        mrn: patient.mrn,
        contactNumber: patient.contactNumber,
        diagnosis: patient.diagnosis
      });
      setPendingAction('discharge');
      navigate('/tasks');
    }}
    className="flex items-center justify-center w-full gap-2 px-3 py-2 text-sm text-yellow-600 bg-yellow-100 rounded-lg hover:bg-yellow-200"
  >
    <User className="w-4 h-4" />
    Discharge
  </button>

              </div>
            </div>
                <button
    onClick={() => {
      setPatient({
        id: patient.id.toString(),
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        mrn: patient.mrn,
        contactNumber: patient.contactNumber,
        diagnosis: patient.diagnosis
      });
      setPendingAction('consultation');
      navigate('/consultations');
    }}
    className="flex items-center justify-center w-full gap-2 px-3 py-2 text-sm text-purple-600 bg-purple-100 rounded-lg hover:bg-purple-200"
  >
    <Stethoscope className="w-4 h-4" />
    Book Consultation
  </button>

  <button
    onClick={() => {
      setPatient({
        id: patient.id.toString(),
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        mrn: patient.mrn,
        contactNumber: patient.contactNumber,
        diagnosis: patient.diagnosis
      });
      setPendingAction('appointment');
      navigate('/appointments');
    }}
    className="flex items-center justify-center w-full gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200"
  >
    <CalendarClock className="w-4 h-4" />
    Book Appointment
  </button>
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

// Load patients from storage with LocalForage fallback
const loadPatientsFromStorage = async (): Promise<ExtendedPatient[]> => {
  try {
    const storedPatients = await localforage.getItem<ExtendedPatient[]>('patients_data');
    if (storedPatients && Array.isArray(storedPatients)) {
      return storedPatients;
    }
  } catch (error) {
    console.warn('Failed to load from LocalForage:', error);
  }
  
  return initialPatients;
};

// Save patients to storage with LocalForage
const savePatientsToStorage = async (patients: ExtendedPatient[]) => {
  try {
    await localforage.setItem('patients_data', patients);
    console.log('Patients saved to LocalForage');
  } catch (error) {
    console.error('Failed to save to LocalForage:', error);
  }
};

// Enhanced Main Component with Vitals-to-Triage Auto-Escalation
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
  const [viewMode, setViewMode] = useState<'list' | 'detailed'>('list');
  const [selectedPatient, setSelectedPatient] = useState<ExtendedPatient | null>(null);
  const [editingPatient, setEditingPatient] = useState<ExtendedPatient | null>(null);
  const [showNotesModal, setShowNotesModal] = useState<boolean>(false);
  const [currentPatientForNotes, setCurrentPatientForNotes] = useState<ExtendedPatient | null>(null);
  const [newNote, setNewNote] = useState<string>('');
  const [expandedPatients, setExpandedPatients] = useState<Set<number>>(new Set());

  // FILE MANAGEMENT STATE
  const [showFileModal, setShowFileModal] = useState(false);
  const [currentPatientForFiles, setCurrentPatientForFiles] = useState<ExtendedPatient | null>(null);
  const [currentFileType, setCurrentFileType] = useState<'documents' | 'consent'>('documents');

  // Load patients from storage on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      const savedPatients = await loadPatientsFromStorage();
      setPatients(savedPatients);
    };
    loadInitialData();
  }, []);

  // Save patients to storage whenever patients change
  useEffect(() => {
    if (patients.length > 0) {
      savePatientsToStorage(patients);
    }
  }, [patients]);

  // Real-time vitals monitoring and auto-escalation
  useEffect(() => {
    const interval = setInterval(async () => {
      setPatients(prevPatients => {
        return prevPatients.map(patient => {
          if (patient.vitals && patient.vitals.lastUpdated) {
            const evaluation = evaluateVitals(patient.vitals);
            
            // Auto-update triage status if needed
            if (evaluation.triageStatus !== patient.triageStatus) {
              // Generate critical alert if needed
              if (['CRITICAL', 'HIGH'].includes(evaluation.triageStatus)) {
                try {
                  addNotification({
                    userId: 'current-user-id',
                    title: `🚨 Auto-Escalated: ${patient.name}`,
                    body: `Vitals indicate ${evaluation.triageStatus.toLowerCase()} condition. Abnormal: ${evaluation.abnormalVitals.join(', ')}`
                  }, {
                    metaType: 'auto-escalation',
                    role: 'healthcare-provider'
                  }).catch(console.error);
                } catch (error) {
                  console.error('Failed to send notification:', error);
                }
              }

              return {
                ...patient,
                triageStatus: evaluation.triageStatus,
                abnormalVitals: evaluation.abnormalVitals,
                lastTriageUpdate: new Date().toISOString()
              };
            }
          }
          return patient;
        });
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // CONNECTED BUTTON HANDLERS:

  const handleOrderBloods = (patient: ExtendedPatient) => {
    setPatient({
      id: patient.id.toString(),
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      mrn: patient.mrn,
      contactNumber: patient.contactNumber,
      diagnosis: patient.diagnosis
    });
    
    setPendingAction('order-bloods');
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

  const handleManageDocuments = (patient: ExtendedPatient) => {
    setCurrentPatientForFiles(patient);
    setCurrentFileType('documents');
    setShowFileModal(true);
  };

  const handleManageConsent = (patient: ExtendedPatient) => {
    setCurrentPatientForFiles(patient);
    setCurrentFileType('consent');
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

  const updatePatientTriageStatus = (patientId: number, newTriageStatus: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') => {
    const updatedPatients = patients.map(p => 
      p.id === patientId ? { 
        ...p, 
        triageStatus: newTriageStatus,
        lastTriageUpdate: new Date().toISOString()
      } : p
    );
    setPatients(updatedPatients);

    // Generate notification for manual triage changes
    if (['CRITICAL', 'HIGH'].includes(newTriageStatus)) {
      const patient = patients.find(p => p.id === patientId);
      if (patient) {
        try {
          addNotification({
            userId: 'current-user-id',
            title: `🏥 Triage Updated: ${patient.name}`,
            body: `Patient triage status manually updated to ${newTriageStatus.toLowerCase()}`
          }, {
            metaType: 'triage-update',
            role: 'healthcare-provider'
          }).catch(console.error);
        } catch (error) {
          console.error('Failed to send notification:', error);
        }
      }
    }
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
      id: Math.max(...patients.map(p => p.id), 0) + 1,
      triageStatus: 'LOW',
      lastTriageUpdate: new Date().toISOString()
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

  // Enhanced sorting with triage priority
  const sorted = [...filtered].sort((a, b) => {
    let valA: any, valB: any;
    
    switch (sortBy) {
      case 'triage':
        const triageOrder = { 'CRITICAL': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4 };
        valA = triageOrder[a.triageStatus as keyof typeof triageOrder] || 5;
        valB = triageOrder[b.triageStatus as keyof typeof triageOrder] || 5;
        break;
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
            <option value="triage">Sort by Triage</option>
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
                onManageDocuments={handleManageDocuments}
                onManageConsent={handleManageConsent}
                onTriageChange={updatePatientTriageStatus}
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
              <span className="ml-auto">Triage/Priority</span>
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
                onManageDocuments={handleManageDocuments}
                onManageConsent={handleManageConsent}
                onTriageChange={updatePatientTriageStatus}
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
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">Medical Details</h4>
                  <div className="space-y-3">
                    <div>
                      
                    </div>
                    <div>
                      <span className="block mb-1 text-sm font-medium text-gray-600">Triage Status</span>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getTriageColor(selectedPatient.triageStatus)}`}>
                        {selectedPatient.triageStatus || 'LOW'}
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
                    
                    {/* Enhanced Vitals Display */}
                    <div>
                      <span className="block mb-2 text-sm font-medium text-gray-600">Current Vitals</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className={`p-2 text-center rounded ${getVitalColor(getVitalStatus('systolicBP', selectedPatient.vitals?.systolicBP))}`}>
                          <div className="text-xs font-medium">BP</div>
                          <div className="text-sm font-bold">{selectedPatient.vitals?.bp || '85/50'}</div>
                        </div>
                        <div className={`p-2 text-center rounded ${getVitalColor(getVitalStatus('heartRate', selectedPatient.vitals?.heartRate))}`}>
                          <div className="text-xs font-medium">HR</div>
                          <div className="text-sm font-bold">{selectedPatient.vitals?.hr || '110'}</div>
                        </div>
                        <div className={`p-2 text-center rounded ${getVitalColor(getVitalStatus('temperature', selectedPatient.vitals?.temperature))}`}>
                          <div className="text-xs font-medium">TEMP</div>
                          <div className="text-sm font-bold">{selectedPatient.vitals?.temp || '38.5°C'}</div>
                        </div>
                        <div className={`p-2 text-center rounded ${getVitalColor(getVitalStatus('oxygenSaturation', selectedPatient.vitals?.oxygenSaturation))}`}>
                          <div className="text-xs font-medium">SPO2</div>
                          <div className="text-sm font-bold">{selectedPatient.vitals?.spo2 || '92%'}</div>
                        </div>
                      </div>
                      
                      {/* Abnormal Vitals Alert */}
                      {selectedPatient.abnormalVitals && selectedPatient.abnormalVitals.length > 0 && (
                        <div className="p-2 mt-2 bg-red-100 border border-red-200 rounded">
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="text-xs font-medium text-red-700">Abnormal Vitals Detected:</span>
                          </div>
                          <div className="mt-1 text-xs text-red-600">
                            {selectedPatient.abnormalVitals.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {selectedPatient.notes && selectedPatient.notes.length > 0 && (
                <div className="mt-6">
                  <h4 className="pb-2 mb-3 font-semibold text-gray-800">Latest Notes</h4>
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    {selectedPatient.notes.map((note: string, index: number) => (
                      <p key={index} className="mb-1 text-gray-800">• {note}</p>
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
          fileType={currentFileType}
        />
      )}
    </div>
  );
};

export default Patients;




