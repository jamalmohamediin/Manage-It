import React, { useState } from 'react';
import {
  Search, Filter, Plus, X, FileText, User, Pill, Calendar, Clock
} from 'lucide-react';

// Types
interface Prescription {
  id: number;
  patient: string;
  medication: string;
  dosage: string;
  date: string;
  status: string;
  duration: string;
  frequency: string;
  prescriber: string;
  instructions?: string;
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

// Prescription Form Modal
const PrescriptionModal = ({ isOpen, onClose, onSave, prescription = null }: any) => {
  const [formData, setFormData] = useState({
    patient: prescription?.patient || '',
    medication: prescription?.medication || '',
    dosage: prescription?.dosage || '',
    frequency: prescription?.frequency || '',
    duration: prescription?.duration || '',
    instructions: prescription?.instructions || '',
    prescriber: prescription?.prescriber || 'Dr. Current'
  });

  const handleSubmit = () => {
    const newPrescription: Prescription = {
      id: prescription?.id || Date.now(),
      ...formData,
      date: prescription?.date || new Date().toLocaleDateString(),
      status: prescription?.status || 'Active'
    };
    onSave(newPrescription);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md overflow-y-auto bg-white shadow-xl rounded-xl max-h-[90vh]">
        <div className="sticky top-0 flex items-center justify-between p-4 bg-white border-b">
          <h3 className="text-lg font-bold text-gray-800">
            {prescription ? 'Edit Prescription' : 'New Prescription'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Patient Name *</label>
            <input
              type="text"
              required
              value={formData.patient}
              onChange={(e) => setFormData({...formData, patient: e.target.value})}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter patient name"
            />
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Medication *</label>
            <input
              type="text"
              required
              value={formData.medication}
              onChange={(e) => setFormData({...formData, medication: e.target.value})}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Amoxicillin 500mg"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Dosage</label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 500mg"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 7 days"
              />
            </div>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({...formData, frequency: e.target.value})}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select frequency</option>
              <option value="Once daily">Once daily</option>
              <option value="Twice daily">Twice daily</option>
              <option value="Three times daily">Three times daily</option>
              <option value="Four times daily">Four times daily</option>
              <option value="Every 4 hours">Every 4 hours</option>
              <option value="Every 6 hours">Every 6 hours</option>
              <option value="Every 8 hours">Every 8 hours</option>
              <option value="As needed">As needed</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Special Instructions</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({...formData, instructions: e.target.value})}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="e.g., Take with food, avoid alcohol..."
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {prescription ? 'Update Prescription' : 'Create Prescription'}
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

// Sample Data
const initialPrescriptions: Prescription[] = [
  {
    id: 1,
    patient: 'John Smith',
    medication: 'Morphine 10mg IV',
    dosage: '10mg',
    date: 'Today at 10:30 AM',
    status: 'Active',
    duration: '3 days',
    frequency: 'Every 4 hours',
    prescriber: 'Dr. Williams',
    instructions: 'Monitor for respiratory depression'
  },
  {
    id: 2,
    patient: 'Maria Garcia',
    medication: 'Omeprazole 40mg PO',
    dosage: '40mg',
    date: 'Yesterday at 3:15 PM',
    status: 'Active',
    duration: '7 days',
    frequency: 'Once daily',
    prescriber: 'Dr. Johnson',
    instructions: 'Take before breakfast'
  },
  {
    id: 3,
    patient: 'Sarah Miller',
    medication: 'Antibiotics 500mg',
    dosage: '500mg',
    date: 'Yesterday at 2:00 PM',
    status: 'Active',
    duration: '10 days',
    frequency: 'Twice daily',
    prescriber: 'Dr. Brown',
    instructions: 'Complete full course even if feeling better'
  },
  {
    id: 4,
    patient: 'Robert Johnson',
    medication: 'Paracetamol 1g PO',
    dosage: '1g',
    date: 'Today at 8:00 AM',
    status: 'Completed',
    duration: '5 days',
    frequency: 'Every 6 hours',
    prescriber: 'Dr. Davis',
    instructions: 'Maximum 4g per day'
  }
];

// Main Prescriptions Component
const Prescriptions: React.FC = () => {
  const [prescriptionsList, setPrescriptionsList] = useState<Prescription[]>(initialPrescriptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'date' | 'patient' | 'medication'>('date');
  const [showModal, setShowModal] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);

  // Filter prescriptions
  const filteredPrescriptions = prescriptionsList.filter(prescription =>
    prescription.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.medication.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle prescription save/update
  const handleSavePrescription = (prescriptionData: Prescription) => {
    if (editingPrescription) {
      setPrescriptionsList(prescriptionsList.map(p => 
        p.id === prescriptionData.id ? prescriptionData : p
      ));
    } else {
      setPrescriptionsList([...prescriptionsList, prescriptionData]);
    }
    setEditingPrescription(null);
  };

  // Handle prescription actions
  const handleModify = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setShowModal(true);
  };

  const handleRenew = (prescription: Prescription) => {
    const renewedPrescription: Prescription = {
      ...prescription,
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      status: 'Active'
    };
    setPrescriptionsList([...prescriptionsList, renewedPrescription]);
  };

  const handleDiscontinue = (id: number) => {
    setPrescriptionsList(prescriptionsList.map(p => 
      p.id === id ? {...p, status: 'Completed'} : p
    ));
  };

  const handleArchive = (id: number) => {
    setPrescriptionsList(prescriptionsList.filter(p => p.id !== id));
  };

  const handlePrint = (prescription: Prescription) => {
    // In a real app, this would generate a proper prescription printout
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Prescription - ${prescription.patient}</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Medical Prescription</h2>
            <p><strong>Patient:</strong> ${prescription.patient}</p>
            <p><strong>Medication:</strong> ${prescription.medication}</p>
            <p><strong>Dosage:</strong> ${prescription.dosage}</p>
            <p><strong>Frequency:</strong> ${prescription.frequency}</p>
            <p><strong>Duration:</strong> ${prescription.duration}</p>
            <p><strong>Instructions:</strong> ${prescription.instructions || 'None'}</p>
            <p><strong>Prescribed by:</strong> ${prescription.prescriber}</p>
            <p><strong>Date:</strong> ${prescription.date}</p>
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
          <Pill className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Digital Prescriptions</h1>
        </div>
        
        <SearchFilterControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterBy={filterBy}
          setFilterBy={setFilterBy}
          filterOptions={[
            { value: 'date', label: 'Filter by Date' },
            { value: 'patient', label: 'Filter by Patient' },
            { value: 'medication', label: 'Filter by Medication' }
          ]}
          onAdd={() => setShowModal(true)}
          addButtonText="Create Prescription"
          placeholder="Search prescriptions..."
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Active Prescriptions */}
          <div className="p-4 bg-white shadow-lg rounded-xl">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-green-600">
              <Clock className="w-5 h-5" />
              Active Prescriptions ({filteredPrescriptions.filter(p => p.status === 'Active').length})
            </h3>
            <div className="space-y-3 overflow-y-auto max-h-96">
              {filteredPrescriptions.filter(p => p.status === 'Active').map(prescription => (
                <div key={prescription.id} className="p-4 transition-colors border rounded-lg bg-green-50 hover:bg-green-100">
                  <div className="mb-2">
                    <p className="text-lg font-bold text-green-800">{prescription.medication}</p>
                    <p className="flex items-center gap-1 text-sm text-gray-600">
                      <User className="w-3 h-3" />
                      {prescription.patient}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2 text-xs text-gray-500">
                    <p><span className="font-medium">Prescribed:</span> {prescription.date}</p>
                    <p><span className="font-medium">Duration:</span> {prescription.duration}</p>
                    <p><span className="font-medium">Frequency:</span> {prescription.frequency}</p>
                    <p><span className="font-medium">By:</span> {prescription.prescriber}</p>
                  </div>
                  {prescription.instructions && (
                    <p className="p-2 mb-3 text-xs text-gray-600 rounded bg-blue-50">
                      <span className="font-medium">Instructions:</span> {prescription.instructions}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    <button 
                      onClick={() => handleModify(prescription)}
                      className="px-2 py-1 text-xs text-blue-600 transition-colors bg-blue-100 rounded hover:bg-blue-200"
                    >
                      Modify
                    </button>
                    <button 
                      onClick={() => handleRenew(prescription)}
                      className="px-2 py-1 text-xs text-green-600 transition-colors bg-green-100 rounded hover:bg-green-200"
                    >
                      Renew
                    </button>
                    <button 
                      onClick={() => handleDiscontinue(prescription.id)}
                      className="px-2 py-1 text-xs text-red-600 transition-colors bg-red-100 rounded hover:bg-red-200"
                    >
                      Discontinue
                    </button>
                    <button 
                      onClick={() => handlePrint(prescription)}
                      className="px-2 py-1 text-xs text-purple-600 transition-colors bg-purple-100 rounded hover:bg-purple-200"
                    >
                      Print
                    </button>
                  </div>
                </div>
              ))}
              {filteredPrescriptions.filter(p => p.status === 'Active').length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  <Pill className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No active prescriptions</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Completed Prescriptions */}
          <div className="p-4 bg-white shadow-lg rounded-xl">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-600">
              <Calendar className="w-5 h-5" />
              Completed Prescriptions ({filteredPrescriptions.filter(p => p.status === 'Completed').length})
            </h3>
            <div className="space-y-3 overflow-y-auto max-h-96">
              {filteredPrescriptions.filter(p => p.status === 'Completed').map(prescription => (
                <div key={prescription.id} className="p-4 transition-colors border rounded-lg bg-gray-50 hover:bg-gray-100">
                  <div className="mb-2">
                    <p className="text-lg font-bold text-gray-800">{prescription.medication}</p>
                    <p className="flex items-center gap-1 text-sm text-gray-600">
                      <User className="w-3 h-3" />
                      {prescription.patient}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2 text-xs text-gray-500">
                    <p><span className="font-medium">Completed:</span> {prescription.date}</p>
                    <p><span className="font-medium">Duration:</span> {prescription.duration}</p>
                    <p><span className="font-medium">Frequency:</span> {prescription.frequency}</p>
                    <p><span className="font-medium">By:</span> {prescription.prescriber}</p>
                  </div>
                  {prescription.instructions && (
                    <p className="p-2 mb-3 text-xs text-gray-600 rounded bg-blue-50">
                      <span className="font-medium">Instructions:</span> {prescription.instructions}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    <button 
                      onClick={() => alert('Viewing prescription history...')}
                      className="px-2 py-1 text-xs text-blue-600 transition-colors bg-blue-100 rounded hover:bg-blue-200"
                    >
                      View History
                    </button>
                    <button 
                      onClick={() => handleRenew(prescription)}
                      className="px-2 py-1 text-xs text-green-600 transition-colors bg-green-100 rounded hover:bg-green-200"
                    >
                      Reorder
                    </button>
                    <button 
                      onClick={() => handleArchive(prescription.id)}
                      className="px-2 py-1 text-xs text-orange-600 transition-colors bg-orange-100 rounded hover:bg-orange-200"
                    >
                      Archive
                    </button>
                  </div>
                </div>
              ))}
              {filteredPrescriptions.filter(p => p.status === 'Completed').length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No completed prescriptions</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {filteredPrescriptions.length === 0 && (
          <div className="py-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No Prescriptions Found</h3>
            <p className="text-gray-500">No prescriptions match your search. Try adjusting your search terms or create a new prescription.</p>
          </div>
        )}

        {/* Prescription Modal */}
        <PrescriptionModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingPrescription(null);
          }}
          onSave={handleSavePrescription}
          prescription={editingPrescription}
        />
      </div>
    </div>
  );
};

export default Prescriptions;