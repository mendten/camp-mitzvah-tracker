import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { checkDataVersion } from './utils/dataReset'

// Check for data version changes and reset if needed
checkDataVersion();

createRoot(document.getElementById("root")!).render(<App />);
