import { AppShell } from './components/AppShell';
import { PhoneFrame } from './components/PhoneFrame';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { NavProvider } from './context/NavContext';
import { ToastProvider } from './context/ToastContext';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <PhoneFrame>
          <ToastProvider>
            <NavProvider>
              <AppShell />
            </NavProvider>
          </ToastProvider>
        </PhoneFrame>
      </AppProvider>
    </AuthProvider>
  );
}
