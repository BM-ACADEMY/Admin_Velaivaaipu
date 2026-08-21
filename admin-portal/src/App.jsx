import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'sonner';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Toaster position="top-center" richColors />
        <Router>
          <AppRoutes />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
