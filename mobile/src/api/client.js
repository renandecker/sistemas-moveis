// Cliente de API para o app mobile. Diferente do front-end web (que usa um
// proxy do Vite para "/api"), aqui precisamos da URL completa do backend,
// pois o app roda fora do navegador — por isso ela é configurável na tela
// "Configurações" e injetada via useConfig().

async function request(baseUrl, path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
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
  return res.json();
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

    // Diagnóstico de conexão (usado na tela de Configurações)
    testarConexao: () => request(baseUrl, '/moveis'),
  };
}
