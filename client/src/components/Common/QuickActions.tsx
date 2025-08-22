import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UserPlus, 
  CalendarPlus, 
  Check, 
  Receipt, 
  BarChart3, 
  Megaphone 
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}

interface QuickActionsProps {
  onAction: (actionId: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: 'add-student',
      label: 'Add Student',
      icon: <UserPlus className="w-6 h-6" />,
      onClick: () => onAction('add-student'),
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'schedule-class',
      label: 'Schedule Class',
      icon: <CalendarPlus className="w-6 h-6" />,
      onClick: () => onAction('schedule-class'),
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'take-attendance',
      label: 'Take Attendance',
      icon: <Check className="w-6 h-6" />,
      onClick: () => onAction('take-attendance'),
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'generate-invoice',
      label: 'Generate Invoice',
      icon: <Receipt className="w-6 h-6" />,
      onClick: () => onAction('generate-invoice'),
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 'view-reports',
      label: 'View Reports',
      icon: <BarChart3 className="w-6 h-6" />,
      onClick: () => onAction('view-reports'),
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 'send-notice',
      label: 'Send Notice',
      icon: <Megaphone className="w-6 h-6" />,
      onClick: () => onAction('send-notice'),
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];

  return (
    <Card data-testid="card-quick-actions">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              className="flex flex-col items-center p-4 h-auto hover:bg-slate-50 transition-colors"
              onClick={action.onClick}
              data-testid={`button-${action.id}`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 ${action.color}`}>
                {action.icon}
              </div>
              <span className="text-sm font-medium text-slate-700">
                {action.label}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
