import { Outlet } from 'react-router-dom'
import Aside from '../../components/Aside'
import './style.css'

function Layout() {

  return (
    <div className="home">
      <Aside />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
