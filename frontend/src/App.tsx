import React, { useState, useEffect } from 'react';
import { HealthProvider } from './context/HealthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { EmergencyModal } from './components/EmergencyModal';
import { QRCodeModal } from './components/QRCodeModal';
import { AuthModal } from './components/AuthModal';

// Pages
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
      setCurrentPath(hash);
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPageComponent = () => {
    switch (currentPath) {
      case '/':
      case '':
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
        return <DoctorPortal />;
      case '/emergency':
        return <Emergency />;
      case '/settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={navigate} onOpenQR={() => setIsQRModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <Navbar onOpenQR={() => setIsQRModalOpen(true)} />

      {/* Main Body */}
      <div className="flex-1 flex w-full px-4 lg:px-8 py-6 gap-6">
        <Sidebar currentPath={currentPath} onNavigate={navigate} />

        <main className="flex-1 min-w-0">
          {renderPageComponent()}
        </main>
      </div>

      {/* Global Modals */}
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
