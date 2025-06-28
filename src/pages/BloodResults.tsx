import React, { useState } from 'react';
import {
  Search, Filter, Plus, X, Activity, User, Calendar, AlertTriangle
} from 'lucide-react';

// Types
interface BloodTestValue {
  value: number;
  normal: string;
  status: string;
}

interface BloodResult {
  id: number;
  patient: string;
  mrn: string;
  date: string;
  status: string;
  critical: boolean;
  testType: string;
  results: {
    fbc: {
      hemoglobin: BloodTestValue;
      whiteCount: BloodTestValue;
      platelets: BloodTestValue;
      hematocrit: BloodTestValue;
    };
    biochemistry: {
      sodium: BloodTestValue;
      potassium: BloodTestValue;
      creatinine: BloodTestValue;
      glucose: BloodTestValue;
      troponin?: BloodTestValue;
    };
  };
}

// Helper Components
const SearchFilterControls = ({ 
  searchTerm, 
  setSearchTerm, 
  filterBy, 
  setFilterBy, 
  filterOptions, 
  onAdd, 
  addButtonText,
  placeholder = "Search..."
}: any) => (
  <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-4">
    <button
      onClick={onAdd}
      className="flex items-center justify-center gap-2 p-3 text-green-700 transition-all duration-200 transform bg-green-100 shadow-lg rounded-xl hover:bg-green-200 hover:scale-105 active:scale-95"
    >
      <Plus className="w-5 h-5" />
      <span className="text-sm font-medium">{addButtonText}</span>
    </button>
    
    <div className="flex items-center col-span-1 gap-2 p-3 bg-blue-100 shadow-lg lg:col-span-2 rounded-xl">
      <Search className="flex-shrink-0 w-5 h-5 text-blue-600" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 text-sm placeholder-blue-600 bg-transparent outline-none"
      />
    </div>
    
    <div className="flex items-center gap-2 p-3 bg-purple-100 shadow-lg rounded-xl">
      <Filter className="flex-shrink-0 w-5 h-5 text-purple-600" />
      <select
        value={filterBy}
        onChange={(e) => setFilterBy(e.target.value)}
        className="flex-1 text-sm text-purple-600 bg-transparent outline-none"
      >
        {filterOptions.map((option: any) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  </div>
);

// Helper function to get status colors
function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'complete':
    case 'normal':
      return 'bg-green-100 text-green-700';
    case 'pending':
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-700';
    case 'in progress':
      return 'bg-blue-100 text-blue-700';
    case 'critical':
    case 'high':
    case 'low':
      return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

// Blood Test Form Modal
const BloodTestModal = ({ isOpen, onClose, onSave, bloodResult = null }: any) => {
  const [formData, setFormData] = useState({
    patient: bloodResult?.patient || '',
    mrn: bloodResult?.mrn || '',
    testType: bloodResult?.testType || 'Full Blood Count + Biochemistry',
    critical: bloodResult?.critical || false,
    hemoglobin: bloodResult?.results?.fbc?.hemoglobin?.value || '',
    whiteCount: bloodResult?.results?.fbc?.whiteCount?.value || '',
    platelets: bloodResult?.results?.fbc?.platelets?.value || '',
    hematocrit: bloodResult?.results?.fbc?.hematocrit?.value || '',
    sodium: bloodResult?.results?.biochemistry?.sodium?.value || '',
    potassium: bloodResult?.results?.biochemistry?.potassium?.value || '',
    creatinine: bloodResult?.results?.biochemistry?.creatinine?.value || '',
    glucose: bloodResult?.results?.biochemistry?.glucose?.value || '',
    troponin: bloodResult?.results?.biochemistry?.troponin?.value || ''
  });

  const getTestStatus = (value: number, type: string) => {
    // Simple logic for determining status based on common ranges
    // FIXED: Removed unused 'normalRange' parameter
    const ranges = {
      hemoglobin: { low: 12.0, high: 15.5 },
      whiteCount: { low: 4.0, high: 11.0 },
      platelets: { low: 150, high: 450 },
      hematocrit: { low: 36, high: 46 },
      sodium: { low: 136, high: 145 },
      potassium: { low: 3.5, high: 5.1 },
      creatinine: { low: 0.7, high: 1.3 },
      glucose: { low: 70, high: 100 },
      troponin: { low: 0, high: 0.04 }
    };

    const range = ranges[type as keyof typeof ranges];
    if (!range) return 'Normal';
    
    if (value < range.low) return 'Low';
    if (value > range.high) return 'High';
    return 'Normal';
  };

  const handleSubmit = () => {
    if (!formData.patient || !formData.mrn) {
      alert('Please fill in required fields (Patient Name and MRN)');
      return;
    }

    const newBloodResult: BloodResult = {
      id: bloodResult?.id || Date.now(),
      patient: formData.patient,
      mrn: formData.mrn,
      date: bloodResult?.date || new Date().toLocaleDateString(),
      status: 'Complete',
      critical: formData.critical,
      testType: formData.testType,
      results: {
        fbc: {
          hemoglobin: {
            value: Number(formData.hemoglobin) || 0,
            normal: '12.0-15.5 g/dL',
            status: getTestStatus(Number(formData.hemoglobin), 'hemoglobin')
          },
          whiteCount: {
            value: Number(formData.whiteCount) || 0,
            normal: '4.0-11.0 x10³/μL',
            status: getTestStatus(Number(formData.whiteCount), 'whiteCount')
          },
          platelets: {
            value: Number(formData.platelets) || 0,
            normal: '150-450 x10³/μL',
            status: getTestStatus(Number(formData.platelets), 'platelets')
          },
          hematocrit: {
            value: Number(formData.hematocrit) || 0,
            normal: '36-46%',
            status: getTestStatus(Number(formData.hematocrit), 'hematocrit')
          }
        },
        biochemistry: {
          sodium: {
            value: Number(formData.sodium) || 0,
            normal: '136-145 mmol/L',
            status: getTestStatus(Number(formData.sodium), 'sodium')
          },
          potassium: {
            value: Number(formData.potassium) || 0,
            normal: '3.5-5.1 mmol/L',
            status: getTestStatus(Number(formData.potassium), 'potassium')
          },
          creatinine: {
            value: Number(formData.creatinine) || 0,
            normal: '0.7-1.3 mg/dL',
            status: getTestStatus(Number(formData.creatinine), 'creatinine')
          },
          glucose: {
            value: Number(formData.glucose) || 0,
            normal: '70-100 mg/dL',
            status: getTestStatus(Number(formData.glucose), 'glucose')
          },
          ...(formData.troponin && {
            troponin: {
              value: Number(formData.troponin),
              normal: '<0.04 ng/mL',
              status: getTestStatus(Number(formData.troponin), 'troponin')
            }
          })
        }
      }
    };

    onSave(newBloodResult);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl overflow-y-auto bg-white shadow-xl rounded-xl max-h-[90vh]">
        <div className="sticky top-0 flex items-center justify-between p-4 bg-white border-b">
          <h3 className="text-lg font-bold text-gray-800">
            {bloodResult ? 'Edit Blood Test Results' : 'New Blood Test Results'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Patient Information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Patient Name *</label>
              <input
                type="text"
                value={formData.patient}
                onChange={(e) => setFormData({...formData, patient: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter patient name"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">MRN *</label>
              <input
                type="text"
                value={formData.mrn}
                onChange={(e) => setFormData({...formData, mrn: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., MRN001"
              />
            </div>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Test Type</label>
            <select
              value={formData.testType}
              onChange={(e) => setFormData({...formData, testType: e.target.value})}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Full Blood Count + Biochemistry">Full Blood Count + Biochemistry</option>
              <option value="Full Blood Count Only">Full Blood Count Only</option>
              <option value="Biochemistry Only">Biochemistry Only</option>
              <option value="Cardiac Markers">Cardiac Markers</option>
              <option value="Emergency Panel">Emergency Panel</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="critical"
              checked={formData.critical}
              onChange={(e) => setFormData({...formData, critical: e.target.checked})}
              className="rounded"
            />
            <label htmlFor="critical" className="text-sm font-medium text-red-600">
              Mark as Critical Result
            </label>
          </div>
          
          {/* FBC Results */}
          <div className="p-4 border rounded-lg bg-blue-50">
            <h4 className="mb-3 text-lg font-semibold text-blue-800">Full Blood Count (FBC)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Hemoglobin (g/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.hemoglobin}
                  onChange={(e) => setFormData({...formData, hemoglobin: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Normal: 12.0-15.5"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">White Count (x10³/μL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.whiteCount}
                  onChange={(e) => setFormData({...formData, whiteCount: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Normal: 4.0-11.0"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Platelets (x10³/μL)</label>
                <input
                  type="number"
                  value={formData.platelets}
                  onChange={(e) => setFormData({...formData, platelets: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Normal: 150-450"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Hematocrit (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.hematocrit}
                  onChange={(e) => setFormData({...formData, hematocrit: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Normal: 36-46"
                />
              </div>
            </div>
          </div>
          
          {/* Biochemistry Results */}
          <div className="p-4 border rounded-lg bg-green-50">
            <h4 className="mb-3 text-lg font-semibold text-green-800">Biochemistry</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Sodium (mmol/L)</label>
                <input
                  type="number"
                  value={formData.sodium}
                  onChange={(e) => setFormData({...formData, sodium: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Normal: 136-145"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Potassium (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.potassium}
                  onChange={(e) => setFormData({...formData, potassium: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Normal: 3.5-5.1"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Creatinine (mg/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.creatinine}
                  onChange={(e) => setFormData({...formData, creatinine: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Normal: 0.7-1.3"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Glucose (mg/dL)</label>
                <input
                  type="number"
                  value={formData.glucose}
                  onChange={(e) => setFormData({...formData, glucose: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Normal: 70-100"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-700">Troponin (ng/mL) - Optional</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.troponin}
                  onChange={(e) => setFormData({...formData, troponin: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Normal: <0.04"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {bloodResult ? 'Update Results' : 'Save Results'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Blood Results Modal Component
const BloodResultsModal = ({ result, onClose }: { result: BloodResult, onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div className="w-full max-w-4xl overflow-y-auto bg-white shadow-xl rounded-xl max-h-[90vh]">
      <div className="sticky top-0 flex items-center justify-between p-4 bg-white border-b">
        <h3 className="text-lg font-bold text-gray-800">Blood Test Results - {result.patient}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Patient Info Header */}
        <div className="p-4 rounded-lg bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div><span className="font-medium">Patient:</span> {result.patient}</div>
            <div><span className="font-medium">MRN:</span> {result.mrn}</div>
            <div><span className="font-medium">Date:</span> {result.date}</div>
            <div><span className="font-medium">Test Type:</span> {result.testType}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* FBC Results */}
          <div className="p-4 border rounded-lg bg-blue-50">
            <h4 className="mb-3 text-lg font-semibold text-blue-800">Full Blood Count (FBC)</h4>
            <div className="space-y-2">
              {Object.entries(result.results.fbc).map(([key, value]: [string, BloodTestValue]) => (
                <div key={key} className={`p-2 rounded ${value.status === 'Normal' ? 'bg-green-100' : value.status === 'High' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                  <div className="flex justify-between">
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className={`font-bold ${value.status === 'Normal' ? 'text-green-700' : value.status === 'High' ? 'text-red-700' : 'text-yellow-700'}`}>
                      {value.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Value: {value.value} | Normal: {value.normal}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Biochemistry Results */}
          <div className="p-4 border rounded-lg bg-green-50">
            <h4 className="mb-3 text-lg font-semibold text-green-800">Biochemistry</h4>
            <div className="space-y-2">
              {Object.entries(result.results.biochemistry).map(([key, value]: [string, BloodTestValue]) => (
                <div key={key} className={`p-2 rounded ${value.status === 'Normal' ? 'bg-green-100' : value.status === 'High' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                  <div className="flex justify-between">
                    <span className="font-medium capitalize">{key}</span>
                    <span className={`font-bold ${value.status === 'Normal' ? 'text-green-700' : value.status === 'High' ? 'text-red-700' : 'text-yellow-700'}`}>
                      {value.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Value: {value.value} | Normal: {value.normal}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Print Results
          </button>
          <button
            onClick={() => alert('Sharing results with patient...')}
            className="px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
          >
            Share Results
          </button>
          <button
            onClick={() => alert('Sending to referring physician...')}
            className="px-4 py-2 text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            Send to Physician
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Sample Data
const initialBloodResults: BloodResult[] = [
  {
    id: 1,
    patient: 'John Smith',
    mrn: 'MRN001',
    date: '2025-06-23',
    status: 'Complete',
    critical: true,
    testType: 'Emergency Panel',
    results: {
      fbc: {
        hemoglobin: { value: 8.2, normal: '12.0-15.5 g/dL', status: 'Low' },
        whiteCount: { value: 15.2, normal: '4.0-11.0 x10³/μL', status: 'High' },
        platelets: { value: 150, normal: '150-450 x10³/μL', status: 'Normal' },
        hematocrit: { value: 28.0, normal: '36-46%', status: 'Low' }
      },
      biochemistry: {
        sodium: { value: 140, normal: '136-145 mmol/L', status: 'Normal' },
        potassium: { value: 4.0, normal: '3.5-5.1 mmol/L', status: 'Normal' },
        creatinine: { value: 1.8, normal: '0.7-1.3 mg/dL', status: 'High' },
        glucose: { value: 90, normal: '70-100 mg/dL', status: 'Normal' },
        troponin: { value: 0.8, normal: '<0.04 ng/mL', status: 'High' }
      }
    }
  },
  {
    id: 2,
    patient: 'Maria Garcia',
    mrn: 'MRN002',
    date: '2025-06-22',
    status: 'Complete',
    critical: false,
    testType: 'Full Blood Count + Biochemistry',
    results: {
      fbc: {
        hemoglobin: { value: 12.8, normal: '12.0-15.5 g/dL', status: 'Normal' },
        whiteCount: { value: 8.5, normal: '4.0-11.0 x10³/μL', status: 'Normal' },
        platelets: { value: 280, normal: '150-450 x10³/μL', status: 'Normal' },
        hematocrit: { value: 39.0, normal: '36-46%', status: 'Normal' }
      },
      biochemistry: {
        sodium: { value: 142, normal: '136-145 mmol/L', status: 'Normal' },
        potassium: { value: 4.2, normal: '3.5-5.1 mmol/L', status: 'Normal' },
        creatinine: { value: 0.9, normal: '0.7-1.3 mg/dL', status: 'Normal' },
        glucose: { value: 85, normal: '70-100 mg/dL', status: 'Normal' }
      }
    }
  },
  {
    id: 3,
    patient: 'Robert Johnson',
    mrn: 'MRN003',
    date: '2025-06-21',
    status: 'Complete',
    critical: false,
    testType: 'Full Blood Count + Biochemistry',
    results: {
      fbc: {
        hemoglobin: { value: 14.2, normal: '12.0-15.5 g/dL', status: 'Normal' },
        whiteCount: { value: 7.8, normal: '4.0-11.0 x10³/μL', status: 'Normal' },
        platelets: { value: 320, normal: '150-450 x10³/μL', status: 'Normal' },
        hematocrit: { value: 42.0, normal: '36-46%', status: 'Normal' }
      },
      biochemistry: {
        sodium: { value: 139, normal: '136-145 mmol/L', status: 'Normal' },
        potassium: { value: 3.8, normal: '3.5-5.1 mmol/L', status: 'Normal' },
        creatinine: { value: 1.1, normal: '0.7-1.3 mg/dL', status: 'Normal' },
        glucose: { value: 92, normal: '70-100 mg/dL', status: 'Normal' }
      }
    }
  }
];

// Main Blood Results Component
const BloodResults: React.FC = () => {
  const [bloodResults, setBloodResults] = useState<BloodResult[]>(initialBloodResults);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'date' | 'patient' | 'test'>('date');
  const [showModal, setShowModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<BloodResult | null>(null);
  const [editingResult, setEditingResult] = useState<BloodResult | null>(null);

  // Filter blood results
  const filteredResults = bloodResults.filter(result =>
    result.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.testType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle blood result save/update
  const handleSaveBloodResult = (resultData: BloodResult) => {
    if (editingResult) {
      setBloodResults(bloodResults.map(r => 
        r.id === resultData.id ? resultData : r
      ));
    } else {
      setBloodResults([...bloodResults, resultData]);
    }
    setEditingResult(null);
  };

  // Handle actions
  const handleViewFullResults = (result: BloodResult) => {
    setSelectedPatient(result);
    setShowResultsModal(true);
  };

  const handleEdit = (result: BloodResult) => {
    setEditingResult(result);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this blood test result?')) {
      setBloodResults(bloodResults.filter(r => r.id !== id));
    }
  };

  const handlePrint = (result: BloodResult) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Blood Test Results - ${result.patient}</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Blood Test Results</h2>
            <p><strong>Patient:</strong> ${result.patient}</p>
            <p><strong>MRN:</strong> ${result.mrn}</p>
            <p><strong>Date:</strong> ${result.date}</p>
            <p><strong>Test Type:</strong> ${result.testType}</p>
            ${result.critical ? '<p style="color: red;"><strong>⚠️ CRITICAL RESULTS</strong></p>' : ''}
            
            <h3>Full Blood Count (FBC)</h3>
            ${Object.entries(result.results.fbc).map(([key, value]) => 
              `<p><strong>${key}:</strong> ${value.value} (${value.status}) - Normal: ${value.normal}</p>`
            ).join('')}
            
            <h3>Biochemistry</h3>
            ${Object.entries(result.results.biochemistry).map(([key, value]) => 
              `<p><strong>${key}:</strong> ${value.value} (${value.status}) - Normal: ${value.normal}</p>`
            ).join('')}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gray-50">
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Blood Test Results</h1>
        </div>
        
        <SearchFilterControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterBy={filterBy}
          setFilterBy={setFilterBy}
          filterOptions={[
            { value: 'date', label: 'Filter by Date' },
            { value: 'patient', label: 'Filter by Patient' },
            { value: 'test', label: 'Filter by Test Type' }
          ]}
          onAdd={() => setShowModal(true)}
          addButtonText="Add Blood Result"
          placeholder="Search blood results..."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResults.map(result => (
            <div key={result.id} className={`p-4 bg-white shadow-lg rounded-xl border-l-4 hover:shadow-xl transition-shadow ${result.critical ? 'border-red-500' : 'border-blue-500'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-800">{result.patient}</h3>
                {result.critical && (
                  <span className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-red-600 bg-red-100 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    CRITICAL
                  </span>
                )}
              </div>
              <div className="mb-2 text-sm text-gray-600">
                <p className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  MRN: {result.mrn}
                </p>
                <p className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {result.date}
                </p>
                <p className="text-xs text-gray-500">{result.testType}</p>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(result.status)}`}>
                  {result.status}
                </span>
              </div>
              
              {/* Quick Summary */}
              <div className="mb-3 space-y-1">
                <div className="text-xs">
                  <span className="font-medium">Hemoglobin:</span> 
                  <span className={`ml-1 ${result.results.fbc.hemoglobin.status === 'Normal' ? 'text-green-600' : 'text-red-600'}`}>
                    {result.results.fbc.hemoglobin.value} {result.results.fbc.hemoglobin.status}
                  </span>
                </div>
                <div className="text-xs">
                  <span className="font-medium">WBC:</span> 
                  <span className={`ml-1 ${result.results.fbc.whiteCount.status === 'Normal' ? 'text-green-600' : 'text-red-600'}`}>
                    {result.results.fbc.whiteCount.value} {result.results.fbc.whiteCount.status}
                  </span>
                </div>
                {result.results.biochemistry.troponin && (
                  <div className="text-xs">
                    <span className="font-medium">Troponin:</span> 
                    <span className={`ml-1 ${result.results.biochemistry.troponin.status === 'Normal' ? 'text-green-600' : 'text-red-600'}`}>
                      {result.results.biochemistry.troponin.value} {result.results.biochemistry.troponin.status}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-1">
                <button 
                  onClick={() => handleViewFullResults(result)}
                  className="flex-1 px-2 py-1 text-xs text-blue-600 transition-colors bg-blue-100 rounded hover:bg-blue-200"
                >
                  View Full Results
                </button>
                <button 
                  onClick={() => handlePrint(result)}
                  className="flex-1 px-2 py-1 text-xs text-green-600 transition-colors bg-green-100 rounded hover:bg-green-200"
                >
                  Print
                </button>
              </div>
              <div className="flex gap-1 mt-2">
                <button 
                  onClick={() => handleEdit(result)}
                  className="flex-1 px-2 py-1 text-xs text-purple-600 transition-colors bg-purple-100 rounded hover:bg-purple-200"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(result.id)}
                  className="flex-1 px-2 py-1 text-xs text-red-600 transition-colors bg-red-100 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredResults.length === 0 && (
          <div className="py-12 text-center">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No Blood Results Found</h3>
            <p className="text-gray-500">No blood test results match your search. Try adjusting your search terms or add new results.</p>
          </div>
        )}

        {/* Blood Test Form Modal */}
        <BloodTestModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingResult(null);
          }}
          onSave={handleSaveBloodResult}
          bloodResult={editingResult}
        />

        {/* Blood Results Detail Modal */}
        {showResultsModal && selectedPatient && (
          <BloodResultsModal 
            result={selectedPatient} 
            onClose={() => setShowResultsModal(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default BloodResults;