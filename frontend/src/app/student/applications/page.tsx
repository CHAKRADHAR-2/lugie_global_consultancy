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
  Compass,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { HorizonPath } from "@/components/ui/horizon-path";
import { GrowingHorizonLoader } from "@/components/ui/loading-concepts";
import { SkeletonJourney } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/feedback";

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

function getStatusBadgeTone(status: string): "success" | "sage" | "warm" | "misty" | "warning" | "error" {
  const s = status.toLowerCase();
  if (s.includes("offer") || s.includes("accept") || s.includes("enroll") || s.includes("approv")) {
    return "success";
  }
  if (s.includes("submit") || s.includes("review")) {
    return "sage";
  }
  if (s.includes("pending") || s.includes("wait")) {
    return "warning";
  }
  if (s.includes("reject") || s.includes("declin")) {
    return "error";
  }
  if (s.includes("draft")) {
    return "warm";
  }
  return "misty";
}

function getStageIndex(status: string): number {
  const s = status.toLowerCase();
  if (s.includes("enroll") || s.includes("visa")) return 4;
  if (s.includes("offer") || s.includes("accept") || s.includes("decision")) return 3;
  if (s.includes("review") || s.includes("interview")) return 2;
  if (s.includes("submit")) return 1;
  return 0;
}

const APPLICATION_STAGES = [
  "Draft",
  "Submitted",
  "Under Review",
  "Decision / Offer",
  "Visa & Enrolled",
];

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
    return <SkeletonJourney />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl text-[#263331]">
            My Applications
          </h1>
          <p className="mt-1 text-sm text-[#546866]">
            Track your submissions across international university admission committees.
          </p>
        </div>

        <Link
          href="/student/universities"
          className={buttonVariants({ variant: "primary", size: "md" })}
        >
          <Plus className="h-4 w-4" />
          Apply to Another University
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="beyond-card p-12 text-center max-w-lg mx-auto">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6EFEA] border border-[#B7CBC2] text-[#3F6258]">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h2 className="font-editorial text-xl text-[#263331]">No active applications</h2>
          <p className="text-xs text-[#546866] mt-1.5 mb-6">
            Browse our catalog of verified universities in the UK, USA, Germany, Canada, and Ireland.
          </p>
          <Link
            href="/student/universities"
            className={buttonVariants({ variant: "primary", size: "md" })}
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
                      ? "border-[#394B49] bg-white shadow-md ring-2 ring-[#B7CBC2]/70"
                      : "beyond-card beyond-card-interactive"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-sm text-[#263331]">
                      {app.application_reference || `Application #${app.id.slice(0, 8)}`}
                    </span>
                    <StatusBadge tone={getStatusBadgeTone(app.status)} className="uppercase">
                      {app.status}
                    </StatusBadge>
                  </div>

                  <p className="text-xs text-[#546866]">
                    Created on {new Date(app.created_at).toLocaleDateString()}
                  </p>

                  {app.deadline && (
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#8A5A1E] bg-[#FCF6EC] border border-[#D9A879]/60 px-2.5 py-1 rounded-lg">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>Deadline: {app.deadline}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Application Detail & Horizon Path Status History */}
          <div className="lg:col-span-7">
            {selectedApp && (
              <div className="beyond-card p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DCE5E8]">
                  <div>
                    <h3 className="text-lg font-bold text-[#263331]">
                      {selectedApp.application_reference || `Application Details`}
                    </h3>
                    <p className="text-xs font-mono text-[#546866] mt-0.5">
                      ID: {selectedApp.id}
                    </p>
                  </div>
                  <StatusBadge tone={getStatusBadgeTone(selectedApp.status)} className="uppercase self-start sm:self-auto">
                    Status: {selectedApp.status.toUpperCase()}
                  </StatusBadge>
                </div>

                {/* Calm Horizon Path Stage Progress */}
                <div className="rounded-xl bg-[#F3F0E8]/60 border border-[#DCE5E8] p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#394B49]">
                      <Compass className="h-3.5 w-3.5 text-[#8E572C]" />
                      Horizon Path Milestone Tracker
                    </span>
                    <div className="w-28 sm:w-36">
                      <HorizonPath variant="compact" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {APPLICATION_STAGES.map((stage, idx) => {
                      const activeIdx = getStageIndex(selectedApp.status);
                      const isCompleted = idx < activeIdx;
                      const isCurrent = idx === activeIdx;
                      return (
                        <div
                          key={stage}
                          className={`rounded-lg border px-2.5 py-2 text-center transition ${
                            isCompleted
                              ? "bg-[#E6EFEA] border-[#B7CBC2] text-[#2F6B55]"
                              : isCurrent
                              ? "bg-[#F6EDE4] border-[#D9A879] text-[#263331]"
                              : "bg-white border-[#DCE5E8] text-[#546866]"
                          }`}
                        >
                          <div className="text-[10px] font-bold flex items-center justify-center gap-1">
                            {isCompleted && <CheckCircle2 className="h-3 w-3 shrink-0" />}
                            <span>{stage}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Notes or Guidance */}
                {selectedApp.notes && (
                  <div className="rounded-xl bg-[#F3F0E8]/60 p-4 border border-[#DCE5E8] text-xs text-[#394B49]">
                    <span className="font-bold text-[#263331] block mb-1">Counsellor Notes:</span>
                    {selectedApp.notes}
                  </div>
                )}

                {/* Timeline History */}
                <div>
                  <h4 className="text-sm font-bold text-[#263331] mb-4">
                    Status History &amp; Milestones
                  </h4>

                  {loadingTimeline ? (
                    <div className="py-8 flex justify-center">
                      <GrowingHorizonLoader size="sm" label="Loading application milestones…" />
                    </div>
                  ) : timeline.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#B7CBC2] bg-[#F3F0E8]/40 p-5 text-center">
                      <p className="text-xs text-[#546866] italic">
                        No status changes recorded yet.
                      </p>
                    </div>
                  ) : (
                    <div className="relative pl-7 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#B7CBC2]">
                      {timeline.map((item, idx) => {
                        const isLatest = idx === 0;
                        return (
                          <div key={item.id} className="relative">
                            <div
                              className={`absolute -left-7 top-1 h-4 w-4 rounded-full border-2 border-white shadow-xs ${
                                isLatest ? "bg-[#D9A879]" : "bg-[#394B49]"
                              }`}
                            />
                            <div className="rounded-xl border border-[#DCE5E8] bg-[#F3F0E8]/40 p-3.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-[#263331]">
                                  Status changed to:{" "}
                                  <span className="text-[#3F6258] font-bold">{item.to_status}</span>
                                </span>
                                <span className="text-[10px] font-medium text-[#546866]">
                                  {new Date(item.changed_at).toLocaleString()}
                                </span>
                              </div>
                              {item.notes && (
                                <p className="text-xs text-[#546866] mt-1.5 leading-relaxed">
                                  {item.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
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
