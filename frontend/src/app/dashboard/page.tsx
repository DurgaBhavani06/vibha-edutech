'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import StudentDashboard from './student/page';
import ProfessionalDashboard from './professional/page';
import TrainerDashboard from './trainer/page';
import CollegeDashboard from './college/page';
import AdminDashboard from './admin/page';

export default function DashboardRouter() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-vibha-teal" />
        <span className="text-xs text-vibha-slate-light font-medium">
          Verifying session & resolving role permissions...
        </span>
      </div>
    );
  }

  // Server-verified role routing
  switch (user.role) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return <AdminDashboard />;
    case 'TRAINER':
      return <TrainerDashboard />;
    case 'COLLEGE_COORDINATOR':
      return <CollegeDashboard />;
    case 'PROFESSIONAL_LEARNER':
      return <ProfessionalDashboard />;
    case 'STUDENT':
    default:
      return <StudentDashboard />;
  }
}
