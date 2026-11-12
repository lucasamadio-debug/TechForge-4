import { RegraNegocioError } from "../erros/Erros";
import { AtualizacaoItem, ResumoItem } from "../tipos/Tipos";

export abstract class ItemAcervo {
  private static _contadorId = 1;
  private readonly _id: number;
  private _emprestadoPara: string | null = null;
  private _dataEmprestimo: Date | null = null;


  protected constructor(
    private _titulo: string,
    private readonly _anoPublicacao: number
  ) {
    validarTexto(_titulo, "O título");
    if (!Number.isInteger(_anoPublicacao) || _anoPublicacao < 1400 || _anoPublicacao > new Date().getFullYear() + 1) {
      throw new RegraNegocioError("Informe um ano de publicação válido (a partir de 1400).");
    }
    this._titulo = _titulo.trim();
    this._id = ItemAcervo._contadorId++;
  }

  get id(): number {
    return this._id;
  }

  get titulo(): string {
    return this._titulo;
  }

  get anoPublicacao(): number {
    return this._anoPublicacao;
  }

  get disponivel(): boolean {
    return this._emprestadoPara === null;
  }


  get statusDisponibilidade(): string {
    return this.disponivel ? "Disponível" : `Emprestado para ${this._emprestadoPara}`;
  }

  get tempoEmprestado(): number {
    if (this._dataEmprestimo === null) return 0;
    const diferencaMs = Date.now() - this._dataEmprestimo.getTime();
    return Math.max(0, Math.floor(diferencaMs / (1000 * 60 * 60 * 24)));
  }

  atualizarCadastro(dados: AtualizacaoItem): void {
    if (dados.titulo !== undefined) {
      validarTexto(dados.titulo, "O título");
      this._titulo = dados.titulo.trim();
    }
  }

  emprestar(nomePessoa: string): void {
    validarTexto(nomePessoa, "O nome da pessoa");
    if (!this.disponivel) {
      throw new RegraNegocioError("Este item já está emprestado.");
    }
    this._emprestadoPara = nomePessoa.trim();
    this._dataEmprestimo = new Date();
  }

  devolver(): void {
    if (this.disponivel) {
      throw new RegraNegocioError("Este item não está emprestado.");
    }
    this._emprestadoPara = null;
    this._dataEmprestimo = null;
  }

  obterResumo(): ResumoItem {
    return {
      id: this.id,
      titulo: this.titulo,
      tipo: this.constructor.name,
      status: this.statusDisponibilidade
    };
  }

  protected validarDiasAtraso(diasAtraso: number): void {
    if (!Number.isInteger(diasAtraso) || diasAtraso < 0) {
      throw new RegraNegocioError("Os dias de atraso devem ser um número inteiro não negativo.");
    }
  }

  abstract calcularMulta(diasAtraso: number): number;
}

export function validarTexto(valor: string, descricao: string): void {
  if (typeof valor !== "string" || valor.trim().length === 0) {
    throw new RegraNegocioError(`${descricao} é obrigatório(a).`);
  }
}
