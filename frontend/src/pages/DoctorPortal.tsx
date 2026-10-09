
import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import {
  Stethoscope,
  FileText,
  ChevronDown,
  ChevronUp,
  Key,
  Download,
  Search,
  ArrowUpRight,
  CalendarDays,
  Users,
  Activity,
  Clock,
  CheckCircle2,
} from 'lucide-react';

type PatientTab = 'Overview' | 'Reports' | 'Medications' | 'Vitals' | 'History';

export const DoctorPortal: React.FC = () => {
  const { profile, appointments, addPrescription } = useHealth();

  const [tokenInput, setTokenInput] = useState('demo_token_8899');
  const [authorized, setAuthorized] = useState(true);
  const [selectedPatientTab, setSelectedPatientTab] =
    useState<PatientTab>('Overview');
  const [expandedApptId, setExpandedApptId] = useState<string | null>(
    appointments[0]?.id || null
  );

  const [activeConsultApptId, setActiveConsultApptId] = useState<string | null>(
    null
  );
  const [clinicalObservations, setClinicalObservations] = useState(
    'Superficial localized erythema noted on left arm. No purulent discharge.'
  );
  const [diagnosis] = useState(
    'Contact Dermatitis / Mild Skin Allergy'
  );
  const [plan] = useState(
    'Apply Hydrocortisone 1% cream twice daily for 5 days. Wash gently with fragrance-free soap.'
  );
  const [rxMedicines, setRxMedicines] = useState(
    'Cetirizine 10mg (Once daily at night for 5 days), Hydrocortisone 1% Cream (Twice daily)'
  );
  const [followUpDate] = useState('2026-10-19');
  const [consultationSuccess, setConsultationSuccess] = useState(false);

  const handleCompleteConsultation = (apptId: string) => {
    fetch(
      `http://localhost:8000/api/doctor/appointments/${apptId}/consultation`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinical_observations: clinicalObservations,
          assessment_diagnosis: diagnosis,
          plan,
          prescription_items: rxMedicines.split(','),
          follow_up_date: followUpDate,
        }),
      }
    ).catch((err) =>
      console.warn('Backend consult sync warning:', err)
    );

    const targetAppt =
      appointments.find((a) => a.id === apptId) || appointments[0];

    addPrescription({
      doctorName: targetAppt
        ? targetAppt.doctorName
        : 'Dr. Priya Mehta',
      hospitalName: targetAppt
        ? targetAppt.hospitalName
        : 'General Clinic',
      date: new Date().toISOString().split('T')[0],
      items: rxMedicines
        .split(',')
        .map((item, idx) => ({
          id: `rx_item_${idx}`,
          medicationName: item.trim(),
          dosage: 'As prescribed',
          frequency: 'Daily',
          duration: '5 Days',
          instructions: 'Take after meals',
        })),
      notes: `Diagnosis: ${diagnosis}. Plan: ${plan}`,
    });

    setConsultationSuccess(true);

    setTimeout(() => {
      setConsultationSuccess(false);
      setActiveConsultApptId(null);
    }, 3000);
  };

  const scheduleList = [
    {
      time: '09:00 AM',
      name: 'Amit Kumar',
      reason: 'Follow-up • Diabetes',
      status: 'Join',
      isLive: true,
    },
    {
      time: '09:30 AM',
      name: 'Neha Singh',
      reason: 'Consultation • Fever',
      status: 'Upcoming',
      isLive: false,
    },
    {
      time: '10:00 AM',
      name: profile.name,
      reason: 'Report Discussion',
      status: 'Upcoming',
      isLive: false,
    },
    {
      time: '10:30 AM',
      name: 'Sneha Patel',
      reason: 'General Consultation',
      status: 'Upcoming',
      isLive: false,
    },
  ];

  const recentPatients = [
    {
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      time: 'Today, 10:00 AM',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop',
    },
    {
      name: 'Neha Singh',
      age: 34,
      gender: 'Female',
      time: 'Today, 09:30 AM',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop',
    },
    {
      name: 'Amit Kumar',
      age: 45,
      gender: 'Male',
      time: 'Today, 09:00 AM',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop',
    },
    {
      name: 'Sneha Patel',
      age: 29,
      gender: 'Female',
      time: 'Today, 10:30 AM',
      avatar:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop',
    },
  ];

  const cardClass =
    'rounded-xl border border-slate-200 bg-white p-5 shadow-sm';

  const sectionTitleClass =
    'border-b border-slate-200 pb-3 text-xs font-bold uppercase tracking-wider text-slate-500';

  const primaryButtonClass =
    'rounded-lg bg-[#0F766E] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#115E59] focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2';

  const secondaryButtonClass =
    'rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50';

  return (
    <div className="space-y-6 pb-10">
      {/* Dashboard heading and token authentication */}
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md bg-[#E6F4F1] p-2 text-[#0F766E]">
              <Stethoscope size={20} />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0F766E]">
              Doctor Dashboard
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#16324F]">
            Good morning, Dr. Priya Mehta!
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Here's your schedule and patient overview.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 sm:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Search patients, records..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
            />
          </div>

          <button
            type="button"
            onClick={() => setAuthorized(true)}
            className={primaryButtonClass}
          >
            <span className="flex items-center justify-center gap-2">
              <Key size={15} />
              Authenticate Token
            </span>
          </button>
        </div>
      </div>

      {/* Dashboard statistics */}
      {authorized && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Today's Schedule
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[#16324F]">
                    {scheduleList.length}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Scheduled consultations
                  </p>
                </div>
                <div className="rounded-lg bg-[#E6F4F1] p-3 text-[#0F766E]">
                  <CalendarDays size={22} />
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Recent Patients
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[#16324F]">
                    {recentPatients.length}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Patient overview
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 text-blue-700">
                  <Users size={22} />
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Active Appointments
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[#16324F]">
                    {appointments.length}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    From your appointment records
                  </p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 text-amber-700">
                  <Activity size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* Main dashboard grid */}
          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
            {/* Today's schedule */}
            <section className={cardClass}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className={sectionTitleClass}>
                  Today's Schedule
                </h2>
                <CalendarDays size={18} className="text-[#0F766E]" />
              </div>

              <div className="space-y-3">
                {scheduleList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="shrink-0 text-xs font-semibold text-slate-500">
                        {item.time}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-[#16324F]">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.reason}
                        </p>
                      </div>
                    </div>

                    {item.isLive ? (
                      <button
                        type="button"
                        className={`${primaryButtonClass} shrink-0`}
                      >
                        Join
                      </button>
                    ) : (
                      <span className="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-500">
                        Upcoming
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Recent patients and health summary */}
            <div className="space-y-6">
              <section className={cardClass}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className={sectionTitleClass}>
                    Recent Patients
                  </h2>
                  <Users size={18} className="text-[#0F766E]" />
                </div>

                <div className="space-y-3">
                  {recentPatients.map((pt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-2.5 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <img
                          src={pt.avatar}
                          alt={pt.name}
                          className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover"
                        />
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-[#16324F]">
                            {pt.name}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            {pt.age} yrs • {pt.gender}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="hidden text-[10px] text-slate-400 sm:block">
                          {pt.time}
                        </p>
                        <button
                          type="button"
                          className="mt-1 text-xs font-semibold text-[#0F766E] hover:underline"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Patient health summary */}
              <section className={cardClass}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className={sectionTitleClass}>
                    Patient Health Summary
                  </h2>
                  <Activity size={18} className="text-[#0F766E]" />
                </div>

                <div className="mb-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop"
                    alt={profile.name}
                    className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-[#16324F]">
                      {profile.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {profile.age} yrs • {profile.gender}
                    </p>
                  </div>
                </div>

                <div className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-200 pb-2">
                  {(
                    [
                      'Overview',
                      'Reports',
                      'Medications',
                      'Vitals',
                      'History',
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setSelectedPatientTab(tab)}
                      className={`shrink-0 rounded-md px-2.5 py-2 text-xs font-semibold transition-colors ${
                        selectedPatientTab === tab
                          ? 'bg-[#E6F4F1] text-[#0F766E]'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-[#16324F]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {selectedPatientTab === 'Overview' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Conditions
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#16324F]">
                        Diabetes (Type 2)
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Since 2022
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Allergies
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#0F766E]">
                        None known
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Current Medications
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#16324F]">
                        Metformin 500mg
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Vitamin D3
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Last Visit
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#16324F]">
                        12 Mar 2024
                      </p>
                    </div>
                  </div>
                )}

                {selectedPatientTab === 'Reports' && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <FileText size={22} className="mb-2 text-[#0F766E]" />
                    <p className="text-sm font-semibold text-[#16324F]">
                      Medical Reports
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Open the Reports section to review uploaded diagnostic
                      documents.
                    </p>
                  </div>
                )}

                {selectedPatientTab === 'Medications' && (
                  <div className="space-y-2">
                    {['Metformin 500mg', 'Vitamin D3'].map((medicine) => (
                      <div
                        key={medicine}
                        className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
                      >
                        <div className="rounded-md bg-[#E6F4F1] p-2 text-[#0F766E]">
                          <FileText size={16} />
                        </div>
                        <span className="text-sm font-medium text-[#16324F]">
                          {medicine}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedPatientTab === 'Vitals' && (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['Blood Pressure', 'Not available'],
                      ['Heart Rate', 'Not available'],
                      ['Temperature', 'Not available'],
                      ['Oxygen Level', 'Not available'],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-lg border border-slate-200 p-3"
                      >
                        <p className="text-xs text-slate-500">{label}</p>
                        <p className="mt-2 text-sm font-semibold text-[#16324F]">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedPatientTab === 'History' && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <Clock size={22} className="mb-2 text-[#0F766E]" />
                    <p className="text-sm font-semibold text-[#16324F]">
                      Medical History
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Review the patient's recorded visits and medical history
                      before making clinical decisions.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  className={`${secondaryButtonClass} mt-4 flex w-full items-center justify-center gap-2`}
                >
                  <Download size={15} className="text-[#0F766E]" />
                  FHIR Export
                </button>
              </section>
            </div>

            {/* Quick actions and active appointments */}
            <div className="space-y-6">
              <section className={cardClass}>
                <h2 className={`${sectionTitleClass} mb-4`}>
                  Quick Actions
                </h2>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveConsultApptId(
                        appointments[0]?.id || 'appt_1'
                      )
                    }
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-left transition-colors hover:border-teal-200 hover:bg-[#F5FAF9]"
                  >
                    <span className="flex items-center gap-3">
                      <FileText size={18} className="text-[#0F766E]" />
                      <span className="text-sm font-semibold text-[#16324F]">
                        Create Prescription
                      </span>
                    </span>
                    <ArrowUpRight size={17} className="text-slate-400" />
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-left transition-colors hover:border-teal-200 hover:bg-[#F5FAF9]"
                  >
                    <span className="flex items-center gap-3">
                      <Stethoscope size={18} className="text-[#0F766E]" />
                      <span className="text-sm font-semibold text-[#16324F]">
                        Request Test
                      </span>
                    </span>
                    <ArrowUpRight size={17} className="text-slate-400" />
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-left transition-colors hover:border-teal-200 hover:bg-[#F5FAF9]"
                  >
                    <span className="flex items-center gap-3">
                      <Key size={18} className="text-[#0F766E]" />
                      <span className="text-sm font-semibold text-[#16324F]">
                        Share Record Access
                      </span>
                    </span>
                    <ArrowUpRight size={17} className="text-slate-400" />
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-left transition-colors hover:border-teal-200 hover:bg-[#F5FAF9]"
                  >
                    <span className="flex items-center gap-3">
                      <Download size={18} className="text-[#0F766E]" />
                      <span className="text-sm font-semibold text-[#16324F]">
                        Generate FHIR Export
                      </span>
                    </span>
                    <ArrowUpRight size={17} className="text-slate-400" />
                  </button>
                </div>
              </section>

              <section className={cardClass}>
                <h2 className={`${sectionTitleClass} mb-4`}>
                  Active Appointments &amp; Briefs
                </h2>

                {appointments.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center">
                    <CalendarDays
                      size={24}
                      className="mx-auto mb-2 text-slate-400"
                    />
                    <p className="text-sm font-semibold text-[#16324F]">
                      No appointments yet
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Booked appointments will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((appt) => {
                      const isExpanded = expandedApptId === appt.id;
                      const isConsulting = activeConsultApptId === appt.id;

                      return (
                        <div
                          key={appt.id}
                          className="overflow-hidden rounded-lg border border-slate-200"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedApptId(
                                isExpanded ? null : appt.id
                              )
                            }
                            aria-expanded={isExpanded}
                            className="flex w-full items-center justify-between gap-3 bg-slate-50 p-3 text-left transition-colors hover:bg-slate-100"
                          >
                            <div>
                              <h3 className="text-sm font-semibold text-[#16324F]">
                                {appt.reason}
                              </h3>
                              <p className="mt-1 text-xs text-slate-500">
                                {appt.date} at {appt.time}
                              </p>
                            </div>

                            {isExpanded ? (
                              <ChevronUp
                                size={18}
                                className="shrink-0 text-slate-500"
                              />
                            ) : (
                              <ChevronDown
                                size={18}
                                className="shrink-0 text-slate-500"
                              />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="space-y-3 border-t border-slate-200 p-3">
                              <p className="text-sm leading-5 text-slate-600">
                                {appt.diseaseDescription || appt.reason}
                              </p>

                              {!isConsulting ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveConsultApptId(appt.id)
                                  }
                                  className={`${primaryButtonClass} w-full`}
                                >
                                  Start Prescription Entry
                                </button>
                              ) : (
                                <div className="space-y-3 rounded-lg border border-teal-100 bg-[#F5FAF9] p-3">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
                                    Prescription Form
                                  </h4>

                                  <div>
                                    <label
                                      htmlFor={`observations-${appt.id}`}
                                      className="mb-1.5 block text-xs font-semibold text-slate-600"
                                    >
                                      Clinical Observations
                                    </label>
                                    <textarea
                                      id={`observations-${appt.id}`}
                                      value={clinicalObservations}
                                      onChange={(e) =>
                                        setClinicalObservations(e.target.value)
                                      }
                                      placeholder="Enter clinical observations..."
                                      rows={3}
                                      className="w-full resize-y rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-800 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                                    />
                                  </div>

                                  <div>
                                    <label
                                      htmlFor={`medicines-${appt.id}`}
                                      className="mb-1.5 block text-xs font-semibold text-slate-600"
                                    >
                                      Prescription Items
                                    </label>
                                    <input
                                      id={`medicines-${appt.id}`}
                                      type="text"
                                      value={rxMedicines}
                                      onChange={(e) =>
                                        setRxMedicines(e.target.value)
                                      }
                                      placeholder="Enter medicines separated by commas"
                                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                                    />
                                    <p className="mt-1 text-[11px] text-slate-500">
                                      Separate each prescription item with a
                                      comma.
                                    </p>
                                  </div>

                                  {consultationSuccess && (
                                    <div
                                      role="status"
                                      className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800"
                                    >
                                      <CheckCircle2 size={16} />
                                      Prescription added to the patient record.
                                    </div>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCompleteConsultation(appt.id)
                                    }
                                    className={`${primaryButtonClass} w-full`}
                                  >
                                    Save Prescription
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveConsultApptId(null)
                                    }
                                    className={`${secondaryButtonClass} w-full`}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        </>
      )}

      {!authorized && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <Key size={28} className="mx-auto mb-3 text-[#0F766E]" />
          <h2 className="font-semibold text-[#16324F]">
            Clinical records are locked
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Enter your access token and authenticate to view the dashboard.
          </p>
          <button
            type="button"
            onClick={() => setAuthorized(true)}
            className={`${primaryButtonClass} mt-4`}
          >
            Authenticate Token
          </button>
        </div>
      )}
    </div>
  );
};
