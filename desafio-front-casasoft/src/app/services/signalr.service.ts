import { Injectable, NgZone, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';
import { ChamadoService } from './chamado.service';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hub?: signalR.HubConnection;
  private platformId = inject(PLATFORM_ID);
  private readonly HUB_URL = `${environment.CHAMADO_BASE}/AtualizarPesquisa`;

  constructor(private chamados: ChamadoService, private zone: NgZone) { }

  async start(accessToken?: string) {
    if (!isPlatformBrowser(this.platformId)) return;

    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(this.HUB_URL, {
        accessTokenFactory: accessToken ? () => accessToken : undefined,
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hub.serverTimeoutInMilliseconds = 30_000;
    this.hub.keepAliveIntervalInMilliseconds = 15_000;


    this.hub.on('BroadcastMessage', async () => {
      await this.chamados.refresh('signalr');
    });

    this.hub.onreconnected(async () => {
      await this.chamados.refresh('signalr');
    });

    this.hub.onclose(err => {
      console.warn('[SignalR] onclose', err);
    });

    await this.hub.start();
    console.info('[SignalR] conectado');
  }

  stop() { return this.hub?.stop(); }
}
