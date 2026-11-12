import { ItemAcervo, validarTexto } from "./ItemAcervo";
import { Reservavel } from "./Reservavel";
import { RegraNegocioError } from "../erros/Erros";

export class Livro extends ItemAcervo implements Reservavel {
  private _reservadoPor: string | null = null;

  constructor(
    titulo: string,
    anoPublicacao: number,
    private readonly _autor: string
  ) {
    super(titulo, anoPublicacao);
    validarTexto(_autor, "O autor");
  }

  get autor(): string {
    return this._autor;
  }

  get reservadoPor(): string | null {
    return this._reservadoPor;
  }

  override get statusDisponibilidade(): string {
    if (!this.disponivel) return super.statusDisponibilidade;
    if (this._reservadoPor !== null) return `Reservado para ${this._reservadoPor}`;
    return "Disponível";
  }

  reservar(nomePessoa: string): void {
    validarTexto(nomePessoa, "O nome da pessoa");
    if (!this.disponivel) throw new RegraNegocioError("Livro emprestado não pode ser reservado.");
    if (this._reservadoPor !== null) throw new RegraNegocioError("Este livro já possui reserva.");
    this._reservadoPor = nomePessoa.trim();
  }

  cancelarReserva(): void {
    if (this._reservadoPor === null) throw new RegraNegocioError("Não há reserva para cancelar.");
    this._reservadoPor = null;
  }

  override emprestar(nomePessoa: string): void {
    validarTexto(nomePessoa, "O nome da pessoa");
    if (this._reservadoPor !== null && this._reservadoPor.toLocaleLowerCase("pt-BR") !== nomePessoa.trim().toLocaleLowerCase("pt-BR")) {
      throw new RegraNegocioError(`O livro está reservado para ${this._reservadoPor}.`);
    }
    super.emprestar(nomePessoa);
    this._reservadoPor = null;
  }

  override calcularMulta(diasAtraso: number): number {
    this.validarDiasAtraso(diasAtraso);
    return diasAtraso * 1.50;
  }
}
