import { Injectable, NgZone, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { ChamadoService } from './chamado.service';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hub?: signalR.HubConnection;
  private platformId = inject(PLATFORM_ID);
  private readonly HUB_URL = `${environment.CHAMADO_BASE}/hub`;

  constructor(private chamados: ChamadoService, private zone: NgZone) {}

  async start(accessToken?: string) {
    if (!isPlatformBrowser(this.platformId)) return;

    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(this.HUB_URL, {
        accessTokenFactory: accessToken ? () => accessToken : undefined,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hub.on('BroadcastMessage', async () => { await this.chamados.refresh(); });
    this.hub.onreconnected(async () => { await this.chamados.refresh(); });

    await this.hub.start();
  }

  stop() { return this.hub?.stop(); }
}
