import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { WebSocketService } from '../../core/websocket/websocket.service';
import { KpiResponse, KpiSnapshot, EventNotification, TimeSeriesPoint } from '../../core/analytics/analytics.models';

Chart.register(...registerables);

interface KpiCard {
  label: string; value: string; delta: string;
  positive: boolean; icon: string; iconClass: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,
    CommonModule, BaseChartDirective, NavbarComponent,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  kpis         = signal<KpiCard[]>([]);
  recentEvents = signal<EventNotification[]>([]);
  loading      = signal(true);

  lineData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Live Metric',
      data: [],
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79,70,229,0.08)',
      tension: 0.4,
      fill: true,
      pointRadius: 3,
    }],
  };
  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
      y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
    },
  };

  donutData: ChartData<'doughnut'> = {
    labels: ['click', 'pageview', 'purchase', 'signup', 'logout'],
    datasets: [{
      data: [30, 25, 20, 15, 10],
      backgroundColor: ['#4f46e5','#06b6d4','#f59e0b','#10b981','#f43f5e'],
    }],
  };
  donutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    cutout: '68%',
  };

  constructor(
    private analytics: AnalyticsService,
    private ws: WebSocketService,
  ) {}

  ngOnInit(): void {
    this.ws.connect();
    this.loadKpis();
    this.loadEventBreakdown();
    this.subscribeRealtime();
  }

  private loadKpis(): void {
    const { from, to } = this.analytics.getLast7Days();
    this.analytics.getKpis(from, to).subscribe({
      next: (res) => {
        this.kpis.set(this.buildKpiCards(res));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadEventBreakdown(): void {
    const { from, to } = this.analytics.getLast7Days();
    this.analytics.getEventBreakdown(from, to).subscribe(data => {
      if (data.length > 0) {
        this.donutData = {
          labels: data.map(d => d.eventType),
          datasets: [{
            data: data.map(d => d.count),
            backgroundColor: ['#4f46e5','#06b6d4','#f59e0b','#10b981','#f43f5e'],
          }],
        };
      }
    });
  }

  private subscribeRealtime(): void {
    this.ws.subscribe<KpiSnapshot>('/topic/kpis')
      .pipe(takeUntil(this.destroy$))
      .subscribe(snap => this.kpis.update(cards => this.updateKpiCards(cards, snap)));

    this.ws.subscribe<EventNotification>('/topic/events')
      .pipe(takeUntil(this.destroy$))
      .subscribe(evt => {
        this.recentEvents.update(list => [evt, ...list].slice(0, 10));
      });

    this.ws.subscribe<TimeSeriesPoint>('/topic/metrics')
      .pipe(takeUntil(this.destroy$))
      .subscribe(pt => {
        const time = new Date(pt.timestamp).toLocaleTimeString();
        const labels = [...(this.lineData.labels as string[]), time].slice(-20);
        const values = [...(this.lineData.datasets[0].data as number[]), pt.value].slice(-20);
        this.lineData = {
          ...this.lineData,
          labels,
          datasets: [{ ...this.lineData.datasets[0], data: values }],
        };
      });
  }

  private buildKpiCards(res: KpiResponse): KpiCard[] {
    return [
      { label: 'Total Events',  value: res.totalEvents.toLocaleString(),  delta: '+12.5%', positive: true,  icon: 'bolt',         iconClass: 'blue'   },
      { label: 'Active Users',  value: res.activeUsers.toLocaleString(),  delta: '+8.2%',  positive: true,  icon: 'group',        iconClass: 'green'  },
      { label: 'Total Revenue', value: '$' + (res.totalRevenue ?? 0).toLocaleString(), delta: '+4.1%', positive: true, icon: 'attach_money', iconClass: 'amber'  },
      { label: 'Page Views',    value: res.pageViews.toLocaleString(),    delta: '-2.3%',  positive: false, icon: 'visibility',   iconClass: 'purple' },
    ];
  }

  private updateKpiCards(cards: KpiCard[], snap: KpiSnapshot): KpiCard[] {
    if (!cards.length) return cards;
    const updated = [...cards];
    updated[0] = { ...updated[0], value: snap.totalEvents.toLocaleString() };
    updated[1] = { ...updated[1], value: snap.activeUsers.toLocaleString() };
    updated[2] = { ...updated[2], value: '$' + snap.latestRevenue.toLocaleString() };
    updated[3] = { ...updated[3], value: snap.pageViews.toLocaleString() };
    return updated;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
