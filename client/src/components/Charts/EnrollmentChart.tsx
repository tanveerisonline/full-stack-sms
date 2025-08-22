import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EnrollmentChartProps {
  data?: {
    labels: string[];
    enrollments: number[];
  };
}

export function EnrollmentChart({ data }: EnrollmentChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const defaultData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    enrollments: [1180, 1205, 1220, 1235, 1240, 1247]
  };

  const chartData = data || defaultData;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 40;

    // Calculate scales
    const maxValue = Math.max(...chartData.enrollments);
    const minValue = Math.min(...chartData.enrollments);
    const valueRange = maxValue - minValue;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Draw grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw line chart
    ctx.strokeStyle = '#3b82f6';
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.lineWidth = 3;

    // Create path for line
    ctx.beginPath();
    chartData.enrollments.forEach((value, index) => {
      const x = padding + (chartWidth / (chartData.enrollments.length - 1)) * index;
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    // Create area fill
    const firstX = padding;
    const lastX = padding + (chartWidth / (chartData.enrollments.length - 1)) * (chartData.enrollments.length - 1);
    const bottomY = padding + chartHeight;
    
    ctx.lineTo(lastX, bottomY);
    ctx.lineTo(firstX, bottomY);
    ctx.closePath();
    ctx.fill();

    // Draw line
    ctx.beginPath();
    chartData.enrollments.forEach((value, index) => {
      const x = padding + (chartWidth / (chartData.enrollments.length - 1)) * index;
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = '#3b82f6';
    chartData.enrollments.forEach((value, index) => {
      const x = padding + (chartWidth / (chartData.enrollments.length - 1)) * index;
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    chartData.labels.forEach((label, index) => {
      const x = padding + (chartWidth / (chartData.labels.length - 1)) * index;
      const y = height - 10;
      ctx.fillText(label, x, y);
    });

    // Draw y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (valueRange / 5) * (5 - i);
      const y = padding + (chartHeight / 5) * i + 4;
      ctx.fillText(Math.round(value).toString(), padding - 10, y);
    }

  }, [chartData]);

  return (
    <Card data-testid="card-enrollment-chart">
      <CardHeader>
        <CardTitle>Enrollment Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="chart-container relative w-full h-64">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            data-testid="canvas-enrollment-chart"
          />
        </div>
      </CardContent>
    </Card>
  );
}
