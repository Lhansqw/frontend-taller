'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { fetchRecent, ServiceLog } from '@/lib/api';

const SERVICE_COLORS: Record<string, string> = {
  INVENTORY: '#00d4ff',
  ORDERS: '#a78bfa',
  PAYMENTS: '#00ff88',
};

const SERVICE_LABELS: Record<string, string> = {
  INVENTORY: 'Inventario',
  ORDERS: 'Pedidos',
  PAYMENTS: 'Pagos',
};

interface ChartPoint {
  index: number;
  INVENTORY?: number;
  ORDERS?: number;
  PAYMENTS?: number;
}

export default function ResponseTimeChart() {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [inv, ord, pay] = await Promise.all([
        fetchRecent('INVENTORY'),
        fetchRecent('ORDERS'),
        fetchRecent('PAYMENTS'),
      ]);

      const maxLen = Math.max(inv.logs.length, ord.logs.length, pay.logs.length, 1);
      const points: ChartPoint[] = [];

      for (let i = 0; i < maxLen; i++) {
        points.push({
          index: i + 1,
          INVENTORY: inv.logs[i]?.durationMs,
          ORDERS: ord.logs[i]?.durationMs,
          PAYMENTS: pay.logs[i]?.durationMs,
        });
      }

      setChartData(points);
    } catch (err) {
      console.error('Chart load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 shadow-xl">
        <p className="text-xs text-[var(--text-muted)] font-mono mb-2">Llamada #{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} className="text-sm font-mono" style={{ color: p.color }}>
            {SERVICE_LABELS[p.dataKey]}: <strong>{p.value}ms</strong>
          </p>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-[var(--text-muted)] font-mono text-sm">
        Cargando datos...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,64,0.8)" />
        <XAxis
          dataKey="index"
          stroke="#4a5568"
          tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
          label={{ value: 'Últimas llamadas', position: 'insideBottom', offset: -2, fill: '#4a5568', fontSize: 10 }}
        />
        <YAxis
          stroke="#4a5568"
          tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
          unit="ms"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'Space Grotesk' }}>
              {SERVICE_LABELS[value] || value}
            </span>
          )}
        />
        {Object.entries(SERVICE_COLORS).map(([service, color]) => (
          <Line
            key={service}
            type="monotone"
            dataKey={service}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
