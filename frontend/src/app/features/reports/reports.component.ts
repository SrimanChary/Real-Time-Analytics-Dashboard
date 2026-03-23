import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { EventTypeCount } from '../../core/analytics/analytics.models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, FormsModule, NavbarComponent,
    MatIconModule, MatButtonModule, MatSnackBarModule,
  ],
  template: `
    <app-navbar />
    <main class="page-content">
      <div class="page-header">
        <div><h1>Reports</h1><p>Generate and export analytics reports</p></div>
        <button mat-raised-button color="primary" (click)="generateReport()" [disabled]="generating()">
          <mat-icon>download</mat-icon>
          {{ generating() ? 'Generating…' : 'Export CSV' }}
        </button>
      </div>

      <!-- Quick Stats -->
      <div class="stats-row">
        @for (stat of stats(); track stat.label) {
          <div class="stat-card">
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-value">{{ stat.value }}</span>
          </div>
        }
      </div>

      <!-- Event Breakdown Table -->
      <div class="section-card">
        <div class="section-title">
          <mat-icon>bar_chart</mat-icon>
          Event Breakdown — Last 7 Days
          <button mat-icon-button style="margin-left:auto" (click)="loadBreakdown()" title="Refresh">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>

        @if (loading()) {
          <div class="empty-state"><mat-icon>hourglass_top</mat-icon><p>Loading…</p></div>
        } @else if (breakdown().length === 0) {
          <div class="empty-state"><mat-icon>inbox</mat-icon><p>No event data found.</p></div>
        } @else {
          <table class="report-table">
            <thead>
              <tr>
                <th>#</th><th>Event Type</th><th>Count</th><th>Share</th><th>Trend</th>
              </tr>
            </thead>
            <tbody>
              @for (row of breakdown(); track row.eventType; let i = $index) {
                <tr>
                  <td class="rank">{{ i + 1 }}</td>
                  <td>
                    <span class="event-pill">{{ row.eventType }}</span>
                  </td>
                  <td><strong>{{ row.count | number }}</strong></td>
                  <td>
                    <div class="share-bar">
                      <div class="share-fill" [style.width.%]="getShare(row.count)"></div>
                      <span>{{ getShare(row.count) | number:'1.1-1' }}%</span>
                    </div>
                  </td>
                  <td>
                    <span class="trend-badge" [class.up]="i < 2" [class.down]="i >= 4">
                      {{ i < 2 ? '↑' : i >= 4 ? '↓' : '→' }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Ingest Demo Event -->
      <div class="section-card">
        <div class="section-title"><mat-icon>add_circle</mat-icon>Ingest Test Event</div>
        <div class="ingest-form">
          <select [(ngModel)]="newEventType" class="event-select">
            <option value="pageview">pageview</option>
            <option value="click">click</option>
            <option value="purchase">purchase</option>
            <option value="signup">signup</option>
            <option value="logout">logout</option>
          </select>
          <button mat-raised-button color="accent" (click)="sendEvent()">
            <mat-icon>send</mat-icon> Send Event
          </button>
        </div>
        <p style="font-size:12px;color:#9ca3af;margin-top:8px">
          This will POST to <code>/api/v1/analytics/events</code> and broadcast via WebSocket.
        </p>
      </div>
    </main>
  `,
  styles: [`
    .page-content { max-width:1200px;margin:0 auto;padding:28px 24px; }
    .page-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:24px; }
    h1 { font-size:22px;font-weight:700;color:#111827; }
    p  { color:#6b7280;font-size:13px;margin-top:2px; }
    .stats-row { display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:20px; }
    .stat-card { background:#fff;border:1px solid #f0f0f4;border-radius:10px;padding:16px 20px; }
    .stat-label { display:block;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.04em; }
    .stat-value { display:block;font-size:22px;font-weight:700;color:#111827;margin-top:4px; }
    .report-table { width:100%;border-collapse:collapse;font-size:13px; }
    .report-table th { text-align:left;padding:10px 12px;background:#f9fafb;color:#6b7280;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #f0f0f4; }
    .report-table td { padding:11px 12px;border-bottom:1px solid #f9fafb;color:#374151; }
    .report-table tr:hover td { background:#fafafa; }
    .rank { color:#9ca3af;font-weight:600; }
    .event-pill { background:#eff6ff;color:#2563eb;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600; }
    .share-bar { display:flex;align-items:center;gap:8px; }
    .share-fill { height:6px;background:#4f46e5;border-radius:3px;min-width:4px; }
    .share-bar span { font-size:12px;color:#6b7280;min-width:36px; }
    .trend-badge { font-weight:700;font-size:15px; }
    .trend-badge.up   { color:#16a34a; }
    .trend-badge.down { color:#dc2626; }
    .empty-state { display:flex;flex-direction:column;align-items:center;gap:8px;padding:40px 0;color:#9ca3af; }
    .empty-state mat-icon { font-size:32px;width:32px;height:32px; }
    .ingest-form { display:flex;align-items:center;gap:12px; }
    .event-select { padding:8px 12px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;color:#374151;outline:none; }
    code { background:#f3f4f6;padding:1px 5px;border-radius:4px;font-size:11px; }
  `],
})
export class ReportsComponent implements OnInit {
  breakdown  = signal<EventTypeCount[]>([]);
  stats      = signal<{ label: string; value: string }[]>([]);
  loading    = signal(true);
  generating = signal(false);
  newEventType = 'pageview';
  private totalCount = 0;

  constructor(
    private analytics: AnalyticsService,
    private snack: MatSnackBar,
  ) {}

  ngOnInit(): void { this.loadBreakdown(); }

  loadBreakdown(): void {
    this.loading.set(true);
    const { from, to } = this.analytics.getLast7Days();
    this.analytics.getEventBreakdown(from, to).subscribe({
      next: data => {
        this.breakdown.set(data);
        this.totalCount = data.reduce((s, d) => s + d.count, 0);
        this.stats.set([
          { label: 'Total Events',  value: this.totalCount.toLocaleString() },
          { label: 'Event Types',   value: String(data.length) },
          { label: 'Top Event',     value: data[0]?.eventType ?? '—' },
          { label: 'Top Count',     value: (data[0]?.count ?? 0).toLocaleString() },
        ]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getShare(count: number): number {
    return this.totalCount > 0 ? (count / this.totalCount) * 100 : 0;
  }

  sendEvent(): void {
    this.analytics.ingestEvent({ eventType: this.newEventType, source: 'dashboard-ui' })
      .subscribe({
        next: () => {
          this.snack.open(`Event "${this.newEventType}" sent!`, 'OK', { duration: 3000 });
          this.loadBreakdown();
        },
        error: () => this.snack.open('Failed to send event', 'OK', { duration: 3000 }),
      });
  }

  generateReport(): void {
    this.generating.set(true);
    const data = this.breakdown();
    const csv  = ['Event Type,Count,Share %',
      ...data.map(d => `${d.eventType},${d.count},${this.getShare(d.count).toFixed(1)}`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'analytics-report.csv';
    a.click(); URL.revokeObjectURL(url);
    this.generating.set(false);
    this.snack.open('Report exported!', 'OK', { duration: 3000 });
  }
}
