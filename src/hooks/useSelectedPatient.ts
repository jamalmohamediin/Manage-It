// src/hooks/useSelectedPatient.ts
import { useSelectedPatient, usePendingAction, PATIENT_ACTIONS, type PatientAction } from '../contexts/SelectedPatientContext';

// Re-export the main hook
export default useSelectedPatient;

// Also export the utility hook and constants for convenience
export { usePendingAction, PATIENT_ACTIONS };
export type { PatientAction };

// Additional utility hooks for common scenarios

// Hook for handling connected button navigation
export const usePatientNavigation = () => {
  const { setPatient, setPendingAction, clearPendingAction } = useSelectedPatient();

  const navigateWithPatient = (patient: any, action: PatientAction, navigate: (path: string) => void) => {
    // Convert patient to SelectedPatient format
    const selectedPatient = {
      id: patient.id?.toString() || '',
      name: patient.name || patient.fullName || '',
      age: patient.age,
      gender: patient.gender,
      mrn: patient.mrn,
      contactNumber: patient.contactNumber || patient.phone,
      diagnosis: patient.diagnosis
    };

    setPatient(selectedPatient);
    setPendingAction(action);

    // Navigate based on action
    switch (action) {
      case PATIENT_ACTIONS.ORDER_BLOODS:
      case PATIENT_ACTIONS.ORDER_XRAYS:
      case PATIENT_ACTIONS.ORDER_INVESTIGATIONS:
        navigate('/diagnostics');
        break;
      case PATIENT_ACTIONS.CREATE_REFERRAL:
        navigate('/referrals');
        break;
      case PATIENT_ACTIONS.GENERATE_REPORT:
        navigate('/notes');
        break;
      default:
        console.warn('Unknown action for navigation:', action);
    }
  };

  return { navigateWithPatient, clearPendingAction };
};

// Hook for checking if we're in a connected workflow
export const useConnectedWorkflow = () => {
  const { patient, pendingAction } = useSelectedPatient();
  
  return {
    isInWorkflow: !!(patient && pendingAction),
    patient,
    action: pendingAction,
    workflowDescription: patient && pendingAction 
      ? `${pendingAction.replace('-', ' ').toUpperCase()} for ${patient.name}`
      : null
  };
};