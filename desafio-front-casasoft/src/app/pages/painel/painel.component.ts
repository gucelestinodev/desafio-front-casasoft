import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PLATFORM_ID } from '@angular/core';
import { ChamadoService, Chamado } from '../../services/chamado.service';
import { SignalRService } from '../../services/signalr.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-painel',
  imports: [CommonModule, FormsModule],
  templateUrl: './painel.component.html',
  styleUrls: ['./painel.component.scss'],
})
export class PainelComponent implements OnInit, OnDestroy {
  private chamados = inject(ChamadoService);
  private signal = inject(SignalRService);
  private platformId: object = inject(PLATFORM_ID);

  sub?: Subscription;

  itens: Chamado[] = [];
  pagina = 1;
  tamanho = 10;
  total = 0;

  filtroTitulo: string | null = null;
  filtroDescricao: string | null = null;

  abrirModalCriar = false;
  novoTitulo = '';
  novaDescricao = '';
  salvando = false;

  async ngOnInit() {
    await this.chamados.pesquisar(1, this.tamanho);
    this.sub = this.chamados.state$.subscribe(s => {
      this.itens = s.itens;
      this.pagina = s.pagina;
      this.tamanho = s.tamanho;
      this.total = s.total;
    });

    if (isPlatformBrowser(this.platformId)) {
      try {
        const token = localStorage.getItem('token') || undefined;
        await this.signal.start(token);
      } catch {}
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.signal.stop();
  }

  limparFiltro() {
    this.filtroTitulo = null;
    this.filtroDescricao = null;
  }

  get itensFiltrados(): Chamado[] {
    const t = (this.filtroTitulo ?? '').trim().toLowerCase();
    const d = (this.filtroDescricao ?? '').trim().toLowerCase();

    return this.itens.filter(c => {
      const tit = (c.titulo ?? '').toLowerCase();
      const des = (c.descricao ?? '').toLowerCase();
      const okTitulo = !t || tit.includes(t);
      const okDesc   = !d || des.includes(d);
      return okTitulo && okDesc;
    });
  }

  refresh() { this.chamados.refresh(); }
  anterior() { this.chamados.paginaAnterior(); }
  proxima() { this.chamados.proximaPagina(); }
  irPara(p: number) { this.chamados.irParaPagina(p); }
  trocarTamanho(t: number) { this.chamados.mudarTamanho(t); }

  get paginaFinal() { return Math.max(1, Math.ceil(this.total / this.tamanho)); }
  get faixaTexto() {
    if (this.total === 0) return '0 de 0';
    const ini = (this.pagina - 1) * this.tamanho + 1;
    const fim = Math.min(this.pagina * this.tamanho, this.total);
    return `${ini}–${fim} de ${this.total}`;
  }
  get paginasParaMostrar(): number[] {
    const total = this.paginaFinal;
    const atual = this.pagina;
    const window = 2;
    const ini = Math.max(1, atual - window);
    const fim = Math.min(total, atual + window);
    const arr: number[] = [];
    for (let p = ini; p <= fim; p++) arr.push(p);
    if (!arr.includes(1)) arr.unshift(1);
    if (!arr.includes(total)) arr.push(total);
    return Array.from(new Set(arr)).sort((a,b) => a-b);
  }

  abrirCriar() {
    this.novoTitulo = '';
    this.novaDescricao = '';
    this.salvando = false;
    this.abrirModalCriar = true;
  }

  fecharCriar() {
    this.abrirModalCriar = false;
  }

  async criarChamado() {
    if (!this.novoTitulo.trim() || !this.novaDescricao.trim()) return;
    this.salvando = true;
    try {
      await this.chamados.criarChamado({
        titulo: this.novoTitulo.trim(),
        descricao: this.novaDescricao.trim(),
      });
      this.fecharCriar();
      await this.chamados.refresh();
    } finally {
      this.salvando = false;
    }
  }
}
