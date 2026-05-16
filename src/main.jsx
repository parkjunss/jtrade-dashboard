import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AppActionProvider } from './context/AppActionContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './styles/dashboard.css';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <AppActionProvider>
      <App />
    </AppActionProvider>
  </AuthProvider>
);
