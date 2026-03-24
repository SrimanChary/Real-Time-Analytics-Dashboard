import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { WebSocketService } from '../../core/websocket/websocket.service';
import { KpiResponse, KpiSnapshot, EventNotification, TimeSeriesPoint } from '../../core/analytics/analytics.models';

interface KpiCard {
  label: string; value: string; delta: string;
  positive: boolean; icon: string; iconClass: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  kpis         = signal<KpiCard[]>([]);
  recentEvents = signal<EventNotification[]>([]);
  loading      = signal(true);
  wsConnected  = signal(false);

  constructor(
    private analytics: AnalyticsService,
    private ws: WebSocketService,
  ) {}

  ngOnInit(): void {
    this.loadKpis();
    this.loadEvents();
    this.ws.connect();
    this.ws.status$.pipe(takeUntil(this.destroy$))
      .subscribe(s => this.wsConnected.set(s === 'connected'));
    this.ws.subscribe<KpiSnapshot>('/topic/kpis')
      .pipe(takeUntil(this.destroy$))
      .subscribe(snap => {
        this.kpis.update(cards => {
          if (!cards.length) return cards;
          const u = [...cards];
          u[0] = { ...u[0], value: snap.totalEvents.toLocaleString() };
          u[1] = { ...u[1], value: snap.activeUsers.toLocaleString() };
          u[2] = { ...u[2], value: '$' + snap.latestRevenue.toLocaleString() };
          u[3] = { ...u[3], value: snap.pageViews.toLocaleString() };
          return u;
        });
      });
    this.ws.subscribe<EventNotification>('/topic/events')
      .pipe(takeUntil(this.destroy$))
      .subscribe(evt => this.recentEvents.update(list => [evt, ...list].slice(0, 10)));
  }

  private loadKpis(): void {
    const { from, to } = this.analytics.getLast7Days();
    this.analytics.getKpis(from, to).subscribe({
      next: res => { this.kpis.set(this.buildCards(res)); this.loading.set(false); },
      error: ()  => this.loading.set(false),
    });
  }

  private loadEvents(): void {
    const { from, to } = this.analytics.getLast7Days();
    this.analytics.getEventBreakdown(from, to).subscribe();
  }

  private buildCards(res: KpiResponse): KpiCard[] {
    return [
      { label: 'Total Events',  value: res.totalEvents.toLocaleString(),  delta: '+12.5%', positive: true,  icon: 'bolt',         iconClass: 'blue'   },
      { label: 'Active Users',  value: res.activeUsers.toLocaleString(),  delta: '+8.2%',  positive: true,  icon: 'group',        iconClass: 'green'  },
      { label: 'Total Revenue', value: '$' + (res.totalRevenue ?? 0).toLocaleString(), delta: '+4.1%', positive: true, icon: 'attach_money', iconClass: 'amber' },
      { label: 'Page Views',    value: res.pageViews.toLocaleString(),    delta: '-2.3%',  positive: false, icon: 'visibility',   iconClass: 'purple' },
    ];
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
