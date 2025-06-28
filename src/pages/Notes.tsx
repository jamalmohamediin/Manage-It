import React, { useState } from 'react';
import {
  Search, Filter, Plus, MessageSquare, Edit, Share, Archive, 
  Trash2, FileText, Calendar, Stethoscope, X, Printer,
  Save, Clock
} from 'lucide-react';

// Types
interface Note {
  id: number;
  patient: string;
  type: string;
  content: string;
  date: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'final' | 'amended';
  doctor: string;
}

interface NotesTabProps {
  notesList?: Note[];
  setNotesList?: (notes: Note[]) => void;
  onShowNotesModal?: () => void;
}

// Sample data for demonstration
const initialNotes: Note[] = [
  {
    id: 1,
    patient: 'John Smith',
    type: 'Progress Note',
    content: 'Post-operative recovery progressing well. Patient is alert and oriented. Wound healing appropriately with no signs of infection. Pain controlled with current regimen.',
    date: 'Today',
    time: '10:30 AM',
    priority: 'medium',
    status: 'final',
    doctor: 'Dr. Johnson'
  },
  {
    id: 2,
    patient: 'Maria Garcia',
    type: 'Surgery Note',
    content: 'Pre-operative assessment completed. Patient fasted appropriately. Consents signed. Ready for laparoscopic cholecystectomy scheduled for tomorrow.',
    date: 'Yesterday',
    time: '3:15 PM',
    priority: 'high',
    status: 'final',
    doctor: 'Dr. Smith'
  },
  {
    id: 3,
    patient: 'Robert Johnson',
    type: 'Discharge Note',
    content: 'Patient ready for discharge. Post-operative recovery excellent. Follow-up scheduled in 2 weeks. Discharge instructions provided.',
    date: 'Today',
    time: '8:00 AM',
    priority: 'low',
    status: 'final',
    doctor: 'Dr. Wilson'
  },
  {
    id: 4,
    patient: 'Sarah Miller',
    type: 'Consultation Note',
    content: 'Initial consultation findings: 28-year-old female presenting with right lower quadrant pain. Clinical examination suggestive of appendicitis. Recommending urgent surgical evaluation.',
    date: 'Yesterday',
    time: '1:00 PM',
    priority: 'high',
    status: 'final',
    doctor: 'Dr. Brown'
  }
];

const NotesTab: React.FC<NotesTabProps> = ({ 
  notesList = initialNotes
}) => {
  // Local state
  const [notes, setNotes] = useState<Note[]>(notesList);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('date');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form state for new/edit note
  const [formData, setFormData] = useState({
    patient: '',
    type: 'Progress Note',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    doctor: 'Dr. Johnson'
  });

  const addNote = () => {
    const newNote: Note = {
      id: Date.now(),
      ...formData,
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'draft'
    };
    setNotes([newNote, ...notes]);
    setFormData({ patient: '', type: 'Progress Note', content: '', priority: 'medium', doctor: 'Dr. Johnson' });
    setShowAddModal(false);
  };

  const editNote = () => {
    if (editingNote) {
      const updatedNotes = notes.map(note => 
        note.id === editingNote.id 
          ? { ...note, ...formData, status: 'amended' as const }
          : note
      );
      setNotes(updatedNotes);
      setShowEditModal(false);
      setEditingNote(null);
    }
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const archiveNote = (noteId: number) => {
    // In a real app, this would move to archived section
    alert('Note archived successfully!');
  };

  const shareNote = (note: Note) => {
    setSelectedNote(note);
  };

  // Filtering
  const filteredNotes = notes.filter(note =>
    note.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.doctor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'final': return 'bg-green-100 text-green-700';
      case 'amended': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Clinical Notes</h1>
          <p className="text-gray-600">Manage and review patient clinical documentation</p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-3 p-4 text-white transition-all duration-200 transform bg-green-600 shadow-lg hover:bg-green-700 rounded-xl hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Note</span>
          </button>
          
          <div className="flex items-center col-span-2 gap-3 p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 text-gray-700 placeholder-gray-400 outline-none"
            />
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="flex-1 text-gray-700 bg-transparent outline-none"
            >
              <option value="date">Filter by Date</option>
              <option value="patient">Filter by Patient</option>
              <option value="type">Filter by Type</option>
              <option value="priority">Filter by Priority</option>
            </select>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {filteredNotes.map(note => (
            <div key={note.id} className={`p-6 bg-white rounded-xl shadow-sm border-l-4 ${getPriorityColor(note.priority)} hover:shadow-md transition-shadow`}>
              <div className="flex flex-col mb-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1 mb-4 md:mb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {note.type} - {note.patient}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(note.status)}`}>
                      {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mb-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{note.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{note.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Stethoscope className="w-4 h-4" />
                      <span>{note.doctor}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => {
                      setEditingNote(note);
                      setFormData({
                        patient: note.patient,
                        type: note.type,
                        content: note.content,
                        priority: note.priority,
                        doctor: note.doctor
                      });
                      setShowEditModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-xs text-blue-600 transition-colors bg-blue-100 rounded-lg hover:bg-blue-200"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button 
                    onClick={() => shareNote(note)}
                    className="flex items-center gap-1 px-3 py-1 text-xs text-green-600 transition-colors bg-green-100 rounded-lg hover:bg-green-200"
                  >
                    <Share className="w-3 h-3" />
                    Share
                  </button>
                  <button 
                    onClick={() => archiveNote(note.id)}
                    className="flex items-center gap-1 px-3 py-1 text-xs text-orange-600 transition-colors bg-orange-100 rounded-lg hover:bg-orange-200"
                  >
                    <Archive className="w-3 h-3" />
                    Archive
                  </button>
                  <button 
                    onClick={() => deleteNote(note.id)}
                    className="flex items-center gap-1 px-3 py-1 text-xs text-red-600 transition-colors bg-red-100 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
              
              <p className="mb-4 leading-relaxed text-gray-700">{note.content}</p>
              
              <div className="flex flex-wrap gap-2">
                <button className="flex items-center gap-1 px-3 py-1 text-xs text-purple-600 transition-colors bg-purple-100 rounded-lg hover:bg-purple-200">
                  <FileText className="w-3 h-3" />
                  Add Amendment
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-3 py-1 text-xs text-gray-600 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <Printer className="w-3 h-3" />
                  Print
                </button>
                <button className="flex items-center gap-1 px-3 py-1 text-xs text-indigo-600 transition-colors bg-indigo-100 rounded-lg hover:bg-indigo-200">
                  <Save className="w-3 h-3" />
                  Save as Template
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="py-16 text-center bg-white shadow-sm rounded-xl">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="mb-2 text-xl font-medium text-gray-900">No Clinical Notes Found</h3>
            <p className="mb-6 text-gray-500">No notes match your current search criteria.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
            >
              Create First Note
            </button>
          </div>
        )}

        {/* Add Note Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Add New Clinical Note</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 transition-colors hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Patient Name</label>
                    <input
                      type="text"
                      value={formData.patient}
                      onChange={(e) => setFormData({...formData, patient: e.target.value})}
                      placeholder="Enter patient name"
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Note Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Progress Note">Progress Note</option>
                      <option value="Surgery Note">Surgery Note</option>
                      <option value="Consultation Note">Consultation Note</option>
                      <option value="Discharge Note">Discharge Note</option>
                      <option value="Admission Note">Admission Note</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as 'low' | 'medium' | 'high'})}
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Doctor</label>
                    <input
                      type="text"
                      value={formData.doctor}
                      onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                      placeholder="Enter doctor name"
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Clinical Note Content</label>
                  <textarea
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Enter detailed clinical note..."
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={addNote}
                  disabled={!formData.patient || !formData.content}
                  className="flex-1 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Note Modal */}
        {showEditModal && editingNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Edit Clinical Note</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 transition-colors hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Patient Name</label>
                    <input
                      type="text"
                      value={formData.patient}
                      onChange={(e) => setFormData({...formData, patient: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Note Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Progress Note">Progress Note</option>
                      <option value="Surgery Note">Surgery Note</option>
                      <option value="Consultation Note">Consultation Note</option>
                      <option value="Discharge Note">Discharge Note</option>
                      <option value="Admission Note">Admission Note</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as 'low' | 'medium' | 'high'})}
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Doctor</label>
                    <input
                      type="text"
                      value={formData.doctor}
                      onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Clinical Note Content</label>
                  <textarea
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={editNote}
                  className="flex-1 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Update Note
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Note Modal */}
        {selectedNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Share Clinical Note</h3>
                <button
                  onClick={() => setSelectedNote(null)}
                  className="text-gray-400 transition-colors hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="block text-sm font-medium text-gray-600">Type:</span>
                      <span className="text-gray-900">{selectedNote.type}</span>
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-gray-600">Patient:</span>
                      <span className="text-gray-900">{selectedNote.patient}</span>
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-gray-600">Date:</span>
                      <span className="text-gray-900">{selectedNote.date}</span>
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-gray-600">Doctor:</span>
                      <span className="text-gray-900">{selectedNote.doctor}</span>
                    </div>
                  </div>
                  <div>
                    <span className="block mb-2 text-sm font-medium text-gray-600">Content:</span>
                    <div className="p-3 bg-white border rounded">
                      <p className="leading-relaxed text-gray-900">{selectedNote.content}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Share with:</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Message (Optional):</label>
                  <textarea
                    rows={3}
                    placeholder="Add a message..."
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedNote(null)}
                  className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Note shared successfully!');
                    setSelectedNote(null);
                  }}
                  className="flex-1 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Share Note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesTab;