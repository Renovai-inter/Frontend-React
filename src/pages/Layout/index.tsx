import { Suspense, type MouseEvent } from 'react'
import { Outlet } from 'react-router-dom'
import Aside from '../../components/Aside'
import ChatBot from '../../components/ChatBot'
import PaginaCarregando from '../../components/PaginaCarregando'
import './style.css'

const ID_CONTEUDO = 'conteudo-principal'

function Layout() {

  // Em vez de mudar a URL com "#...", move o foco para o conteúdo (WCAG 2.4.1: pular blocos repetidos)
  function pularParaConteudo(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    document.getElementById(ID_CONTEUDO)?.focus()
  }

  return (
    <div className="home">
      <a href={`#${ID_CONTEUDO}`} className="skip-link" onClick={pularParaConteudo}>
        Pular para o conteúdo
      </a>
      <Aside />
      <main id={ID_CONTEUDO} tabIndex={-1}>
        {/* Suspense por página: o menu lateral continua visível enquanto a tela é carregada */}
        <Suspense fallback={<PaginaCarregando />}>
          <Outlet />
        </Suspense>
      </main>
      <ChatBot />
    </div>
  )
}

export default Layout
