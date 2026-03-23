export interface KpiResponse {
  totalEvents: number;
  activeUsers: number;
  totalRevenue: number;
  avgMetricValue: number;
  pageViews: number;
  period: { from: string; to: string };
}

export interface KpiSnapshot {
  totalEvents: number;
  activeUsers: number;
  latestRevenue: number;
  pageViews: number;
  timestamp: string;
}

export interface TimeSeriesPoint {
  label: string;
  value: number;
  timestamp: string;
}

export interface EventTypeCount {
  eventType: string;
  count: number;
}

export interface EventRequest {
  eventType: string;
  source?: string;
  payload?: Record<string, unknown>;
}

export interface EventResponse {
  id: number;
  eventType: string;
  source: string;
  occurredAt: string;
}

export interface EventNotification {
  id: number;
  eventType: string;
  occurredAt: string;
}
