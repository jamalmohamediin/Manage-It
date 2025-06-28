// src/contexts/SelectedPatientContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  // New: Auto-action triggers
  pendingAction: string | null;
  setPendingAction: (action: string | null) => void;
  // New: Clear after action
  clearPendingAction: () => void;
}

const SelectedPatientContext = createContext<SelectedPatientContextType | undefined>(undefined);

export const SelectedPatientProvider = ({ children }: { children: ReactNode }) => {
  const [patient, setPatient] = useState<SelectedPatient | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const clearPendingAction = () => setPendingAction(null);

  return (
    <SelectedPatientContext.Provider value={{ 
      patient, 
      setPatient, 
      pendingAction, 
      setPendingAction,
      clearPendingAction 
    }}>
      {children}
    </SelectedPatientContext.Provider>
  );
};

// FIXED: Export the hook properly
export const useSelectedPatient = () => {
  const context = useContext(SelectedPatientContext);
  if (!context) {
    throw new Error('useSelectedPatient must be used within a SelectedPatientProvider');
  }
  return context;
};