import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Search, Download, UserPlus } from 'lucide-react';
import { db } from '../firebase/firebase-config';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { useSelectedPatient } from '../contexts/SelectedPatientContext';

// Type definitions
interface TestSection {
  left: string[];
  right: string[];
}

interface TestCategory {
  [sectionName: string]: TestSection;
}

interface RightColumnCategory {
  title: string;
  sections: {
    [sectionName: string]: TestSection;
  };
}

const Diagnostics = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [patientName, setPatientName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // ENHANCED: Add context hooks for patient auto-selection
  const { patient: selectedPatient, pendingAction, clearPendingAction } = useSelectedPatient();

  // Mock data structure matching the exact layout
  const leftColumnData: { [categoryName: string]: TestCategory } = {
    "Laboratory Tests": {
      "Biochemistry": {
        left: ["Urea", "Sodium", "Chloride", "Calcium", "Phosphate", "Liver Function Tests (LFTs)", "Lipase", "Albumin"],
        right: ["Creatinine", "Potassium", "Bicarbonate", "Magnesium", "Glucose", "Amylase", "Total Protein"]
      },
      "Hematology": {
        left: ["Full Blood Count (FBC)", "Peripheral Smear", "Platelet Count", "INR", "aPTT"],
        right: ["ESR", "Reticulocyte Count", "Coagulation Profile", "PT"]
      },
      "Endocrinology": {
        left: ["Thyroid Stimulating Hormone (TSH)", "Free T4", "Insulin", "Parathyroid Hormone (PTH)"],
        right: ["Free T3", "Cortisol", "HbA1c", "ACTH"]
      },
      "Tumor Markers": {
        left: ["PSA", "CA 19-9", "AFP"],
        right: ["CA-125", "CEA", "β-hCG"]
      },
      "Infection Panels": {
        left: ["HIV ELISA", "Hepatitis C Antibody", "TB GeneXpert"],
        right: ["Hepatitis B Surface Antigen", "COVID-19 PCR", "Syphilis RPR"]
      }
    }
  };

  const rightColumnData: RightColumnCategory[] = [
    {
      title: "Point-of-Care Tests",
      sections: {
        "General": {
          left: ["Urine Dipstick", "Rapid HIV Test", "Blood Glucose (Fingerprick)"],
          right: ["Pregnancy Test", "Rapid Malaria Test"]
        }
      }
    },
    {
      title: "Imaging & Scans",
      sections: {
        "Radiology": {
          left: ["Chest X-Ray", "CT Brain", "MRI Brain", "Ultrasound Abdomen", "Breast Ultrasound"],
          right: ["Abdominal X-Ray", "CT Abdomen", "MRI Spine", "Pelvic Ultrasound"]
        }
      }
    },
    {
      title: "Cardiac & Vascular",
      sections: {
        "Cardiology": {
          left: ["ECG", "Cardiac Enzymes", "CK-MB", "D-Dimer"],
          right: ["Echocardiogram", "Troponin I", "Lipid Profile"]
        }
      }
    },
    {
      title: "Neurology & Mental",
      sections: {
        "Neurological": {
          left: ["EEG", "CT Brain", "Neuropsychological Testing"],
          right: ["MRI Brain", "Lumbar Puncture (CSF Analysis)"]
        }
      }
    },
    {
      title: "Specialist Panels",
      sections: {
        "Rheumatology": {
          left: ["ANA", "Anti-CCP"],
          right: ["RF", "CRP"]
        },
        "Toxicology": {
          left: ["Urine Drug Screen", "Paracetamol Level"],
          right: ["Blood Alcohol Level", "Salicylate Level"]
        },
        "Genetic": {
          left: ["Karyotyping", "CFTR Mutation Panel"],
          right: ["BRCA1/2"]
        }
      }
    }
  ];

  // ENHANCED: Auto-handle patient selection and test ordering
  useEffect(() => {
    if (selectedPatient && pendingAction) {
      // Auto-fill patient name
      setPatientName(selectedPatient.name);
      
      // Auto-open the modal
      setShowModal(true);
      
      // Auto-select relevant tests based on action
      if (pendingAction === 'order-bloods') {
        // Auto-select common blood tests
        const bloodTests = [
          'Full Blood Count (FBC)',
          'Urea',
          'Creatinine',
          'Glucose',
          'Liver Function Tests (LFTs)'
        ];
        setSelectedTests(bloodTests);
      } else if (pendingAction === 'order-xrays') {
        // Auto-select imaging tests
        const imagingTests = [
          'Chest X-Ray',
          'Abdominal X-Ray'
        ];
        setSelectedTests(imagingTests);
      } else if (pendingAction === 'order-investigations') {
        // Keep current selection or empty for manual selection
        setSelectedTests([]);
      }
      
      // Clear the pending action
      clearPendingAction();
    }
  }, [selectedPatient, pendingAction, clearPendingAction]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setListening(false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser');
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const handleCheckboxChange = (test: string) => {
    setSelectedTests((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );
  };

  const handleSaveToFirestore = async () => {
    if (!patientName || selectedTests.length === 0) {
      alert('Please fill in patient name and select at least one test');
      return;
    }

    try {
      await addDoc(collection(db, 'diagnosticOrders'), {
        patientName,
        selectedTests,
        createdAt: Timestamp.now(),
      });
      alert('Diagnostics order saved successfully!');
      setSelectedTests([]);
      setPatientName('');
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save diagnostics order');
    }
  };

  const handleGeneratePDF = async () => {
    if (!contentRef.current) {
      alert('Content not available for PDF generation');
      return;
    }

    try {
      // Dynamic import for better performance
      const html2canvas = await import('html2canvas');
      const jsPDF = await import('jspdf');
      
      const canvas = await html2canvas.default(contentRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF.default();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`diagnostic_order_${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF');
    }
  };

  // Helper functions for filtering
  const filterTests = (tests: string[] = []): string[] =>
    tests.filter((test) => test.toLowerCase().includes(searchQuery.toLowerCase()));

  const filterSection = (section: TestSection): TestSection | null => {
    const filteredLeft = filterTests(section.left);
    const filteredRight = filterTests(section.right);
    
    if (filteredLeft.length > 0 || filteredRight.length > 0) {
      return {
        left: filteredLeft,
        right: filteredRight
      };
    }
    return null;
  };

  // Filter left column data
  const filteredLeftColumn: { [categoryName: string]: TestCategory } = {};
  
  Object.entries(leftColumnData).forEach(([categoryName, category]) => {
    const filteredCategory: TestCategory = {};
    
    Object.entries(category).forEach(([sectionName, section]) => {
      const filteredSection = filterSection(section);
      if (filteredSection) {
        filteredCategory[sectionName] = filteredSection;
      }
    });
    
    if (Object.keys(filteredCategory).length > 0) {
      filteredLeftColumn[categoryName] = filteredCategory;
    }
  });

  // Filter right column data
  const filteredRightColumn: RightColumnCategory[] = rightColumnData
    .map(category => {
      const filteredSections: { [sectionName: string]: TestSection } = {};
      
      Object.entries(category.sections).forEach(([sectionName, section]) => {
        const filteredSection = filterSection(section);
        if (filteredSection) {
          filteredSections[sectionName] = filteredSection;
        }
      });
      
      if (Object.keys(filteredSections).length > 0) {
        return {
          ...category,
          sections: filteredSections
        };
      }
      return null;
    })
    .filter((category): category is RightColumnCategory => category !== null);

  const renderTestColumn = (tests: string[]): React.ReactElement | null => {
    if (!tests || tests.length === 0) return null;
    
    return (
      <div className="flex-1">
        {tests.map((test) => (
          <label key={test} className="flex items-center gap-2 mb-1 text-sm">
            <input
              type="checkbox"
              checked={selectedTests.includes(test)}
              onChange={() => handleCheckboxChange(test)}
              className="rounded"
            />
            <span className="text-gray-700">{test}</span>
          </label>
        ))}
      </div>
    );
  };

  const renderSection = (section: TestSection): React.ReactElement => {
    return (
      <div className="flex gap-4">
        {renderTestColumn(section.left)}
        {renderTestColumn(section.right)}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 mb-6 md:flex-row md:items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Diagnostics</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-md bg-amber-800 hover:bg-amber-900">
            <UserPlus className="w-4 h-4" />
            Select/Add Patient {selectedPatient ? `(${selectedPatient.name})` : ''}
          </button>
          <button
            className="px-4 py-2 text-white transition-colors rounded-md bg-amber-800 hover:bg-amber-900"
            onClick={() => setShowModal(true)}
          >
            Order Investigation
          </button>
          <button
            onClick={handleGeneratePDF}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-md bg-amber-800 hover:bg-amber-900"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search tests..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
        <button
          onClick={toggleListening}
          className={`p-2 rounded-full border-2 transition-colors ${
            listening 
              ? 'bg-red-100 border-red-300 text-red-600' 
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Content Grid */}
      <div ref={contentRef} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column - Laboratory Tests */}
        <div className="space-y-6">
          {Object.entries(filteredLeftColumn).map(([categoryName, category]) => (
            <div key={categoryName} className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">{categoryName}</h2>
              
              {Object.entries(category).map(([sectionName, section]) => (
                <div key={sectionName} className="mb-4 last:mb-0">
                  <h3 className="mb-2 text-base font-medium text-gray-700">{sectionName}</h3>
                  {renderSection(section)}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Right Column - Other Test Categories */}
        <div className="space-y-6">
          {filteredRightColumn.map((category, index) => (
            <div key={index} className="p-5 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">{category.title}</h2>
              
              {Object.entries(category.sections).map(([sectionName, section]) => (
                <div key={sectionName} className="mb-4 last:mb-0">
                  <h3 className="mb-2 text-base font-medium text-gray-700">{sectionName}</h3>
                  {renderSection(section)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ENHANCED Modal with Auto-Patient Detection */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <h3 className="mb-4 text-xl font-semibold text-gray-800">Enter Patient Info</h3>
            
            {/* ENHANCED: Patient name input with auto-selection indicator */}
            <input
              type="text"
              placeholder="Patient Name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              style={{
                backgroundColor: selectedPatient ? '#f0f9ff' : 'white',
                borderColor: selectedPatient ? '#0ea5e9' : '#d1d5db'
              }}
            />
            
            {/* ENHANCED: Show auto-selection indicator */}
            {selectedPatient && (
              <p className="mb-4 text-sm text-blue-600">
                ✓ Patient auto-selected from Patients page
              </p>
            )}
            
            <div className="mb-4">
              <p className="mb-2 text-sm text-gray-600">Selected Tests: {selectedTests.length}</p>
              {selectedTests.length > 0 && (
                <div className="p-2 overflow-y-auto text-xs rounded max-h-32 bg-gray-50">
                  {selectedTests.map((test, index) => (
                    <div key={index} className="text-gray-700">{test}</div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 transition-colors bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveToFirestore}
                className="px-4 py-2 text-white transition-colors rounded-md bg-amber-800 hover:bg-amber-900"
              >
                Save Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnostics;