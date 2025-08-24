import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Mail, 
  MessageSquare, 
  CreditCard,
  Save,
  RefreshCw,
  Info,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface SystemSettingValue {
  id: number;
  value: string;
  description: string;
  isEncrypted: boolean;
  updatedAt: string;
}

interface CategorySettings {
  [key: string]: SystemSettingValue;
}

interface SystemSettingsData {
  general: CategorySettings;
  sms_gateway: CategorySettings;
  email_service: CategorySettings;
  payment_gateway: CategorySettings;
}

export default function SystemSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<Partial<SystemSettingsData>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  // Fetch system settings
  const { data: settingsData, isLoading, error } = useQuery({
    queryKey: ['/api/super-admin/settings'],
    queryFn: async () => {
      try {
        const response = await apiRequest('/api/super-admin/settings');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const rawData = await response.json();
        
        // Initialize empty structure
        const groupedData: SystemSettingsData = {
          general: {},
          sms_gateway: {},
          email_service: {},
          payment_gateway: {}
        };
        
        // API returns array of settings, need to group by category
        if (Array.isArray(rawData)) {
          rawData.forEach((setting: any) => {
            const category = setting.category as keyof SystemSettingsData;
            if (groupedData[category]) {
              groupedData[category][setting.key] = {
                id: setting.id,
                value: setting.value,
                description: setting.description || '',
                isEncrypted: setting.isEncrypted || false,
                updatedAt: setting.updatedAt
              };
            }
          });
        }
        
        return groupedData;
      } catch (error) {
        console.error('Query function error:', error);
        throw error;
      }
    },
    retry: false,
  });

  // Initialize form data when settings are loaded
  useEffect(() => {
    if (settingsData) {
      const initialFormData: any = {};
      Object.keys(settingsData).forEach(category => {
        initialFormData[category] = {};
        const categoryData = settingsData[category as keyof SystemSettingsData];
        if (categoryData) {
          Object.keys(categoryData).forEach(key => {
            const setting = categoryData[key];
            if (setting && typeof setting === 'object' && 'value' in setting) {
              initialFormData[category][key] = setting.value;
            }
          });
        }
      });
      setFormData(initialFormData);
    }
  }, [settingsData]);

  // Initialize default settings mutation
  const initializeSettingsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/super-admin/settings/initialize', {
        method: 'POST',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/settings'] });
      toast({ title: 'Success', description: 'Default settings initialized successfully!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to initialize settings',
        variant: 'destructive'
      });
    },
  });

  // Update category settings mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ category, settings }: { category: string; settings: Record<string, any> }) => {
      const response = await apiRequest(`/api/super-admin/settings/${category}`, {
        method: 'PUT',
        body: JSON.stringify({ settings }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/settings'] });
      toast({ title: 'Success', description: 'Settings saved successfully!' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to save settings',
        variant: 'destructive'
      });
    },
  });

  const handleInputChange = (category: string, key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...(prev as any)[category],
        [key]: value
      }
    }));
  };

  const handleSaveCategory = (category: string) => {
    const categoryData = (formData as any)[category];
    if (!categoryData) return;
    
    const settings: Record<string, any> = {};
    
    Object.keys(categoryData).forEach(key => {
      const originalSetting = settingsData?.[category as keyof SystemSettingsData]?.[key];
      if (originalSetting && typeof originalSetting === 'object') {
        settings[key] = {
          value: categoryData[key],
          description: originalSetting.description || '',
          isEncrypted: originalSetting.isEncrypted || false,
        };
      }
    });

    updateCategoryMutation.mutate({ category, settings });
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderField = (
    category: string,
    key: string,
    setting: SystemSettingValue,
    label: string,
    type: string = 'text',
    placeholder?: string,
    options?: { value: string; label: string }[]
  ) => {
    const fieldKey = `${category}-${key}`;
    const currentValue = (formData as any)[category]?.[key] || '';
    const isSecret = setting.isEncrypted;
    const showSecret = showSecrets[fieldKey];

    if (type === 'select') {
      return (
        <div className="space-y-2">
          <Label htmlFor={fieldKey}>{label}</Label>
          <Select 
            value={currentValue} 
            onValueChange={(value) => handleInputChange(category, key, value)}
          >
            <SelectTrigger data-testid={`select-${fieldKey}`}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {setting.description && (
            <p className="text-xs text-gray-500 flex items-start gap-1">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              {setting.description}
            </p>
          )}
        </div>
      );
    }

    if (type === 'switch') {
      return (
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor={fieldKey}>{label}</Label>
            {setting.description && (
              <p className="text-xs text-gray-500 flex items-start gap-1">
                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                {setting.description}
              </p>
            )}
          </div>
          <Switch
            id={fieldKey}
            checked={currentValue === 'true' || currentValue === true}
            onCheckedChange={(checked) => handleInputChange(category, key, checked.toString())}
            data-testid={`switch-${fieldKey}`}
          />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label htmlFor={fieldKey}>{label}</Label>
        <div className="relative">
          <Input
            id={fieldKey}
            type={isSecret && !showSecret ? 'password' : type}
            value={String(currentValue)}
            onChange={(e) => handleInputChange(category, key, e.target.value)}
            placeholder={placeholder}
            data-testid={`input-${fieldKey}`}
          />
          {isSecret && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => toggleSecretVisibility(fieldKey)}
              data-testid={`toggle-secret-${fieldKey}`}
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          )}
        </div>
        {setting.description && (
          <p className="text-xs text-gray-500 flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            {setting.description}
          </p>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load system settings. 
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2"
              onClick={() => initializeSettingsMutation.mutate()}
              disabled={initializeSettingsMutation.isPending}
            >
              Initialize default settings
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!settingsData) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Settings Found</h3>
            <p className="text-gray-500 mb-4">Initialize default system settings to get started.</p>
            <Button 
              onClick={() => initializeSettingsMutation.mutate()}
              disabled={initializeSettingsMutation.isPending}
              data-testid="button-initialize-settings"
            >
              {initializeSettingsMutation.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              Initialize Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600">Configure system-wide settings and integrations</p>
        </div>
        <Button 
          variant="outline"
          onClick={() => initializeSettingsMutation.mutate()}
          disabled={initializeSettingsMutation.isPending}
          data-testid="button-refresh-settings"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="sms_gateway" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            SMS Gateway
          </TabsTrigger>
          <TabsTrigger value="email_service" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Service
          </TabsTrigger>
          <TabsTrigger value="payment_gateway" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payment Gateway
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {settingsData.general && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {settingsData.general.school_name && renderField(
                      'general', 'school_name', settingsData.general.school_name,
                      'School Name', 'text', 'Enter school name'
                    )}
                    {settingsData.general.admin_email && renderField(
                      'general', 'admin_email', settingsData.general.admin_email,
                      'Admin Email', 'email', 'admin@school.edu'
                    )}
                    {settingsData.general.contact_phone && renderField(
                      'general', 'contact_phone', settingsData.general.contact_phone,
                      'Contact Phone', 'tel', '+1234567890'
                    )}
                    {settingsData.general.website_url && renderField(
                      'general', 'website_url', settingsData.general.website_url,
                      'Website URL', 'url', 'https://school.edu'
                    )}
                  </div>
                  
                  {settingsData.general.school_address && (
                    <div className="col-span-2">
                      {renderField(
                        'general', 'school_address', settingsData.general.school_address,
                        'School Address', 'text', 'Enter complete address'
                      )}
                    </div>
                  )}

                  {settingsData.general.timezone && (
                    <div>
                      {renderField(
                        'general', 'timezone', settingsData.general.timezone,
                        'Timezone', 'select', 'Select timezone',
                        [
                          { value: 'UTC', label: 'UTC' },
                          { value: 'America/New_York', label: 'Eastern Time' },
                          { value: 'America/Chicago', label: 'Central Time' },
                          { value: 'America/Denver', label: 'Mountain Time' },
                          { value: 'America/Los_Angeles', label: 'Pacific Time' },
                          { value: 'Europe/London', label: 'London' },
                          { value: 'Europe/Paris', label: 'Paris' },
                          { value: 'Asia/Tokyo', label: 'Tokyo' },
                          { value: 'Asia/Shanghai', label: 'Shanghai' },
                          { value: 'Asia/Kolkata', label: 'India' },
                        ]
                      )}
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={() => handleSaveCategory('general')}
                      disabled={updateCategoryMutation.isPending}
                      data-testid="button-save-general"
                    >
                      {updateCategoryMutation.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms_gateway">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                SMS Gateway Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {settingsData.sms_gateway && (
                <>
                  {settingsData.sms_gateway.enabled && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      {renderField(
                        'sms_gateway', 'enabled', settingsData.sms_gateway.enabled,
                        'Enable SMS Notifications', 'switch'
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {settingsData.sms_gateway.provider && renderField(
                      'sms_gateway', 'provider', settingsData.sms_gateway.provider,
                      'SMS Provider', 'select', 'Select provider',
                      [
                        { value: 'twilio', label: 'Twilio' },
                        { value: 'nexmo', label: 'Nexmo/Vonage' },
                        { value: 'textlocal', label: 'Textlocal' },
                        { value: 'aws_sns', label: 'AWS SNS' },
                      ]
                    )}
                    {settingsData.sms_gateway.sender_id && renderField(
                      'sms_gateway', 'sender_id', settingsData.sms_gateway.sender_id,
                      'Sender ID', 'text', 'SCHOOL'
                    )}
                    {settingsData.sms_gateway.api_key && renderField(
                      'sms_gateway', 'api_key', settingsData.sms_gateway.api_key,
                      'API Key', 'text', 'Enter API key'
                    )}
                    {settingsData.sms_gateway.api_secret && renderField(
                      'sms_gateway', 'api_secret', settingsData.sms_gateway.api_secret,
                      'API Secret', 'text', 'Enter API secret'
                    )}
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={() => handleSaveCategory('sms_gateway')}
                      disabled={updateCategoryMutation.isPending}
                      data-testid="button-save-sms"
                    >
                      {updateCategoryMutation.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email_service">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Service Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {settingsData.email_service && (
                <>
                  {settingsData.email_service.enabled && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      {renderField(
                        'email_service', 'enabled', settingsData.email_service.enabled,
                        'Enable Email Notifications', 'switch'
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {settingsData.email_service.provider && renderField(
                      'email_service', 'provider', settingsData.email_service.provider,
                      'Email Provider', 'select', 'Select provider',
                      [
                        { value: 'sendgrid', label: 'SendGrid' },
                        { value: 'mailgun', label: 'Mailgun' },
                        { value: 'smtp', label: 'SMTP' },
                        { value: 'ses', label: 'AWS SES' },
                      ]
                    )}
                    {settingsData.email_service.from_email && renderField(
                      'email_service', 'from_email', settingsData.email_service.from_email,
                      'From Email', 'email', 'no-reply@school.edu'
                    )}
                    {settingsData.email_service.from_name && renderField(
                      'email_service', 'from_name', settingsData.email_service.from_name,
                      'From Name', 'text', 'School Name'
                    )}
                    {settingsData.email_service.api_key && renderField(
                      'email_service', 'api_key', settingsData.email_service.api_key,
                      'API Key', 'text', 'Enter API key'
                    )}
                  </div>

                  {/* SMTP Settings */}
                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4">SMTP Settings (if using SMTP provider)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {settingsData.email_service.smtp_host && renderField(
                        'email_service', 'smtp_host', settingsData.email_service.smtp_host,
                        'SMTP Host', 'text', 'smtp.gmail.com'
                      )}
                      {settingsData.email_service.smtp_port && renderField(
                        'email_service', 'smtp_port', settingsData.email_service.smtp_port,
                        'SMTP Port', 'number', '587'
                      )}
                      {settingsData.email_service.smtp_username && renderField(
                        'email_service', 'smtp_username', settingsData.email_service.smtp_username,
                        'SMTP Username', 'text', 'username@gmail.com'
                      )}
                      {settingsData.email_service.smtp_password && renderField(
                        'email_service', 'smtp_password', settingsData.email_service.smtp_password,
                        'SMTP Password', 'text', 'Enter password'
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={() => handleSaveCategory('email_service')}
                      disabled={updateCategoryMutation.isPending}
                      data-testid="button-save-email"
                    >
                      {updateCategoryMutation.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment_gateway">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Gateway Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {settingsData.payment_gateway && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                    {settingsData.payment_gateway.enabled && renderField(
                      'payment_gateway', 'enabled', settingsData.payment_gateway.enabled,
                      'Enable Online Payments', 'switch'
                    )}
                    {settingsData.payment_gateway.test_mode && renderField(
                      'payment_gateway', 'test_mode', settingsData.payment_gateway.test_mode,
                      'Test Mode', 'switch'
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {settingsData.payment_gateway.provider && renderField(
                      'payment_gateway', 'provider', settingsData.payment_gateway.provider,
                      'Payment Provider', 'select', 'Select provider',
                      [
                        { value: 'stripe', label: 'Stripe' },
                        { value: 'paypal', label: 'PayPal' },
                        { value: 'razorpay', label: 'Razorpay' },
                        { value: 'square', label: 'Square' },
                      ]
                    )}
                    {settingsData.payment_gateway.currency && renderField(
                      'payment_gateway', 'currency', settingsData.payment_gateway.currency,
                      'Currency', 'select', 'Select currency',
                      [
                        { value: 'USD', label: 'US Dollar (USD)' },
                        { value: 'EUR', label: 'Euro (EUR)' },
                        { value: 'GBP', label: 'British Pound (GBP)' },
                        { value: 'INR', label: 'Indian Rupee (INR)' },
                        { value: 'CAD', label: 'Canadian Dollar (CAD)' },
                      ]
                    )}
                    {settingsData.payment_gateway.public_key && renderField(
                      'payment_gateway', 'public_key', settingsData.payment_gateway.public_key,
                      'Public Key', 'text', 'Enter public key'
                    )}
                    {settingsData.payment_gateway.secret_key && renderField(
                      'payment_gateway', 'secret_key', settingsData.payment_gateway.secret_key,
                      'Secret Key', 'text', 'Enter secret key'
                    )}
                    {settingsData.payment_gateway.webhook_secret && renderField(
                      'payment_gateway', 'webhook_secret', settingsData.payment_gateway.webhook_secret,
                      'Webhook Secret', 'text', 'Enter webhook secret'
                    )}
                  </div>

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      For Stripe: Get your keys from the Stripe Dashboard. Use test keys for development and live keys for production.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={() => handleSaveCategory('payment_gateway')}
                      disabled={updateCategoryMutation.isPending}
                      data-testid="button-save-payment"
                    >
                      {updateCategoryMutation.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}