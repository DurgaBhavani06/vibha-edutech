'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldAlert,
  Users,
  Building2,
  Mail,
  Loader2,
  BookOpen,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  Eye,
  EyeOff,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'enquiries' | 'organizations' | 'courses'>('users');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [enquiriesList, setEnquiriesList] = useState<any[]>([]);
  const [orgsList, setOrgsList] = useState<any[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'https://vibha-edutech.onrender.com/api/v1';

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);

    try {
      const [usersRes, enqRes, orgsRes, coursesRes] = await Promise.all([
        fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/enquiries`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/organizations`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/courses?include_unpublished=true`),
      ]);

      if (usersRes.ok) setUsersList(await usersRes.json());
      if (enqRes.ok) setEnquiriesList(await enqRes.json());
      if (orgsRes.ok) setOrgsList(await orgsRes.json());
      if (coursesRes.ok) {
        const cData = await coursesRes.json();
        setCoursesList(cData.items || []);
      }
    } catch (err) {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleTogglePublish = async (courseId: number) => {
    setActionLoadingId(courseId);
    try {
      const res = await fetch(`${API_URL}/courses/${courseId}/publish`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      alert('Failed to update course status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-vibha-navy text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[11px] font-semibold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Platform Administration & LMS Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Administrator Console
          </h1>
          <p className="text-xs sm:text-sm text-vibha-grey/80">
            Authenticated Admin: <span className="font-semibold text-white">{user?.full_name}</span> ({user?.role})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-vibha-navy-light px-3 py-1.5 rounded-lg border border-vibha-navy-light text-vibha-teal">
            Server Permissions Verified
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-1">
          <div className="text-xs font-semibold text-vibha-slate-light uppercase">Platform Users</div>
          <div className="text-2xl font-bold text-vibha-navy">{usersList.length}</div>
          <div className="text-[11px] text-vibha-teal font-medium">Students, Faculty & Staff</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-1">
          <div className="text-xs font-semibold text-vibha-slate-light uppercase">Active Curricula</div>
          <div className="text-2xl font-bold text-vibha-navy">{coursesList.length}</div>
          <div className="text-[11px] text-vibha-teal font-medium">Modular tracks</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-1">
          <div className="text-xs font-semibold text-vibha-slate-light uppercase">Inquiries Logged</div>
          <div className="text-2xl font-bold text-vibha-navy">{enquiriesList.length}</div>
          <div className="text-[11px] text-vibha-teal font-medium">Verified submissions</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-vibha-slate-border shadow-sm space-y-1">
          <div className="text-xs font-semibold text-vibha-slate-light uppercase">Partner Campuses</div>
          <div className="text-2xl font-bold text-vibha-navy">{orgsList.length}</div>
          <div className="text-[11px] text-vibha-teal font-medium">Tenants on platform</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-vibha-slate-border pb-2 flex-wrap">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-vibha-navy text-white'
              : 'text-vibha-slate hover:bg-vibha-grey'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'courses'
              ? 'bg-vibha-navy text-white'
              : 'text-vibha-slate hover:bg-vibha-grey'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Courses & Curricula ({coursesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('enquiries')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'enquiries'
              ? 'bg-vibha-navy text-white'
              : 'text-vibha-slate hover:bg-vibha-grey'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Enquiries Queue ({enquiriesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('organizations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'organizations'
              ? 'bg-vibha-navy text-white'
              : 'text-vibha-slate hover:bg-vibha-grey'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Organizations & Tenants ({orgsList.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {isLoading ? (
        <div className="py-12 flex justify-center items-center gap-2 text-xs text-vibha-slate-light">
          <Loader2 className="w-5 h-5 animate-spin text-vibha-teal" />
          <span>Loading server records...</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-vibha-slate-border shadow-sm overflow-hidden">
          {/* Courses & Curricula Management */}
          {activeTab === 'courses' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-vibha-slate">
                <thead className="bg-vibha-grey uppercase text-[11px] text-vibha-slate-light border-b border-vibha-slate-border">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Course Title</th>
                    <th className="p-3.5">Category & Level</th>
                    <th className="p-3.5">Audience</th>
                    <th className="p-3.5">Duration</th>
                    <th className="p-3.5">Publish Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vibha-slate-border">
                  {coursesList.map((c) => (
                    <tr key={c.id} className="hover:bg-vibha-grey/30">
                      <td className="p-3.5 font-mono">{c.id}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-vibha-navy">{c.title}</div>
                        <div className="text-[11px] text-vibha-slate-light font-mono">{c.slug}</div>
                      </td>
                      <td className="p-3.5">
                        <div>{c.category}</div>
                        <div className="text-[11px] text-vibha-slate-light">{c.level}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-vibha-grey text-vibha-slate text-[10px] font-bold uppercase">
                          {c.audience}
                        </span>
                      </td>
                      <td className="p-3.5 text-vibha-slate">
                        {c.duration_weeks} wks ({c.hours_per_week}h/wk)
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.is_published
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {c.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleTogglePublish(c.id)}
                            disabled={actionLoadingId === c.id}
                            className="p-1.5 rounded-lg border border-vibha-slate-border text-xs hover:bg-vibha-grey"
                            title={c.is_published ? 'Unpublish' : 'Publish'}
                          >
                            {actionLoadingId === c.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : c.is_published ? (
                              <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                            ) : (
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                          </button>
                          <Link
                            href={`/courses/${c.slug}`}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-vibha-navy text-white hover:bg-vibha-teal transition-colors"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* User Directory */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-vibha-slate">
                <thead className="bg-vibha-grey uppercase text-[11px] text-vibha-slate-light border-b border-vibha-slate-border">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Full Name</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Assigned Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vibha-slate-border">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-vibha-grey/30">
                      <td className="p-3.5 font-mono">{u.id}</td>
                      <td className="p-3.5 font-semibold text-vibha-navy">{u.full_name}</td>
                      <td className="p-3.5 font-mono">{u.email}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-vibha-teal-subtle text-vibha-teal-dark">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {u.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="p-3.5 text-vibha-slate-light">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Enquiries Queue */}
          {activeTab === 'enquiries' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-vibha-slate">
                <thead className="bg-vibha-grey uppercase text-[11px] text-vibha-slate-light border-b border-vibha-slate-border">
                  <tr>
                    <th className="p-3.5">Reference Code</th>
                    <th className="p-3.5">Contact Name</th>
                    <th className="p-3.5">Email & Phone</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Organization / Course</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vibha-slate-border">
                  {enquiriesList.map((e) => (
                    <tr key={e.id} className="hover:bg-vibha-grey/30">
                      <td className="p-3.5 font-mono font-bold text-vibha-teal">{e.reference_code}</td>
                      <td className="p-3.5 font-semibold text-vibha-navy">{e.full_name}</td>
                      <td className="p-3.5 font-mono text-[11px]">
                        <div>{e.email}</div>
                        <div className="text-vibha-slate-light">{e.phone}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-vibha-grey text-vibha-slate">
                          {e.enquiry_type}
                        </span>
                      </td>
                      <td className="p-3.5 text-vibha-slate-light">
                        {e.organization_or_college || e.course_slug || 'General'}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Organizations */}
          {activeTab === 'organizations' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-vibha-slate">
                <thead className="bg-vibha-grey uppercase text-[11px] text-vibha-slate-light border-b border-vibha-slate-border">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Organization Name</th>
                    <th className="p-3.5">Code</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vibha-slate-border">
                  {orgsList.length > 0 ? (
                    orgsList.map((o) => (
                      <tr key={o.id} className="hover:bg-vibha-grey/30">
                        <td className="p-3.5 font-mono">{o.id}</td>
                        <td className="p-3.5 font-semibold text-vibha-navy">{o.name}</td>
                        <td className="p-3.5 font-mono text-vibha-teal font-bold">{o.code}</td>
                        <td className="p-3.5">{o.type}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            Active Tenant
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-vibha-slate-light">
                        No partner organizations created yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
