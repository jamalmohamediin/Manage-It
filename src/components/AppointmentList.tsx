import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, User, Users, Phone, MapPin, Edit3, Trash2,
  CheckCircle, XCircle, RotateCcw, Bell, Eye, Search, Filter,
  Plus, Loader, AlertCircle, Save, X, UserCheck
} from 'lucide-react';

// Mock Firebase functions for demonstration
const mockFirebaseFunctions = {
  getAppointments: async (businessId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      {
        id: '1',
        patientId: 'p1',
        doctorId: 'd1',
        date: new Date().toISOString(),
        reason: 'Regular checkup',
        status: 'scheduled',
        duration: 30,
        location: 'Room 101'
      },
      {
        id: '2',
        patientId: 'p2',
        doctorId: 'd2',
        date: new Date(Date.now() + 86400000).toISOString(),
        reason: 'Follow-up consultation',
        status: 'confirmed',
        duration: 45,
        location: 'Room 102'
      }
    ];
  },
  getPatients: async (businessId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 'p1', fullName: 'John Doe', phone: '+1 (555) 123-4567' },
      { id: 'p2', fullName: 'Jane Smith', phone: '+1 (555) 987-6543' }
    ];
  },
  fetchAllRoles: async (businessId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { userId: 'd1', role: 'doctor', name: 'Dr. Johnson' },
      { userId: 'd2', role: 'doctor', name: 'Dr. Williams' }
    ];
  },
  updateAppointment: async (id: string, updates: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },
  deleteAppointment: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }
};

// Types
interface Appointment {
  id: string;
  patientId?: string;
  doctorId?: string;
  date: string;
  reason: string;
  status: string;
  duration?: number;
  location?: string;
}

interface Patient {
  id: string;
  fullName: string;
  phone?: string;
}

interface UserRole {
  userId: string;
  role?: string;
  name?: string;
}

// Mock hook for demonstration
const useBusinessId = () => 'demo-business-id';

const toast = {
  success: (message: string) => {
    console.log('Success:', message);
    // In real app, this would show a toast notification
  },
  error: (message: string) => {
    console.log('Error:', message);
    // In real app, this would show an error toast
  }
};

const AppointmentList: React.FC = () => {
  const businessId = useBusinessId();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Appointment>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Load data
  useEffect(() => {
    if (!businessId) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        const [appointmentsData, patientsData, rolesData] = await Promise.all([
          mockFirebaseFunctions.getAppointments(businessId),
          mockFirebaseFunctions.getPatients(businessId),
          mockFirebaseFunctions.fetchAllRoles(businessId)
        ]);
        
        setAppointments(appointmentsData);
        setPatients(patientsData);
        setDoctors(rolesData.filter(r => r.role?.toLowerCase() === "doctor"));
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [businessId]);

  const getPatientName = (id?: string) => 
    patients.find(p => p.id === id)?.fullName || "Unknown Patient";
  
  const getPatientPhone = (id?: string) => 
    patients.find(p => p.id === id)?.phone || "";
    
  const getDoctorName = (id?: string) => 
    doctors.find(d => d.userId === id)?.name || doctors.find(d => d.userId === id)?.userId || "Unassigned";

  const startEdit = (app: Appointment) => {
    setEditingId(app.id);
    setEditForm({ 
      date: app.date, 
      reason: app.reason, 
      doctorId: app.doctorId || "",
      duration: app.duration || 30,
      location: app.location || ""
    });
  };

  const cancelEdit = () => { 
    setEditingId(null); 
    setEditForm({}); 
  };

  const saveEdit = async (id: string) => {
    try {
      await mockFirebaseFunctions.updateAppointment(id, editForm);
      toast.success("Appointment updated successfully");
      
      // Update local state
      setAppointments(prev => prev.map(a => 
        a.id === id ? { ...a, ...editForm } : a
      ));
      
      cancelEdit();
    } catch (error) {
      toast.error('Failed to update appointment');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await mockFirebaseFunctions.deleteAppointment(id);
        toast.success("Appointment cancelled successfully");
        setAppointments(prev => prev.filter(a => a.id !== id));
      } catch (error) {
        toast.error('Failed to cancel appointment');
      }
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await mockFirebaseFunctions.updateAppointment(id, { status: newStatus });
      setAppointments(prev => prev.map(a => 
        a.id === id ? { ...a, status: newStatus } : a
      ));
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'rescheduled':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      getPatientName(appointment.patientId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDoctorName(appointment.doctorId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50 sm:p-6">
      <div className="mx-auto space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">🗓️ Appointments</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {filteredAppointments.length} of {appointments.length} appointments
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent outline-none"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add Appointment
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden bg-white rounded-lg shadow-sm lg:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-sm font-medium tracking-wider text-left text-gray-500 uppercase">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-sm font-medium tracking-wider text-left text-gray-500 uppercase">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-sm font-medium tracking-wider text-left text-gray-500 uppercase">
                    Reason
                  </th>
                  <th className="px-6 py-4 text-sm font-medium tracking-wider text-left text-gray-500 uppercase">
                    Doctor
                  </th>
                  <th className="px-6 py-4 text-sm font-medium tracking-wider text-left text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-sm font-medium tracking-wider text-left text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === appointment.id ? (
                        <input
                          type="datetime-local"
                          value={editForm.date as string || ""}
                          onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      ) : (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {formatDate(appointment.date)}
                          </div>
                          {appointment.duration && (
                            <div className="text-gray-500">{appointment.duration} min</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getPatientName(appointment.patientId)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getPatientPhone(appointment.patientId)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === appointment.id ? (
                        <input
                          type="text"
                          value={editForm.reason as string || ""}
                          onChange={e => setEditForm(f => ({ ...f, reason: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">{appointment.reason}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === appointment.id ? (
                        <select
                          value={editForm.doctorId || ""}
                          onChange={e => setEditForm(f => ({ ...f, doctorId: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded"
                        >
                          <option value="">Unassigned</option>
                          {doctors.map(d => (
                            <option key={d.userId} value={d.userId}>
                              {d.name || d.userId}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center text-sm text-gray-900">
                          <UserCheck className="w-4 h-4 mr-2 text-gray-500" />
                          {getDoctorName(appointment.doctorId)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      {editingId === appointment.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveEdit(appointment.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(appointment)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {appointment.status.toLowerCase() !== 'completed' && (
                            <button
                              onClick={() => updateStatus(appointment.id, 'completed')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="space-y-4 lg:hidden">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(appointment.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-800">
                      {getPatientName(appointment.patientId)}
                    </span>
                  </div>
                  <div className="mb-2 text-sm text-gray-600">{appointment.reason}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{getDoctorName(appointment.doctorId)}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => startEdit(appointment)}
                  className="flex items-center gap-1 px-3 py-1 text-xs text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit
                </button>
                {appointment.status.toLowerCase() !== 'completed' && (
                  <button
                    onClick={() => updateStatus(appointment.id, 'completed')}
                    className="flex items-center gap-1 px-3 py-1 text-xs text-green-600 bg-green-100 rounded hover:bg-green-200"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Complete
                  </button>
                )}
                <button
                  onClick={() => handleDelete(appointment.id)}
                  className="flex items-center gap-1 px-3 py-1 text-xs text-red-600 bg-red-100 rounded hover:bg-red-200"
                >
                  <Trash2 className="w-3 h-3" />
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAppointments.length === 0 && !loading && (
          <div className="py-12 text-center bg-white rounded-lg shadow-sm">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              {searchTerm || statusFilter !== 'all' ? 'No appointments found' : 'No appointments scheduled'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Schedule your first appointment to get started.'
              }
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {appointments.filter(a => a.status.toLowerCase() === 'scheduled').length}
            </div>
            <div className="text-sm text-gray-600">Scheduled</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {appointments.filter(a => a.status.toLowerCase() === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">
              {appointments.filter(a => a.status.toLowerCase() === 'confirmed').length}
            </div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-red-600">
              {appointments.filter(a => a.status.toLowerCase() === 'cancelled').length}
            </div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentList;