import { createRoot } from 'react-dom/client'
import Logo from '/face-blowing-a-kiss.svg'
import './index.css'
import App from './App'

function Overlay() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
      <a href="mailto:mail@christianhohenbild.de" style={{ position: 'absolute', bottom: 40, left: 140, fontSize: '20px' }}>
        contact
        <br />
        Christian Hohenbild
      </a>
      <div style={{ position: 'absolute', top: 40, left: 40, fontSize: '20px' }}>Creative Whatever</div>
      <div style={{ position: 'absolute', bottom: 40, right: 40, fontSize: '20px' }}>12/12/2023</div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <Overlay />
    <img src={Logo} style={{ position: 'absolute', bottom: 30, left: 40, width: 80 }}
    scale = {1.5}
    />
  </>
)
