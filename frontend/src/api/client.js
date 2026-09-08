const BASE_URL = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
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

export const api = {
  // Materiais
  listarMateriais: (tipo) => request(`/materiais${tipo ? `?tipo=${tipo}` : ''}`),
  buscarMaterial: (id) => request(`/materiais/${id}`),
  criarMaterial: (dto) => request('/materiais', { method: 'POST', body: JSON.stringify(dto) }),
  atualizarMaterial: (id, dto) => request(`/materiais/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  removerMaterial: (id) => request(`/materiais/${id}`, { method: 'DELETE' }),
  materiaisAbaixoEstoque: () => request('/materiais/abaixo-estoque-minimo'),

  // Móveis
  listarMoveis: () => request('/moveis'),
  buscarMovel: (id) => request(`/moveis/${id}`),
  criarMovel: (dto) => request('/moveis', { method: 'POST', body: JSON.stringify(dto) }),
  atualizarMovel: (id, dto) => request(`/moveis/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  removerMovel: (id) => request(`/moveis/${id}`, { method: 'DELETE' }),

  // Estrutura (BOM)
  listarEstrutura: (movelId) => request(`/moveis/${movelId}/estrutura`),
  adicionarItemEstrutura: (movelId, dto) =>
    request(`/moveis/${movelId}/estrutura`, { method: 'POST', body: JSON.stringify(dto) }),
  atualizarItemEstrutura: (movelId, itemId, dto) =>
    request(`/moveis/${movelId}/estrutura/${itemId}`, { method: 'PUT', body: JSON.stringify(dto) }),
  removerItemEstrutura: (movelId, itemId) =>
    request(`/moveis/${movelId}/estrutura/${itemId}`, { method: 'DELETE' }),

  // Necessidade de materiais (explosão de BOM)
  calcularNecessidade: (movelId, quantidade) =>
    request(`/moveis/${movelId}/necessidade-materiais?quantidade=${quantidade}`),

  // Ordens de montagem
  listarOrdens: (status) => request(`/ordens-montagem${status ? `?status=${status}` : ''}`),
  criarOrdem: (dto) => request('/ordens-montagem', { method: 'POST', body: JSON.stringify(dto) }),
  atualizarStatusOrdem: (id, status) =>
    request(`/ordens-montagem/${id}/status`, { method: 'PATCH', body: JSON.stringify(status) }),
  removerOrdem: (id) => request(`/ordens-montagem/${id}`, { method: 'DELETE' }),

  // Calculadoras utilitárias (Seção 2)
  calcularChapas: (dto) => request('/calculos/chapas', { method: 'POST', body: JSON.stringify(dto) }),
  calcularFitaBorda: (dto) => request('/calculos/fita-borda', { method: 'POST', body: JSON.stringify(dto) }),
};
