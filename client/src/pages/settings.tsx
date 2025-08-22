import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/Common/Toast';
import { 
  Settings, 
  Database, 
  Shield, 
  Globe, 
  Mail, 
  Bell,
  Users,
  School,
  Calendar,
  DollarSign,
  Save,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';

export default function SystemSettings() {
  const { addToast } = useToast();
  
  const [generalSettings, setGeneralSettings] = useState({
    schoolName: 'EduManage Pro Academy',
    schoolAddress: '123 Education Street, Academic City, AC 12345',
    schoolPhone: '+1 (555) 123-4567',
    schoolEmail: 'admin@edumanagepro.edu',
    timezone: 'America/New_York',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  });

  const [securitySettings, setSecuritySettings] = useState({
    requireTwoFactor: false,
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireSpecialChars: true,
    allowSelfRegistration: false,
    maxLoginAttempts: 5
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: 'noreply@edumanagepro.edu',
    smtpPassword: '********',
    smtpEncryption: 'TLS',
    fromName: 'EduManage Pro',
    fromEmail: 'noreply@edumanagepro.edu'
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    retentionPeriod: 30,
    backupLocation: 'cloud',
    lastBackup: '2024-02-20 03:00:00'
  });

  const [academicSettings, setAcademicSettings] = useState({
    academicYearStart: '2024-08-01',
    academicYearEnd: '2025-06-30',
    gradingScale: 'letter',
    passingGrade: 'D',
    maxAbsences: 20,
    latePolicyDays: 3
  });

  const handleSaveGeneral = () => {
    addToast('General settings saved successfully!', 'success');
  };

  const handleSaveSecurity = () => {
    addToast('Security settings saved successfully!', 'success');
  };

  const handleSaveEmail = () => {
    addToast('Email settings saved successfully!', 'success');
  };

  const handleSaveBackup = () => {
    addToast('Backup settings saved successfully!', 'success');
  };

  const handleSaveAcademic = () => {
    addToast('Academic settings saved successfully!', 'success');
  };

  const handleBackupNow = () => {
    addToast('Backup initiated successfully!', 'success');
  };

  const handleTestEmail = () => {
    addToast('Test email sent successfully!', 'success');
  };

  return (
    <div className="space-y-8" data-testid="settings-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
            System Settings
          </h2>
          <p className="text-slate-600" data-testid="text-page-subtitle">
            Configure system-wide settings and preferences
          </p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" data-testid="tab-general">General</TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">Security</TabsTrigger>
          <TabsTrigger value="email" data-testid="tab-email">Email</TabsTrigger>
          <TabsTrigger value="backup" data-testid="tab-backup">Backup</TabsTrigger>
          <TabsTrigger value="academic" data-testid="tab-academic">Academic</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <School className="w-5 h-5 mr-2" />
                School Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    value={generalSettings.schoolName}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                    data-testid="input-school-name"
                  />
                </div>
                <div>
                  <Label htmlFor="schoolPhone">Phone Number</Label>
                  <Input
                    id="schoolPhone"
                    value={generalSettings.schoolPhone}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, schoolPhone: e.target.value }))}
                    data-testid="input-school-phone"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="schoolAddress">Address</Label>
                <Input
                  id="schoolAddress"
                  value={generalSettings.schoolAddress}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, schoolAddress: e.target.value }))}
                  data-testid="input-school-address"
                />
              </div>

              <div>
                <Label htmlFor="schoolEmail">Email</Label>
                <Input
                  id="schoolEmail"
                  type="email"
                  value={generalSettings.schoolEmail}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, schoolEmail: e.target.value }))}
                  data-testid="input-school-email"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={generalSettings.timezone}
                    onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger data-testid="select-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={generalSettings.language}
                    onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={generalSettings.currency}
                    onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger data-testid="select-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSaveGeneral} data-testid="button-save-general">
                <Save className="w-4 h-4 mr-2" />
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Authentication & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Two-Factor Authentication</Label>
                  <p className="text-sm text-slate-600">Force all users to enable 2FA</p>
                </div>
                <Switch
                  checked={securitySettings.requireTwoFactor}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireTwoFactor: checked }))}
                  data-testid="switch-require-2fa"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Self Registration</Label>
                  <p className="text-sm text-slate-600">Allow users to create their own accounts</p>
                </div>
                <Switch
                  checked={securitySettings.allowSelfRegistration}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, allowSelfRegistration: checked }))}
                  data-testid="switch-self-registration"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                    data-testid="input-session-timeout"
                  />
                </div>
                <div>
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                    data-testid="input-max-login-attempts"
                  />
                </div>
              </div>

              <Button onClick={handleSaveSecurity} data-testid="button-save-security">
                <Save className="w-4 h-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                    data-testid="input-smtp-host"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                    data-testid="input-smtp-port"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                    data-testid="input-from-name"
                  />
                </div>
                <div>
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                    data-testid="input-from-email"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={handleSaveEmail} data-testid="button-save-email">
                  <Save className="w-4 h-4 mr-2" />
                  Save Email Settings
                </Button>
                <Button variant="outline" onClick={handleTestEmail} data-testid="button-test-email">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Test Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Backup Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Automatic Backups</Label>
                  <p className="text-sm text-slate-600">Enable scheduled automatic backups</p>
                </div>
                <Switch
                  checked={backupSettings.autoBackup}
                  onCheckedChange={(checked) => setBackupSettings(prev => ({ ...prev, autoBackup: checked }))}
                  data-testid="switch-auto-backup"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select 
                    value={backupSettings.backupFrequency}
                    onValueChange={(value) => setBackupSettings(prev => ({ ...prev, backupFrequency: value }))}
                  >
                    <SelectTrigger data-testid="select-backup-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="retentionPeriod">Retention Period (days)</Label>
                  <Input
                    id="retentionPeriod"
                    type="number"
                    value={backupSettings.retentionPeriod}
                    onChange={(e) => setBackupSettings(prev => ({ ...prev, retentionPeriod: parseInt(e.target.value) }))}
                    data-testid="input-retention-period"
                  />
                </div>
              </div>

              <div>
                <Label>Last Backup: {backupSettings.lastBackup}</Label>
              </div>

              <div className="flex space-x-4">
                <Button onClick={handleSaveBackup} data-testid="button-save-backup">
                  <Save className="w-4 h-4 mr-2" />
                  Save Backup Settings
                </Button>
                <Button variant="outline" onClick={handleBackupNow} data-testid="button-backup-now">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Backup Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Settings */}
        <TabsContent value="academic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Academic Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="academicYearStart">Academic Year Start</Label>
                  <Input
                    id="academicYearStart"
                    type="date"
                    value={academicSettings.academicYearStart}
                    onChange={(e) => setAcademicSettings(prev => ({ ...prev, academicYearStart: e.target.value }))}
                    data-testid="input-academic-year-start"
                  />
                </div>
                <div>
                  <Label htmlFor="academicYearEnd">Academic Year End</Label>
                  <Input
                    id="academicYearEnd"
                    type="date"
                    value={academicSettings.academicYearEnd}
                    onChange={(e) => setAcademicSettings(prev => ({ ...prev, academicYearEnd: e.target.value }))}
                    data-testid="input-academic-year-end"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gradingScale">Grading Scale</Label>
                  <Select 
                    value={academicSettings.gradingScale}
                    onValueChange={(value) => setAcademicSettings(prev => ({ ...prev, gradingScale: value }))}
                  >
                    <SelectTrigger data-testid="select-grading-scale">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="letter">Letter Grades (A-F)</SelectItem>
                      <SelectItem value="percentage">Percentage (0-100%)</SelectItem>
                      <SelectItem value="gpa">GPA Scale (0-4.0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="passingGrade">Minimum Passing Grade</Label>
                  <Select 
                    value={academicSettings.passingGrade}
                    onValueChange={(value) => setAcademicSettings(prev => ({ ...prev, passingGrade: value }))}
                  >
                    <SelectTrigger data-testid="select-passing-grade">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSaveAcademic} data-testid="button-save-academic">
                <Save className="w-4 h-4 mr-2" />
                Save Academic Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}