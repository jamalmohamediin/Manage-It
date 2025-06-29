import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const BusinessSettings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    emailNotifications: true,
    smsAlerts: false,
    autoSaveNotes: true,
    soundAlerts: true,
    
    // Notification Preferences
    criticalAlerts: true,
    patientUpdates: true,
    scheduleChanges: false,
    labResults: true,
    referralUpdates: true,
    
    // Display Settings
    fontSize: 'Small',
    language: 'English',
    
    // Data & Backup
    autoBackup: true,
    sessionTimeout: '30 minutes'
  });

  const [systemInfo] = useState({
    version: 'v2.4.1',
    lastUpdate: 'June 20, 2025',
    storageUsed: '2.3 GB / 10 GB',
    activeUsers: '1,247'
  });

  const handleSettingChange = (setting: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = () => {
    // Simulate API call
    setTimeout(() => {
      alert('General settings saved successfully!');
    }, 500);
  };

  const handleSavePreferences = () => {
    // Simulate API call
    setTimeout(() => {
      alert('Notification preferences saved successfully!');
    }, 500);
  };

  const handleApplyChanges = () => {
    // Simulate API call
    setTimeout(() => {
      alert('Display settings applied successfully!');
    }, 500);
  };

  const handleSecurityAction = (action: string) => {
    switch(action) {
      case 'password':
        alert('Redirecting to change password...');
        break;
      case '2fa':
        alert('Two-factor authentication setup...');
        break;
      case 'sessions':
        alert('Viewing active sessions...');
        break;
      case 'privacy':
        alert('Opening privacy settings...');
        break;
    }
  };

  const handleDataAction = (action: string) => {
    switch(action) {
      case 'export':
        alert('Exporting your data...');
        break;
      case 'backup':
        alert('Creating backup...');
        break;
      case 'restore':
        alert('Restore data options...');
        break;
      case 'history':
        alert('Backup history...');
        break;
    }
  };

  const handleSystemAction = (action: string) => {
    switch(action) {
      case 'updates':
        alert('Checking for updates...');
        break;
      case 'diagnostics':
        alert('Running system diagnostics...');
        break;
      case 'license':
        alert('License information...');
        break;
    }
  };

  const handleAdvancedAction = (action: string) => {
    switch(action) {
      case 'cache':
        if(confirm('Are you sure you want to clear cache?')) {
          alert('Cache cleared successfully!');
        }
        break;
      case 'reset':
        if(confirm('Are you sure you want to reset to default settings?')) {
          alert('Settings reset to default!');
        }
        break;
      case 'delete':
        if(confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
          alert('Account deletion initiated...');
        }
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="container px-4 py-8 mx-auto">
        {/* Title */}
        <h1 className="mb-8 text-2xl font-bold text-gray-800">Business Settings</h1>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {/* General Settings */}
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-purple-600">General Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Email Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">SMS Alerts</span>
                <input
                  type="checkbox"
                  checked={settings.smsAlerts}
                  onChange={(e) => handleSettingChange('smsAlerts', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Auto-save Notes</span>
                <input
                  type="checkbox"
                  checked={settings.autoSaveNotes}
                  onChange={(e) => handleSettingChange('autoSaveNotes', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Sound Alerts</span>
                <input
                  type="checkbox"
                  checked={settings.soundAlerts}
                  onChange={(e) => handleSettingChange('soundAlerts', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
              </label>
              <button
                onClick={handleSaveSettings}
                className="w-full py-2 text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700"
              >
                Save Settings
              </button>
            </div>
          </div>

          {/* Security Settings */}
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-red-600">Security Settings</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleSecurityAction('password')}
                className="w-full py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
              >
                Change Password
              </button>
              <button
                onClick={() => handleSecurityAction('2fa')}
                className="w-full py-2 text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600"
              >
                Enable 2FA
              </button>
              <button
                onClick={() => handleSecurityAction('sessions')}
                className="w-full py-2 text-white transition-colors bg-yellow-500 rounded-lg hover:bg-yellow-600"
              >
                Active Sessions
              </button>
              <button
                onClick={() => handleSecurityAction('privacy')}
                className="w-full py-2 text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
              >
                Privacy Settings
              </button>
              <div className="mt-4">
                <label className="block mb-2 text-sm text-gray-700">Session Timeout</label>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="15 minutes">15 minutes</option>
                  <option value="30 minutes">30 minutes</option>
                  <option value="1 hour">1 hour</option>
                  <option value="2 hours">2 hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-blue-600">Notification Preferences</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Critical Alerts</span>
                <input
                  type="checkbox"
                  checked={settings.criticalAlerts}
                  onChange={(e) => handleSettingChange('criticalAlerts', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Patient Updates</span>
                <input
                  type="checkbox"
                  checked={settings.patientUpdates}
                  onChange={(e) => handleSettingChange('patientUpdates', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Schedule Changes</span>
                <input
                  type="checkbox"
                  checked={settings.scheduleChanges}
                  onChange={(e) => handleSettingChange('scheduleChanges', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Lab Results</span>
                <input
                  type="checkbox"
                  checked={settings.labResults}
                  onChange={(e) => handleSettingChange('labResults', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Referral Updates</span>
                <input
                  type="checkbox"
                  checked={settings.referralUpdates}
                  onChange={(e) => handleSettingChange('referralUpdates', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
              </label>
              <button
                onClick={handleSavePreferences}
                className="w-full py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Save Preferences
              </button>
            </div>
          </div>

          {/* Display Settings */}
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-green-600">Display Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm text-gray-700">Font Size</label>
                <select
                  value={settings.fontSize}
                  onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm text-gray-700">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>
              <button
                onClick={handleApplyChanges}
                className="w-full py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
              >
                Apply Changes
              </button>
            </div>
          </div>

          {/* Data & Backup */}
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-blue-600">Data & Backup</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleDataAction('export')}
                className="flex items-center justify-center w-full gap-2 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Download size={16} />
                Export My Data
              </button>
              <button
                onClick={() => handleDataAction('backup')}
                className="flex items-center justify-center w-full gap-2 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Upload size={16} />
                Create Backup
              </button>
              <button
                onClick={() => handleDataAction('restore')}
                className="flex items-center justify-center w-full gap-2 py-2 text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600"
              >
                <RotateCcw size={16} />
                Restore Data
              </button>
              <button
                onClick={() => handleDataAction('history')}
                className="w-full py-2 text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700"
              >
                Backup History
              </button>
              <label className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-700">Auto Backup</span>
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
              </label>
              <p className="text-xs text-gray-500">Last backup: Today 3:00 AM</p>
            </div>
          </div>

          {/* System Information */}
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-teal-600">System Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Version:</span>
                <span className="text-sm font-medium">{systemInfo.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Update:</span>
                <span className="text-sm font-medium">{systemInfo.lastUpdate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Storage Used:</span>
                <span className="text-sm font-medium">{systemInfo.storageUsed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Users:</span>
                <span className="text-sm font-medium">{systemInfo.activeUsers}</span>
              </div>
              <div className="pt-3 space-y-2">
                <button
                  onClick={() => handleSystemAction('updates')}
                  className="w-full py-2 text-white transition-colors bg-teal-600 rounded-lg hover:bg-teal-700"
                >
                  Check for Updates
                </button>
                <button
                  onClick={() => handleSystemAction('diagnostics')}
                  className="w-full py-2 text-white transition-colors bg-teal-600 rounded-lg hover:bg-teal-700"
                >
                  System Diagnostics
                </button>
                <button
                  onClick={() => handleSystemAction('license')}
                  className="w-full py-2 text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
                >
                  License Info
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Settings - Full Width */}
          <div className="p-6 bg-white border rounded-lg shadow-sm lg:col-span-2 xl:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-orange-600">Advanced Settings</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <button
                onClick={() => handleAdvancedAction('cache')}
                className="flex items-center justify-center gap-2 py-3 text-white transition-colors bg-yellow-500 rounded-lg hover:bg-yellow-600"
              >
                <RefreshCw size={16} />
                Clear Cache
              </button>
              <button
                onClick={() => handleAdvancedAction('reset')}
                className="flex items-center justify-center gap-2 py-3 text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600"
              >
                <RotateCcw size={16} />
                Reset to Default
              </button>
              <button
                onClick={() => handleAdvancedAction('delete')}
                className="flex items-center justify-center gap-2 py-3 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
              >
                <Trash2 size={16} />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettings;