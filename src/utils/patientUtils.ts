// src/utils/patientUtils.ts

// Patient conversion utilities
export const patientUtils = {
  // Convert your ExtendedPatient to SelectedPatient format
  toSelectedPatient: (patient: any) => ({
    id: patient.id.toString(),
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    mrn: patient.mrn,
    contactNumber: patient.contactNumber,
    diagnosis: patient.diagnosis
  }),
  
  // Get patient display name with age
  getDisplayName: (patient: any) => 
    `${patient.name} (${patient.age}y, ${patient.gender.charAt(0)})`,
  
  // Format patient info for forms
  formatForForm: (patient: any) => ({
    patientName: patient.name,
    patientAge: patient.age?.toString() || '',
    patientGender: patient.gender || 'Male',
    patientPhone: patient.contactNumber || '',
    patientMRN: patient.mrn || ''
  })
};

// OPTIONAL: LocalStorage backup for patient selection (if needed)
export const patientStorage = {
  saveSelectedPatient: (patient: any) => {
    localStorage.setItem('selectedPatient', JSON.stringify(patient));
  },
  
  getSelectedPatient: () => {
    const stored = localStorage.getItem('selectedPatient');
    return stored ? JSON.parse(stored) : null;
  },
  
  clearSelectedPatient: () => {
    localStorage.removeItem('selectedPatient');
  }
};

// Action constants for better type safety
export const DIAGNOSTIC_CATEGORIES = {
  BLOODS: 'order-bloods',
  XRAYS: 'order-xrays',
  INVESTIGATIONS: 'order-investigations'
} as const;

export const REFERRAL_ACTIONS = {
  CREATE: 'create-referral'
} as const;

// File types for upload validation
export const ALLOWED_FILE_TYPES = {
  DOCUMENTS: '.pdf,.doc,.docx,.txt',
  IMAGES: '.jpg,.jpeg,.png,.gif,.bmp',
  VIDEOS: '.mp4,.mov,.avi,.wmv,.flv',
  ALL: '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.mp4,.mov,.avi,.wmv,.flv'
} as const;

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,  // 5MB
  MAX_VIDEO_SIZE: 50 * 1024 * 1024  // 50MB
} as const;

// Validation helpers
export const validateFile = (file: File) => {
  const errors: string[] = [];
  
  // Check file size
  if (file.size > FILE_SIZE_LIMITS.MAX_FILE_SIZE) {
    if (file.type.startsWith('video/') && file.size > FILE_SIZE_LIMITS.MAX_VIDEO_SIZE) {
      errors.push(`Video files must be smaller than ${FILE_SIZE_LIMITS.MAX_VIDEO_SIZE / 1024 / 1024}MB`);
    } else if (file.type.startsWith('image/') && file.size > FILE_SIZE_LIMITS.MAX_IMAGE_SIZE) {
      errors.push(`Image files must be smaller than ${FILE_SIZE_LIMITS.MAX_IMAGE_SIZE / 1024 / 1024}MB`);
    } else {
      errors.push(`Files must be smaller than ${FILE_SIZE_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
  }
  
  // Check file type
  const allowedTypes = ALLOWED_FILE_TYPES.ALL.split(',');
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedTypes.includes(fileExtension)) {
    errors.push(`File type ${fileExtension} is not allowed`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file type icon
export const getFileTypeIcon = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return '📄';
    case 'doc':
    case 'docx':
      return '📝';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
      return '🖼️';
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'wmv':
    case 'flv':
      return '🎥';
    case 'txt':
      return '📋';
    default:
      return '📁';
  }
};

// FIXED: Debug helper for development
export const debugPatientContext = (patient: any, action: any) => {
  // FIXED: Use typeof to check if we're in browser environment
  if (typeof window !== 'undefined') {
    console.log('🩺 Patient Context Debug:', {
      patient,
      action,
      timestamp: new Date().toISOString()
    });
  }
};