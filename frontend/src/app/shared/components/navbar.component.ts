import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatDividerModule } from "@angular/material/divider";
import { AuthService } from '../../core/auth/auth.service';
import { WebSocketService, WsStatus } from '../../core/websocket/websocket.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive,
    MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule, MatDividerModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  @Input() sidebarOpen = true;

  navLinks = [
    { path: '/dashboard',  label: 'Dashboard',  icon: 'dashboard' },
    { path: '/analytics',  label: 'Analytics',  icon: 'bar_chart' },
    { path: '/reports',    label: 'Reports',    icon: 'description' },
  ];

  constructor(
    public auth: AuthService,
    public ws: WebSocketService,
    private router: Router,
  ) {}

  get wsStatus(): WsStatus { return this.ws.status$.getValue(); }

  get wsStatusClass(): string {
    return {
      connected:    'badge-live',
      connecting:   'badge-warn',
      disconnected: 'badge-error',
    }[this.wsStatus] ?? 'badge-error';
  }

  get wsStatusLabel(): string {
    return {
      connected:    'Live',
      connecting:   'Connecting…',
      disconnected: 'Offline',
    }[this.wsStatus] ?? 'Offline';
  }

  logout(): void { this.auth.logout(); }
}
