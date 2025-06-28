import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { diagnosticStructure } from '../utils/diagnosticStructure';
import { NAV_ITEMS } from '../utils/navItems';
import { staticAppPhrases } from '../utils/staticAppPhrases';
import { Patient } from '../types';
import { useBusinessId } from './useBusinessId';

export interface SearchResult {
  type: 'patient' | 'test' | 'nav' | 'phrase';
  label: string;
  path?: string;
}

export const useGlobalSearch = () => {
  const businessId = useBusinessId();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    const fetch = async () => {
      const snap = await getDocs(
        query(collection(db, 'patients'), where('businessId', '==', businessId))
      );
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Patient),
      }));
      setPatients(data);
      setLoading(false);
    };
    fetch();
  }, [businessId]);

  const search = (queryText: string): SearchResult[] => {
    const keyword = queryText.trim().toLowerCase();
    if (!keyword) return [];

    const found: SearchResult[] = [];

    // 1. Patients
    patients.forEach((patient) => {
      const med = patient.allergies?.medication?.join(', ').toLowerCase() || '';
      const food = patient.allergies?.food?.join(', ').toLowerCase() || '';
      const otherMed = patient.allergies?.otherMedication?.toLowerCase() || '';
      const otherFood = patient.allergies?.otherFood?.toLowerCase() || '';

      if (
        patient.fullName?.toLowerCase().includes(keyword) ||
        patient.address?.toLowerCase().includes(keyword) ||
        patient.medicalAidNumber?.toLowerCase().includes(keyword) ||
        patient.medicalAidName?.toLowerCase().includes(keyword) ||
        patient.medicalAidMainMember?.toLowerCase().includes(keyword) ||
        patient.idNumber?.toLowerCase().includes(keyword) ||
        patient.triageStatus?.toLowerCase().includes(keyword) ||
        patient.specialInstructions?.toLowerCase().includes(keyword) ||
        med.includes(keyword) ||
        food.includes(keyword) ||
        otherMed.includes(keyword) ||
        otherFood.includes(keyword)
      ) {
        found.push({ type: 'patient', label: patient.fullName });
      }
    });

    // 2. Diagnostics
    Object.entries(diagnosticStructure).forEach(([section, tests]) => {
      if (section.toLowerCase().includes(keyword)) {
        found.push({ type: 'test', label: section });
      }
      if (Array.isArray(tests)) {
        (tests as string[]).forEach((test) => {
          if (test.toLowerCase().includes(keyword)) {
            found.push({ type: 'test', label: test });
          }
        });
      }
    });

    // 3. Nav Tabs
    NAV_ITEMS.forEach((nav) => {
      if (nav.label.toLowerCase().includes(keyword)) {
        found.push({ type: 'nav', label: nav.label, path: nav.path });
      }
    });

    // 4. Static App Phrases
    staticAppPhrases.forEach((phrase) => {
      if (phrase.toLowerCase().includes(keyword)) {
        found.push({ type: 'phrase', label: phrase });
      }
    });

    setResults(found);
    return found;
  };

  return {
    search,
    loading,
    results,
  };
};
