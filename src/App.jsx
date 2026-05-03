import { Routes, Route, Link, useLocation } from 'react-router-dom'
import AddPage from './pages/AddPage.jsx'
import ListPage from './pages/ListPage.jsx'

export default function App() {
  const { pathname } = useLocation()
  return (
    <div className="container">
      <header>
        <h1>Beer Counter</h1>
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
