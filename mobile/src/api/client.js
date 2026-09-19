// Cliente de API para o app mobile. Diferente do front-end web (que usa um
// proxy do Vite para "/api"), aqui precisamos da URL completa do backend,
// pois o app roda fora do navegador — por isso ela é configurável na tela
// "Configurações" e injetada via useConfig().

import { marcarInicioChamadaLenta, marcarFimChamadaLenta } from '../utils/coldStartEmitter';

// O backend pode estar hospedado num plano gratuito (Render) que desativa a
// instância por inatividade — segundo o próprio aviso do Render, isso pode
// atrasar as próximas requisições em 50 segundos OU MAIS. Esses dois números
// controlam esse comportamento:
const TEMPO_LIMITE_MS = 75000;   // aborta a chamada só depois de 75s (folga acima dos 50s+ avisados pelo Render)
const LIMIAR_AVISO_MS = 3500;    // se passar disso sem resposta, avisamos a tela que "pode ser cold start"

async function request(baseUrl, path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TEMPO_LIMITE_MS);

  let avisouLentidao = false;
  const avisoTimeoutId = setTimeout(() => {
    avisouLentidao = true;
    marcarInicioChamadaLenta();
  }, LIMIAR_AVISO_MS);

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });

    if (!res.ok) {
      let mensagem = `Erro ${res.status}`;
      try {
        const corpo = await res.json();
        mensagem = corpo.erro || mensagem;
      } catch (_) {
        /* corpo sem JSON */
      }
      throw new Error(mensagem);
    }

    if (res.status === 204) return null;
    return await res.json();
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new Error(
        'O servidor demorou demais para responder (mais de 75s). Se ele estava inativo, ' +
        'tente novamente em alguns segundos — costuma voltar ao normal no segundo acesso.'
      );
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
    clearTimeout(avisoTimeoutId);
    if (avisouLentidao) marcarFimChamadaLenta();
  }
}

/**
 * Cria um cliente de API vinculado a uma baseUrl específica.
 * Uso: const api = criarApi(apiBaseUrl); api.listarMateriais();
 */
export function criarApi(baseUrl) {
  return {
    // Materiais
    listarMateriais: (tipo) => request(baseUrl, `/materiais${tipo ? `?tipo=${tipo}` : ''}`),
    buscarMaterial: (id) => request(baseUrl, `/materiais/${id}`),
    criarMaterial: (dto) => request(baseUrl, '/materiais', { method: 'POST', body: JSON.stringify(dto) }),
    atualizarMaterial: (id, dto) => request(baseUrl, `/materiais/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
    removerMaterial: (id) => request(baseUrl, `/materiais/${id}`, { method: 'DELETE' }),
    materiaisAbaixoEstoque: () => request(baseUrl, '/materiais/abaixo-estoque-minimo'),

    // Móveis
    listarMoveis: () => request(baseUrl, '/moveis'),
    buscarMovel: (id) => request(baseUrl, `/moveis/${id}`),
    criarMovel: (dto) => request(baseUrl, '/moveis', { method: 'POST', body: JSON.stringify(dto) }),
    atualizarMovel: (id, dto) => request(baseUrl, `/moveis/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
    removerMovel: (id) => request(baseUrl, `/moveis/${id}`, { method: 'DELETE' }),

    // Estrutura (BOM)
    listarEstrutura: (movelId) => request(baseUrl, `/moveis/${movelId}/estrutura`),
    adicionarItemEstrutura: (movelId, dto) =>
      request(baseUrl, `/moveis/${movelId}/estrutura`, { method: 'POST', body: JSON.stringify(dto) }),
    removerItemEstrutura: (movelId, itemId) =>
      request(baseUrl, `/moveis/${movelId}/estrutura/${itemId}`, { method: 'DELETE' }),

    // Necessidade de materiais (explosão de BOM)
    calcularNecessidade: (movelId, quantidade) =>
      request(baseUrl, `/moveis/${movelId}/necessidade-materiais?quantidade=${quantidade}`),

    // Ordens de montagem
    listarOrdens: (status) => request(baseUrl, `/ordens-montagem${status ? `?status=${status}` : ''}`),
    criarOrdem: (dto) => request(baseUrl, '/ordens-montagem', { method: 'POST', body: JSON.stringify(dto) }),
    atualizarStatusOrdem: (id, status) =>
      request(baseUrl, `/ordens-montagem/${id}/status`, { method: 'PATCH', body: JSON.stringify(status) }),
    removerOrdem: (id) => request(baseUrl, `/ordens-montagem/${id}`, { method: 'DELETE' }),

    // Calculadoras utilitárias (Seção 2 da especificação)
    calcularChapas: (dto) => request(baseUrl, '/calculos/chapas', { method: 'POST', body: JSON.stringify(dto) }),
    calcularFitaBorda: (dto) => request(baseUrl, '/calculos/fita-borda', { method: 'POST', body: JSON.stringify(dto) }),

    // Clientes
    listarClientes: (busca) => request(baseUrl, `/clientes${busca ? `?busca=${encodeURIComponent(busca)}` : ''}`),
    buscarCliente: (id) => request(baseUrl, `/clientes/${id}`),
    criarCliente: (dto) => request(baseUrl, '/clientes', { method: 'POST', body: JSON.stringify(dto) }),
    removerCliente: (id) => request(baseUrl, `/clientes/${id}`, { method: 'DELETE' }),
    listarComprasDoCliente: (id) => request(baseUrl, `/clientes/${id}/compras`),

    // Vendas (compras dos clientes, com dados do móvel)
    criarVenda: (dto) => request(baseUrl, '/vendas', { method: 'POST', body: JSON.stringify(dto) }),
    atualizarStatusVenda: (id, status) =>
      request(baseUrl, `/vendas/${id}/status`, { method: 'PATCH', body: JSON.stringify(status) }),

    // Fornecedores
    listarFornecedores: () => request(baseUrl, '/fornecedores'),
    buscarFornecedor: (id) => request(baseUrl, `/fornecedores/${id}`),
    criarFornecedor: (dto) => request(baseUrl, '/fornecedores', { method: 'POST', body: JSON.stringify(dto) }),
    removerFornecedor: (id) => request(baseUrl, `/fornecedores/${id}`, { method: 'DELETE' }),
    listarMateriaisDoFornecedor: (id) => request(baseUrl, `/fornecedores/${id}/materiais`),
    adicionarMaterialAoFornecedor: (id, dto) =>
      request(baseUrl, `/fornecedores/${id}/materiais`, { method: 'POST', body: JSON.stringify(dto) }),
    removerMaterialDoFornecedor: (id, itemId) =>
      request(baseUrl, `/fornecedores/${id}/materiais/${itemId}`, { method: 'DELETE' }),

    // Movimentações de estoque (entrada/saída)
    listarMovimentacoes: (params = {}) => {
      const qs = new URLSearchParams();
      if (params.materialId) qs.set('materialId', params.materialId);
      if (params.tipo) qs.set('tipo', params.tipo);
      const query = qs.toString();
      return request(baseUrl, `/movimentacoes${query ? `?${query}` : ''}`);
    },
    registrarMovimentacao: (dto) => request(baseUrl, '/movimentacoes', { method: 'POST', body: JSON.stringify(dto) }),

    // Fluxo de caixa
    listarLancamentos: (params = {}) => {
      const qs = new URLSearchParams();
      if (params.tipo) qs.set('tipo', params.tipo);
      if (params.status) qs.set('status', params.status);
      const query = qs.toString();
      return request(baseUrl, `/fluxo-caixa/lancamentos${query ? `?${query}` : ''}`);
    },
    criarLancamento: (dto) => request(baseUrl, '/fluxo-caixa/lancamentos', { method: 'POST', body: JSON.stringify(dto) }),
    registrarPagamentoLancamento: (id, dto) =>
      request(baseUrl, `/fluxo-caixa/lancamentos/${id}/pagar`, { method: 'PATCH', body: JSON.stringify(dto || {}) }),
    cancelarLancamento: (id) => request(baseUrl, `/fluxo-caixa/lancamentos/${id}/cancelar`, { method: 'PATCH' }),
    resumoFluxoCaixa: (inicio, fim) => {
      const qs = new URLSearchParams();
      if (inicio) qs.set('inicio', inicio);
      if (fim) qs.set('fim', fim);
      const query = qs.toString();
      return request(baseUrl, `/fluxo-caixa/resumo${query ? `?${query}` : ''}`);
    },

    // Diagnóstico de conexão (usado na tela de Configurações)
    testarConexao: () => request(baseUrl, '/moveis'),
  };
}
