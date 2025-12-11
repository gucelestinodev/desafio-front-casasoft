import { Injectable, NgZone, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Subject } from 'rxjs'; // <-- Subject aqui
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Chamado {
  id: number;
  titulo: string;
  descricao: string;
  status: string;
  dataCadastro: string;
}

export interface PesquisaState {
  itens: Chamado[];
  pagina: number;
  tamanho: number;
  total: number;
  titulo?: string | null;
  descricao?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ChamadoService {
  private platformId = inject(PLATFORM_ID);

  private readonly LIST_URL = `${environment.CHAMADO_BASE}/api/v1/chamados/pesquisa`;
  private readonly CREATE_URL = `${environment.CHAMADO_BASE}/api/v1/chamados`;
  private readonly DETAIL_URL = `${environment.CHAMADO_BASE}/api/v1/chamados`;

  private _state$ = new BehaviorSubject<PesquisaState>({
    itens: [], pagina: 1, tamanho: 10, total: 0, titulo: null, descricao: null,
  });

  public readonly state$ = this._state$.asObservable();
  public readonly itens$ = this.state$.pipe(map((s) => s.itens));

  private _autoUpdate$ = new Subject<void>();
  public readonly autoUpdate$ = this._autoUpdate$.asObservable();

  private suprimirProximaAutoUpdate = false;

  constructor(private http: HttpClient, private zone: NgZone) { }

  public suprimirProximaAtualizacaoAutomatica() {
    this.suprimirProximaAutoUpdate = true;
  }

  async refresh(origem: 'manual' | 'signalr' = 'manual') {
    if (!isPlatformBrowser(this.platformId)) return;

    const s = this._state$.value;
    await this.pesquisar(
      s.pagina,
      s.tamanho,
      s.titulo ?? undefined,
      s.descricao ?? undefined
    );

    if (origem === 'signalr') {
      if (this.suprimirProximaAutoUpdate) {
        this.suprimirProximaAutoUpdate = false;
        return;
      }

      this._autoUpdate$.next();
    }
  }

  async pesquisar(pagina = 1, maximo = 10, titulo?: string, descricao?: string) {
    if (!isPlatformBrowser(this.platformId)) return;

    let params = new HttpParams()
      .set('pagina', String(pagina))
      .set('maximo', String(maximo));
    if (titulo) params = params.set('titulo', titulo);
    if (descricao) params = params.set('descricao', descricao);

    const resp = await firstValueFrom(this.http.get<{
      data: { pagina: number; tamanho: number; total: number; resultado: Chamado[] }
    }>(this.LIST_URL, { params }));

    const payload = resp?.data;
    this.zone.run(() => {
      this._state$.next({
        itens: payload?.resultado ?? [],
        pagina: payload?.pagina ?? pagina,
        tamanho: payload?.tamanho ?? maximo,
        total: payload?.total ?? 0,
        titulo: titulo ?? null,
        descricao: descricao ?? null,
      });
    });
  }

  async carregarListaInicial() {
    if (!isPlatformBrowser(this.platformId)) return;
    const s = this._state$.value;
    return this.pesquisar(1, s.tamanho ?? 10, s.titulo ?? undefined, s.descricao ?? undefined);
  }

  async atualizarPesquisa() { return this.refresh('manual'); }

  async paginaAnterior() {
    if (!isPlatformBrowser(this.platformId)) return;
    const s = this._state$.value;
    const prev = Math.max(1, s.pagina - 1);
    return this.pesquisar(prev, s.tamanho, s.titulo ?? undefined, s.descricao ?? undefined);
  }

  async proximaPagina() {
    if (!isPlatformBrowser(this.platformId)) return;
    const s = this._state$.value;
    const last = Math.max(1, Math.ceil(s.total / s.tamanho));
    const next = Math.min(last, s.pagina + 1);
    return this.pesquisar(next, s.tamanho, s.titulo ?? undefined, s.descricao ?? undefined);
  }

  async irParaPagina(p: number) {
    if (!isPlatformBrowser(this.platformId)) return;
    const s = this._state$.value;
    return this.pesquisar(p, s.tamanho, s.titulo ?? undefined, s.descricao ?? undefined);
  }

  async mudarTamanho(tamanho: number) {
    if (!isPlatformBrowser(this.platformId)) return;
    const s = this._state$.value;
    return this.pesquisar(1, tamanho, s.titulo ?? undefined, s.descricao ?? undefined);
  }

  async criarChamado(input: { titulo: string; descricao: string; status?: 'ABERTO' | 'FECHADO'; dataCadastro?: string }) {
    if (!isPlatformBrowser(this.platformId)) return;
    const body = {
      titulo: input.titulo,
      descricao: input.descricao,
      status: input.status ?? 'ABERTO',
      dataCadastro: input.dataCadastro ?? new Date().toISOString(),
    };
    const resp = await firstValueFrom(this.http.post<{ data: Chamado }>(this.CREATE_URL, body));
    return resp?.data;
  }

  async obterPorId(id: number) {
    const resp = await firstValueFrom(
      this.http.get<{ data: Chamado }>(`${this.DETAIL_URL}/${id}`)
    );
    return resp?.data;
  }

  async atualizarChamado(
    id: number,
    input: { titulo: string; descricao: string; dataCadastro?: string }
  ) {
    const body = {
      titulo: input.titulo,
      descricao: input.descricao,
      status: 'ABERTO' as const,
      dataCadastro: new Date().toISOString(),
    };

    const resp = await firstValueFrom(
      this.http.put<{ data: Partial<Chamado> }>(`${this.DETAIL_URL}/${id}`, body)
    );

    return resp?.data;
  }

  async excluirChamado(id: number) {
    const resp = await firstValueFrom(this.http.delete<{ data: boolean }>(`${this.DETAIL_URL}/${id}`));
    return !!resp?.data;
  }
}
