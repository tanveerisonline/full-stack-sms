import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatTimeAgo } from '@/utils/formatters';
import { 
  UserPlus, 
  CheckCircle, 
  Calendar, 
  DollarSign, 
  BookOpen, 
  AlertCircle 
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'enrollment' | 'attendance' | 'exam' | 'payment' | 'assignment' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  status?: 'success' | 'warning' | 'info' | 'error';
}

export function RecentActivity() {
  // Mock recent activities data
  const activities: Activity[] = [
    {
      id: '1',
      type: 'enrollment',
      title: 'New student registration',
      description: 'Sarah Johnson enrolled in Grade 10',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      user: 'Admin',
      status: 'success'
    },
    {
      id: '2',
      type: 'attendance',
      title: 'Attendance submitted',
      description: 'Mrs. Davis submitted Grade 8A attendance',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      user: 'Mrs. Davis',
      status: 'success'
    },
    {
      id: '3',
      type: 'exam',
      title: 'Exam scheduled',
      description: 'Mathematics Mid-term for Grade 9',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      user: 'Dr. Smith',
      status: 'info'
    },
    {
      id: '4',
      type: 'payment',
      title: 'Fee payment received',
      description: '$450 tuition payment from Alex Miller',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      user: 'Finance Dept',
      status: 'success'
    },
    {
      id: '5',
      type: 'assignment',
      title: 'Assignment submitted',
      description: 'Physics assignment by Grade 11 students',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'Mr. Johnson',
      status: 'info'
    },
    {
      id: '6',
      type: 'notification',
      title: 'System maintenance',
      description: 'Scheduled maintenance completed successfully',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'System',
      status: 'warning'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment':
        return <UserPlus className="w-4 h-4" />;
      case 'attendance':
        return <CheckCircle className="w-4 h-4" />;
      case 'exam':
        return <Calendar className="w-4 h-4" />;
      case 'payment':
        return <DollarSign className="w-4 h-4" />;
      case 'assignment':
        return <BookOpen className="w-4 h-4" />;
      case 'notification':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getActivityColor = (status: string = 'info') => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-600';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      case 'error':
        return 'bg-red-100 text-red-600';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case 'enrollment':
        return 'bg-blue-100 text-blue-800';
      case 'attendance':
        return 'bg-green-100 text-green-800';
      case 'exam':
        return 'bg-purple-100 text-purple-800';
      case 'payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'assignment':
        return 'bg-indigo-100 text-indigo-800';
      case 'notification':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Card data-testid="card-recent-activity">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              data-testid={`activity-item-${activity.id}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.status)}`}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-800 truncate" data-testid={`activity-title-${activity.id}`}>
                    {activity.title}
                  </p>
                  <Badge className={getActivityBadgeColor(activity.type)} variant="outline">
                    {activity.type}
                  </Badge>
                </div>
                
                <p className="text-xs text-slate-600 mb-1" data-testid={`activity-description-${activity.id}`}>
                  {activity.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500" data-testid={`activity-time-${activity.id}`}>
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                  {activity.user && (
                    <p className="text-xs text-slate-500" data-testid={`activity-user-${activity.id}`}>
                      by {activity.user}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-200">
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium" data-testid="button-view-all-activities">
            View all activities →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
