// src/hooks/useSelectedPatient.ts
import { useContext } from 'react';
import { SelectedPatientContext } from '../contexts/SelectedPatientContext';

interface SelectedPatient {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  [key: string]: any;
}

interface UseSelectedPatientReturn {
  patient: SelectedPatient | null;
  setPatient: (patient: SelectedPatient | null) => void;
}

const useSelectedPatient = (): UseSelectedPatientReturn => {
  const context = useContext(SelectedPatientContext) as UseSelectedPatientReturn;

  if (!context) {
    throw new Error('useSelectedPatient must be used within a SelectedPatientProvider');
  }

  return {
    patient: context.patient,
    setPatient: context.setPatient,
  };
};

export default useSelectedPatient;
