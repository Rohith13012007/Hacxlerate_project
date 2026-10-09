import React, { useState, useEffect } from 'react';
import { HealthProvider } from './context/HealthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { EmergencyModal } from './components/EmergencyModal';
import { QRCodeModal } from './components/QRCodeModal';
import { AuthModal } from './components/AuthModal';

// User Assigned Deliverables: Portal Gateway, Home Landing, Patient & Doctor Auth
import { HomeLanding } from './pages/HomeLanding';
import { AuthGateway } from './pages/AuthGateway';
import { PatientLogin } from './pages/PatientLogin';
import { DoctorLogin } from './pages/DoctorLogin';

// Teammate Application Pages (Accessed after authentication / dashboard routing)
import { Dashboard } from './pages/Dashboard';
import { Assistant } from './pages/Assistant';
import { HealthScan } from './pages/HealthScan';
import { FoodScan } from './pages/FoodScan';
import { MedicalReports } from './pages/MedicalReports';
import { PrescriptionManager } from './pages/PrescriptionManager';
import { MedicineManager } from './pages/MedicineManager';
import { Appointments } from './pages/Appointments';
import { FindDoctors } from './pages/FindDoctors';
import { MedicalHistory } from './pages/MedicalHistory';
import { Profile } from './pages/Profile';
import { DoctorPortal } from './pages/DoctorPortal';
import { Emergency } from './pages/Emergency';
import { Settings } from './pages/Settings';

const AppContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      const basePath = hash.split('?')[0];
      setCurrentPath(basePath);
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    const basePath = path.split('?')[0];
    setCurrentPath(basePath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. DEFAULT ROOT ROUTE: HOME / LANDING (PDF Page 1)
  if (currentPath === '/' || currentPath === '' || currentPath === '/home' || currentPath === '/landing') {
    return <HomeLanding onNavigate={navigate} />;
  }

  // 2. PATIENT AUTHENTICATION ROUTES (PDF Pages 2, 3, 4)
  if (currentPath === '/login' || currentPath === '/patient-login') {
    return <PatientLogin onNavigate={navigate} initialStep="login" />;
  }

  if (currentPath === '/register' || currentPath === '/patient-register') {
    return <PatientLogin onNavigate={navigate} initialStep="register" />;
  }

  // 2. DOCTOR AUTHENTICATION ROUTES
  if (currentPath === '/doctor-login') {
    return <DoctorLogin onNavigate={navigate} initialMode="login" />;
  }

  if (currentPath === '/doctor-register') {
    return <DoctorLogin onNavigate={navigate} initialMode="register" />;
  }

  // 3. OPTIONAL AUTH GATEWAY
  if (currentPath === '/gateway' || currentPath === '/auth') {
    return <AuthGateway onNavigate={navigate} />;
  }

  // 4. TEAMMATE APPLICATION VIEWS (Dashboard, DoctorPortal, etc.)
  const renderPageComponent = () => {
    switch (currentPath) {
      case '/dashboard':
      case '/patient-dashboard':
        return <Dashboard onNavigate={navigate} onOpenQR={() => setIsQRModalOpen(true)} />;
      case '/assistant':
        return <Assistant />;
      case '/scan':
        return <HealthScan />;
      case '/food':
        return <FoodScan />;
      case '/reports':
        return <MedicalReports />;
      case '/prescriptions':
        return <PrescriptionManager />;
      case '/medicines':
        return <MedicineManager />;
      case '/appointments':
        return <Appointments />;
      case '/doctors':
        return <FindDoctors onNavigateDoctorPortal={() => navigate('/doctor-access')} />;
      case '/history':
      case '/timeline':
        return <MedicalHistory />;
      case '/profile':
        return <Profile />;
      case '/doctor-access':
      case '/doctor':
      case '/doctor-portal':
        return <DoctorPortal />;
      case '/emergency':
        return <Emergency />;
      case '/settings':
        return <Settings />;
      default:
        return <AuthGateway onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <Navbar onOpenQR={() => setIsQRModalOpen(true)} onNavigate={navigate} />

      {/* Main Body */}
      <div className="flex-1 flex w-full px-4 lg:px-8 py-6 gap-6">
        <Sidebar currentPath={currentPath} onNavigate={navigate} />

        <main className="flex-1 min-w-0">
          {renderPageComponent()}
        </main>
      </div>

      {/* Modals */}
      <VoiceAssistantModal />
      <EmergencyModal />
      <AuthModal />
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onNavigateDoctorPortal={() => {
          setIsQRModalOpen(false);
          navigate('/doctor-access');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <HealthProvider>
      <AppContent />
    </HealthProvider>
  );
}
