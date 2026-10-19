import { Link } from "react-router-dom";
import { Users, Stethoscope, HeartPulse, Calendar, User } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import { useUsers } from "../../hooks/useUsers";
import { useDoctors } from "../../hooks/useDoctors";
import { usePatients } from "../../hooks/usePatients";
import { useAdminAppointments } from "../../hooks/useAppointments";
import { errorMessage } from "../../lib/fetcher";
import { formatDateTime } from "../../lib/datetime";

export default function AdminDashboard() {
  const usersQ = useUsers();
  const doctorsQ = useDoctors();
  const patientsQ = usePatients();
  const appointmentsQ = useAdminAppointments();

  const isLoading =
    usersQ.isLoading ||
    doctorsQ.isLoading ||
    patientsQ.isLoading ||
    appointmentsQ.isLoading;

  const error =
    usersQ.error || doctorsQ.error || patientsQ.error || appointmentsQ.error;

  const reloadAll = () => {
    usersQ.invalidate();
    doctorsQ.invalidate();
    patientsQ.invalidate();
    appointmentsQ.invalidate();
  };

  const stats = [
    {
      label: "Total Users",
      value: usersQ.users.length,
      icon: Users,
      color: "purple" as const,
    },
    {
      label: "Doctors",
      value: doctorsQ.doctors.length,
      icon: Stethoscope,
      color: "teal" as const,
    },
    {
      label: "Patients",
      value: patientsQ.patients.length,
      icon: HeartPulse,
      color: "blue" as const,
    },
    {
      label: "Appointments",
      value: appointmentsQ.appointments.length,
      icon: Calendar,
      color: "amber" as const,
    },
  ];

  // Most recent by createdAt (fallback to appointmentTime)
  const recent = [...appointmentsQ.appointments]
    .sort((a, b) => {
      const aKey = a.createdAt ?? a.appointmentTime;
      const bKey = b.createdAt ?? b.appointmentTime;
      return bKey.localeCompare(aKey);
    })
    .slice(0, 3);

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Admin Dashboard"
          subtitle="Overview of your hospital operations"
        />
        <LoadingState label="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Admin Dashboard"
          subtitle="Overview of your hospital operations"
        />
        <ErrorState message={errorMessage(error)} onRetry={reloadAll} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of your hospital operations"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Recent Appointments</h2>
          <Link
            to="/admin/appointments"
            className="text-sm text-teal-600 font-semibold hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recent.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-400">
              No appointments yet
            </div>
          )}

          {recent.map((apt) => (
            <div key={apt.id} className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">
                  {apt.patientName} → {apt.doctorName}
                </div>
                <div className="text-xs text-slate-500">
                  {formatDateTime(apt.appointmentTime)} · {apt.specialization}
                </div>
              </div>
              <StatusBadge status={apt.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
