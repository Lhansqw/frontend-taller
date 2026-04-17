'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchLogs, ServiceLog } from '@/lib/api';

const SERVICE_LABELS: Record<string, string> = {
  INVENTORY: 'Inventario',
  ORDERS: 'Pedidos',
  PAYMENTS: 'Pagos',
};

const SERVICE_COLORS: Record<string, string> = {
  INVENTORY: '#00d4ff',
  ORDERS: '#a78bfa',
  PAYMENTS: '#00ff88',
};

export default function LogsTable() {
  const [logs, setLogs] = useState<ServiceLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Filters
  const [filterService, setFilterService] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLogs({
        service: filterService || undefined,
        status: filterStatus || undefined,
        from: filterFrom ? new Date(filterFrom).toISOString() : undefined,
        to: filterTo ? new Date(filterTo).toISOString() : undefined,
        page,
        size: 15,
      });
      setLogs(data.logs);
      setTotal(data.totalElements);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  }, [filterService, filterStatus, filterFrom, filterTo, page]);

  // Polling every 3 seconds
  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 3000);
    return () => clearInterval(interval);
  }, [loadLogs]);

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString('es-CO', { hour12: false });
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--text-muted)] font-mono">Servicio</label>
          <select
            value={filterService}
            onChange={(e) => { setFilterService(e.target.value); setPage(0); }}
            className="bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--accent)] cursor-pointer"
          >
            <option value="">Todos</option>
            <option value="INVENTORY">Inventario</option>
            <option value="ORDERS">Pedidos</option>
            <option value="PAYMENTS">Pagos</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--text-muted)] font-mono">Estado</label>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
            className="bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--accent)] cursor-pointer"
          >
            <option value="">Todos</option>
            <option value="SUCCESS">Exitoso</option>
            <option value="ERROR">Error</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--text-muted)] font-mono">Desde</label>
          <input
            type="datetime-local"
            value={filterFrom}
            onChange={(e) => { setFilterFrom(e.target.value); setPage(0); }}
            className="bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--text-muted)] font-mono">Hasta</label>
          <input
            type="datetime-local"
            value={filterTo}
            onChange={(e) => { setFilterTo(e.target.value); setPage(0); }}
            className="bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <button
          onClick={() => {
            setFilterService('');
            setFilterStatus('');
            setFilterFrom('');
            setFilterTo('');
            setPage(0);
          }}
          className="px-4 py-2 text-sm font-mono border border-[var(--border)] text-[var(--text-muted)] rounded-lg hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
        >
          Limpiar
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span className="status-dot bg-[var(--success)]" />
          <span className="text-xs text-[var(--text-muted)] font-mono">
            {loading ? 'Actualizando...' : `${total} registros`}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
              <th className="text-left px-4 py-3 text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
                Request ID
              </th>
              <th className="text-left px-4 py-3 text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
                Servicio
              </th>
              <th className="text-left px-4 py-3 text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
                Operación
              </th>
              <th className="text-left px-4 py-3 text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
                Duración
              </th>
              <th className="text-left px-4 py-3 text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
                Estado
              </th>
              <th className="text-left px-4 py-3 text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[var(--text-muted)] font-mono text-sm">
                  {loading ? 'Cargando logs...' : 'No hay logs. Presiona "Simular Carga" para generar datos.'}
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <>
                  <tr
                    key={log.id}
                    onClick={() => toggleExpand(log.id)}
                    className={`border-b border-[var(--border)]/50 cursor-pointer transition-colors ${
                      expandedId === log.id
                        ? 'bg-[var(--surface2)]'
                        : 'hover:bg-[var(--surface)] '
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">
                      {log.requestId.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
                        style={{
                          color: SERVICE_COLORS[log.serviceId] || '#94a3b8',
                          backgroundColor: `${SERVICE_COLORS[log.serviceId]}18` || '#94a3b818',
                        }}
                      >
                        {SERVICE_LABELS[log.serviceId] || log.serviceId}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text)]">
                      {log.operation}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      <span
                        className={
                          log.durationMs > 200
                            ? 'text-[var(--warning)]'
                            : 'text-[var(--text-muted)]'
                        }
                      >
                        {log.durationMs}ms
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          log.status === 'SUCCESS'
                            ? 'text-[var(--success)] bg-green-500/10'
                            : 'text-[var(--error)] bg-red-500/10'
                        }`}
                      >
                        {log.status === 'SUCCESS' ? '✓ ÉXITO' : '✗ ERROR'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">
                      {formatTimestamp(log.timestamp)}
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {expandedId === log.id && (
                    <tr key={`${log.id}-detail`} className="bg-[var(--bg)] border-b border-[var(--border)]">
                      <td colSpan={6} className="px-6 py-4 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-[var(--text-muted)] font-mono mb-1">REQUEST ID COMPLETO</p>
                            <code className="text-xs text-[var(--accent)] font-mono break-all">
                              {log.requestId}
                            </code>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--text-muted)] font-mono mb-1">PARÁMETROS DE ENTRADA</p>
                            <code className="text-xs text-[var(--text)] font-mono">
                              {log.inputParams || '[]'}
                            </code>
                          </div>
                          {log.status === 'SUCCESS' && log.responseData && (
                            <div className="md:col-span-2">
                              <p className="text-xs text-[var(--text-muted)] font-mono mb-1">RESPUESTA COMPLETA</p>
                              <pre className="text-xs text-[var(--success)] font-mono bg-green-500/5 border border-green-500/10 rounded p-3 overflow-x-auto max-h-32 overflow-y-auto">
                                {log.responseData}
                              </pre>
                            </div>
                          )}
                          {log.status === 'ERROR' && log.errorMessage && (
                            <div className="md:col-span-2">
                              <p className="text-xs text-[var(--text-muted)] font-mono mb-1">STACK TRACE</p>
                              <pre className="text-xs text-[var(--error)] font-mono bg-red-500/5 border border-red-500/10 rounded p-3 overflow-x-auto max-h-32 overflow-y-auto">
                                {log.errorMessage}
                              </pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 15 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)] font-mono">
            Mostrando {page * 15 + 1}–{Math.min((page + 1) * 15, total)} de {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-xs font-mono border border-[var(--border)] rounded text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={(page + 1) * 15 >= total}
              className="px-3 py-1.5 text-xs font-mono border border-[var(--border)] rounded text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
