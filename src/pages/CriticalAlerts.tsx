import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Plus, ChevronDown, AlertTriangle, 
  Clock, User, MapPin, Stethoscope, Activity,
  FileText, RefreshCw, Bell,
  Heart, Thermometer, Zap, Shield, UserCheck,
  TrendingUp, CheckCircle, XCircle, Eye,
  Download, Upload
} from 'lucide-react';

interface CriticalAlert {
  id?: string;
  patientName: string;
  message: string;
  acknowledged?: boolean;
  timestamp?: string;
  ward?: string;
  hospital?: string;
  triage?: string;
  diagnosis?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  alertType?: 'vitals' | 'medication' | 'emergency' | 'lab' | 'other';
  doctorAssigned?: string;
  priority?: number;
  comorbidities?: string;
  allergies?: string;
  height?: string;
  weight?: string;
  patientAge?: number;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  glucoseLevel?: number;
  lastVitalsCheck?: string;
  medications?: string[];
  notes?: string;
  escalationHistory?: EscalationEntry[];
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  lastEscalated?: string;
}

interface EscalationEntry {
  timestamp: string;
  escalatedBy: string;
  reason: string;
  notifiedPersons: string[];
  actionsTaken?: string[];
  followUpRequired?: boolean;
}
const getPriorityColor = (severity?: CriticalAlert['severity']): string => {
  switch (severity) {
    case 'critical':
      return 'text-red-700 animate-pulse';
    case 'high':
      return 'text-orange-700';
    case 'medium':
      return 'text-yellow-700';
    case 'low':
      return 'text-green-700';
    default:
      return 'text-blue-700';
  }
};

const getAlertIconColor = (severity?: CriticalAlert['severity']): string => {
  switch (severity) {
    case 'critical': return 'text-red-600';
    case 'high': return 'text-orange-600';
    case 'medium': return 'text-yellow-600';
    case 'low': return 'text-green-600';
    default: return 'text-blue-600';
  }
};

const getAlertMessageBoxClasses = (severity?: CriticalAlert['severity']): string => {
  switch (severity) {
    case 'critical': return 'bg-red-100 border border-red-200';
    case 'high': return 'bg-orange-100 border border-orange-200';
    case 'medium': return 'bg-yellow-100 border border-yellow-200';
    case 'low': return 'bg-green-100 border border-green-200';
    default: return 'bg-blue-100 border border-blue-200';
  }
};

const getAlertCardBorderAndBgClasses = (severity?: CriticalAlert['severity']): string => {
  switch (severity) {
    case 'critical': return 'border-red-500 bg-red-50';
    case 'high': return 'border-orange-500 bg-orange-50';
    case 'medium': return 'border-yellow-500 bg-yellow-50';
    case 'low': return 'border-green-500 bg-green-50';
    default: return 'border-blue-500 bg-blue-50';
  }
};

const generateDummyAlerts = (): CriticalAlert[] => {
  const patients = [
    { name: "Sarah Johnson", age: 34, ward: "ICU-A", doctor: "Dr. Emily Chen" },
    { name: "Michael Rodriguez", age: 67, ward: "Emergency", doctor: "Dr. James Wilson" },
    { name: "Emma Thompson", age: 45, ward: "Cardiology", doctor: "Dr. Sarah Kim" },
    { name: "David Lee", age: 28, ward: "Surgery", doctor: "Dr. Mike Brown" },
    { name: "Lisa Davis", age: 72, ward: "ICU-B", doctor: "Dr. Anna Smith" },
    { name: "Robert Wilson", age: 56, ward: "Neurology", doctor: "Dr. Chris Taylor" },
    { name: "Maria Garcia", age: 39, ward: "Pediatrics", doctor: "Dr. Jennifer Lopez" },
    { name: "John Anderson", age: 82, ward: "Geriatrics", doctor: "Dr. David Kim" }
  ];

  const alertMessages = [
    "Sudden drop in blood pressure detected - requires immediate attention",
    "Abnormal heart rhythm pattern observed - possible arrhythmia",
    "High fever (104°F) not responding to medication",
    "Severe allergic reaction to new medication - anaphylaxis risk",
    "Post-operative bleeding detected - surgical intervention may be needed",
    "Respiratory distress - oxygen saturation dropping rapidly",
    "Blood glucose critically low - risk of diabetic coma",
    "Chest pain with ECG changes - possible cardiac event"
  ];

  return patients.map((patient, index) => {
    const severity = ['critical', 'high', 'medium', 'low'][index % 4] as CriticalAlert['severity'];
    const alertType = ['vitals', 'medication', 'emergency', 'lab', 'other'][index % 5] as CriticalAlert['alertType'];
    
    return {
      id: 'alert-' + (index + 1),
      patientName: patient.name,
      patientAge: patient.age,
      message: alertMessages[index] || "General medical alert requiring attention",
      ward: patient.ward,
      hospital: "Central Medical Center",
      triage: index < 2 ? "Critical" : index < 4 ? "High" : index < 6 ? "Medium" : "Low",
      diagnosis: [
        "Hypertensive Crisis",
        "Acute Myocardial Infarction", 
        "Pneumonia",
        "Post-Op Complications",
        "Sepsis",
        "Stroke",
        "Asthma Exacerbation",
        "Diabetic Emergency"
      ][index],
      severity: severity,
      alertType: alertType,
      doctorAssigned: patient.doctor,
      comorbidities: [
        "Diabetes Type 2, Hypertension",
        "Coronary Artery Disease, COPD",
        "Asthma, Anxiety Disorder",
        "No known comorbidities",
        "Heart Failure, Diabetes",
        "Previous Stroke, Atrial Fibrillation",
        "Severe Allergies",
        "Multiple Chronic Conditions"
      ][index],
      allergies: [
        "Penicillin, Shellfish",
        "Latex, Aspirin",
        "No known allergies",
        "Sulfa drugs",
        "Iodine contrast",
        "Morphine",
        "Multiple drug allergies",
        "Environmental allergies"
      ][index],
      height: (165 + Math.floor(Math.random() * 25)) + " cm",
      weight: (60 + Math.floor(Math.random() * 40)) + " kg",
      bloodPressure: (120 + Math.floor(Math.random() * 60)) + "/" + (80 + Math.floor(Math.random() * 30)),
      heartRate: 60 + Math.floor(Math.random() * 60),
      temperature: 36.5 + Math.random() * 4,
      oxygenSaturation: 85 + Math.floor(Math.random() * 15),
      respiratoryRate: 12 + Math.floor(Math.random() * 18),
      glucoseLevel: 70 + Math.floor(Math.random() * 150),
      lastVitalsCheck: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      medications: [
        ["Lisinopril", "Metformin", "Aspirin"],
        ["Metoprolol", "Atorvastatin", "Clopidogrel"],
        ["Albuterol", "Prednisone"],
        ["Acetaminophen"],
        ["Digoxin", "Furosemide", "Insulin"],
        ["Warfarin", "Amlodipine"],
        ["EpiPen", "Benadryl"],
        ["Multiple medications"]
      ][index],
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      acknowledged: index > 5,
      acknowledgedBy: index > 5 ? "Dr. " + ["Smith", "Johnson", "Brown"][Math.floor(Math.random() * 3)] : undefined,
      priority: index < 2 ? 5 : index < 4 ? 4 : index < 6 ? 3 : 2,
      notes: "Patient requires " + (index < 3 ? 'immediate' : 'standard') + " monitoring. " + (index % 2 === 0 ? 'Family has been notified.' : 'Awaiting family contact.')
    };
  });
};


const getAlertTypeIcon = (type?: string) => {
  switch (type) {
    case 'vitals': 
      return React.createElement(Activity, { className: "w-4 h-4" });
    case 'medication': 
      return React.createElement(FileText, { className: "w-4 h-4" });
    case 'emergency': 
      return React.createElement(AlertTriangle, { className: "w-4 h-4" });
    case 'lab': 
      return React.createElement(Stethoscope, { className: "w-4 h-4" });
    default: 
      return React.createElement(Bell, { className: "w-4 h-4" });
  }
};

const getAgeGroup = (age?: number): string => {
  if (!age) return 'Unknown';
  if (age < 18) return 'Pediatric';
  if (age < 65) return 'Adult';
  return 'Geriatric';
};

const CriticalAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<CriticalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertsSearchTerm, setAlertsSearchTerm] = useState('');
  const [alertsFilterBy, setAlertsFilterBy] = useState('all');
  const [showAddAlertModal, setShowAddAlertModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalatingAlert, setEscalatingAlert] = useState<CriticalAlert | null>(null);
  const [escalationReason, setEscalationReason] = useState('');
  
  const [newAlert, setNewAlert] = useState<Partial<CriticalAlert>>({
    patientName: '',
    message: '',
    ward: '',
    hospital: 'Central Medical Center',
    triage: 'High',
    diagnosis: '',
    severity: 'medium',
    alertType: 'other',
    doctorAssigned: '',
    comorbidities: '',
    allergies: '',
    height: '',
    weight: '',
    patientAge: undefined,
    bloodPressure: '',
    heartRate: undefined,
    temperature: undefined,
    oxygenSaturation: undefined
  });

  useEffect(() => {
    const initializeData = () => {
      setLoading(true);
      setTimeout(() => {
        const dummyData = generateDummyAlerts();
        setAlerts(dummyData);
        setLoading(false);
        setTimeout(() => {
          window.alert('✅ Loaded ' + dummyData.length + ' critical alerts for testing');
        }, 500);
      }, 1000);
    };

    initializeData();
  }, []);

  const acknowledgeAlert = async (id: string) => {
    try {
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { 
          ...a, 
          acknowledged: true, 
          acknowledgedAt: new Date().toISOString(),
          acknowledgedBy: 'Dr. Current User'
        } : a))
      );
      window.alert('✅ Alert acknowledged successfully');
    } catch (error) {
      window.alert('❌ Failed to acknowledge alert');
      console.error('Error acknowledging alert:', error);
    }
  };

  const updateAlertSeverity = async (alertId: string, newSeverity: string) => {
    try {
      setAlerts(alerts.map(a => 
        a.id === alertId ? { 
          ...a, 
          severity: newSeverity as CriticalAlert['severity'],
          priority: newSeverity === 'critical' ? 5 : newSeverity === 'high' ? 4 : newSeverity === 'medium' ? 3 : 2
        } : a
      ));
      window.alert('✅ Alert severity updated to ' + newSeverity);
    } catch (error) {
      window.alert('❌ Failed to update alert severity');
    }
  };

  const updateAlertTriage = async (alertId: string, newTriage: string) => {
    try {
      setAlerts(alerts.map(a => 
        a.id === alertId ? { ...a, triage: newTriage } : a
      ));
      window.alert('✅ Alert triage updated to ' + newTriage);
    } catch (error) {
      window.alert('❌ Failed to update alert triage');
    }
  };

  const escalateAlert = async (criticalAlert: CriticalAlert) => {
    if (!escalationReason.trim()) {
      window.alert('⚠️ Please provide an escalation reason');
      return;
    }

    try {
      const escalationEntry: EscalationEntry = {
        timestamp: new Date().toISOString(),
        escalatedBy: 'Dr. Current User',
        reason: escalationReason,
        notifiedPersons: [
          'Chief Medical Officer',
          'Department Head',
          'Senior Resident',
          'Nursing Supervisor'
        ],
        actionsTaken: [
          'SMS alert sent to CMO',
          'Email notifications dispatched',
          'Hospital-wide announcement made',
          'Incident report auto-generated'
        ],
        followUpRequired: true
      };

      const updatedAlert: CriticalAlert = {
        ...criticalAlert,
        severity: 'critical',
        triage: 'Critical',
        escalationHistory: [
          ...(criticalAlert.escalationHistory || []),
          escalationEntry
        ],
        lastEscalated: new Date().toISOString()
      };

      setAlerts(alerts.map(a => 
        a.id === criticalAlert.id ? updatedAlert : a
      ));

      window.alert('🚨 Alert escalated! Initiating emergency protocols...');
      
      setTimeout(() => window.alert('📱 SMS sent to Chief Medical Officer'), 1000);
      setTimeout(() => window.alert('📧 Email alerts sent to department heads'), 2000);
      setTimeout(() => window.alert('🔔 Hospital-wide notification broadcast'), 3000);
      setTimeout(() => window.alert('📋 Incident report auto-generated'), 4000);
      setTimeout(() => window.alert('👥 Senior staff auto-assigned to case'), 5000);

      setShowEscalateModal(false);
      setEscalatingAlert(null);
      setEscalationReason('');
      
    } catch (error) {
      window.alert('❌ Failed to escalate alert');
      console.error('Error escalating alert:', error);
    }
  };

  const viewPatientDetails = (patientName: string) => {
    const message = '🔍 Navigating to ' + patientName + "'s detailed medical record...\n\n" +
          'In a real application, this would:\n' +
          '• Open patient\'s full medical history\n' +
          '• Show current medications & allergies\n' +
          '• Display recent lab results\n' +
          '• Show appointment history\n' +
          '• Allow direct communication with care team';
    window.alert(message);
  };

  const dismissAlert = async (alertId: string) => {
    try {
      setAlerts(alerts.filter(a => a.id !== alertId));
      window.alert('✅ Alert dismissed successfully');
    } catch (error) {
      window.alert('❌ Failed to dismiss alert');
    }
  };

  const addAlert = async () => {
    if (!newAlert.patientName || !newAlert.message) {
      window.alert('⚠️ Please fill in required fields (Patient Name and Alert Message)');
      return;
    }

    try {
      const currentTime = new Date().toISOString();
      const alertId = 'alert-' + Date.now();
      const severity = newAlert.severity || 'medium';
      const patientName = newAlert.patientName || '';
      const message = newAlert.message || '';
      
      let priority = 2;
      if (severity === 'critical') priority = 5;
      else if (severity === 'high') priority = 4;
      else if (severity === 'medium') priority = 3;

      const alertData: CriticalAlert = {
        ...newAlert,
        id: alertId,
        timestamp: currentTime,
        acknowledged: false,
        priority: priority,
        severity: severity,
        patientName: patientName,
        message: message
      };

      setAlerts([alertData, ...alerts]);
      setShowAddAlertModal(false);
      
      setNewAlert({
        patientName: '',
        message: '',
        ward: '',
        hospital: 'Central Medical Center',
        triage: 'High',
        diagnosis: '',
        severity: 'medium',
        alertType: 'other',
        doctorAssigned: '',
        comorbidities: '',
        allergies: '',
        height: '',
        weight: '',
        patientAge: undefined,
        bloodPressure: '',
        heartRate: undefined,
        temperature: undefined,
        oxygenSaturation: undefined
      });
      
      window.alert('✅ Alert created successfully');
    } catch (error) {
      window.alert('❌ Failed to create alert');
      console.error('Error creating alert:', error);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.patientName.toLowerCase().includes(alertsSearchTerm.toLowerCase()) ||
      (alert.diagnosis && alert.diagnosis.toLowerCase().includes(alertsSearchTerm.toLowerCase())) ||
      alert.message.toLowerCase().includes(alertsSearchTerm.toLowerCase()) ||
      (alert.ward && alert.ward.toLowerCase().includes(alertsSearchTerm.toLowerCase())) ||
      (alert.doctorAssigned && alert.doctorAssigned.toLowerCase().includes(alertsSearchTerm.toLowerCase()));

    const matchesFilter = 
      alertsFilterBy === 'all' ||
      (alertsFilterBy === 'critical' && alert.severity === 'critical') ||
      (alertsFilterBy === 'unacknowledged' && !alert.acknowledged) ||
      (alertsFilterBy === 'escalated' && alert.escalationHistory && alert.escalationHistory.length > 0) ||
      (alertsFilterBy === 'vitals' && alert.alertType === 'vitals') ||
      (alertsFilterBy === 'medication' && alert.alertType === 'medication') ||
      (alertsFilterBy === 'emergency' && alert.alertType === 'emergency');

    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
    if (b.severity === 'critical' && a.severity !== 'critical') return 1;
    if (!a.acknowledged && b.acknowledged) return -1;
    if (a.acknowledged && !b.acknowledged) return 1;
    return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
  });

  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    unacknowledged: alerts.filter(a => !a.acknowledged).length,
    escalated: alerts.filter(a => a.escalationHistory && a.escalationHistory.length > 0).length,
    vitals: alerts.filter(a => a.alertType === 'vitals').length,
    medication: alerts.filter(a => a.alertType === 'medication').length,
    emergency: alerts.filter(a => a.alertType === 'emergency').length
  };

  const exportAlerts = () => {
    const csvData = alerts.map(alert => ({
      'Patient Name': alert.patientName,
      'Age': alert.patientAge,
      'Ward': alert.ward,
      'Severity': alert.severity,
      'Alert Type': alert.alertType,
      'Message': alert.message,
      'Doctor': alert.doctorAssigned,
      'Acknowledged': alert.acknowledged ? 'Yes' : 'No',
      'Timestamp': alert.timestamp
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = new Date().toISOString().split('T')[0];
    a.download = 'critical-alerts-' + today + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    window.alert('📊 Alert data exported successfully');
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      const newDummyData = generateDummyAlerts();
      setAlerts(newDummyData);
      setLoading(false);
      window.alert('🔄 Data refreshed successfully');
    }, 1000);
  };

  return (
    <div className="min-h-screen p-4 space-y-6 bg-gray-50">
      <div className="p-6 bg-white shadow-lg rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="flex items-center gap-2 text-3xl font-bold text-red-600">
              🚨 Critical Alerts Dashboard
            </h2>
            {stats.critical > 0 && (
              <div className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-full animate-pulse">
                {stats.critical} CRITICAL
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-600">Total</div>
              </div>
            </div>
          </div>
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
                <div className="text-sm text-red-600">Critical</div>
              </div>
            </div>
          </div>
          <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.unacknowledged}</div>
                <div className="text-sm text-orange-600">Pending</div>
              </div>
            </div>
          </div>
          <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.escalated}</div>
                <div className="text-sm text-purple-600">Escalated</div>
              </div>
            </div>
          </div>
          <div className="p-4 border border-green-200 rounded-lg bg-green-50">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.vitals}</div>
                <div className="text-sm text-green-600">Vitals</div>
              </div>
            </div>
          </div>
          <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.medication}</div>
                <div className="text-sm text-yellow-600">Medication</div>
              </div>
            </div>
          </div>
          <div className="p-4 border border-pink-200 rounded-lg bg-pink-50">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-pink-600" />
              <div>
                <div className="text-2xl font-bold text-pink-600">{stats.emergency}</div>
                <div className="text-sm text-pink-600">Emergency</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-6">
        <button
          onClick={() => setShowAddAlertModal(true)}
          className="flex items-center justify-center gap-3 p-4 text-green-700 transition-all duration-200 transform bg-green-100 shadow-lg rounded-xl hover:bg-green-200 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">Create Alert</span>
        </button>

        <button
          onClick={refreshData}
          className="flex items-center justify-center gap-3 p-4 text-blue-700 transition-all duration-200 transform bg-blue-100 shadow-lg rounded-xl hover:bg-blue-200 hover:scale-105"
        >
          <RefreshCw className="w-5 h-5" />
          <span className="text-sm font-medium">Refresh</span>
        </button>

        <button
          onClick={exportAlerts}
          className="flex items-center justify-center gap-3 p-4 text-purple-700 transition-all duration-200 transform bg-purple-100 shadow-lg rounded-xl hover:bg-purple-200 hover:scale-105"
        >
          <Download className="w-5 h-5" />
          <span className="text-sm font-medium">Export</span>
        </button>

        <button
          onClick={() => window.alert('📁 Import functionality available in full version')}
          className="flex items-center justify-center gap-3 p-4 text-orange-700 transition-all duration-200 transform bg-orange-100 shadow-lg rounded-xl hover:bg-orange-200 hover:scale-105"
        >
          <Upload className="w-5 h-5" />
          <span className="text-sm font-medium">Import</span>
        </button>
        
        <div className="flex items-center col-span-1 gap-2 p-4 bg-blue-100 shadow-lg rounded-xl">
          <Search className="w-5 h-5 text-blue-600" />
          <input
            type="text"
            placeholder="Search by patient, diagnosis, ward, doctor..."
            value={alertsSearchTerm}
            onChange={(e) => setAlertsSearchTerm(e.target.value)}
            className="flex-1 text-sm placeholder-blue-600 bg-transparent outline-none"
          />
        </div>
        
        <div className="flex items-center gap-2 p-4 bg-purple-100 shadow-lg rounded-xl">
          <Filter className="w-5 h-5 text-purple-600" />
          <select
            value={alertsFilterBy}
            onChange={(e) => setAlertsFilterBy(e.target.value)}
            className="flex-1 text-sm text-purple-600 bg-transparent outline-none"
          >
            <option value="all">All Alerts</option>
            <option value="critical">Critical Only</option>
            <option value="unacknowledged">Unacknowledged</option>
            <option value="escalated">Escalated</option>
            <option value="vitals">Vitals Alerts</option>
            <option value="medication">Medication</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 bg-white shadow-lg rounded-xl">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
            <p className="text-lg text-gray-500">Loading critical alerts...</p>
            <p className="text-sm text-gray-400">Connecting to hospital systems...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            return (
              <div key={alert.id} className={`bg-white rounded-xl shadow-lg border-l-4 transition-all hover:shadow-xl ${getAlertCardBorderAndBgClasses(alert.severity)}`}>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-gray-600" />
                          <h3 className="text-xl font-bold text-gray-800">{alert.patientName}</h3>
                          {alert.patientAge && (
                            <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
                              {alert.patientAge}y, {getAgeGroup(alert.patientAge)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          {getAlertTypeIcon(alert.alertType)}
                          <span className="capitalize">{alert.alertType || 'other'}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'Just now'}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 mb-4 md:grid-cols-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600">Ward:</span>
                          <span className="text-sm text-gray-800">{alert.ward || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600">Diagnosis:</span>
                          <span className="text-sm text-gray-800">{alert.diagnosis || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600">Doctor:</span>
                          <span className="text-sm text-gray-800">{alert.doctorAssigned || 'Unassigned'}</span>
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-lg mb-4 ${getAlertMessageBoxClasses(alert.severity)}`}>
                        <div className="flex items-start gap-2">
                          <AlertTriangle className={`w-5 h-5 mt-0.5 ${getAlertIconColor(alert.severity)}`} />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-700">Alert Message:</span>
                            <p className={`text-sm font-semibold mt-1 ${getPriorityColor(alert.severity)}`}>
                              {alert.message}
                            </p>
                          </div>
                        </div>
                      </div>

                      {(alert.bloodPressure || alert.heartRate || alert.temperature || alert.oxygenSaturation) && (
                        <div className="grid grid-cols-2 gap-2 p-3 mb-4 border rounded-lg bg-gray-50 md:grid-cols-4">
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            <div>
                              <div className="text-xs text-gray-500">BP</div>
                              <div className="text-sm font-medium">{alert.bloodPressure || 'N/A'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-500" />
                            <div>
                              <div className="text-xs text-gray-500">HR</div>
                              <div className="text-sm font-medium">{alert.heartRate || 'N/A'} bpm</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Thermometer className="w-4 h-4 text-orange-500" />
                            <div>
                              <div className="text-xs text-gray-500">Temp</div>
                              <div className="text-sm font-medium">{alert.temperature ? alert.temperature.toFixed(1) + '°C' : 'N/A'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-green-500" />
                            <div>
                              <div className="text-xs text-gray-500">SpO2</div>
                              <div className="text-sm font-medium">{alert.oxygenSaturation || 'N/A'}%</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {alert.acknowledged && (
                        <div className="flex items-center gap-2 p-3 bg-green-100 border border-green-200 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <span className="text-sm font-medium text-green-700">
                              ✅ Alert Acknowledged
                            </span>
                            {alert.acknowledgedBy && (
                              <p className="text-xs text-green-600">
                                By {alert.acknowledgedBy} at {alert.acknowledgedAt ? new Date(alert.acknowledgedAt).toLocaleString() : 'Unknown time'}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-6">
                      {!alert.acknowledged && (
                        <button 
                          onClick={() => acknowledgeAlert(alert.id!)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 transition-colors bg-green-100 rounded-lg hover:bg-green-200"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Acknowledge
                        </button>
                      )}
                      <div className="relative">
                        <select
                          value={alert.severity || 'medium'}
                          onChange={(e) => updateAlertSeverity(alert.id!, e.target.value)}
                          className="block w-full px-4 py-2 pr-8 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-lg appearance-none hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="critical">Critical</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                      </div>
                      <div className="relative">
                        <select
                          value={alert.triage || 'High'}
                          onChange={(e) => updateAlertTriage(alert.id!, e.target.value)}
                          className="block w-full px-4 py-2 pr-8 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-lg appearance-none hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Critical">Critical</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                      </div>
                      <button
                        onClick={() => viewPatientDetails(alert.patientName)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-blue-700 transition-colors bg-blue-100 rounded-lg hover:bg-blue-200"
                      >
                        <Eye className="w-4 h-4" />
                        View Patient
                      </button>
                      <button 
                        onClick={() => {
                          setEscalatingAlert(alert);
                          setShowEscalateModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-700 transition-colors bg-red-100 rounded-lg hover:bg-red-200"
                      >
                        <TrendingUp className="w-4 h-4" />
                        Escalate
                      </button>
                      <button 
                        onClick={() => dismissAlert(alert.id!)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        <XCircle className="w-4 h-4" />
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {!loading && filteredAlerts.length === 0 && (
            <div className="py-16 text-center bg-white shadow-lg rounded-xl">
              <AlertTriangle className="w-20 h-20 mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2 text-xl font-medium text-gray-900">No Critical Alerts Found</h3>
              <p className="mb-4 text-gray-500">
                {alerts.length === 0 
                  ? "Excellent! All patients are stable. No urgent attention required." 
                  : "No alerts match your current filter criteria."
                }
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowAddAlertModal(true)}
                  className="flex items-center gap-2 px-6 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  <Plus className="w-5 h-5" />
                  Create Test Alert
                </button>
                <button
                  onClick={refreshData}
                  className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <RefreshCw className="w-5 h-5" />
                  Refresh Data
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-xl">
            <h3 className="mb-4 text-lg font-bold">Create New Alert</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Patient Name *"
                value={newAlert.patientName || ''}
                onChange={(e) => {
                  const updated = {...newAlert};
                  updated.patientName = e.target.value;
                  setNewAlert(updated);
                }}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Alert Message *"
                value={newAlert.message || ''}
                onChange={(e) => {
                  const updated = {...newAlert};
                  updated.message = e.target.value;
                  setNewAlert(updated);
                }}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <select
                value={newAlert.severity || 'medium'}
                onChange={(e) => {
                  const updated = {...newAlert};
                  updated.severity = e.target.value as CriticalAlert['severity'];
                  setNewAlert(updated);
                }}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical Priority</option>
              </select>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={addAlert}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Create Alert
              </button>
              <button
                onClick={() => setShowAddAlertModal(false)}
                className="flex-1 px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showEscalateModal && escalatingAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-lg p-6 bg-white shadow-xl rounded-xl">
            <h3 className="mb-4 text-lg font-bold text-red-600">🚨 Escalate Alert</h3>
            <div className="p-4 mb-4 border border-red-200 rounded-lg bg-red-50">
              <h4 className="font-semibold text-red-800">Patient: {escalatingAlert.patientName}</h4>
              <p className="mt-1 text-sm text-red-700">Current Alert: {escalatingAlert.message}</p>
              <div className="flex gap-4 mt-2 text-xs text-red-600">
                <span>Ward: {escalatingAlert.ward || 'Not specified'}</span>
                <span>Severity: {escalatingAlert.severity || 'Unknown'}</span>
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Escalation Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Describe why this alert requires immediate senior attention..."
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
              />
            </div>
            <div className="p-4 mb-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <h5 className="mb-2 font-semibold text-yellow-800">Escalation Actions:</h5>
              <ul className="space-y-1 text-sm text-yellow-700">
                <li>• 📱 SMS to Chief Medical Officer</li>
                <li>• 📧 Email to Department Heads</li>
                <li>• 🔔 Hospital-wide notification</li>
                <li>• 📋 Incident report creation</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => escalateAlert(escalatingAlert)}
                disabled={!escalationReason.trim()}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                🚨 ESCALATE NOW
              </button>
              <button
                onClick={() => setShowEscalateModal(false)}
                className="flex-1 px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriticalAlertsPage;