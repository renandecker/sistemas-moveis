// Paleta espelhando o logo da Móveis Pajé (verde-petróleo quase preto + dourado),
// adaptada para contraste e toque em telas móveis.
export const cores = {
  bg: '#f5f4f0',
  paper: '#faf9f6',
  panel: '#ffffff',
  ink: '#16211f',
  muted: '#7c8582',
  line: '#e2e0d8',
  lineForte: '#cdc9bd',
  accent: '#84692f',
  accentClaro: '#c9ad72',
  accentSoft: '#f2ecdc',
  teal: '#101c1c',
  tealClaro: '#1c2d2b',
  success: '#2a4948',
  warn: '#a23b2e',
  warnSoft: '#f6e2dd',
  branco: '#ffffff',
};

export const espacamento = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const tipografia = {
  titulo: { fontSize: 22, fontWeight: '700', color: cores.ink },
  subtitulo: { fontSize: 16, fontWeight: '600', color: cores.ink },
  corpo: { fontSize: 14, color: cores.ink },
  legenda: { fontSize: 12, color: cores.muted },
  mono: { fontFamily: 'monospace' },
};
