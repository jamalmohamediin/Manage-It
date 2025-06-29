// src/utils/patientUtils.ts

// Enhanced patient conversion utilities
export const patientUtils = {
  // Convert any patient format to SelectedPatient format
  toSelectedPatient: (patient: any) => ({
    id: patient.id?.toString() || patient.patientId?.toString(),
    name: patient.name || patient.fullName || patient.patientName,
    age: patient.age,
    gender: patient.gender,
    mrn: patient.mrn || patient.medicalRecordNumber,
    contactNumber: patient.contactNumber || patient.phone || patient.phoneNumber,
    diagnosis: patient.diagnosis || patient.primaryDiagnosis
  }),
  
  // Get patient display name with comprehensive formatting
  getDisplayName: (patient: any) => {
    if (!patient) return 'Unknown Patient';
    
    const name = patient.name || patient.fullName || 'Unknown';
    const age = patient.age ? `${patient.age}y` : '?y';
    const gender = patient.gender ? patient.gender.charAt(0).toUpperCase() : '?';
    
    return `${name} (${age}, ${gender})`;
  },
  
  // Get detailed patient info string
  getDetailedInfo: (patient: any) => {
    if (!patient) return 'No patient information available';
    
    const parts = [];
    if (patient.name) parts.push(`Name: ${patient.name}`);
    if (patient.age) parts.push(`Age: ${patient.age}`);
    if (patient.gender) parts.push(`Gender: ${patient.gender}`);
    if (patient.mrn) parts.push(`MRN: ${patient.mrn}`);
    if (patient.diagnosis) parts.push(`Diagnosis: ${patient.diagnosis}`);
    
    return parts.join(' | ');
  },
  
  // Format patient info for forms with comprehensive mapping
  formatForForm: (patient: any) => ({
    patientId: patient.id?.toString() || '',
    patientName: patient.name || patient.fullName || '',
    patientAge: patient.age?.toString() || '',
    patientGender: patient.gender || 'Male',
    patientPhone: patient.contactNumber || patient.phone || '',
    patientMRN: patient.mrn || '',
    patientDiagnosis: patient.diagnosis || '',
    patientWard: patient.ward || '',
    patientRoom: patient.room || '',
    patientHospital: patient.hospital || ''
  }),

  // Extract patient vitals in standardized format
  extractVitals: (patient: any) => ({
    bloodPressure: patient.vitals?.bp || patient.vitals?.bloodPressure || '',
    heartRate: patient.vitals?.hr || patient.vitals?.heartRate || '',
    temperature: patient.vitals?.temp || patient.vitals?.temperature || '',
    oxygenSaturation: patient.vitals?.spo2 || patient.vitals?.oxygenSaturation || '',
    respiratoryRate: patient.vitals?.rr || patient.vitals?.respiratoryRate || '',
    lastUpdated: patient.vitals?.lastUpdated || new Date().toISOString()
  }),

  // Format allergies for display
  formatAllergies: (patient: any) => {
    if (patient.selectedAllergies && patient.selectedAllergies.length > 0) {
      return patient.selectedAllergies.join(', ');
    }
    if (patient.allergies && patient.allergies !== 'NKDA') {
      return patient.allergies;
    }
    return 'NKDA (No Known Drug Allergies)';
  },

  // Format comorbidities for display
  formatComorbidities: (patient: any) => {
    if (patient.selectedComorbidities && patient.selectedComorbidities.length > 0) {
      return patient.selectedComorbidities.join(', ');
    }
    if (patient.comorbidities && patient.comorbidities !== 'None') {
      return patient.comorbidities;
    }
    return 'None reported';
  },

  // Get patient status color
  getStatusColor: (status: string) => {
    switch (status?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': case 'stable': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  },

  // Get triage status color
  getTriageColor: (triageStatus: string) => {
    switch (triageStatus?.toUpperCase()) {
      case 'CRITICAL': return 'text-red-800 bg-red-100 border-red-200';
      case 'HIGH': return 'text-orange-800 bg-orange-100 border-orange-200';
      case 'MEDIUM': return 'text-yellow-800 bg-yellow-100 border-yellow-200';
      case 'LOW': return 'text-green-800 bg-green-100 border-green-200';
      default: return 'text-gray-800 bg-gray-100 border-gray-200';
    }
  },

  // Calculate patient age from DOB
  calculateAge: (dateOfBirth: string | Date) => {
    if (!dateOfBirth) return null;
    
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  },

  // Validate patient data completeness
  validatePatientData: (patient: any) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!patient.name && !patient.fullName) errors.push('Patient name is required');
    if (!patient.id) errors.push('Patient ID is required');
    
    // Important fields
    if (!patient.age && !patient.dateOfBirth) warnings.push('Age or date of birth missing');
    if (!patient.gender) warnings.push('Gender information missing');
    if (!patient.mrn) warnings.push('Medical record number missing');
    if (!patient.contactNumber && !patient.phone) warnings.push('Contact number missing');
    if (!patient.diagnosis) warnings.push('Diagnosis information missing');

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completeness: Math.round(((10 - errors.length - warnings.length) / 10) * 100)
    };
  }
};

// Enhanced localStorage backup for patient selection
export const patientStorage = {
  saveSelectedPatient: (patient: any) => {
    try {
      const patientData = {
        ...patient,
        timestamp: Date.now()
      };
      localStorage.setItem('selectedPatient', JSON.stringify(patientData));
      console.log('💾 Patient saved to localStorage:', patient.name);
    } catch (error) {
      console.error('Failed to save patient to localStorage:', error);
    }
  },
  
  getSelectedPatient: () => {
    try {
      const stored = localStorage.getItem('selectedPatient');
      if (!stored) return null;
      
      const patientData = JSON.parse(stored);
      
      // Check if data is not too old (24 hours)
      if (Date.now() - patientData.timestamp > 24 * 60 * 60 * 1000) {
        patientStorage.clearSelectedPatient();
        return null;
      }
      
      return patientData;
    } catch (error) {
      console.error('Failed to get patient from localStorage:', error);
      patientStorage.clearSelectedPatient();
      return null;
    }
  },
  
  clearSelectedPatient: () => {
    try {
      localStorage.removeItem('selectedPatient');
      console.log('🗑️ Cleared patient from localStorage');
    } catch (error) {
      console.error('Failed to clear patient from localStorage:', error);
    }
  },

  // Save recent patients list
  addToRecentPatients: (patient: any, maxRecent: number = 10) => {
    try {
      const recent = patientStorage.getRecentPatients();
      const patientData = patientUtils.toSelectedPatient(patient);
      
      // Remove if already exists
      const filtered = recent.filter((p: any) => p.id !== patientData.id);
      
      // Add to beginning
      const updated = [patientData, ...filtered].slice(0, maxRecent);
      
      localStorage.setItem('recentPatients', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to add to recent patients:', error);
    }
  },

  getRecentPatients: () => {
    try {
      const stored = localStorage.getItem('recentPatients');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get recent patients:', error);
      return [];
    }
  }
};

// Action constants for better type safety
export const DIAGNOSTIC_CATEGORIES = {
  BLOODS: 'order-bloods',
  XRAYS: 'order-xrays',
  INVESTIGATIONS: 'order-investigations',
  CT_SCAN: 'order-ct-scan',
  MRI: 'order-mri',
  ULTRASOUND: 'order-ultrasound',
  ECG: 'order-ecg',
  ECHO: 'order-echo'
} as const;

export const REFERRAL_ACTIONS = {
  CREATE: 'create-referral',
  URGENT: 'urgent-referral',
  SPECIALIST: 'specialist-referral',
  DISCHARGE: 'discharge-referral'
} as const;

export const PRESCRIPTION_ACTIONS = {
  ADD: 'add-prescription',
  MODIFY: 'modify-prescription',
  DISCONTINUE: 'discontinue-prescription',
  REVIEW: 'review-prescriptions'
} as const;

// Enhanced file validation with medical document support
export const ALLOWED_FILE_TYPES = {
  DOCUMENTS: '.pdf,.doc,.docx,.txt,.rtf',
  IMAGES: '.jpg,.jpeg,.png,.gif,.bmp,.tiff,.dicom',
  VIDEOS: '.mp4,.mov,.avi,.wmv,.flv,.webm',
  MEDICAL: '.dcm,.dicom,.hl7,.xml',
  ALL: '.pdf,.doc,.docx,.txt,.rtf,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.mp4,.mov,.avi,.wmv,.flv,.webm,.dcm,.dicom,.hl7,.xml'
} as const;

// Enhanced file size limits
export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB general limit
  MAX_IMAGE_SIZE: 25 * 1024 * 1024,  // 25MB for images
  MAX_VIDEO_SIZE: 500 * 1024 * 1024, // 500MB for videos
  MAX_DOCUMENT_SIZE: 100 * 1024 * 1024, // 100MB for documents
  MAX_MEDICAL_SIZE: 1024 * 1024 * 1024 // 1GB for medical files (DICOM, etc.)
} as const;

// Enhanced file validation
export const validateFile = (file: File) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check file size based on type
  const fileType = file.type.toLowerCase();
  
  if (fileType.startsWith('video/')) {
    if (file.size > FILE_SIZE_LIMITS.MAX_VIDEO_SIZE) {
      errors.push(`Video files must be smaller than ${FILE_SIZE_LIMITS.MAX_VIDEO_SIZE / 1024 / 1024}MB`);
    }
  } else if (fileType.startsWith('image/')) {
    if (file.size > FILE_SIZE_LIMITS.MAX_IMAGE_SIZE) {
      errors.push(`Image files must be smaller than ${FILE_SIZE_LIMITS.MAX_IMAGE_SIZE / 1024 / 1024}MB`);
    }
  } else if (fileType.includes('dicom') || file.name.toLowerCase().endsWith('.dcm')) {
    if (file.size > FILE_SIZE_LIMITS.MAX_MEDICAL_SIZE) {
      errors.push(`Medical files must be smaller than ${FILE_SIZE_LIMITS.MAX_MEDICAL_SIZE / 1024 / 1024 / 1024}GB`);
    }
  } else if (file.size > FILE_SIZE_LIMITS.MAX_DOCUMENT_SIZE) {
    errors.push(`Document files must be smaller than ${FILE_SIZE_LIMITS.MAX_DOCUMENT_SIZE / 1024 / 1024}MB`);
  }
  
  // Check file type
  const allowedTypes = ALLOWED_FILE_TYPES.ALL.split(',');
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedTypes.includes(fileExtension)) {
    errors.push(`File type ${fileExtension} is not allowed`);
  }
  
  // Warnings for large files
  if (file.size > 10 * 1024 * 1024) { // 10MB
    warnings.push('Large file size may take time to upload');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fileType: getFileCategory(file.name),
    size: file.size
  };
};

// Enhanced file size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Enhanced file type detection
export const getFileCategory = (fileName: string): 'image' | 'video' | 'document' | 'medical' | 'unknown' => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'].includes(extension || '')) return 'image';
  if (['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'].includes(extension || '')) return 'video';
  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension || '')) return 'document';
  if (['dcm', 'dicom', 'hl7', 'xml'].includes(extension || '')) return 'medical';
  
  return 'unknown';
};

// Enhanced file type icon with medical support
export const getFileTypeIcon = (fileName: string): string => {
  const category = getFileCategory(fileName);
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (category) {
    case 'image': return '🖼️';
    case 'video': return '🎥';
    case 'medical': return '🏥';
    case 'document':
      switch (extension) {
        case 'pdf': return '📄';
        case 'doc': case 'docx': return '📝';
        case 'txt': case 'rtf': return '📋';
        default: return '📄';
      }
    default: return '📁';
  }
};

// Enhanced debug helper with better formatting
export const debugPatientContext = (patient: any, action: any, additionalData?: any) => {
  if (
    typeof window !== 'undefined' &&
    typeof (window as any).process !== 'undefined' &&
    (window as any).process.env?.NODE_ENV === 'development'
  ) {
    console.group('🩺 Patient Context Debug');
    console.log('Patient:', patient);
    console.log('Action:', action);
    console.log('Timestamp:', new Date().toISOString());
    if (additionalData) {
      console.log('Additional Data:', additionalData);
    }
    if (patient) {
      console.log('Validation:', patientUtils.validatePatientData(patient));
    }
    console.groupEnd();
  }
};

// Medical specialties for referrals
export const MEDICAL_SPECIALTIES = [
  'Cardiology',
  'Dermatology', 
  'Endocrinology',
  'Gastroenterology',
  'Hematology',
  'Nephrology',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Psychiatry',
  'Pulmonology',
  'Rheumatology',
  'Surgery',
  'Urology'
] as const;

// Common vital signs reference ranges
export const VITAL_SIGNS_RANGES = {
  heartRate: { min: 60, max: 100, unit: 'bpm' },
  systolicBP: { min: 90, max: 120, unit: 'mmHg' },
  diastolicBP: { min: 60, max: 80, unit: 'mmHg' },
  respiratoryRate: { min: 12, max: 20, unit: '/min' },
  oxygenSaturation: { min: 95, max: 100, unit: '%' },
  temperature: { min: 36.1, max: 37.5, unit: '°C' }
} as const;

export default patientUtils;