import React, { useState, useEffect } from 'react';
import { HealthProvider } from './context/HealthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DoctorLayout } from './components/DoctorLayout';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { EmergencyModal } from './components/EmergencyModal';
import { QRCodeModal } from './components/QRCodeModal';
import { AuthModal } from './components/AuthModal';
import { DoctorPatients } from './pages/DoctorPatients';
import { DoctorPrescriptions } from './pages/DoctorPrescriptions';
import { DoctorProfile } from './pages/DoctorProfile';

// Patient Pages
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
import { Emergency } from './pages/Emergency';
import { Settings } from './pages/Settings';

// Doctor Pages
import { DoctorPortal } from './pages/DoctorPortal';
import { DoctorAppointments } from './pages/DoctorAppointments';
import { DoctorVideo } from './pages/DoctorVideo';

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

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Doctor portal routes
  const doctorPages: Record<string, string> = {
    '/doctor-patients': 'Patient Records',
    '/doctor-prescriptions': 'Prescriptions',
    '/doctor-profile': 'Doctor Profile',
  };

  // Separate Doctor Portal layout
  if (
    currentPath === '/doctor-access' ||
    currentPath.startsWith('/doctor-')
  ) {
    let doctorContent: React.ReactNode;

    switch (currentPath) {
      case '/doctor-access':
        doctorContent = <DoctorPortal />;
        break;

      case '/doctor-appointments':
        doctorContent = <DoctorAppointments onNavigate={navigate} />;
        break;

      case '/doctor-video':
        doctorContent = <DoctorVideo />;
        break;

      case '/doctor-patients':
        doctorContent = <DoctorPatients />;
        break;

      case '/doctor-prescriptions':
        doctorContent = <DoctorPrescriptions />;
        break;

      case '/doctor-profile':
        doctorContent = <DoctorProfile />;
        break;

      default:
        doctorContent = (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900">
              {doctorPages[currentPath] || 'Doctor Portal'}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              This section will be implemented next.
            </p>
          </div>
        );
    }

    return (
      <DoctorLayout onNavigate={navigate}>
        {doctorContent}
      </DoctorLayout>
    );
  }

  // Existing Patient Portal pages
  const renderPageComponent = () => {
    switch (currentPath) {
      case '/':
      case '':
        return (
          <Dashboard
            onNavigate={navigate}
            onOpenQR={() => setIsQRModalOpen(true)}
          />
        );

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
        return (
          <FindDoctors
            onNavigateDoctorPortal={() => navigate('/doctor-access')}
          />
        );

      case '/history':
      case '/timeline':
        return <MedicalHistory />;

      case '/profile':
        return <Profile />;

      case '/emergency':
        return <Emergency />;

      case '/settings':
        return <Settings />;

      default:
        return (
          <Dashboard
            onNavigate={navigate}
            onOpenQR={() => setIsQRModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] font-sans antialiased text-[#16324F] selection:bg-teal-100 selection:text-teal-900">
      {/* Patient Portal Header */}
      <Navbar onOpenQR={() => setIsQRModalOpen(true)} />

      {/* Patient Portal Layout */}
      <div className="flex-1 flex w-full gap-6 px-4 py-6 lg:px-8">
        <Sidebar
          currentPath={currentPath}
          onNavigate={navigate}
        />

        <main className="min-w-0 flex-1">
          {renderPageComponent()}
        </main>
      </div>

      {/* Patient Portal Modals */}
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