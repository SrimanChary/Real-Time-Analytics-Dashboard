import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from "ng2-charts";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { AnalyticsService } from '../../core/analytics/analytics.service';

type Range = '24h' | '7d' | '30d';
type MetricKey = 'page_views' | 'active_users' | 'revenue';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule, FormsModule, BaseChartDirective, NavbarComponent,
    MatIconModule, MatButtonModule, MatSelectModule, MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <app-navbar />
    <main class="page-content">
      <div class="page-header">
        <div><h1>Analytics</h1><p>Deep-dive into your metrics</p></div>
        <div class="controls">
          <mat-form-field appearance="outline" style="width:150px">
            <mat-label>Metric</mat-label>
            <mat-select [(ngModel)]="selectedMetric" (ngModelChange)="load()">
              <mat-option value="page_views">Page Views</mat-option>
              <mat-option value="active_users">Active Users</mat-option>
              <mat-option value="revenue">Revenue</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="range-tabs">
            @for (r of ranges; track r.value) {
              <button [class.active]="selectedRange === r.value" (click)="setRange(r.value)">
                {{ r.label }}
              </button>
            }
          </div>
        </div>
      </div>

      @if (loading()) {
        <div style="display:flex;align-items:center;gap:12px;padding:60px 0;color:#6b7280">
          <mat-spinner diameter="32" /> Loading chart data…
        </div>
      } @else {
        <div class="section-card">
          <div class="section-title">
            <mat-icon>area_chart</mat-icon>
            {{ selectedMetric | titlecase }} · {{ selectedRange }}
          </div>
          <div style="height:320px">
            <canvas baseChart [data]="barData" [options]="barOptions" type="bar"></canvas>
          </div>
        </div>

        <div class="section-card" style="margin-top:20px">
          <div class="section-title"><mat-icon>table_chart</mat-icon>Data Table</div>
          <table class="data-table">
            <thead>
              <tr><th>Timestamp</th><th>Value</th></tr>
            </thead>
            <tbody>
              @for (pt of tableData(); track pt.label) {
                <tr>
                  <td>{{ pt.timestamp | date:'medium' }}</td>
                  <td><strong>{{ pt.value | number:'1.2-2' }}</strong></td>
                </tr>
              }
              @empty {
                <tr><td colspan="2" style="text-align:center;color:#9ca3af;padding:20px">No data</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </main>
  `,
  styles: [`
    .page-content { max-width:1200px;margin:0 auto;padding:28px 24px; }
    .page-header { display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;gap:16px;flex-wrap:wrap; }
    h1 { font-size:22px;font-weight:700;color:#111827; }
    p  { color:#6b7280;font-size:13px;margin-top:2px; }
    .controls { display:flex;align-items:center;gap:12px;flex-wrap:wrap; }
    .range-tabs { display:flex;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden; }
    .range-tabs button {
      padding:7px 16px;font-size:13px;font-weight:500;border:none;
      background:#fff;cursor:pointer;color:#6b7280;transition:all .15s;
    }
    .range-tabs button.active { background:#4f46e5;color:#fff; }
    .data-table { width:100%;border-collapse:collapse;font-size:13px; }
    .data-table th { text-align:left;padding:10px 12px;background:#f9fafb;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #f0f0f4; }
    .data-table td { padding:10px 12px;border-bottom:1px solid #f9fafb;color:#374151; }
    .data-table tr:hover td { background:#fafafa; }
  `],
})
export class AnalyticsComponent implements OnInit {
  selectedMetric: MetricKey = 'page_views';
  selectedRange:  Range     = '7d';
  loading  = signal(true);
  tableData = signal<{ label: string; value: number; timestamp: string }[]>([]);

  ranges = [
    { value: '24h' as Range, label: '24h' },
    { value: '7d'  as Range, label: '7d'  },
    { value: '30d' as Range, label: '30d' },
  ];

  barData: ChartData<'bar'> = { labels: [], datasets: [] };
  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 12 } },
      y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
    },
  };

  constructor(private analytics: AnalyticsService) {}
  ngOnInit(): void { this.load(); }

  setRange(r: Range): void { this.selectedRange = r; this.load(); }

  load(): void {
    this.loading.set(true);
    const range = this.selectedRange === '24h'
      ? this.analytics.getLast24Hours()
      : this.selectedRange === '7d'
        ? this.analytics.getLast7Days()
        : this.analytics.getLast30Days();

    this.analytics.getTimeSeries(this.selectedMetric, range.from, range.to).subscribe({
      next: data => {
        const sliced = data.slice(-40);
        this.barData = {
          labels: sliced.map(d => new Date(d.timestamp).toLocaleDateString()),
          datasets: [{
            label: this.selectedMetric,
            data: sliced.map(d => d.value),
            backgroundColor: 'rgba(79,70,229,0.75)',
            borderRadius: 4,
          }],
        };
        this.tableData.set(sliced.slice().reverse().slice(0, 20));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
