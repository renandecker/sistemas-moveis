import { useMemo } from 'react';
import { criarApi } from '../api/client';
import { useConfig } from '../context/ConfigContext';

/** Retorna o cliente de API já vinculado à URL configurada pelo usuário. */
export function useApi() {
  const { apiBaseUrl } = useConfig();
  return useMemo(() => criarApi(apiBaseUrl), [apiBaseUrl]);
}
