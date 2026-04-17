'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchSummary, simulateLoad, ServiceMetric } from '@/lib/api';
import ServiceCard from '@/components/ServiceCard';
import ResponseTimeChart from '@/components/ResponseTimeChart';
import LogsTable from '@/components/LogsTable';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<ServiceMetric[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    try {
      const data = await fetchSummary();
      setMetrics(data.services);
      setLastUpdate(new Date().toLocaleTimeString('es-CO', { hour12: false }));
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  }, []);

  useEffect(() => {
    loadSummary();
    const interval = setInterval(loadSummary, 5000);
    return () => clearInterval(interval);
  }, [loadSummary]);

  const handleSimulate = async () => {
    setSimulating(true);
    setSimResult(null);
    try {
      const result = await simulateLoad();
      setSimResult(`✓ ${result.callsGenerated} llamadas generadas exitosamente`);
      await loadSummary();
    } catch (err) {
      setSimResult('✗ Error al simular carga');
    } finally {
      setSimulating(false);
      setTimeout(() => setSimResult(null), 4000);
    }
  };

  // Determine services with problems for global alert
  const problematicServices = metrics.filter((m) => m.errorRate > 15);

  return (
    <div className="min-h-screen bg-[var(--bg)] grid-bg">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center">
                <span className="text-[var(--accent)] text-sm">⬡</span>
              </div>
              <div>
                <h1 className="font-display font-bold text-[var(--text)] text-lg leading-none">
                  ProxyMonitor
                </h1>
                <p className="text-xs text-[var(--text-muted)] font-mono leading-none mt-0.5">
                  Observabilidad de Microservicios
                </p>
              </div>
            </div>

            {problematicServices.length > 0 && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-1.5">
                <span className="status-dot bg-[var(--error)]" />
                <span className="text-xs font-mono text-[var(--error)]">
                  {problematicServices.length} servicio(s) con problemas
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {lastUpdate && (
              <span className="text-xs font-mono text-[var(--text-muted)]">
                Actualizado: {lastUpdate}
              </span>
            )}

            <button
              onClick={handleSimulate}
              disabled={simulating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono font-semibold transition-all duration-200 ${
                simulating
                  ? 'bg-[var(--accent)]/20 text-[var(--accent)]/60 border border-[var(--accent)]/20 cursor-not-allowed'
                  : 'bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent)]/90 shadow-lg shadow-[var(--accent)]/20'
              }`}
            >
              {simulating ? (
                <>
                  <span className="animate-spin">⟳</span> Simulando...
                </>
              ) : (
                <>⚡ Simular Carga</>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Simulation result toast */}
        {simResult && (
          <div
            className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-lg text-sm font-mono border animate-slide-up ${
              simResult.startsWith('✓')
                ? 'bg-green-500/10 border-green-500/30 text-[var(--success)]'
                : 'bg-red-500/10 border-red-500/30 text-[var(--error)]'
            }`}
          >
            {simResult}
          </div>
        )}

        {/* Section: Service Cards */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <h2 className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest px-3">
              Estado de Servicios
            </h2>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {metrics.length === 0 ? (
              <>
                {['Inventario', 'Pedidos', 'Pagos'].map((name) => (
                  <div
                    key={name}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 animate-pulse"
                  >
                    <div className="h-6 w-32 bg-[var(--border)] rounded mb-4" />
                    <div className="h-10 w-24 bg-[var(--border)] rounded mb-2" />
                    <div className="h-2 bg-[var(--border)] rounded" />
                    <p className="text-xs text-[var(--text-muted)] font-mono mt-3 text-center">
                      Sin datos — Simula carga para empezar
                    </p>
                  </div>
                ))}
              </>
            ) : (
              metrics.map((metric) => (
                <ServiceCard key={metric.serviceId} metric={metric} />
              ))
            )}
          </div>
        </section>

        {/* Section: Response Time Chart */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-semibold text-[var(--text)]">
                Tiempos de Respuesta
              </h2>
              <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                Últimas 20 llamadas por servicio
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-dot bg-[var(--accent)]" />
              <span className="text-xs font-mono text-[var(--text-muted)]">En vivo</span>
            </div>
          </div>
          <ResponseTimeChart />
        </section>

        {/* Section: Logs Table */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-semibold text-[var(--text)]">
                Registro de Logs
              </h2>
              <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                Actualización automática cada 3 segundos · Click en una fila para ver detalles
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-dot bg-[var(--success)]" />
              <span className="text-xs font-mono text-[var(--text-muted)]">Polling activo</span>
            </div>
          </div>
          <LogsTable />
        </section>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-[var(--border)]">
          <p className="text-xs font-mono text-[var(--text-muted)]">
            Patrón Proxy · Patrones de Software · Semestre Cuarto · 2026
          </p>
        </footer>
      </main>
    </div>
  );
}
