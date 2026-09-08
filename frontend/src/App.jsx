import React from 'react'
import { NavLink, Route, Routes, Navigate } from 'react-router-dom'
import Painel from './pages/Painel.jsx'
import Materiais from './pages/Materiais.jsx'
import Moveis from './pages/Moveis.jsx'
import MovelDetalhe from './pages/MovelDetalhe.jsx'
import OrdensMontagem from './pages/OrdensMontagem.jsx'
import Calculadoras from './pages/Calculadoras.jsx'

const NAV_ITEMS = [
  { to: '/', label: 'Painel', end: true },
  { to: '/materiais', label: 'Materiais' },
  { to: '/moveis', label: 'Móveis · BOM' },
  { to: '/ordens', label: 'Ordens de Montagem' },
  { to: '/calculadoras', label: 'Calculadoras' },
]

export default function App() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">⌗</span>
          <div className="brand-text">
            <strong>Oficina</strong>
            <span>Sistema de Montagem</span>
          </div>
        </div>

        <nav className="nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => 'nav-link' + (isActive ? ' is-active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <span className="tick">±1mm</span>
          <p>Tolerância dimensional padrão para peças cortadas (MDF/MDP).</p>
        </div>
      </aside>

      <main className="content">
        <Routes>
          <Route path="/" element={<Painel />} />
          <Route path="/materiais" element={<Materiais />} />
          <Route path="/moveis" element={<Moveis />} />
          <Route path="/moveis/:id" element={<MovelDetalhe />} />
          <Route path="/ordens" element={<OrdensMontagem />} />
          <Route path="/calculadoras" element={<Calculadoras />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
