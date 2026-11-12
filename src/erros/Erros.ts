export class RegraNegocioError extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "RegraNegocioError";
  }
}

export class ItemNaoEncontradoError extends Error {
  constructor(id: number) {
    super(`Não existe um item com ID ${id}.`);
    this.name = "ItemNaoEncontradoError";
  }
}
