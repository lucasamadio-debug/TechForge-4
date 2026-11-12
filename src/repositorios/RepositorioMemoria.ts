import { ItemNaoEncontradoError, RegraNegocioError } from "../erros/Erros";

export class RepositorioMemoria<T extends { readonly id: number }> {
  private readonly _itens: T[] = [];

  adicionar(item: T): void {
    if (this._itens.some((atual) => atual.id === item.id)) {
      throw new RegraNegocioError(`Já existe um item com ID ${item.id}.`);
    }
    this._itens.push(item);
  }

  listar(): ReadonlyArray<T> {
    return [...this._itens];
  }

  buscarPorId(id: number): T {
    const item = this._itens.find((atual) => atual.id === id);
    if (!item) throw new ItemNaoEncontradoError(id);
    return item;
  }

  remover(id: number): void {
    const indice = this._itens.findIndex((atual) => atual.id === id);
    if (indice < 0) throw new ItemNaoEncontradoError(id);
    this._itens.splice(indice, 1);
  }
}
