// Pub/sub bem simples para avisar a UI quando uma chamada de API está
// demorando mais que o normal (possível cold start do backend). React
// Native não tem window/CustomEvent como o navegador, então usamos isso
// no lugar do padrão usado no client.js do front-end web.

const ouvintes = new Set();
let contagemChamadasLentas = 0;

function notificar() {
  const acordando = contagemChamadasLentas > 0;
  ouvintes.forEach((cb) => cb(acordando));
}

export function marcarInicioChamadaLenta() {
  contagemChamadasLentas++;
  notificar();
}

export function marcarFimChamadaLenta() {
  contagemChamadasLentas = Math.max(0, contagemChamadasLentas - 1);
  notificar();
}

export function assinarColdStart(callback) {
  ouvintes.add(callback);
  return () => ouvintes.delete(callback);
}
