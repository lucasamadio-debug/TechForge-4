import assert from "node:assert/strict";
import { Livro } from "./dominio/Livro";
import { JogoEletronico } from "./dominio/JogoEletronico";
import { ItemAcervo } from "./dominio/ItemAcervo";
import { RepositorioMemoria } from "./repositorios/RepositorioMemoria";
import { ItemNaoEncontradoError, RegraNegocioError } from "./erros/Erros";

const acervo = new RepositorioMemoria<ItemAcervo>();
const livro = new Livro("Dom Casmurro", 1899, "Machado de Assis");
const jogo = new JogoEletronico("Jogo de Teste", 2020, "PC");
assert.equal(jogo.id, livro.id + 1, "IDs devem ser autoincrementados entre subclasses");

acervo.adicionar(livro);
acervo.adicionar(jogo);
assert.equal(acervo.listar().length, 2);
assert.equal(acervo.buscarPorId(jogo.id), jogo);
assert.throws(() => acervo.adicionar(livro), RegraNegocioError);
assert.throws(() => acervo.buscarPorId(9999), ItemNaoEncontradoError);

livro.reservar("Ana");
assert.equal(livro.statusDisponibilidade, "Reservado para Ana");
assert.throws(() => livro.emprestar("Bruno"), RegraNegocioError);
livro.emprestar("Ana");
assert.equal(livro.disponivel, false);
assert.throws(() => livro.emprestar("Ana"), RegraNegocioError);
assert.equal(livro.calcularMulta(2), 3);
assert.equal(jogo.calcularMulta(2), 6);
assert.throws(() => jogo.calcularMulta(-1), RegraNegocioError);
livro.devolver();
assert.equal(livro.statusDisponibilidade, "Disponível");
assert.throws(() => livro.devolver(), RegraNegocioError);
livro.atualizarCadastro({ titulo: "Dom Casmurro - edição revista" });
assert.equal(livro.titulo, "Dom Casmurro - edição revista");
assert.throws(() => livro.atualizarCadastro({ titulo: "  " }), RegraNegocioError);

livro.reservar("Carla");
livro.cancelarReserva();
assert.equal(livro.statusDisponibilidade, "Disponível");
acervo.remover(livro.id);
assert.equal(acervo.listar().length, 1);
assert.throws(() => acervo.remover(livro.id), ItemNaoEncontradoError);

console.log("Todos os testes de entidades, multas, reservas e repositório passaram!");
