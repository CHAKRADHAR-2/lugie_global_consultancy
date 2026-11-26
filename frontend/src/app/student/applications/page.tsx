"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  GraduationCap,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  Loader2,
  ChevronRight,
  AlertCircle,
  FileText,
} from "lucide-react";

interface Application {
  id: string;
  course_id: string;
  intake_id: string | null;
  status: string;
  application_reference: string | null;
  submission_date: string | null;
  deadline: string | null;
  notes: string | null;
  created_at: string;
}

interface TimelineItem {
  id: string;
  from_status: string | null;
  to_status: string;
  notes: string | null;
  changed_at: string;
}

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  useEffect(() => {
    async function loadApplications() {
      try {
        const apps = await api.get<Application[]>("applications/me");
        setApplications(apps || []);
        if (apps && apps.length > 0) {
          setSelectedApp(apps[0]);
          loadTimeline(apps[0].id);
        }
      } catch (err) {
        console.error("Failed to load applications:", err);
        toast.error("Could not retrieve applications.");
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, []);

  const loadTimeline = async (appId: string) => {
    setLoadingTimeline(true);
    try {
      const history = await api.get<TimelineItem[]>(`applications/${appId}/timeline`);
      setTimeline(history || []);
    } catch (err) {
      console.error("Failed to load timeline:", err);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const handleSelectApp = (app: Application) => {
    setSelectedApp(app);
    loadTimeline(app.id);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(166,72%,40%)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(222,47%,11%)]">My Applications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your submissions across international university admission committees.
          </p>
        </div>

        <Link
          href="/student/universities"
          className="inline-flex items-center gap-2 rounded-lg bg-[hsl(166,72%,40%)] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[hsl(166,72%,46%)] transition"
        >
          <Plus className="h-4 w-4" />
          Apply to Another University
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center max-w-lg mx-auto shadow-sm">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">No active applications</h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            Browse our catalog of verified universities in the UK, USA, Germany, Canada, and Ireland.
          </p>
          <Link
            href="/student/universities"
            className="rounded-lg bg-[hsl(166,72%,40%)] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[hsl(166,72%,46%)]"
          >
            Explore University Directory
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Applications Master List */}
          <div className="lg:col-span-5 space-y-3">
            {applications.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => handleSelectApp(app)}
                  className={`cursor-pointer rounded-2xl p-5 border transition ${
                    isSelected
                      ? "border-[hsl(166,72%,40%)] bg-white shadow-md ring-2 ring-[hsl(166,72%,40%)]/10"
                      : "border-gray-100 bg-white hover:border-gray-200 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-gray-900">
                      {app.application_reference || `Application #${app.id.slice(0, 8)}`}
                    </span>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                      {app.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500">
                    Created on {new Date(app.created_at).toLocaleDateString()}
                  </p>

                  {app.deadline && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded w-fit">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>Deadline: {app.deadline}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Application Detail & Status History */}
          <div className="lg:col-span-7">
            {selectedApp && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-lg font-bold text-[hsl(222,47%,11%)]">
                      {selectedApp.application_reference || `Application Details`}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">ID: {selectedApp.id}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    Status: {selectedApp.status.toUpperCase()}
                  </span>
                </div>

                {/* Notes or Guidance */}
                {selectedApp.notes && (
                  <div className="rounded-xl bg-gray-50 p-4 border border-gray-100 text-xs text-gray-600">
                    <span className="font-bold text-gray-900 block mb-1">Counsellor Notes:</span>
                    {selectedApp.notes}
                  </div>
                )}

                {/* Timeline History */}
                <div>
                  <h4 className="text-sm font-bold text-[hsl(222,47%,11%)] mb-4">
                    Status History & Milestones
                  </h4>

                  {loadingTimeline ? (
                    <div className="py-8 text-center text-xs text-gray-400">Loading timeline...</div>
                  ) : timeline.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No status changes recorded yet.</p>
                  ) : (
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                      {timeline.map((item, idx) => (
                        <div key={item.id} className="relative">
                          <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[hsl(166,72%,40%)] shadow-sm" />
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">
                              Status changed to:{" "}
                              <span className="text-[hsl(166,72%,40%)]">{item.to_status}</span>
                            </span>
                            {item.notes && <p className="text-xs text-gray-600 mt-0.5">{item.notes}</p>}
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              {new Date(item.changed_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
