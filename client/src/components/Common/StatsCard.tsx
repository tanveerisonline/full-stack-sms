import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: ReactNode;
  className?: string;
}

export function StatsCard({ title, value, change, changeType = 'neutral', icon, className = '' }: StatsCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <Card className={`${className}`} data-testid={`card-stats-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600" data-testid={`text-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>{title}</p>
            <p className="text-3xl font-bold text-slate-800" data-testid={`text-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>{value}</p>
            {change && (
              <p className={`text-sm ${getChangeColor()}`} data-testid={`text-change-${title.toLowerCase().replace(/\s+/g, '-')}`}>
                {change}
              </p>
            )}
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center" data-testid={`icon-container-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
