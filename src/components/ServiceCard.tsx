'use client';

import { ServiceMetric } from '@/lib/api';

interface ServiceCardProps {
  metric: ServiceMetric;
}

const SERVICE_LABELS: Record<string, string> = {
  INVENTORY: 'Inventario',
  ORDERS: 'Pedidos',
  PAYMENTS: 'Pagos',
};

const SERVICE_ICONS: Record<string, string> = {
  INVENTORY: '📦',
  ORDERS: '🛒',
  PAYMENTS: '💳',
};

export default function ServiceCard({ metric }: ServiceCardProps) {
  const isProblematic = metric.errorRate > 15;
  const label = SERVICE_LABELS[metric.serviceId] || metric.serviceId;
  const icon = SERVICE_ICONS[metric.serviceId] || '⚙️';

  return (
    <div
      className={`relative rounded-xl border p-6 transition-all duration-300 ${
        isProblematic
          ? 'border-red-500/60 bg-red-950/20 glow-error'
          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/40'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-display font-semibold text-[var(--text)] text-lg leading-tight">
              {label}
            </h3>
            <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">{metric.serviceId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="status-dot"
            style={{ backgroundColor: isProblematic ? 'var(--error)' : 'var(--success)' }}
          />
          {isProblematic && (
            <span className="text-xs font-mono text-[var(--error)] font-semibold bg-red-500/10 px-2 py-0.5 rounded">
              ALERTA
            </span>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="text-center">
          <p className="text-2xl font-mono font-bold text-[var(--accent)]">
            {metric.totalCalls}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Total llamadas</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-mono font-bold ${isProblematic ? 'text-[var(--error)]' : 'text-[var(--success)]'}`}>
            {metric.successRate.toFixed(1)}%
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Tasa de éxito</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-mono font-bold text-[var(--warning)]">
            {metric.avgDurationMs.toFixed(0)}
            <span className="text-sm font-normal ml-0.5">ms</span>
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Tiempo prom.</p>
        </div>
      </div>

      {/* Success/Error bar */}
      <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${metric.successRate}%`,
            background: isProblematic
              ? 'linear-gradient(90deg, var(--error), var(--warning))'
              : 'linear-gradient(90deg, var(--success), var(--accent))',
          }}
        />
      </div>

      {/* Sub-stats */}
      <div className="flex justify-between mt-2">
        <span className="text-xs font-mono text-[var(--success)]">
          ✓ {metric.successCount} exitosas
        </span>
        <span className="text-xs font-mono text-[var(--error)]">
          ✗ {metric.errorCount} errores ({metric.errorRate.toFixed(1)}%)
        </span>
      </div>
    </div>
  );
}
