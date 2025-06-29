// src/contexts/SelectedPatientContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface SelectedPatient {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  mrn?: string;
  contactNumber?: string;
  diagnosis?: string;
  [key: string]: any;
}

interface SelectedPatientContextType {
  patient: SelectedPatient | null;
  setPatient: (patient: SelectedPatient | null) => void;
  // Auto-action triggers for connected buttons
  pendingAction: string | null;
  setPendingAction: (action: string | null) => void;
  // Clear action after completion
  clearPendingAction: () => void;
  // Enhanced features
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  actionHistory: Array<{
    action: string;
    patient: SelectedPatient;
    timestamp: Date;
  }>;
  addToHistory: (action: string, patient: SelectedPatient) => void;
  clearHistory: () => void;
}

const SelectedPatientContext = createContext<SelectedPatientContextType | undefined>(undefined);

export const SelectedPatientProvider = ({ children }: { children: ReactNode }) => {
  const [patient, setPatient] = useState<SelectedPatient | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionHistory, setActionHistory] = useState<Array<{
    action: string;
    patient: SelectedPatient;
    timestamp: Date;
  }>>([]);

  const clearPendingAction = () => {
    setPendingAction(null);
    setIsLoading(false);
  };

  const addToHistory = (action: string, patient: SelectedPatient) => {
    const newEntry = {
      action,
      patient,
      timestamp: new Date()
    };
    
    setActionHistory(prev => [newEntry, ...prev.slice(0, 9)]); // Keep last 10 entries
  };

  const clearHistory = () => {
    setActionHistory([]);
  };

  // Enhanced setPatient with history tracking
  const setPatientWithHistory = (newPatient: SelectedPatient | null) => {
    if (newPatient && pendingAction) {
      addToHistory(pendingAction, newPatient);
    }
    setPatient(newPatient);
  };

  // Auto-clear patient and action after timeout (5 minutes of inactivity)
  useEffect(() => {
    if (patient && pendingAction) {
      const timeout = setTimeout(() => {
        console.log('Auto-clearing patient context due to inactivity');
        clearPendingAction();
        setPatient(null);
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearTimeout(timeout);
    }
  }, [patient, pendingAction]);

  // Debug logging for development
  useEffect(() => {
    if (import.meta.env.MODE === 'development') {
      console.log('🩺 Patient Context Update:', {
        patient: patient?.name,
        action: pendingAction,
        isLoading,
        timestamp: new Date().toISOString()
      });
    }
  }, [patient, pendingAction, isLoading]);

  // Persist patient context in sessionStorage for page refreshes
  useEffect(() => {
    if (patient && pendingAction) {
      sessionStorage.setItem('selectedPatientContext', JSON.stringify({
        patient,
        pendingAction,
        timestamp: Date.now()
      }));
    } else {
      sessionStorage.removeItem('selectedPatientContext');
    }
  }, [patient, pendingAction]);

  // Restore patient context on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('selectedPatientContext');
    if (stored) {
      try {
        const { patient: storedPatient, pendingAction: storedAction, timestamp } = JSON.parse(stored);
        
        // Only restore if less than 30 minutes old
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          setPatient(storedPatient);
          setPendingAction(storedAction);
          console.log('🔄 Restored patient context from session:', storedPatient.name);
        } else {
          sessionStorage.removeItem('selectedPatientContext');
        }
      } catch (error) {
        console.error('Failed to restore patient context:', error);
        sessionStorage.removeItem('selectedPatientContext');
      }
    }
  }, []);

  return (
    <SelectedPatientContext.Provider value={{ 
      patient, 
      setPatient: setPatientWithHistory, 
      pendingAction, 
      setPendingAction,
      clearPendingAction,
      isLoading,
      setIsLoading,
      actionHistory,
      addToHistory,
      clearHistory
    }}>
      {children}
    </SelectedPatientContext.Provider>
  );
};

// Enhanced hook with better error handling and debugging
export const useSelectedPatient = () => {
  const context = useContext(SelectedPatientContext);
  if (!context) {
    throw new Error('useSelectedPatient must be used within a SelectedPatientProvider');
  }
  return context;
};

// Utility hook for checking if specific action is pending
export const usePendingAction = (actionType: string) => {
  const { pendingAction, clearPendingAction } = useSelectedPatient();
  
  const isPending = pendingAction === actionType;
  
  const completAction = () => {
    if (isPending) {
      clearPendingAction();
    }
  };
  
  return { isPending, completAction };
};

// Action constants for type safety
export const PATIENT_ACTIONS = {
  ORDER_BLOODS: 'order-bloods',
  ORDER_XRAYS: 'order-xrays', 
  ORDER_INVESTIGATIONS: 'order-investigations',
  CREATE_REFERRAL: 'create-referral',
  GENERATE_REPORT: 'generate-report',
  VIEW_HISTORY: 'view-history',
  UPDATE_VITALS: 'update-vitals',
  ADD_PRESCRIPTION: 'add-prescription'
} as const;

export type PatientAction = typeof PATIENT_ACTIONS[keyof typeof PATIENT_ACTIONS];

// Utility functions for common patient operations
export const patientContextUtils = {
  // Quick patient selection with action
  selectPatientWithAction: (
    patient: SelectedPatient, 
    action: PatientAction,
    setPatient: (p: SelectedPatient) => void,
    setPendingAction: (a: string) => void
  ) => {
    setPatient(patient);
    setPendingAction(action);
  },

  // Format patient for display
  formatPatientDisplay: (patient: SelectedPatient | null): string => {
    if (!patient) return 'No patient selected';
    return `${patient.name} (${patient.age}y, ${patient.gender?.charAt(0) || '?'})`;
  },

  // Validate patient has required fields for action
  validatePatientForAction: (patient: SelectedPatient | null, action: PatientAction): boolean => {
    if (!patient) return false;
    
    const requiredFields = ['id', 'name'];
    
    // Additional requirements for specific actions
    switch (action) {
      case PATIENT_ACTIONS.ORDER_BLOODS:
      case PATIENT_ACTIONS.ORDER_XRAYS:
      case PATIENT_ACTIONS.ORDER_INVESTIGATIONS:
        requiredFields.push('mrn', 'age');
        break;
      case PATIENT_ACTIONS.CREATE_REFERRAL:
        requiredFields.push('diagnosis', 'contactNumber');
        break;
    }
    
    return requiredFields.every(field => patient[field]);
  }
};

export default SelectedPatientContext;