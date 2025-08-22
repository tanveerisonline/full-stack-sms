import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EmailModal } from '@/components/EmailModal';
import { SMSModal } from '@/components/SMSModal';
import { NotificationModal } from '@/components/NotificationModal';
import { useToast } from '@/components/Common/Toast';
import { dataService } from '@/services/dataService';
import { formatTimeAgo } from '@/utils/formatters';
import { ANNOUNCEMENT_TYPES, TARGET_AUDIENCE } from '@/utils/constants';
import { Plus, Search, Send, Mail, MessageSquare, Bell, Users, Calendar } from 'lucide-react';

export default function Communication() {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState<{
    title: string;
    content: string;
    type: 'general' | 'academic' | 'event' | 'urgent';
    targetAudience: ('all' | 'students' | 'parents' | 'teachers')[];
    priority: 'low' | 'medium' | 'high';
  }>({
    title: '',
    content: '',
    type: 'general',
    targetAudience: ['all'],
    priority: 'medium'
  });

  const announcements = dataService.getAnnouncements();
  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAnnouncement = () => {
    if (!announcementForm.title || !announcementForm.content) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    const newAnnouncement = {
      ...announcementForm,
      createdBy: '1', // Current user ID
      status: 'published' as const,
      publishDate: new Date().toISOString()
    };

    dataService.addAnnouncement(newAnnouncement);
    setShowNewAnnouncement(false);
    setAnnouncementForm({
      title: '',
      content: '',
      type: 'general',
      targetAudience: ['all'],
      priority: 'medium'
    });
    addToast('Announcement created successfully!', 'success');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      case 'event':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalAnnouncements: announcements.length,
    publishedToday: announcements.filter(a => 
      new Date(a.createdAt).toDateString() === new Date().toDateString()
    ).length,
    urgentMessages: announcements.filter(a => a.type === 'urgent').length,
    totalRecipients: announcements.reduce((sum, a) => 
      sum + (a.targetAudience.includes('all') ? 1000 : 
        a.targetAudience.length * 250), 0
    )
  };

  return (
    <div className="space-y-8" data-testid="communication-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
            Communication Hub
          </h2>
          <p className="text-slate-600" data-testid="text-page-subtitle">
            Send announcements and manage communications
          </p>
        </div>
        <Button 
          onClick={() => setShowNewAnnouncement(true)}
          data-testid="button-new-announcement"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Messages</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalAnnouncements}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Sent Today</p>
                <p className="text-3xl font-bold text-slate-800">{stats.publishedToday}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Send className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Urgent Messages</p>
                <p className="text-3xl font-bold text-slate-800">{stats.urgentMessages}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Reach</p>
                <p className="text-3xl font-bold text-slate-800">{stats.totalRecipients.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Announcements List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-announcements"
                />
              </div>
            </CardContent>
          </Card>

          {/* New Announcement Form */}
          {showNewAnnouncement && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Announcement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Announcement title..."
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                  data-testid="input-announcement-title"
                />
                
                <Textarea
                  placeholder="Announcement content..."
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  data-testid="textarea-announcement-content"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select 
                    value={announcementForm.type} 
                    onValueChange={(value: 'general' | 'academic' | 'event' | 'urgent') => setAnnouncementForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger data-testid="select-announcement-type">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ANNOUNCEMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={announcementForm.targetAudience[0]} 
                    onValueChange={(value: 'all' | 'students' | 'parents' | 'teachers') => setAnnouncementForm(prev => ({ ...prev, targetAudience: [value] }))}
                  >
                    <SelectTrigger data-testid="select-target-audience">
                      <SelectValue placeholder="Audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_AUDIENCE.map((audience) => (
                        <SelectItem key={audience.value} value={audience.value}>
                          {audience.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={announcementForm.priority} 
                    onValueChange={(value: 'low' | 'medium' | 'high') => setAnnouncementForm(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger data-testid="select-priority">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNewAnnouncement(false)}
                    data-testid="button-cancel-announcement"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateAnnouncement}
                    data-testid="button-create-announcement"
                  >
                    Create Announcement
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAnnouncements.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500" data-testid="text-no-announcements">
                      No announcements found.
                    </p>
                  </div>
                ) : (
                  filteredAnnouncements.map((announcement) => (
                    <div 
                      key={announcement.id} 
                      className="border-l-4 border-blue-500 pl-4 py-3 hover:bg-slate-50 transition-colors"
                      data-testid={`announcement-${announcement.id}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-slate-800" data-testid={`text-announcement-title-${announcement.id}`}>
                          {announcement.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getTypeColor(announcement.type)}>
                            {announcement.type}
                          </Badge>
                          <Badge className={getPriorityColor(announcement.priority)}>
                            {announcement.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-2" data-testid={`text-announcement-content-${announcement.id}`}>
                        {announcement.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>To: {Array.isArray(announcement.targetAudience) ? announcement.targetAudience.join(', ') : announcement.targetAudience}</span>
                        <span>{formatTimeAgo(announcement.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => setIsEmailModalOpen(true)}
                data-testid="button-send-email"
              >
                <Mail className="w-4 h-4 mr-3" />
                Send Email
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => setIsSMSModalOpen(true)}
                data-testid="button-send-sms"
              >
                <MessageSquare className="w-4 h-4 mr-3" />
                Send SMS
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => setIsNotificationModalOpen(true)}
                data-testid="button-push-notification"
              >
                <Bell className="w-4 h-4 mr-3" />
                Push Notifications
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => setIsEmailModalOpen(true)}
                data-testid="button-schedule-message"
              >
                <Calendar className="w-4 h-4 mr-3" />
                Schedule Message
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                <h5 className="font-medium text-slate-800">Parent-Teacher Meeting</h5>
                <p className="text-sm text-slate-600">Template for meeting notifications</p>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                <h5 className="font-medium text-slate-800">Exam Schedule</h5>
                <p className="text-sm text-slate-600">Template for exam announcements</p>
              </div>
              <div className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                <h5 className="font-medium text-slate-800">Holiday Notice</h5>
                <p className="text-sm text-slate-600">Template for holiday announcements</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Communication Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Open Rate</span>
                  <span className="font-semibold text-slate-800">89%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Response Rate</span>
                  <span className="font-semibold text-slate-800">67%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Avg. Response Time</span>
                  <span className="font-semibold text-slate-800">2.4h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Communication Modals */}
      <EmailModal 
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
      />
      
      <SMSModal 
        isOpen={isSMSModalOpen}
        onClose={() => setIsSMSModalOpen(false)}
      />
      
      <NotificationModal 
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </div>
  );
}
