import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PLATFORM_ID } from '@angular/core';
import { ChamadoService, Chamado } from '../../services/chamado.service';
import { SignalRService } from '../../services/signalr.service';
import { Subscription } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  standalone: true,
  selector: 'app-painel',
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './painel.component.html',
  styleUrls: ['./painel.component.scss'],
})
export class PainelComponent implements OnInit, OnDestroy {
  private chamados = inject(ChamadoService);
  private signal = inject(SignalRService);
  private platformId: object = inject(PLATFORM_ID);
  private snackbar = inject(SnackbarService);

  private snackBar = inject(MatSnackBar);

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

  detalheAberto = false;
  detalheLoading = false;
  detalheErro: string | null = null;
  detalhe: Chamado | null = null;

  editando = false;
  editTitulo = '';
  editDescricao = '';
  salvandoEdicao = false;

  excluindo = false;

  autoAtualizado = false;
  private autoUpdateSub?: Subscription;
  private autoUpdateTimeout?: any;

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      this.itens = [];
      this.total = 0;
      return;
    }

    await this.chamados.pesquisar(1, this.tamanho);

    this.sub = this.chamados.state$.subscribe(s => {
      this.itens = s.itens;
      this.pagina = s.pagina;
      this.tamanho = s.tamanho;
      this.total = s.total;
    });

    this.autoUpdateSub = this.chamados.autoUpdate$.subscribe(() => {
      this.mostrarSnackAtualizado();
    });

    try {
      const token = localStorage.getItem('token') || undefined;
      await this.signal.start(token);
    } catch { }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.autoUpdateSub?.unsubscribe();
    if (this.autoUpdateTimeout) {
      clearTimeout(this.autoUpdateTimeout);
    }
    this.signal.stop();
  }

  private mostrarSnackAtualizado() {
    this.snackBar.open(
      'Sua listagem foi atualizada automaticamente. Verifique o novo chamado.',
      'OK',
      {
        duration: 3000,
        panelClass: ['snack-info'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      }
    );
  }


  aplicarFiltro() {
    this.filtroTitulo = (this.filtroTitulo ?? '').trim();
    this.filtroDescricao = (this.filtroDescricao ?? '').trim();
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
      const okDesc = !d || des.includes(d);
      return okTitulo && okDesc;
    });
  }

  refresh() {
    this.chamados.suprimirProximaAtualizacaoAutomatica();
    this.chamados.refresh();
  }

  anterior() {
    this.chamados.suprimirProximaAtualizacaoAutomatica();
    this.chamados.paginaAnterior();
  }

  proxima() {
    this.chamados.suprimirProximaAtualizacaoAutomatica();
    this.chamados.proximaPagina();
  }

  irPara(p: number) {
    this.chamados.suprimirProximaAtualizacaoAutomatica();
    this.chamados.irParaPagina(p);
  }

  trocarTamanho(t: number) {
    this.chamados.suprimirProximaAtualizacaoAutomatica();
    this.chamados.mudarTamanho(t);
  }

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
    return Array.from(new Set(arr)).sort((a, b) => a - b);
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
      this.chamados.suprimirProximaAtualizacaoAutomatica();

      await this.chamados.criarChamado({
        titulo: this.novoTitulo.trim(),
        descricao: this.novaDescricao.trim()
      });

      this.snackbar.sucesso('Chamado criado com sucesso!');

      this.fecharCriar();
      await this.chamados.refresh();

    } catch (e) {
      this.snackbar.erro('Erro ao criar chamado.');
    } finally {
      this.salvando = false;
    }
  }

  async abrirDetalhe(id: number) {
    this.detalheAberto = true;
    this.editando = false;
    this.detalheLoading = true;
    this.detalheErro = null;
    this.detalhe = null;
    try {
      this.detalhe = await this.chamados.obterPorId(id);
      this.editTitulo = this.detalhe.titulo ?? '';
      this.editDescricao = this.detalhe.descricao ?? '';
    } catch {
      this.detalheErro = 'Não foi possível carregar os detalhes do chamado.';
    } finally {
      this.detalheLoading = false;
    }
  }

  fecharDetalhe() {
    this.detalheAberto = false;
    this.detalhe = null;
    this.detalheErro = null;
  }

  iniciarEdicao() {
    if (!this.detalhe) return;
    this.editTitulo = this.detalhe.titulo ?? '';
    this.editDescricao = this.detalhe.descricao ?? '';
    this.editando = true;
  }

  cancelarEdicao() {
    this.editando = false;
  }

  async salvarEdicao() {
    if (!this.detalhe) return;
    this.salvandoEdicao = true;
    try {
      this.chamados.suprimirProximaAtualizacaoAutomatica();

      await this.chamados.atualizarChamado(this.detalhe.id, {
        titulo: this.editTitulo.trim(),
        descricao: this.editDescricao.trim()
      });

      this.snackbar.sucesso('Chamado atualizado com sucesso!');

      await this.chamados.refresh();
      this.editando = false;

    } catch {
      this.snackbar.erro('Erro ao atualizar chamado.');
    } finally {
      this.salvandoEdicao = false;
    }
  }

  async excluir() {
    if (!this.detalhe) return;
    const ok = confirm(`Confirma excluir o chamado #${this.detalhe.id}?`);
    if (!ok) return;

    this.excluindo = true;
    try {
      this.chamados.suprimirProximaAtualizacaoAutomatica();

      await this.chamados.excluirChamado(this.detalhe.id);
      this.snackbar.sucesso('Chamado excluído com sucesso!');

      await this.chamados.refresh();
      this.fecharDetalhe();

    } catch {
      this.snackbar.erro('Erro ao excluir chamado.');
    } finally {
      this.excluindo = false;
    }
  }

  onRowKeydown(ev: KeyboardEvent, id: number) {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      this.abrirDetalhe(id);
    }
  }
}
