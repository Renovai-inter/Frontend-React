import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Aside from '../../components/Aside'
import PaginaCarregando from '../../components/PaginaCarregando'
import './style.css'

function Layout() {

  return (
    <div className="home">
      <Aside />
      <main>
        {/* Suspense por página: o menu lateral continua visível enquanto a tela é carregada */}
        <Suspense fallback={<PaginaCarregando />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}

export default Layout
