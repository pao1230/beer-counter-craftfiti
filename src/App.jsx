import { Routes, Route, Link, useLocation } from 'react-router-dom'
import AddPage from './pages/AddPage.jsx'
import ListPage from './pages/ListPage.jsx'
import { MODE } from './api/sheets.js'

export default function App() {
  const { pathname } = useLocation()
  return (
    <div className="container">
      <header>
        <div className="title-row">
          <h1>Beer Counter</h1>
          <span className={`mode-badge ${MODE}`}>
            {MODE === 'remote' ? 'Sheet' : 'Local'}
          </span>
        </div>
        <nav>
          <Link to="/" className={pathname === '/' ? 'active' : ''}>เพิ่ม</Link>
          <Link to="/list" className={pathname === '/list' ? 'active' : ''}>รายการ</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<AddPage />} />
          <Route path="/list" element={<ListPage />} />
        </Routes>
      </main>
    </div>
  )
}
