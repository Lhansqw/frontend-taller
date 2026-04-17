const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface ServiceMetric {
  serviceId: string;
  totalCalls: number;
  errorCount: number;
  successCount: number;
  errorRate: number;
  successRate: number;
  avgDurationMs: number;
}

export interface ServiceLog {
  id: number;
  requestId: string;
  serviceId: string;
  operation: string;
  durationMs: number;
  status: 'SUCCESS' | 'ERROR';
  errorMessage?: string;
  responseData?: string;
  inputParams?: string;
  timestamp: string;
}

export interface LogsResponse {
  logs: ServiceLog[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export interface SummaryResponse {
  services: ServiceMetric[];
  timestamp: string;
}

export async function fetchSummary(): Promise<SummaryResponse> {
  const res = await fetch(`${BASE_URL}/api/metrics/summary`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.json();
}

export async function fetchLogs(params: {
  service?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}): Promise<LogsResponse> {
  const query = new URLSearchParams();
  if (params.service) query.set('service', params.service);
  if (params.status) query.set('status', params.status);
  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);
  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.size !== undefined) query.set('size', String(params.size));

  const res = await fetch(`${BASE_URL}/api/metrics/logs?${query}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch logs');
  return res.json();
}

export async function fetchRecent(serviceId: string): Promise<{ logs: ServiceLog[] }> {
  const res = await fetch(`${BASE_URL}/api/metrics/recent?serviceId=${serviceId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch recent logs');
  return res.json();
}

export async function simulateLoad(): Promise<{ message: string; callsGenerated: number }> {
  const res = await fetch(`${BASE_URL}/api/metrics/simulate-load`, {
    method: 'POST',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to simulate load');
  return res.json();
}

export async function callService(
  service: 'inventory' | 'orders' | 'payments',
  operation: string,
  body?: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const res = await fetch(`${BASE_URL}/api/services/${service}/${operation}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
    cache: 'no-store',
  });
  return res.json();
}
