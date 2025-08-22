import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FinancialChartProps {
  data?: {
    labels: string[];
    revenue: number[];
    expenses: number[];
  };
}

export function FinancialChart({ data }: FinancialChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const defaultData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    revenue: [75000, 82000, 78000, 89000, 92000, 89420],
    expenses: [45000, 48000, 52000, 54000, 51000, 49000]
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
    const allValues = [...chartData.revenue, ...chartData.expenses];
    const maxValue = Math.max(...allValues);
    const minValue = 0;
    const valueRange = maxValue - minValue;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    const barWidth = chartWidth / (chartData.labels.length * 2.5);

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

    // Draw bars
    chartData.labels.forEach((_, index) => {
      const x = padding + (chartWidth / chartData.labels.length) * index + (chartWidth / chartData.labels.length - barWidth * 2) / 2;
      
      // Revenue bar
      const revenueHeight = (chartData.revenue[index] / maxValue) * chartHeight;
      const revenueY = padding + chartHeight - revenueHeight;
      
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x, revenueY, barWidth, revenueHeight);
      
      // Expenses bar
      const expensesHeight = (chartData.expenses[index] / maxValue) * chartHeight;
      const expensesY = padding + chartHeight - expensesHeight;
      
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + barWidth + 4, expensesY, barWidth, expensesHeight);
    });

    // Draw labels
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    chartData.labels.forEach((label, index) => {
      const x = padding + (chartWidth / chartData.labels.length) * index + (chartWidth / chartData.labels.length) / 2;
      const y = height - 10;
      ctx.fillText(label, x, y);
    });

    // Draw y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = (maxValue / 5) * (5 - i);
      const y = padding + (chartHeight / 5) * i + 4;
      ctx.fillText(`$${(value / 1000).toFixed(0)}k`, padding - 10, y);
    }

    // Draw legend
    ctx.textAlign = 'left';
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(width - 150, 20, 12, 12);
    ctx.fillStyle = '#1f2937';
    ctx.fillText('Revenue', width - 130, 31);
    
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(width - 150, 40, 12, 12);
    ctx.fillStyle = '#1f2937';
    ctx.fillText('Expenses', width - 130, 51);

  }, [chartData]);

  return (
    <Card data-testid="card-financial-chart">
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="chart-container relative w-full h-64">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            data-testid="canvas-financial-chart"
          />
        </div>
      </CardContent>
    </Card>
  );
}
