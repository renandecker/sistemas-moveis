import React, { useEffect, useState } from 'react'
import { api } from '../api/client.js'

const TIPOS = ['CHAPA', 'FERRAGEM', 'CONSUMIVEL', 'ACABAMENTO']

const VAZIO = {
  sku: '', nome: '', tipo: 'CHAPA', unidadeMedida: 'UN',
  comprimentoMm: '', larguraMm: '', espessuraMm: '',
  custoUnitario: '', estoqueMinimo: '', estoqueAtual: '', fatorPerdaPadrao: '0.05',
  corAcabamento: '', tipoBorda: '', tipoFerragem: '', cargaMaximaKg: '',
}

export default function Materiais() {
  const [materiais, setMateriais] = useState([])
  const [filtroTipo, setFiltroTipo] = useState('')
  const [form, setForm] = useState(VAZIO)
  const [editandoId, setEditandoId] = useState(null)
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(false)

  function carregar(tipo) {
    setCarregando(true)
    api.listarMateriais(tipo || undefined)
      .then(setMateriais)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }

  useEffect(() => { carregar(filtroTipo) }, [filtroTipo])

  function atualizarCampo(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  function numOuNull(v) {
    if (v === '' || v === null || v === undefined) return null
    const n = Number(v)
    return Number.isNaN(n) ? null : n
  }

  async function salvar(e) {
    e.preventDefault()
    setErro(null)
    const dto = {
      ...form,
      comprimentoMm: numOuNull(form.comprimentoMm),
      larguraMm: numOuNull(form.larguraMm),
      espessuraMm: numOuNull(form.espessuraMm),
      custoUnitario: numOuNull(form.custoUnitario),
      estoqueMinimo: numOuNull(form.estoqueMinimo) ?? 0,
      estoqueAtual: numOuNull(form.estoqueAtual) ?? 0,
      fatorPerdaPadrao: numOuNull(form.fatorPerdaPadrao) ?? 0.05,
      cargaMaximaKg: numOuNull(form.cargaMaximaKg),
    }
    try {
      if (editandoId) {
        await api.atualizarMaterial(editandoId, dto)
      } else {
        await api.criarMaterial(dto)
      }
      setForm(VAZIO)
      setEditandoId(null)
      carregar(filtroTipo)
    } catch (e2) {
      setErro(e2.message)
    }
  }

  function editar(m) {
    setEditandoId(m.id)
    setForm({
      sku: m.sku, nome: m.nome, tipo: m.tipo, unidadeMedida: m.unidadeMedida,
      comprimentoMm: m.comprimentoMm ?? '', larguraMm: m.larguraMm ?? '', espessuraMm: m.espessuraMm ?? '',
      custoUnitario: m.custoUnitario ?? '', estoqueMinimo: m.estoqueMinimo ?? '', estoqueAtual: m.estoqueAtual ?? '',
      fatorPerdaPadrao: m.fatorPerdaPadrao ?? '0.05',
      corAcabamento: m.corAcabamento ?? '', tipoBorda: m.tipoBorda ?? '',
      tipoFerragem: m.tipoFerragem ?? '', cargaMaximaKg: m.cargaMaximaKg ?? '',
    })
  }

  async function remover(id) {
    if (!confirm('Remover este material do catálogo?')) return
    try {
      await api.removerMaterial(id)
      carregar(filtroTipo)
    } catch (e) {
      setErro(e.message)
    }
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setForm(VAZIO)
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow-plain">Catálogo</p>
        <h1>Materiais e Estoque</h1>
        <p className="lede">
          Chapas, ferragens, consumíveis e acabamentos usados na composição dos móveis (BOM).
        </p>
      </header>

      {erro && <div className="banner banner-error">{erro}</div>}

      <div className="split split-wide">
        <section className="panel">
          <div className="panel-toolbar">
            <h2>{editandoId ? 'Editar material' : 'Novo material'}</h2>
            {editandoId && <button className="btn-link" onClick={cancelarEdicao}>cancelar edição</button>}
          </div>

          <form className="form-grid" onSubmit={salvar}>
            <label>SKU
              <input required value={form.sku} onChange={(e) => atualizarCampo('sku', e.target.value)} />
            </label>
            <label>Nome
              <input required value={form.nome} onChange={(e) => atualizarCampo('nome', e.target.value)} />
            </label>
            <label>Tipo
              <select value={form.tipo} onChange={(e) => atualizarCampo('tipo', e.target.value)}>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label>Unidade de medida
              <input required value={form.unidadeMedida} onChange={(e) => atualizarCampo('unidadeMedida', e.target.value)} placeholder="UN, M2, M, KG, ML" />
            </label>

            {form.tipo === 'CHAPA' && (
              <>
                <label>Comprimento (mm)
                  <input type="number" value={form.comprimentoMm} onChange={(e) => atualizarCampo('comprimentoMm', e.target.value)} />
                </label>
                <label>Largura (mm)
                  <input type="number" value={form.larguraMm} onChange={(e) => atualizarCampo('larguraMm', e.target.value)} />
                </label>
                <label>Espessura (mm)
                  <input type="number" value={form.espessuraMm} onChange={(e) => atualizarCampo('espessuraMm', e.target.value)} />
                </label>
                <label>Cor / Acabamento
                  <input value={form.corAcabamento} onChange={(e) => atualizarCampo('corAcabamento', e.target.value)} />
                </label>
                <label>Tipo de borda
                  <input value={form.tipoBorda} onChange={(e) => atualizarCampo('tipoBorda', e.target.value)} />
                </label>
              </>
            )}

            {form.tipo === 'FERRAGEM' && (
              <>
                <label>Tipo de ferragem
                  <input value={form.tipoFerragem} onChange={(e) => atualizarCampo('tipoFerragem', e.target.value)} placeholder="Dobradiça, Corrediça, Parafuso..." />
                </label>
                <label>Carga máxima (kg)
                  <input type="number" value={form.cargaMaximaKg} onChange={(e) => atualizarCampo('cargaMaximaKg', e.target.value)} />
                </label>
              </>
            )}

            <label>Custo unitário (R$)
              <input required type="number" step="0.01" value={form.custoUnitario} onChange={(e) => atualizarCampo('custoUnitario', e.target.value)} />
            </label>
            <label>Estoque mínimo
              <input type="number" step="0.001" value={form.estoqueMinimo} onChange={(e) => atualizarCampo('estoqueMinimo', e.target.value)} />
            </label>
            <label>Estoque atual
              <input type="number" step="0.001" value={form.estoqueAtual} onChange={(e) => atualizarCampo('estoqueAtual', e.target.value)} />
            </label>
            <label>Fator de perda padrão
              <input type="number" step="0.01" min="0" max="1" value={form.fatorPerdaPadrao} onChange={(e) => atualizarCampo('fatorPerdaPadrao', e.target.value)} />
              <span className="hint">0.05–0.10 ferragens · 0.15–0.25 chapas</span>
            </label>

            <div className="form-actions">
              <button type="submit" className="btn-primary">{editandoId ? 'Salvar alterações' : 'Adicionar material'}</button>
            </div>
          </form>
        </section>

        <section className="panel">
          <div className="panel-toolbar">
            <h2>Catálogo</h2>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="">Todos os tipos</option>
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {carregando && <p className="muted">Carregando…</p>}

          <table className="table">
            <thead>
              <tr>
                <th>SKU</th><th>Nome</th><th>Tipo</th><th>Estoque</th><th>Custo</th><th></th>
              </tr>
            </thead>
            <tbody>
              {materiais.map((m) => (
                <tr key={m.id}>
                  <td className="mono">{m.sku}</td>
                  <td>{m.nome}</td>
                  <td><span className="tag">{m.tipo}</span></td>
                  <td className={'mono' + (Number(m.estoqueAtual) < Number(m.estoqueMinimo) ? ' warn' : '')}>
                    {m.estoqueAtual} {m.unidadeMedida}
                  </td>
                  <td className="mono">R$ {Number(m.custoUnitario).toFixed(2)}</td>
                  <td className="row-actions">
                    <button className="btn-link" onClick={() => editar(m)}>editar</button>
                    <button className="btn-link btn-danger" onClick={() => remover(m.id)}>remover</button>
                  </td>
                </tr>
              ))}
              {materiais.length === 0 && !carregando && (
                <tr><td colSpan={6} className="muted">Nenhum material encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
