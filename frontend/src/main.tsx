import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import "./styles/tokens.css";
import "./styles/colors.css";
import "./styles/typography.css";
import "./styles/button.css";
import "./styles/input.css";
import "./styles/modal.css";
import "./styles/Home.css";
import "./styles/PanelCard.css";
import "./styles/ModuleCard.css";
import "./styles/AppHeader.css";
import "./styles/App.css";



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
