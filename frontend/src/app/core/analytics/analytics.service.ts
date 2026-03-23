import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  KpiResponse, TimeSeriesPoint, EventTypeCount,
  EventRequest, EventResponse
} from './analytics.models';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly base = `${environment.apiBaseUrl}/v1/analytics`;

  constructor(private http: HttpClient) {}

  getKpis(from: Date, to: Date): Observable<KpiResponse> {
    const params = new HttpParams()
      .set('from', from.toISOString())
      .set('to',   to.toISOString());
    return this.http.get<KpiResponse>(`${this.base}/kpis`, { params });
  }

  getTimeSeries(metricKey: string, from: Date, to: Date): Observable<TimeSeriesPoint[]> {
    const params = new HttpParams()
      .set('metricKey', metricKey)
      .set('from', from.toISOString())
      .set('to',   to.toISOString());
    return this.http.get<TimeSeriesPoint[]>(`${this.base}/metrics/timeseries`, { params });
  }

  getEventBreakdown(from: Date, to: Date): Observable<EventTypeCount[]> {
    const params = new HttpParams()
      .set('from', from.toISOString())
      .set('to',   to.toISOString());
    return this.http.get<EventTypeCount[]>(`${this.base}/events/breakdown`, { params });
  }

  ingestEvent(request: EventRequest): Observable<EventResponse> {
    return this.http.post<EventResponse>(`${this.base}/events`, request);
  }

  // Helpers to build default date ranges
  getLast24Hours(): { from: Date; to: Date } {
    const to   = new Date();
    const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
    return { from, to };
  }

  getLast7Days(): { from: Date; to: Date } {
    const to   = new Date();
    const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { from, to };
  }

  getLast30Days(): { from: Date; to: Date } {
    const to   = new Date();
    const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { from, to };
  }
}
