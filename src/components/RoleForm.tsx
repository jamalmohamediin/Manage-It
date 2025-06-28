// Enhanced Staff & Role Management Component for Medical Management
// 
// To integrate into your project, add these imports back:
// import { addUserRole } from '../firebase/roles';
// import { useBusinessId } from '../hooks/useBusinessId';
// import { toast } from 'react-hot-toast';
//
// Then replace the mock businessId and Firebase calls with your actual implementations

import React, { useState, useEffect } from 'react';
import {
  Shield, User, Calendar, AlertTriangle, Upload, Eye, Trash2, 
  Plus, Search, Filter, CheckCircle, Clock, FileText, Download,
  X, Mail, Phone, MapPin, Users, Activity, Settings, Edit3,
  ChevronDown, ChevronRight, Star, Bell, RefreshCw, UserPlus,
  BarChart3, MessageSquare, ClipboardList, UserCheck
} from 'lucide-react';

// Types
interface Staff {
  id: number;
  name: string;
  role: string;
  department: string;
  shift: string;
  email: string;
  phone?: string;
  status: 'Available' | 'Busy' | 'Off Duty' | 'On Break';
  lastSeen?: string;
  rating?: number;
  specialties?: string[];
  emergencyContact?: string;
  location?: string;
}

interface UserRole {
  id: string;
  userId: string;
  userName: string;
  role: string;
  department: string;
  assignedDate: string;
  expiresAt?: string;
  status: 'Active' | 'Expiring Soon' | 'Expired' | 'Pending';
  assignedBy: string;
  files: RoleFile[];
  permissions: string[];
  email?: string;
  phone?: string;
  location?: string;
}

interface RoleFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  uploadedBy: string;
}

const availableRoles = [
  'Receptionist', 'Doctor', 'Admin', 'Nurse', 'Pharmacist',
  'ICU Supervisor', 'Charge Nurse', 'Resident Coordinator',
  'Department Head', 'Quality Manager', 'Safety Officer', 'Training Coordinator',
  'Attending Physician', 'Resident', 'Fellow', 'Technician'
];

const availablePermissions = [
  'view_patients', 'edit_patients', 'create_tasks', 'view_tasks',
  'manage_roles', 'access_reports', 'view_patient_records',
  'approve_orders', 'supervise_staff', 'patient_care',
  'staff_coordination', 'emergency_response', 'coordinate_residents',
  'schedule_surgeries', 'training_oversight'
];

const departmentOptions = [
  'ICU', 'Emergency', 'Surgery', 'Radiology', 'Laboratory',
  'Pharmacy', 'Cardiology', 'Pediatrics', 'Administration',
  'Critical Care', 'General Medicine'
];

const RoleForm: React.FC = () => {
  // Mock businessId for preview - replace with: const businessId = useBusinessId();
  const businessId = "demo-business-id";
  
  // Staff Management State
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [staffFilterBy, setStaffFilterBy] = useState<'role' | 'department' | 'name'>('role');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    shift: '',
    specialties: '',
    emergencyContact: '',
    location: ''
  });

  // Role Management State  
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [roles, setRoles] = useState<UserRole[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'role' | 'department' | 'status'>('all');
  const [filterValue, setFilterValue] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Initialize sample data
  useEffect(() => {
    // Sample staff data
    setStaffList([
      {
        id: 1,
        name: "Dr. Mike Johnson",
        role: "Resident",
        department: "Surgery",
        shift: "Day Shift",
        email: "mike.johnson@hospital.com",
        phone: "+1 (555) 123-4567",
        status: "Available",
        lastSeen: "2 mins ago",
        rating: 4.8,
        specialties: ["General Surgery"],
        location: "OR 2"
      },
      {
        id: 2,
        name: "Tech Sarah Wilson",
        role: "Technician",
        department: "Radiology",
        shift: "Night Shift",
        email: "sarah.wilson@hospital.com",
        phone: "+1 (555) 234-5678",
        status: "Busy",
        lastSeen: "5 mins ago",
        rating: 4.6,
        specialties: ["Imaging"],
        location: "Radiology Suite 1"
      },
      {
        id: 3,
        name: "Nurse Bob Smith",
        role: "Nurse",
        department: "Emergency",
        shift: "Evening Shift",
        email: "bob.smith@hospital.com",
        phone: "+1 (555) 345-6789",
        status: "Available",
        lastSeen: "1 min ago",
        rating: 4.7,
        specialties: ["Emergency Care"],
        location: "ER Bay 3"
      }
    ]);

    // Sample role data
    setRoles([
      {
        id: '1',
        userId: 'user001',
        userName: 'Dr. Sarah Johnson',
        role: 'ICU Supervisor',
        department: 'Critical Care',
        assignedDate: '2024-01-15',
        expiresAt: '2025-07-15',
        status: 'Active',
        assignedBy: 'Admin',
        files: [
          {
            id: 'f1',
            name: 'ICU_Certification.pdf',
            type: 'PDF',
            size: 2048576,
            uploadDate: '2024-01-15',
            uploadedBy: 'Dr. Sarah Johnson'
          }
        ],
        permissions: ['view_patients', 'approve_orders', 'supervise_staff'],
        email: 'sarah.johnson@hospital.com',
        phone: '+1 (555) 123-4567',
        location: 'ICU Wing A'
      }
    ]);
  }, []);

  // Staff Management Functions
  const addStaff = () => {
    if (newStaff.name && newStaff.email && newStaff.role && newStaff.department && newStaff.shift) {
      const staff: Staff = {
        id: Date.now(),
        name: newStaff.name,
        email: newStaff.email,
        phone: newStaff.phone,
        role: newStaff.role,
        department: newStaff.department,
        shift: newStaff.shift,
        status: 'Available',
        lastSeen: 'Just added',
        rating: 0,
        specialties: newStaff.specialties.split(',').map(s => s.trim()).filter(s => s),
        emergencyContact: newStaff.emergencyContact,
        location: newStaff.location
      };
      setStaffList([...staffList, staff]);
      setNewStaff({
        name: '', email: '', phone: '', role: '', department: '', shift: '',
        specialties: '', emergencyContact: '', location: ''
      });
      setShowAddStaffModal(false);
      alert('Staff member added successfully!');
    }
  };

  const removeStaff = (id: number) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      setStaffList(staffList.filter(s => s.id !== id));
      alert('Staff member removed successfully!');
    }
  };

  const filteredStaff = staffList.filter(staff =>
    staff.name.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
    staff.department.toLowerCase().includes(staffSearchTerm.toLowerCase())
  );

  // Role Management Functions
  const handleCheckboxChange = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) {
      alert('Select a business first');
      return;
    }
    if (!userId || !role || !userName) {
      alert('User ID, Name and Role are required');
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call delay (remove this in production)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add to local state for immediate UI update
      const newRole: UserRole = {
        id: Date.now().toString(),
        userId,
        userName,
        role,
        department,
        assignedDate: new Date().toISOString().split('T')[0],
        expiresAt: expiresAt || undefined,
        status: 'Active',
        assignedBy: 'Current User',
        files: [],
        permissions,
        email,
        phone,
        location
      };
      setRoles([...roles, newRole]);
      
      alert('Role assigned successfully');
      
      // Reset form
      setUserId('');
      setUserName('');
      setRole('');
      setDepartment('');
      setPermissions([]);
      setExpiresAt('');
      setEmail('');
      setPhone('');
      setLocation('');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      alert('Failed to assign role');
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysUntilExpiration = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const today = new Date();
    const expDate = new Date(expiresAt);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const updateRoleStatus = (role: UserRole): UserRole => {
    if (!role.expiresAt) return { ...role, status: 'Active' };
    
    const daysLeft = getDaysUntilExpiration(role.expiresAt);
    if (daysLeft === null) return role;
    
    if (daysLeft < 0) return { ...role, status: 'Expired' };
    if (daysLeft <= 7) return { ...role, status: 'Expiring Soon' };
    return { ...role, status: 'Active' };
  };

  const filteredRoles = roles
    .map(updateRoleStatus)
    .filter(role => {
      const matchesSearch = role.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           role.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           role.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterBy === 'all') return matchesSearch;
      
      const fieldValue = role[filterBy as keyof UserRole]?.toString().toLowerCase() || '';
      return matchesSearch && fieldValue.includes(filterValue.toLowerCase());
    });

  const removeRole = (id: string) => {
    setRoles(roles.filter(r => r.id !== id));
    alert('Role removed successfully');
  };

  const getStatusColor = (status: UserRole['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Expiring Soon': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'Pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleCardExpansion = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const RoleCard = ({ role }: { role: UserRole }) => {
    const isExpanded = expandedCards.has(role.id);
    const daysLeft = getDaysUntilExpiration(role.expiresAt);
    
    return (
      <div className="overflow-hidden transition-all duration-200 bg-white border border-gray-200 shadow-md rounded-xl hover:shadow-lg">
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 font-semibold text-white rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{role.userName}</h3>
                <p className="text-xs text-gray-600">{role.role}</p>
              </div>
            </div>
            <button
              onClick={() => toggleCardExpansion(role.id)}
              className="p-1 transition-colors rounded-lg hover:bg-white/50"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(role.status)}`}>
                {role.status}
              </span>
              <span className="text-xs text-gray-500">{role.department}</span>
            </div>
            {daysLeft !== null && role.status !== 'Expired' && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600">
                  {daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-gray-600">Assigned: {new Date(role.assignedDate).toLocaleDateString()}</span>
            </div>
            
            {role.expiresAt && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600">Expires: {new Date(role.expiresAt).toLocaleDateString()}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <FileText className="w-3 h-3 text-gray-400" />
              <span className="text-gray-600">{role.files.length} files attached</span>
            </div>
          </div>

          {isExpanded && (
            <div className="pt-3 mt-4 space-y-3 border-t">
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  onClick={() => {setSelectedRole(role); setShowFileModal(true);}}
                  className="flex items-center justify-center px-3 py-2 space-x-1 text-xs text-blue-700 transition-colors bg-blue-100 rounded-lg hover:bg-blue-200"
                >
                  <Upload className="w-3 h-3" />
                  <span>Files</span>
                </button>
                <button
                  onClick={() => removeRole(role.id)}
                  className="flex items-center justify-center px-3 py-2 space-x-1 text-xs text-red-700 transition-colors bg-red-100 rounded-lg hover:bg-red-200"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* STAFF MANAGEMENT SECTION */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">Staff Management</h2>
          
          {/* Controls Row */}
          <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center gap-3 p-4 text-indigo-700 transition-all duration-200 transform bg-indigo-100 shadow-lg rounded-xl hover:bg-indigo-200 hover:scale-105"
            >
              <UserPlus className="w-6 h-6" />
              <span className="font-medium">Assign Role</span>
            </button>
            
            <div className="flex items-center col-span-2 gap-2 p-4 bg-blue-100 shadow-lg rounded-xl">
              <Search className="w-5 h-5 text-blue-600" />
              <input
                type="text"
                placeholder="Search staff..."
                value={staffSearchTerm}
                onChange={(e) => setStaffSearchTerm(e.target.value)}
                className="flex-1 placeholder-blue-600 bg-transparent outline-none"
              />
            </div>
            
            <div className="flex items-center gap-2 p-4 bg-purple-100 shadow-lg rounded-xl">
              <Filter className="w-5 h-5 text-purple-600" />
              <select
                value={staffFilterBy}
                onChange={(e) => setStaffFilterBy(e.target.value as any)}
                className="flex-1 text-sm text-purple-600 bg-transparent outline-none"
              >
                <option value="role">Filter by Role</option>
                <option value="department">Filter by Department</option>
                <option value="name">Filter by Name</option>
              </select>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Staff Overview & Quick Actions */}
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <h3 className="mb-4 text-lg font-bold text-blue-600">Staff Overview & Quick Actions</h3>
              
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 text-center rounded-lg bg-blue-50">
                  <div className="text-2xl font-bold text-blue-800">{staffList.filter(s => s.status === 'Available').length}</div>
                  <div className="text-sm text-blue-600">Available Now</div>
                </div>
                <div className="p-4 text-center rounded-lg bg-red-50">
                  <div className="text-2xl font-bold text-red-800">{staffList.filter(s => s.status === 'Busy').length}</div>
                  <div className="text-sm text-red-600">Currently Busy</div>
                </div>
                <div className="p-4 text-center rounded-lg bg-green-50">
                  <div className="text-2xl font-bold text-green-800">{staffList.filter(s => s.shift === 'Day Shift').length}</div>
                  <div className="text-sm text-green-600">Day Shift</div>
                </div>
                <div className="p-4 text-center rounded-lg bg-purple-50">
                  <div className="text-2xl font-bold text-purple-800">{staffList.filter(s => s.shift === 'Night Shift').length}</div>
                  <div className="text-sm text-purple-600">Night Shift</div>
                </div>
              </div>

              {/* Department Breakdown */}
              <div className="mb-6">
                <h4 className="mb-3 font-semibold text-gray-700 text-md">Department Breakdown</h4>
                <div className="space-y-2">
                  {[...new Set(staffList.map(s => s.department))].map(department => (
                    <div key={department} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-sm font-medium text-gray-800">{department}</span>
                      <span className="px-3 py-1 text-xs text-gray-600 bg-white rounded-full">
                        {staffList.filter(s => s.department === department).length} staff
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 text-md">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setShowAddStaffModal(true)}
                    className="flex items-center justify-center gap-2 p-3 text-green-700 transition-colors bg-green-100 rounded-lg hover:bg-green-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Add Staff</span>
                  </button>
                  <button 
                    onClick={() => alert('Opening staff schedule...')}
                    className="flex items-center justify-center gap-2 p-3 text-blue-700 transition-colors bg-blue-100 rounded-lg hover:bg-blue-200"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">View Schedule</span>
                  </button>
                  <button 
                    onClick={() => alert('Generating staff report...')}
                    className="flex items-center justify-center gap-2 p-3 text-purple-700 transition-colors bg-purple-100 rounded-lg hover:bg-purple-200"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-sm font-medium">Reports</span>
                  </button>
                  <button 
                    onClick={() => alert('Opening staff settings...')}
                    className="flex items-center justify-center gap-2 p-3 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">Settings</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Current Team */}
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <h3 className="mb-4 text-lg font-bold text-green-600">Current Team ({filteredStaff.length})</h3>
              <div className="space-y-3 overflow-y-auto max-h-96">
                {filteredStaff.map(staff => (
                  <div key={staff.id} className="p-4 border rounded-lg bg-green-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-medium text-green-800">{staff.name}</p>
                        <p className="text-sm text-gray-600">{staff.role} - {staff.department}</p>
                        <p className="text-xs text-gray-500">{staff.shift}</p>
                        <p className="text-xs text-gray-500">{staff.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => alert('Editing staff member...')}
                          className="px-3 py-1 text-xs text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => removeStaff(staff.id)}
                          className="px-3 py-1 text-xs text-red-600 bg-red-100 rounded hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => alert('Viewing staff schedule...')}
                        className="px-3 py-1 text-xs text-purple-600 bg-purple-100 rounded hover:bg-purple-200"
                      >
                        Schedule
                      </button>
                      <button 
                        onClick={() => alert('Viewing performance metrics...')}
                        className="px-3 py-1 text-xs text-orange-600 bg-orange-100 rounded hover:bg-orange-200"
                      >
                        Performance
                      </button>
                      <button 
                        onClick={() => alert('Sending message...')}
                        className="px-3 py-1 text-xs text-indigo-600 bg-indigo-100 rounded hover:bg-indigo-200"
                      >
                        Message
                      </button>
                      <button 
                        onClick={() => alert('Assigning task...')}
                        className="px-3 py-1 text-xs text-teal-600 bg-teal-100 rounded hover:bg-teal-200"
                      >
                        Assign Task
                      </button>
                    </div>
                  </div>
                ))}
                {filteredStaff.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    <p>No staff members found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6 md:grid-cols-4">
            <div className="p-4 text-center bg-white border rounded-lg shadow-lg">
              <div className="text-2xl font-bold text-blue-800">{staffList.length}</div>
              <div className="text-sm text-blue-600">Total Staff</div>
            </div>
            <div className="p-4 text-center bg-white border rounded-lg shadow-lg">
              <div className="text-2xl font-bold text-green-800">{staffList.filter(s => s.shift === 'Day Shift').length}</div>
              <div className="text-sm text-green-600">On Duty Now</div>
            </div>
            <div className="p-4 text-center bg-white border rounded-lg shadow-lg">
              <div className="text-2xl font-bold text-purple-800">{new Set(staffList.map(s => s.department)).size}</div>
              <div className="text-sm text-purple-600">Departments</div>
            </div>
            <div className="p-4 text-center bg-white border rounded-lg shadow-lg">
              <div className="text-2xl font-bold text-orange-800">{new Set(staffList.map(s => s.role)).size}</div>
              <div className="text-sm text-orange-600">Roles</div>
            </div>
          </div>

          {staffList.length === 0 && (
            <div className="py-12 text-center">
              <UserCheck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">No Staff Members</h3>
              <p className="text-gray-500">No staff members added yet. Click "Add Staff Member" to get started.</p>
            </div>
          )}
        </div>

        {/* ROLE MANAGEMENT SECTION */}
        <div className="pt-8 border-t border-gray-200">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
                <p className="text-gray-600">Assign and manage user roles and permissions</p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Assign Role</span>
              </button>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Shield className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                    <p className="text-sm text-gray-600">Total Roles</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {filteredRoles.filter(r => r.status === 'Active').length}
                    </p>
                    <p className="text-sm text-gray-600">Active</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Bell className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {filteredRoles.filter(r => r.status === 'Expiring Soon').length}
                    </p>
                    <p className="text-sm text-gray-600">Expiring</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white border rounded-lg shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {[...new Set(roles.map(r => r.department))].length}
                    </p>
                    <p className="text-sm text-gray-600">Departments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-4 mb-6 bg-white border rounded-lg shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="role">Filter by Role</option>
                <option value="department">Filter by Department</option>
                <option value="status">Filter by Status</option>
              </select>
              
              {filterBy !== 'all' && (
                <input
                  type="text"
                  placeholder={`Enter ${filterBy}...`}
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              )}
            </div>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRoles.map(role => (
              <RoleCard key={role.id} role={role} />
            ))}
          </div>

          {filteredRoles.length === 0 && (
            <div className="py-12 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">No Roles Found</h3>
              <p className="text-gray-500">No roles match your current search criteria.</p>
            </div>
          )}
        </div>

        {/* Add Staff Modal */}
        {showAddStaffModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Add New Staff Member</h3>
                  <button
                    onClick={() => setShowAddStaffModal(false)}
                    className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Role</label>
                      <select
                        value={newStaff.role}
                        onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Role</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Nurse">Nurse</option>
                        <option value="Resident">Resident</option>
                        <option value="Technician">Technician</option>
                        <option value="Administrator">Administrator</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Department</label>
                      <select
                        value={newStaff.department}
                        onChange={(e) => setNewStaff({...newStaff, department: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Department</option>
                        <option value="ICU">ICU</option>
                        <option value="Surgery">Surgery</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Radiology">Radiology</option>
                        <option value="Laboratory">Laboratory</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Shift</label>
                    <select
                      value={newStaff.shift}
                      onChange={(e) => setNewStaff({...newStaff, shift: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select Shift</option>
                      <option value="Day Shift">Day Shift (7AM - 7PM)</option>
                      <option value="Night Shift">Night Shift (7PM - 7AM)</option>
                      <option value="Evening Shift">Evening Shift (3PM - 11PM)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      value={newStaff.location}
                      onChange={(e) => setNewStaff({...newStaff, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Work location"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Specialties</label>
                    <input
                      type="text"
                      value={newStaff.specialties}
                      onChange={(e) => setNewStaff({...newStaff, specialties: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Comma-separated specialties"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Emergency Contact</label>
                    <input
                      type="tel"
                      value={newStaff.emergencyContact}
                      onChange={(e) => setNewStaff({...newStaff, emergencyContact: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Emergency contact number"
                    />
                  </div>
                </div>
                
                <div className="flex mt-6 space-x-3">
                  <button
                    onClick={addStaff}
                    className="flex-1 px-4 py-2 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Add Staff Member
                  </button>
                  <button
                    onClick={() => setShowAddStaffModal(false)}
                    className="flex-1 px-4 py-2 font-medium text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Role Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Assign New Role</h3>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">User ID</label>
                      <input
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter user ID"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">User Name</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Role</option>
                        {availableRoles.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Department</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Select Department</option>
                        {departmentOptions.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Permissions</label>
                    <div className="grid grid-cols-2 gap-3 p-3 overflow-y-auto border rounded-lg md:grid-cols-3 max-h-40 bg-gray-50">
                      {availablePermissions.map((perm) => (
                        <label key={perm} className="inline-flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={permissions.includes(perm)}
                            onChange={() => handleCheckboxChange(perm)}
                            className="mr-2 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <span className="text-gray-700">{perm.replace(/_/g, ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex mt-6 space-x-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-4 py-2 font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {submitting ? 'Assigning...' : 'Assign Role'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 px-4 py-2 font-medium text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* File Management Modal */}
        {showFileModal && selectedRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Files for {selectedRole.userName}
                  </h3>
                  <button
                    onClick={() => setShowFileModal(false)}
                    className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 mb-6 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-600">Drop files here or click to upload</p>
                  <button className="px-4 py-2 text-sm text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    Choose Files
                  </button>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Existing Files</h4>
                  {selectedRole.files.length > 0 ? (
                    selectedRole.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-1 rounded hover:bg-gray-200">
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                          <button className="p-1 rounded hover:bg-gray-200">
                            <Download className="w-4 h-4 text-gray-400" />
                          </button>
                          <button className="p-1 rounded hover:bg-gray-200">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-sm text-center text-gray-500">No files uploaded yet</p>
                  )}
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => setShowFileModal(false)}
                    className="w-full px-4 py-2 font-medium text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
                  >
                    Close
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

export default RoleForm;