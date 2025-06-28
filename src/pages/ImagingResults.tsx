import React, { useState } from 'react';
import {
  Search, Filter, Plus, Image, X, Share, FileText, 
  Calendar, Clock, User, Activity
} from 'lucide-react';
// FIXED: Removed unused imports 'Download' and 'BarChart3'

// Types
interface ImagingResult {
  id: number;
  type: string;
  patient: string;
  mrn: string;
  date: string;
  status: string;
  urgent: boolean;
  bodyPart?: string;
  findings?: string;
  radiologist?: string;
}

// Sample data
const sampleImagingResults: ImagingResult[] = [
  {
    id: 1,
    type: 'Chest X-ray',
    patient: 'John Smith',
    mrn: 'MRN001',
    date: 'June 23, 2025',
    status: 'Complete',
    urgent: true,
    bodyPart: 'Chest',
    findings: 'Clear lung fields, no acute findings',
    radiologist: 'Dr. Wilson'
  },
  {
    id: 2,
    type: 'CT Abdomen',
    patient: 'Maria Garcia',
    mrn: 'MRN002',
    date: 'June 22, 2025',
    status: 'Complete',
    urgent: false,
    bodyPart: 'Abdomen',
    findings: 'Normal abdominal organs, no masses',
    radiologist: 'Dr. Chen'
  },
  {
    id: 3,
    type: 'MRI Brain',
    patient: 'Robert Johnson',
    mrn: 'MRN003',
    date: 'June 21, 2025',
    status: 'Pending',
    urgent: false,
    bodyPart: 'Brain',
    findings: 'Pending radiologist review',
    radiologist: 'Dr. Patel'
  },
  {
    id: 4,
    type: 'Ultrasound',
    patient: 'Sarah Miller',
    mrn: 'MRN004',
    date: 'June 24, 2025',
    status: 'In Progress',
    urgent: true,
    bodyPart: 'Abdomen',
    findings: 'Study in progress',
    radiologist: 'Dr. Kim'
  }
];

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
      className="flex items-center justify-center gap-2 p-3 text-green-700 transition-all duration-200 transform bg-green-100 shadow-lg rounded-xl hover:bg-green-200 hover:scale-105"
    >
      <Plus className="w-5 h-5" />
      <span className="text-sm font-medium">{addButtonText}</span>
    </button>
    
    <div className="flex items-center col-span-1 gap-2 p-3 bg-blue-100 shadow-lg lg:col-span-2 rounded-xl">
      <Search className="w-4 h-4 text-blue-600" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 text-sm placeholder-blue-600 bg-transparent outline-none"
      />
    </div>
    
    <div className="flex items-center gap-2 p-3 bg-purple-100 shadow-lg rounded-xl">
      <Filter className="w-4 h-4 text-purple-600" />
      <select
        value={filterBy}
        onChange={(e) => setFilterBy(e.target.value)}
        className="flex-1 text-xs text-purple-600 bg-transparent outline-none"
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
      return 'bg-green-100 text-green-700';
    case 'pending':
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-700';
    case 'in progress':
      return 'bg-blue-100 text-blue-700';
    case 'cancelled':
    case 'critical':
      return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

const ImagingResults: React.FC = () => {
  // Local state
  const [imagingResults, setImagingResults] = useState<ImagingResult[]>(sampleImagingResults);
  const [imagingSearchTerm, setImagingSearchTerm] = useState('');
  const [imagingFilterBy, setImagingFilterBy] = useState<'date' | 'type' | 'patient'>('date');
  const [selectedImaging, setSelectedImaging] = useState<ImagingResult | null>(null);
  const [showXraysModal, setShowXraysModal] = useState(false);
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const [selectedForReport, setSelectedForReport] = useState<ImagingResult | null>(null);

  const addImagingResult = () => {
    const newImaging: ImagingResult = {
      id: Date.now(),
      type: 'X-ray',
      patient: 'New Patient',
      mrn: `MRN${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      status: 'Pending',
      urgent: false,
      bodyPart: 'Chest',
      findings: 'Awaiting imaging',
      radiologist: 'Unassigned'
    };
    setImagingResults([...imagingResults, newImaging]);
  };

  // Filtering
  const filteredImaging = imagingResults.filter(imaging =>
    imaging.patient.toLowerCase().includes(imagingSearchTerm.toLowerCase()) ||
    imaging.type.toLowerCase().includes(imagingSearchTerm.toLowerCase()) ||
    imaging.mrn.toLowerCase().includes(imagingSearchTerm.toLowerCase())
  );

  const handleViewImaging = (imaging: ImagingResult) => {
    setSelectedImaging(imaging);
    setShowXraysModal(true);
  };

  const handleGenerateReport = (imaging: ImagingResult) => {
    setSelectedForReport(imaging);
    setShowGenerateReportModal(true);
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="mx-auto space-y-6 max-w-7xl">
        <h2 className="text-2xl font-bold text-gray-800">Imaging Results</h2>
        
        <SearchFilterControls
          searchTerm={imagingSearchTerm}
          setSearchTerm={setImagingSearchTerm}
          filterBy={imagingFilterBy}
          setFilterBy={setImagingFilterBy}
          filterOptions={[
            { value: 'date', label: 'Filter by Date' },
            { value: 'type', label: 'Filter by Type' },
            { value: 'patient', label: 'Filter by Patient' }
          ]}
          onAdd={addImagingResult}
          addButtonText="Order Imaging"
          placeholder="Search imaging results..."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredImaging.map(imaging => (
            <div key={imaging.id} className="p-4 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-center w-full h-24 mb-3 bg-gray-200 rounded sm:h-32">
                <Image className={`w-6 h-6 sm:w-8 sm:h-8 ${imaging.urgent ? 'text-red-500' : 'text-gray-500'}`} />
              </div>
              
              <h3 className={`font-bold text-sm sm:text-base ${imaging.urgent ? 'text-red-800' : 'text-gray-800'}`}>
                {imaging.type}
                {imaging.urgent && <span className="px-2 py-1 ml-2 text-xs text-red-600 bg-red-100 rounded">URGENT</span>}
              </h3>
              
              <p className="text-xs text-gray-600 sm:text-sm">{imaging.patient} - {imaging.mrn}</p>
              <p className="text-xs text-gray-500">{imaging.date}</p>
              
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(imaging.status)}`}>
                  {imaging.status}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-1 mt-2">
                <button 
                  onClick={() => handleViewImaging(imaging)}
                  className="px-2 py-1 text-xs text-blue-600 transition-colors bg-blue-100 rounded hover:bg-blue-200"
                >
                  View
                </button>
                <button 
                  onClick={() => {
                    // Simulate download
                    const link = document.createElement('a');
                    link.href = '#';
                    link.download = `${imaging.type}_${imaging.patient}.pdf`;
                    link.click();
                  }}
                  className="px-2 py-1 text-xs text-green-600 transition-colors bg-green-100 rounded hover:bg-green-200"
                >
                  Download
                </button>
                <button 
                  onClick={() => setSelectedImaging(imaging)}
                  className="px-2 py-1 text-xs text-purple-600 transition-colors bg-purple-100 rounded hover:bg-purple-200"
                >
                  Share
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-1 mt-1">
                <button 
                  onClick={() => handleGenerateReport(imaging)}
                  className="px-2 py-1 text-xs text-orange-600 transition-colors bg-orange-100 rounded hover:bg-orange-200"
                >
                  Report
                </button>
                <button 
                  onClick={() => alert(`Comparing ${imaging.type} with previous studies...`)}
                  className="px-2 py-1 text-xs text-indigo-600 transition-colors bg-indigo-100 rounded hover:bg-indigo-200"
                >
                  Compare
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredImaging.length === 0 && (
          <div className="py-12 text-center">
            <Image className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No Imaging Results</h3>
            <p className="text-gray-500">No imaging results available. Click "Order Imaging" to add new scans.</p>
          </div>
        )}

        {/* X-rays Viewer Modal */}
        {showXraysModal && selectedImaging && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-4xl bg-white shadow-xl rounded-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedImaging.type} - {selectedImaging.patient}
                </h3>
                <button
                  onClick={() => setShowXraysModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Image Viewer */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-center h-64 bg-black rounded-lg sm:h-80 lg:h-96">
                      <div className="text-center text-white">
                        <Image className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-lg font-medium">{selectedImaging.type}</p>
                        <p className="text-sm opacity-75">{selectedImaging.bodyPart}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center justify-center flex-shrink-0 w-16 h-16 transition-colors bg-gray-300 rounded cursor-pointer hover:bg-gray-400">
                          <Image className="w-6 h-6 text-gray-600" />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Details Panel */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-blue-50">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-800">Patient</span>
                        </div>
                        <p className="text-sm text-gray-700">{selectedImaging.patient}</p>
                        <p className="text-xs text-gray-500">{selectedImaging.mrn}</p>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-green-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-800">Date</span>
                        </div>
                        <p className="text-sm text-gray-700">{selectedImaging.date}</p>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-purple-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-purple-800">Status</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(selectedImaging.status)}`}>
                          {selectedImaging.status}
                        </span>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-orange-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span className="font-medium text-orange-800">Priority</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${selectedImaging.urgent ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          {selectedImaging.urgent ? 'URGENT' : 'ROUTINE'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="mb-2 font-medium text-gray-800">Findings</h4>
                      <p className="text-sm text-gray-600">{selectedImaging.findings}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gray-50">
                      <h4 className="mb-2 font-medium text-gray-800">Radiologist</h4>
                      <p className="text-sm text-gray-600">{selectedImaging.radiologist}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 mt-6 border-t">
                  <button
                    onClick={() => setShowXraysModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleGenerateReport(selectedImaging)}
                    className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-white transition-colors bg-orange-600 rounded-lg hover:bg-orange-700"
                  >
                    <FileText className="w-4 h-4" />
                    Generate Report
                  </button>
                  <button
                    onClick={() => {
                      navigator.share?.({
                        title: `${selectedImaging.type} - ${selectedImaging.patient}`,
                        text: `Imaging results for ${selectedImaging.patient}`,
                      }) || alert('Imaging shared successfully!');
                    }}
                    className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Share className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generate Report Modal */}
        {showGenerateReportModal && selectedForReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-bold text-gray-800">Generate Report</h3>
                <button
                  onClick={() => setShowGenerateReportModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-lg bg-blue-50">
                  <h4 className="mb-2 font-medium text-blue-800">Study Information</h4>
                  <p className="text-sm text-gray-700">{selectedForReport.type} - {selectedForReport.patient}</p>
                  <p className="text-xs text-gray-500">{selectedForReport.date}</p>
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Report Template</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Standard Radiology Report</option>
                    <option>Chest X-ray Template</option>
                    <option>CT Scan Template</option>
                    <option>MRI Template</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Additional Notes</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Enter any additional notes or specific observations..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowGenerateReportModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert('Report generated successfully!');
                      setShowGenerateReportModal(false);
                    }}
                    className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <FileText className="w-4 h-4" />
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {selectedImaging && !showXraysModal && !showGenerateReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md bg-white shadow-xl rounded-xl">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-bold text-gray-800">Share Imaging</h3>
                <button
                  onClick={() => setSelectedImaging(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="p-3 rounded-lg bg-gray-50">
                  <h4 className="font-medium text-gray-800">{selectedImaging.type}</h4>
                  <p className="text-sm text-gray-600">{selectedImaging.patient} - {selectedImaging.mrn}</p>
                  <p className="text-xs text-gray-500">{selectedImaging.date}</p>
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Share with</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Message (optional)</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add a message..."
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedImaging(null)}
                    className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert('Imaging shared successfully!');
                      setSelectedImaging(null);
                    }}
                    className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Share className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagingResults;