import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export type WsStatus = 'connecting' | 'connected' | 'disconnected';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  status$ = new BehaviorSubject<WsStatus>('disconnected');
  private client!: Client;
  private subscriptions = new Map<string, StompSubscription>();

  constructor(private auth: AuthService) {}

  connect(): void {
    if (this.client?.active) return;
    this.status$.next('connecting');

    this.client = new Client({
      brokerURL: environment.wsUrl.replace('http', 'ws') + '/websocket',
      connectHeaders: {
        Authorization: `Bearer ${this.auth.getToken() ?? ''}`,
      },
      reconnectDelay: environment.wsReconnectDelay,
      onConnect: () => {
        this.status$.next('connected');
        console.log('[WS] Connected');
      },
      onDisconnect: () => {
        this.status$.next('disconnected');
      },
      onStompError: frame => {
        this.status$.next('disconnected');
        console.error('[WS] STOMP error', frame);
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.clear();
    this.client?.deactivate();
    this.status$.next('disconnected');
  }

  subscribe<T>(topic: string): Observable<T> {
    return new Observable(observer => {
      const waitAndSubscribe = () => {
        if (!this.client?.connected) {
          setTimeout(waitAndSubscribe, 300);
          return;
        }
        const sub = this.client.subscribe(topic, (msg: IMessage) => {
          try {
            observer.next(JSON.parse(msg.body) as T);
          } catch {
            console.error('[WS] Parse error', msg.body);
          }
        });
        this.subscriptions.set(topic, sub);
      };
      waitAndSubscribe();
      return () => {
        this.subscriptions.get(topic)?.unsubscribe();
        this.subscriptions.delete(topic);
      };
    });
  }

  publish(destination: string, body: object): void {
    if (this.client?.connected) {
      this.client.publish({ destination, body: JSON.stringify(body) });
    }
  }

  ngOnDestroy(): void { this.disconnect(); }
}
