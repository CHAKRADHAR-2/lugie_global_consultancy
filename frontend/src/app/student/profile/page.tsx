"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import {
  User,
  GraduationCap,
  Globe2,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Loader2,
  Calendar,
  Award,
  Briefcase,
  Layers,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  FileCheck,
} from "lucide-react";

interface StudentProfile {
  id: string;
  user_id: string;
  date_of_birth: string | null;
  nationality: string | null;
  current_city: string | null;
  current_country: string | null;
  passport_number: string | null;
  passport_expiry: string | null;
  budget_min: number | null;
  budget_max: number | null;
  budget_currency: string;
  preferred_intake: string | null;
  funding_preference: string | null;
  profile_completion: number;
}

interface AcademicRecord {
  id: string;
  qualification: string;
  institution: string;
  degree: string | null;
  specialisation: string | null;
  cgpa: number | null;
  percentage: number | null;
  backlogs: number;
  is_current: boolean;
}

interface LanguageTest {
  id: string;
  test_type: string;
  overall_score: number | null;
  listening: number | null;
  reading: number | null;
  writing: number | null;
  speaking: number | null;
  test_date: string | null;
}

interface WorkExperience {
  id: string;
  company: string;
  designation: string;
  employment_type: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  technologies: any;
  url: string | null;
}

interface ActivePackage {
  has_active_package: boolean;
  package_name?: string;
  package_slug?: string;
  package_price?: number;
  invoice_number?: string;
}

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"personal" | "academics" | "tests" | "experience" | "goals">("personal");
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [academics, setAcademics] = useState<AcademicRecord[]>([]);
  const [languageTests, setLanguageTests] = useState<LanguageTest[]>([]);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activePackage, setActivePackage] = useState<ActivePackage | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // Modal / Add Form states
  const [addingAcademic, setAddingAcademic] = useState(false);
  const [addingTest, setAddingTest] = useState(false);
  const [addingExp, setAddingExp] = useState(false);

  // Forms
  const [academicForm, setAcademicForm] = useState({
    qualification: "Class XII / Intermediate",
    institution: "",
    degree: "",
    specialisation: "",
    cgpa: "",
    percentage: "",
    backlogs: "0",
  });

  const [testForm, setTestForm] = useState({
    test_type: "IELTS",
    overall_score: "",
    listening: "",
    reading: "",
    writing: "",
    speaking: "",
    test_date: "",
  });

  const [expForm, setExpForm] = useState({
    company: "",
    designation: "",
    employment_type: "Full-time",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
  });

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    async function loadData() {
      try {
        const [profData, acadData, langData, expData, projData, pkgData] = await Promise.all([
          api.get<StudentProfile>("students/me/profile"),
          api.get<AcademicRecord[]>("students/me/academics").catch(() => []),
          api.get<LanguageTest[]>("students/me/language-tests").catch(() => []),
          api.get<WorkExperience[]>("students/me/experiences").catch(() => []),
          api.get<Project[]>("students/me/projects").catch(() => []),
          api.get<ActivePackage>("payments/active-package").catch(() => ({ has_active_package: false })),
        ]);

        setProfile(profData);
        setAcademics(acadData || []);
        setLanguageTests(langData || []);
        setExperiences(expData || []);
        setProjects(projData || []);
        setActivePackage(pkgData);

        reset({
          nationality: profData.nationality || "Indian",
          current_city: profData.current_city || "",
          current_country: profData.current_country || "India",
          passport_number: profData.passport_number || "",
          preferred_intake: profData.preferred_intake || "Fall 2025",
          budget_min: profData.budget_min || "",
          budget_max: profData.budget_max || "",
          funding_preference: profData.funding_preference || "Education Loan",
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [reset]);

  const onSaveProfile = async (formData: any) => {
    setSavingProfile(true);
    try {
      const updated = await api.patch<StudentProfile>("students/me/profile", {
        ...formData,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
      });
      setProfile(updated);
      toast.success("Profile details updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAcademic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!academicForm.qualification || !academicForm.institution) {
      toast.error("Qualification and school/institution are required.");
      return;
    }
    try {
      const newRec = await api.post<AcademicRecord>("students/me/academics", {
        qualification: academicForm.qualification,
        institution: academicForm.institution,
        degree: academicForm.degree || null,
        specialisation: academicForm.specialisation || null,
        cgpa: academicForm.cgpa ? parseFloat(academicForm.cgpa) : null,
        percentage: academicForm.percentage ? parseFloat(academicForm.percentage) : null,
        backlogs: parseInt(academicForm.backlogs) || 0,
        is_current: false,
      });
      setAcademics([...academics, newRec]);
      setAddingAcademic(false);
      setAcademicForm({
        qualification: "Class XII / Intermediate",
        institution: "",
        degree: "",
        specialisation: "",
        cgpa: "",
        percentage: "",
        backlogs: "0",
      });
      toast.success("Academic qualification added to dossier!");
    } catch (err: any) {
      toast.error(err.message || "Failed to add academic record.");
    }
  };

  const handleDeleteAcademic = async (id: string) => {
    try {
      await api.delete(`students/me/academics/${id}`);
      setAcademics(academics.filter((a) => a.id !== id));
      toast.success("Academic record deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete.");
    }
  };

  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testForm.test_type || !testForm.overall_score) {
      toast.error("Test type and overall score are required.");
      return;
    }
    try {
      const newTest = await api.post<LanguageTest>("students/me/language-tests", {
        test_type: testForm.test_type,
        overall_score: parseFloat(testForm.overall_score),
        listening: testForm.listening ? parseFloat(testForm.listening) : null,
        reading: testForm.reading ? parseFloat(testForm.reading) : null,
        writing: testForm.writing ? parseFloat(testForm.writing) : null,
        speaking: testForm.speaking ? parseFloat(testForm.speaking) : null,
        test_date: testForm.test_date || null,
      });
      setLanguageTests([...languageTests, newTest]);
      setAddingTest(false);
      setTestForm({
        test_type: "IELTS",
        overall_score: "",
        listening: "",
        reading: "",
        writing: "",
        speaking: "",
        test_date: "",
      });
      toast.success("Standardized/Language test added!");
    } catch (err: any) {
      toast.error(err.message || "Failed to add test.");
    }
  };

  const handleDeleteTest = async (id: string) => {
    try {
      await api.delete(`students/me/language-tests/${id}`);
      setLanguageTests(languageTests.filter((t) => t.id !== id));
      toast.success("Test record deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete test.");
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm.company || !expForm.designation || !expForm.start_date) {
      toast.error("Company, designation, and start date are required.");
      return;
    }
    try {
      const newExp = await api.post<WorkExperience>("students/me/experiences", {
        company: expForm.company,
        designation: expForm.designation,
        employment_type: expForm.employment_type,
        start_date: expForm.start_date,
        end_date: expForm.is_current ? null : expForm.end_date || null,
        is_current: expForm.is_current,
        description: expForm.description || null,
      });
      setExperiences([...experiences, newExp]);
      setAddingExp(false);
      setExpForm({
        company: "",
        designation: "",
        employment_type: "Full-time",
        start_date: "",
        end_date: "",
        is_current: false,
        description: "",
      });
      toast.success("Experience record added!");
    } catch (err: any) {
      toast.error(err.message || "Failed to add experience.");
    }
  };

  const handleDeleteExperience = async (id: string) => {
    try {
      await api.delete(`students/me/experiences/${id}`);
      setExperiences(experiences.filter((e) => e.id !== id));
      toast.success("Experience deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete experience.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(166,72%,40%)]" />
      </div>
    );
  }

  const completion = profile?.profile_completion || 35;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Profile Header with Plan & Completion */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)] flex items-center justify-center text-xl font-bold border border-[hsl(166,72%,40%)]/20 shadow-inner">
            {user?.first_name ? user.first_name[0] : "S"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[hsl(222,47%,11%)]">
                {user?.first_name} {user?.last_name}
              </h1>
              <span className="rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 border border-emerald-200">
                Verified Student
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{user?.email} &bull; {user?.phone || "No phone linked"}</p>
          </div>
        </div>

        {/* Subscribed Plan Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {activePackage?.has_active_package ? (
            <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200 p-3">
              <div className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                Active Plan
              </div>
              <div className="text-sm font-bold text-gray-900 mt-0.5">
                {activePackage.package_name}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-2">
                <span>Inv: #{activePackage.invoice_number?.slice(0, 10)}</span>
                <Link href="/student/payments" className="text-[hsl(166,72%,40%)] font-bold hover:underline">
                  Upgrade Plan &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
              <div className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider">
                Consultancy Plan
              </div>
              <div className="text-xs font-bold text-gray-800 mt-0.5">Free Evaluation</div>
              <Link href="/pricing" className="text-[11px] text-[hsl(166,72%,40%)] font-bold hover:underline block mt-0.5">
                Enroll in Package &rarr;
              </Link>
            </div>
          )}

          {/* Profile Completion Card */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 min-w-[140px]">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[11px] font-semibold text-gray-600">Dossier Strength</span>
              <span className="font-bold text-[hsl(166,72%,40%)]">{completion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[hsl(166,72%,40%)] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab("personal")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === "personal"
              ? "bg-[hsl(166,72%,40%)] text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <User className="h-3.5 w-3.5" />
          Personal & Passport
        </button>

        <button
          onClick={() => setActiveTab("academics")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === "academics"
              ? "bg-[hsl(166,72%,40%)] text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <GraduationCap className="h-3.5 w-3.5" />
          Academic History ({academics.length})
        </button>

        <button
          onClick={() => setActiveTab("tests")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === "tests"
              ? "bg-[hsl(166,72%,40%)] text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          Tests & Scores ({languageTests.length})
        </button>

        <button
          onClick={() => setActiveTab("experience")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === "experience"
              ? "bg-[hsl(166,72%,40%)] text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
          Experience & Projects ({experiences.length})
        </button>

        <button
          onClick={() => setActiveTab("goals")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === "goals"
              ? "bg-[hsl(166,72%,40%)] text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Globe2 className="h-3.5 w-3.5" />
          Destinations & Budget
        </button>
      </div>

      {/* Tab 1: Personal & Passport Info */}
      {activeTab === "personal" && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">Personal Identification & Passport</h2>
          <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nationality</label>
                <input
                  type="text"
                  placeholder="Indian"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-[hsl(166,72%,40%)]"
                  {...register("nationality")}
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Current City</label>
                <input
                  type="text"
                  placeholder="Hyderabad"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-[hsl(166,72%,40%)]"
                  {...register("current_city")}
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Current Country</label>
                <input
                  type="text"
                  placeholder="India"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-[hsl(166,72%,40%)]"
                  {...register("current_country")}
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Passport Number</label>
                <input
                  type="text"
                  placeholder="Z1234567"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 uppercase font-mono focus:outline-none focus:border-[hsl(166,72%,40%)]"
                  {...register("passport_number")}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-1.5 rounded-lg bg-[hsl(166,72%,40%)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[hsl(166,72%,46%)] disabled:opacity-50 transition"
              >
                {savingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Personal Details
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Academic History (Class X, Class XII, Undergrad, Postgrad) */}
      {activeTab === "academics" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Academic History</h2>
                <p className="text-xs text-gray-500">
                  Record your Class X, Class XII / Intermediate, and Undergraduate Bachelor&apos;s credentials.
                </p>
              </div>
              <button
                onClick={() => setAddingAcademic(true)}
                className="flex items-center gap-1 rounded-lg bg-[hsl(166,72%,40%)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[hsl(166,72%,46%)] transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Qualification
              </button>
            </div>

            {/* Quick Add Presets */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setAcademicForm({ ...academicForm, qualification: "Class X (10th Standard)" });
                  setAddingAcademic(true);
                }}
                className="rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700"
              >
                + Add Class X
              </button>
              <button
                type="button"
                onClick={() => {
                  setAcademicForm({ ...academicForm, qualification: "Class XII (12th / Intermediate)" });
                  setAddingAcademic(true);
                }}
                className="rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700"
              >
                + Add Class XII
              </button>
              <button
                type="button"
                onClick={() => {
                  setAcademicForm({ ...academicForm, qualification: "Undergraduate / Bachelor's Degree" });
                  setAddingAcademic(true);
                }}
                className="rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700"
              >
                + Add Bachelor&apos;s
              </button>
            </div>

            {/* Existing Academic Records List */}
            {academics.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-500">
                <GraduationCap className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                No qualifications recorded yet. Add your Class X, Class XII, and Bachelor&apos;s details.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {academics.map((rec) => (
                  <div key={rec.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-block rounded bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)] font-bold text-[10px] px-2 py-0.5 mb-1">
                        {rec.qualification}
                      </span>
                      <h4 className="text-xs font-bold text-gray-900">{rec.institution}</h4>
                      <p className="text-[11px] text-gray-500">
                        {rec.degree ? `${rec.degree} ` : ""}
                        {rec.specialisation ? `in ${rec.specialisation} ` : ""}
                        {rec.percentage ? `&bull; Score: ${rec.percentage}%` : ""}
                        {rec.cgpa ? `&bull; CGPA: ${rec.cgpa}` : ""}
                        {rec.backlogs > 0 ? ` &bull; ${rec.backlogs} Backlog(s)` : " &bull; 0 Backlogs"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteAcademic(rec.id)}
                      className="text-gray-400 hover:text-rose-600 p-1 rounded transition"
                      title="Delete record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Academic Modal / Form */}
          {addingAcademic && (
            <div className="rounded-2xl border border-[hsl(166,72%,40%)]/30 bg-white p-6 shadow-md">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Add Academic Qualification</h3>
              <form onSubmit={handleAddAcademic} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Qualification Level</label>
                  <select
                    value={academicForm.qualification}
                    onChange={(e) => setAcademicForm({ ...academicForm, qualification: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  >
                    <option value="Class X (10th Standard)">Class X (10th Standard)</option>
                    <option value="Class XII (12th / Intermediate)">Class XII (12th / Intermediate)</option>
                    <option value="Undergraduate / Bachelor's Degree">Undergraduate / Bachelor&apos;s Degree</option>
                    <option value="Postgraduate / Master's Degree">Postgraduate / Master&apos;s Degree</option>
                    <option value="Diploma / Polytechnic">Diploma / Polytechnic</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Institution / School / Board</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CBSE Board / Delhi Public School / JNTU"
                    value={academicForm.institution}
                    onChange={(e) => setAcademicForm({ ...academicForm, institution: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Degree / Stream</label>
                  <input
                    type="text"
                    placeholder="e.g. Science (MPC) / B.Tech Computer Science"
                    value={academicForm.degree}
                    onChange={(e) => setAcademicForm({ ...academicForm, degree: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Percentage / CGPA</label>
                  <input
                    type="text"
                    placeholder="e.g. 88.5% or 8.4 CGPA"
                    value={academicForm.percentage}
                    onChange={(e) => setAcademicForm({ ...academicForm, percentage: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Backlogs Count</label>
                  <input
                    type="number"
                    min="0"
                    value={academicForm.backlogs}
                    onChange={(e) => setAcademicForm({ ...academicForm, backlogs: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-[hsl(166,72%,40%)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[hsl(166,72%,46%)]"
                  >
                    Save Qualification
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingAcademic(false)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Tests (IELTS, TOEFL, PTE, Duolingo, GRE, GMAT, SAT) */}
      {activeTab === "tests" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Standardized & English Language Tests</h2>
                <p className="text-xs text-gray-500">
                  Record test scores for IELTS, TOEFL, PTE, Duolingo, GRE, GMAT, and SAT.
                </p>
              </div>
              <button
                onClick={() => setAddingTest(true)}
                className="flex items-center gap-1 rounded-lg bg-[hsl(166,72%,40%)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[hsl(166,72%,46%)] transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Test Score
              </button>
            </div>

            {/* Test Cards List */}
            {languageTests.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-500">
                <Award className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                No standardized tests added yet. Click &quot;Add Test Score&quot; to log your IELTS, TOEFL, PTE, or GRE.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {languageTests.map((t) => (
                  <div key={t.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm relative">
                    <button
                      onClick={() => handleDeleteTest(t.id)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-rose-600 p-1"
                      title="Delete test"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="rounded bg-teal-50 text-[hsl(166,72%,40%)] font-bold text-xs px-2 py-0.5 border border-teal-200">
                        {t.test_type}
                      </span>
                      <span className="text-sm font-black text-gray-900">
                        Overall: {t.overall_score}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-[10px] text-gray-600 font-mono mt-3 border-t border-gray-100 pt-2">
                      <div>
                        <span className="block text-gray-400">L / Quant</span>
                        <span className="font-bold text-gray-800">{t.listening ?? "—"}</span>
                      </div>
                      <div>
                        <span className="block text-gray-400">R / Verbal</span>
                        <span className="font-bold text-gray-800">{t.reading ?? "—"}</span>
                      </div>
                      <div>
                        <span className="block text-gray-400">W / AWA</span>
                        <span className="font-bold text-gray-800">{t.writing ?? "—"}</span>
                      </div>
                      <div>
                        <span className="block text-gray-400">Speaking</span>
                        <span className="font-bold text-gray-800">{t.speaking ?? "—"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Test Form */}
          {addingTest && (
            <div className="rounded-2xl border border-[hsl(166,72%,40%)]/30 bg-white p-6 shadow-md">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Add Test Score</h3>
              <form onSubmit={handleAddTest} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Test Type</label>
                  <select
                    value={testForm.test_type}
                    onChange={(e) => setTestForm({ ...testForm, test_type: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  >
                    <option value="IELTS">IELTS Academic</option>
                    <option value="TOEFL">TOEFL iBT</option>
                    <option value="PTE">PTE Academic</option>
                    <option value="Duolingo">Duolingo English Test (DET)</option>
                    <option value="GRE">GRE General</option>
                    <option value="GMAT">GMAT Focus</option>
                    <option value="SAT">SAT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Overall Band / Score</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="e.g. 7.5 or 320"
                    value={testForm.overall_score}
                    onChange={(e) => setTestForm({ ...testForm, overall_score: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Test Date</label>
                  <input
                    type="date"
                    value={testForm.test_date}
                    onChange={(e) => setTestForm({ ...testForm, test_date: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Listening / Quant</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="8.0 / 165"
                    value={testForm.listening}
                    onChange={(e) => setTestForm({ ...testForm, listening: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Reading / Verbal</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="7.5 / 158"
                    value={testForm.reading}
                    onChange={(e) => setTestForm({ ...testForm, reading: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Writing / Speaking</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="7.0"
                    value={testForm.writing}
                    onChange={(e) => setTestForm({ ...testForm, writing: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>

                <div className="md:col-span-3 flex items-center gap-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-[hsl(166,72%,40%)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[hsl(166,72%,46%)]"
                  >
                    Save Test Score
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingTest(false)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Work Experience & Projects */}
      {activeTab === "experience" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Work Experience & Internships</h2>
                <p className="text-xs text-gray-500">
                  Highlight relevant industry experience, internships, and technical roles.
                </p>
              </div>
              <button
                onClick={() => setAddingExp(true)}
                className="flex items-center gap-1 rounded-lg bg-[hsl(166,72%,40%)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[hsl(166,72%,46%)] transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Experience
              </button>
            </div>

            {experiences.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-500">
                <Briefcase className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                No professional experience recorded. Click &quot;Add Experience&quot; to log your internships or full-time roles.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {experiences.map((exp) => (
                  <div key={exp.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-gray-900">{exp.designation}</h4>
                        <span className="rounded bg-gray-100 text-gray-700 text-[10px] px-1.5 py-0.5">
                          {exp.employment_type || "Full-time"}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[hsl(166,72%,40%)] mt-0.5">{exp.company}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {exp.start_date} &bull; {exp.is_current ? "Present" : exp.end_date || "Completed"}
                      </p>
                      {exp.description && (
                        <p className="text-xs text-gray-600 mt-1 max-w-2xl">{exp.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="text-gray-400 hover:text-rose-600 p-1 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Experience Modal */}
          {addingExp && (
            <div className="rounded-2xl border border-[hsl(166,72%,40%)]/30 bg-white p-6 shadow-md">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Add Work Experience</h3>
              <form onSubmit={handleAddExperience} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Company / Organization Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Infosys / Google / Start-up"
                    value={expForm.company}
                    onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Job Title / Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer Intern"
                    value={expForm.designation}
                    onChange={(e) => setExpForm({ ...expForm, designation: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Employment Type</label>
                  <select
                    value={expForm.employment_type}
                    onChange={(e) => setExpForm({ ...expForm, employment_type: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract / Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={expForm.start_date}
                    onChange={(e) => setExpForm({ ...expForm, start_date: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Key Responsibilities & Impact</label>
                  <textarea
                    rows={2}
                    placeholder="Briefly describe your projects, tech stack, and achievements..."
                    value={expForm.description}
                    onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-[hsl(166,72%,40%)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[hsl(166,72%,46%)]"
                  >
                    Save Experience
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingExp(false)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Goals & Budget */}
      {activeTab === "goals" && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4">Study Abroad Destinations & Budget</h2>
          <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Target Intake</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-[hsl(166,72%,40%)]"
                  {...register("preferred_intake")}
                >
                  <option value="Spring 2027">Spring 2027 (Jan/Feb)</option>
                  <option value="Fall 2027">Fall 2027 (Aug/Sep)</option>
                  <option value="Spring 2028">Spring 2028 (Jan/Feb)</option>
                  <option value="Fall 2028">Fall 2028 (Aug/Sep)</option>
                  <option value="Flexible / Undecided">Flexible / Undecided</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Funding & Financial Source</label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:border-[hsl(166,72%,40%)]"
                  {...register("funding_preference")}
                >
                  <option value="Education Loan">Education Loan (Non-collateral / Collateral)</option>
                  <option value="Self / Family Funded">Self / Family Funded</option>
                  <option value="Merit Scholarship Dependent">Merit Scholarship Dependent</option>
                  <option value="Company Sponsored">Company Sponsored</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Estimated Tuition Budget (Min INR)</label>
                <input
                  type="number"
                  placeholder="1500000"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  {...register("budget_min")}
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Estimated Tuition Budget (Max INR)</label>
                <input
                  type="number"
                  placeholder="3500000"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  {...register("budget_max")}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-1.5 rounded-lg bg-[hsl(166,72%,40%)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[hsl(166,72%,46%)] disabled:opacity-50 transition"
              >
                {savingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Study Goals
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
