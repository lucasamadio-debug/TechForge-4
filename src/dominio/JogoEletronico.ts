import { ItemAcervo, validarTexto } from "./ItemAcervo";

export class JogoEletronico extends ItemAcervo {
  constructor(
    titulo: string,
    anoPublicacao: number,
    private readonly _plataforma: string
  ) {
    super(titulo, anoPublicacao);
    validarTexto(_plataforma, "A plataforma");
  }

  get plataforma(): string {
    return this._plataforma;
  }

  override calcularMulta(diasAtraso: number): number {
    this.validarDiasAtraso(diasAtraso);
    return diasAtraso * 3.00;
  }
}
