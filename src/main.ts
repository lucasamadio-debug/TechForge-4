import { createInterface } from "node:readline/promises";
import { stdin as entrada, stdout as saida } from "node:process";
import { ItemAcervo } from "./dominio/ItemAcervo";
import { JogoEletronico } from "./dominio/JogoEletronico";
import { Livro } from "./dominio/Livro";
import { RepositorioMemoria } from "./repositorios/RepositorioMemoria";
import { RegraNegocioError } from "./erros/Erros";

const terminal = createInterface({ input: entrada, output: saida });
const acervo = new RepositorioMemoria<ItemAcervo>();

async function perguntar(mensagem: string): Promise<string> {
  return (await terminal.question(mensagem)).trim();
}

async function lerNumero(mensagem: string, minimo = 0): Promise<number> {
  const texto = await perguntar(mensagem);
  const numero = Number(texto);
  if (texto.length === 0 || !Number.isInteger(numero) || numero < minimo) {
    throw new RegraNegocioError(`Digite um número inteiro maior ou igual a ${minimo}.`);
  }
  return numero;
}

async function buscarItemSolicitado(): Promise<ItemAcervo> {
  const id = await lerNumero("ID do item: ", 1);
  return acervo.buscarPorId(id);
}

function listarItens(): void {
  const itens = acervo.listar();
  if (itens.length === 0) {
    console.log("\nO acervo está vazio.");
    return;
  }
  console.log("\n--- ITENS DO ACERVO ---");
  for (const item of itens) {
    const resumo = item.obterResumo(); 
    let detalhe: string;
    if (item instanceof Livro) {
      detalhe = `Autor: ${item.autor}`;
    } else if (item instanceof JogoEletronico) {
      detalhe = `Plataforma: ${item.plataforma}`;
    } else {
      detalhe = "";
    }
    console.log(`#${resumo.id} | ${resumo.tipo}: ${resumo.titulo} (${item.anoPublicacao}) | ${detalhe} | ${resumo.status}`);
  }
}

function mostrarMenu(): void {
  console.log(`
========== ACERVO DIGITAL ==========
1  - Cadastrar livro
2  - Cadastrar jogo eletrônico
3  - Listar itens
4  - Emprestar item
5  - Devolver item
6  - Reservar livro
7  - Cancelar reserva de livro
8  - Calcular multa
9  - Consultar item por ID
10 - Atualizar título
11 - Remover item
0  - Sair
====================================`);
}

async function executarOpcao(opcao: number): Promise<void> {
  switch (opcao) {
    case 1: {
      const titulo = await perguntar("Título do livro: ");
      const ano = await lerNumero("Ano de publicação: ", 1);
      const autor = await perguntar("Autor: ");
      const livro = new Livro(titulo, ano, autor);
      acervo.adicionar(livro);
      console.log(`Livro cadastrado com ID ${livro.id}.`);
      break;
    }
    case 2: {
      const titulo = await perguntar("Nome do jogo: ");
      const ano = await lerNumero("Ano de lançamento: ", 1);
      const plataforma = await perguntar("Plataforma: ");
      const jogo = new JogoEletronico(titulo, ano, plataforma);
      acervo.adicionar(jogo);
      console.log(`Jogo cadastrado com ID ${jogo.id}.`);
      break;
    }
    case 3:
      listarItens();
      break;
    case 4: {
      const item = await buscarItemSolicitado();
      const nome = await perguntar("Emprestar para quem? ");
      item.emprestar(nome); // Polimorfismo: Livro aplica regra de reserva.
      console.log("Empréstimo realizado.");
      break;
    }
    case 5: {
      const item = await buscarItemSolicitado();
      console.log(`Item emprestado há ${item.tempoEmprestado} dia(s).`);
      item.devolver();
      console.log("Devolução realizada.");
      break;
    }
    case 6: {
      const item = await buscarItemSolicitado();
      if (!(item instanceof Livro)) throw new RegraNegocioError("Apenas livros podem ser reservados.");
      const nome = await perguntar("Reservar para quem? ");
      item.reservar(nome);
      console.log("Reserva realizada.");
      break;
    }
    case 7: {
      const item = await buscarItemSolicitado();
      if (!(item instanceof Livro)) throw new RegraNegocioError("Apenas livros possuem reservas.");
      item.cancelarReserva();
      console.log("Reserva cancelada.");
      break;
    }
    case 8: {
      const item = await buscarItemSolicitado();
      const dias = await lerNumero("Dias de atraso: ");
      const multa = item.calcularMulta(dias); 
      console.log(`Multa: ${multa.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`);
      break;
    }
    case 9: {
      const item = await buscarItemSolicitado();
      const resumo = item.obterResumo();
      console.log(`#${resumo.id}: ${resumo.titulo} | ${resumo.tipo} | ${resumo.status}`);
      break;
    }
    case 10: {
      const item = await buscarItemSolicitado();
      const titulo = await perguntar("Novo título: ");
      item.atualizarCadastro({ titulo }); 
      console.log("Título atualizado.");
      break;
    }
    case 11: {
      const item = await buscarItemSolicitado();
      if (item.statusDisponibilidade !== "Disponível") {
        throw new RegraNegocioError("Devolva ou cancele a reserva antes de remover o item.");
      }
      acervo.remover(item.id);
      console.log("Item removido.");
      break;
    }
    default:
      console.log("Opção inválida. Tente novamente.");
  }
}

async function iniciar(): Promise<void> {
  console.log("Bem-vindo ao gerenciador de acervo!");
  try {
    while (true) {
      mostrarMenu();
      const resposta = await perguntar("Escolha uma opção: ");
      if (resposta === "0") break;
      const opcao = Number(resposta);
      if (resposta === "" || !Number.isInteger(opcao)) {
        console.log("Opção inválida. Digite um número do menu.");
        continue;
      }
      try {
        await executarOpcao(opcao);
      } catch (erro: unknown) {
        if (erro instanceof Error) {
          console.log(`Erro: ${erro.message}`);
        } else {
          console.log("Ocorreu um erro inesperado.");
        }
      }
    }
  } finally {
    terminal.close();
  }
  console.log("Programa encerrado. Até mais!");
}

void iniciar().catch((erro: unknown) => {
  console.error("Não foi possível executar o programa:", erro);
  process.exitCode = 1;
});
