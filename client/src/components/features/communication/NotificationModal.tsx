import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/Common/Toast';
import { dataService } from '@/services/dataService';
import { formatTimeAgo } from '@/utils/formatters';
import { Bell, Search, Filter, Eye, Trash2 } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const { addToast } = useToast();
  const notifications = dataService.getNotifications?.() || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const notificationTypes = [
    { value: 'announcement', label: 'Announcement', color: 'bg-blue-100 text-blue-800' },
    { value: 'assignment', label: 'Assignment', color: 'bg-green-100 text-green-800' },
    { value: 'grade', label: 'Grade', color: 'bg-purple-100 text-purple-800' },
    { value: 'attendance', label: 'Attendance', color: 'bg-orange-100 text-orange-800' },
    { value: 'fee', label: 'Fee Payment', color: 'bg-red-100 text-red-800' },
    { value: 'event', label: 'Event', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'system', label: 'System', color: 'bg-gray-100 text-gray-800' }
  ];

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    const notificationType = notificationTypes.find(t => t.value === type);
    return notificationType?.color || 'bg-gray-100 text-gray-800';
  };

  const handleMarkAsRead = (notificationId: string) => {
    // Simulate marking as read
    addToast('Notification marked as read', 'success');
  };

  const handleDelete = (notificationId: string) => {
    // Simulate deletion
    addToast('Notification deleted', 'success');
  };

  const handleMarkAllAsRead = () => {
    addToast(`${filteredNotifications.filter(n => n.status === 'unread').length} notifications marked as read`, 'success');
  };

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => n.status === 'unread').length,
    read: notifications.filter(n => n.status === 'read').length,
    urgent: notifications.filter(n => n.priority === 'high').length
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Push Notifications
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-700">Total Notifications</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
              <div className="text-sm text-orange-700">Unread</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.read}</div>
              <div className="text-sm text-green-700">Read</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
              <div className="text-sm text-red-700">Urgent</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-notifications"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48" data-testid="select-type-filter">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {notificationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={handleMarkAllAsRead}
              disabled={filteredNotifications.filter(n => n.status === 'unread').length === 0}
              data-testid="button-mark-all-read"
            >
              Mark All as Read
            </Button>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No notifications found matching your criteria.
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`border rounded-lg p-4 ${
                    notification.status === 'unread' 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getTypeColor(notification.type)}>
                          {notificationTypes.find(t => t.value === notification.type)?.label || notification.type}
                        </Badge>
                        {notification.priority === 'high' && (
                          <Badge variant="destructive">Urgent</Badge>
                        )}
                        {notification.status === 'unread' && (
                          <Badge variant="outline">New</Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-slate-800 mb-1" data-testid={`notification-title-${notification.id}`}>
                        {notification.title}
                      </h4>
                      <p className="text-slate-600 text-sm mb-2" data-testid={`notification-message-${notification.id}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>{formatTimeAgo(notification.createdAt)}</span>
                        <span>To: {notification.targetAudience || 'All users'}</span>
                        {notification.sender && <span>From: {notification.sender}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {notification.status === 'unread' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsRead(notification.id)}
                          data-testid={`button-mark-read-${notification.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(notification.id)}
                        data-testid={`button-delete-${notification.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose} data-testid="button-close-notifications">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}export default NotificationModal;
