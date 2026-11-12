
export interface DadosCadastroItem {
  titulo: string;
  anoPublicacao: number;
}

export type AtualizacaoItem = Partial<Pick<DadosCadastroItem, "titulo">>;

export type ResumoItem = Readonly<{
  id: number;
  titulo: string;
  tipo: string;
  status: string;
}>;
