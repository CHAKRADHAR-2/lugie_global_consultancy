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
  Plus,
  Trash2,
  Save,
  Award,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkeletonJourney } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/feedback";

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

const INPUT_CLASS =
  "w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/50 px-3.5 py-2.5 text-xs text-[#394B49] placeholder:text-[#546866]/70 focus:outline-none focus:border-[#394B49] focus:bg-white transition";

const SELECT_CLASS =
  "w-full rounded-xl border border-[#DCE5E8] bg-white px-3.5 py-2.5 text-xs text-[#394B49] focus:outline-none focus:border-[#394B49] transition";

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
    return <SkeletonJourney />;
  }

  const completion = profile?.profile_completion || 35;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Profile Header with Plan & Completion */}
      <div className="beyond-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-[#E6EFEA] text-[#263331] flex items-center justify-center text-xl font-bold border border-[#B7CBC2] shrink-0">
            {user?.first_name ? user.first_name[0] : "S"}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-editorial text-2xl sm:text-3xl text-[#263331]">
                {user?.first_name} {user?.last_name}
              </h1>
              <StatusBadge tone="success">Verified Student</StatusBadge>
            </div>
            <p className="text-xs text-[#546866] mt-1">
              {user?.email} &bull; {user?.phone || "No phone linked"}
            </p>
          </div>
        </div>

        {/* Subscribed Plan Badge & Dossier Strength */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          {activePackage?.has_active_package ? (
            <div className="rounded-xl bg-[#E6EFEA] border border-[#B7CBC2] p-3.5">
              <div className="text-[10px] text-[#3F6258] font-semibold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-[#2F6B55]" />
                Active Plan
              </div>
              <div className="text-sm font-bold text-[#263331] mt-0.5">
                {activePackage.package_name}
              </div>
              <div className="text-[10px] text-[#546866] mt-0.5 flex items-center gap-2">
                <span>Inv: #{activePackage.invoice_number?.slice(0, 10)}</span>
                <Link href="/student/payments" className="text-[#394B49] font-bold hover:text-[#8E572C] hover:underline">
                  Upgrade Plan &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-[#F6EDE4] border border-[#D9A879]/80 p-3.5">
              <div className="text-[10px] text-[#8E572C] font-semibold uppercase tracking-wider">
                Consultancy Plan
              </div>
              <div className="text-xs font-bold text-[#263331] mt-0.5">Free Evaluation</div>
              <Link href="/pricing" className="text-[11px] text-[#8E572C] font-bold hover:underline block mt-0.5">
                Enroll in Package &rarr;
              </Link>
            </div>
          )}

          {/* Profile Completion Card */}
          <div className="rounded-xl border border-[#DCE5E8] bg-[#F3F0E8]/60 p-3.5 min-w-[155px]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[11px] font-semibold text-[#546866]">Dossier Strength</span>
              <span className="font-bold text-[#394B49] tabular-nums">{completion}%</span>
            </div>
            <div className="w-full bg-[#B7CBC2]/40 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#394B49] via-[#6E8B82] to-[#D9A879] h-2 rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex items-center gap-2 rounded-2xl border border-[#DCE5E8] bg-white p-1.5 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("personal")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap cursor-pointer ${
            activeTab === "personal"
              ? "bg-[#394B49] text-white shadow-xs"
              : "text-[#546866] hover:bg-[#F3F0E8] hover:text-[#394B49]"
          }`}
        >
          <User className="h-3.5 w-3.5" />
          Personal &amp; Passport
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("academics")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap cursor-pointer ${
            activeTab === "academics"
              ? "bg-[#394B49] text-white shadow-xs"
              : "text-[#546866] hover:bg-[#F3F0E8] hover:text-[#394B49]"
          }`}
        >
          <GraduationCap className="h-3.5 w-3.5" />
          Academic History ({academics.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tests")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap cursor-pointer ${
            activeTab === "tests"
              ? "bg-[#394B49] text-white shadow-xs"
              : "text-[#546866] hover:bg-[#F3F0E8] hover:text-[#394B49]"
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          Tests &amp; Scores ({languageTests.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("experience")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap cursor-pointer ${
            activeTab === "experience"
              ? "bg-[#394B49] text-white shadow-xs"
              : "text-[#546866] hover:bg-[#F3F0E8] hover:text-[#394B49]"
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
          Experience &amp; Projects ({experiences.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("goals")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition whitespace-nowrap cursor-pointer ${
            activeTab === "goals"
              ? "bg-[#394B49] text-white shadow-xs"
              : "text-[#546866] hover:bg-[#F3F0E8] hover:text-[#394B49]"
          }`}
        >
          <Globe2 className="h-3.5 w-3.5" />
          Destinations &amp; Budget
        </button>
      </div>

      {/* Tab 1: Personal & Passport Info */}
      {activeTab === "personal" && (
        <div className="beyond-card p-6">
          <h2 className="text-base font-bold text-[#263331] mb-4">
            Personal Identification &amp; Passport
          </h2>
          <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#394B49] mb-1.5">Nationality</label>
                <input
                  type="text"
                  placeholder="Indian"
                  className={INPUT_CLASS}
                  {...register("nationality")}
                />
              </div>

              <div>
                <label className="block font-semibold text-[#394B49] mb-1.5">Current City</label>
                <input
                  type="text"
                  placeholder="Hyderabad"
                  className={INPUT_CLASS}
                  {...register("current_city")}
                />
              </div>

              <div>
                <label className="block font-semibold text-[#394B49] mb-1.5">Current Country</label>
                <input
                  type="text"
                  placeholder="India"
                  className={INPUT_CLASS}
                  {...register("current_country")}
                />
              </div>

              <div>
                <label className="block font-semibold text-[#394B49] mb-1.5">Passport Number</label>
                <input
                  type="text"
                  placeholder="Z1234567"
                  className={`${INPUT_CLASS} uppercase font-mono`}
                  {...register("passport_number")}
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={savingProfile}
                disabled={savingProfile}
              >
                <Save className="h-3.5 w-3.5" />
                Save Personal Details
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Academic History (Class X, Class XII, Undergrad, Postgrad) */}
      {activeTab === "academics" && (
        <div className="space-y-6">
          <div className="beyond-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-[#263331]">Academic History</h2>
                <p className="text-xs text-[#546866]">
                  Record your Class X, Class XII / Intermediate, and Undergraduate Bachelor&apos;s credentials.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setAddingAcademic(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Qualification
              </Button>
            </div>

            {/* Quick Add Presets */}
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                type="button"
                onClick={() => {
                  setAcademicForm({ ...academicForm, qualification: "Class X (10th Standard)" });
                  setAddingAcademic(true);
                }}
                className="rounded-lg border border-[#DCE5E8] bg-[#F3F0E8]/70 hover:bg-[#E6EFEA] hover:border-[#B7CBC2] px-3 py-1.5 text-[11px] font-semibold text-[#394B49] transition cursor-pointer"
              >
                + Add Class X
              </button>
              <button
                type="button"
                onClick={() => {
                  setAcademicForm({ ...academicForm, qualification: "Class XII (12th / Intermediate)" });
                  setAddingAcademic(true);
                }}
                className="rounded-lg border border-[#DCE5E8] bg-[#F3F0E8]/70 hover:bg-[#E6EFEA] hover:border-[#B7CBC2] px-3 py-1.5 text-[11px] font-semibold text-[#394B49] transition cursor-pointer"
              >
                + Add Class XII
              </button>
              <button
                type="button"
                onClick={() => {
                  setAcademicForm({ ...academicForm, qualification: "Undergraduate / Bachelor's Degree" });
                  setAddingAcademic(true);
                }}
                className="rounded-lg border border-[#DCE5E8] bg-[#F3F0E8]/70 hover:bg-[#E6EFEA] hover:border-[#B7CBC2] px-3 py-1.5 text-[11px] font-semibold text-[#394B49] transition cursor-pointer"
              >
                + Add Bachelor&apos;s
              </button>
            </div>

            {/* Existing Academic Records List */}
            {academics.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#B7CBC2] bg-[#F3F0E8]/50 p-8 text-center text-xs text-[#546866]">
                <GraduationCap className="h-8 w-8 text-[#546866] mx-auto mb-2" />
                No qualifications recorded yet. Add your Class X, Class XII, and Bachelor&apos;s details.
              </div>
            ) : (
              <div className="divide-y divide-[#DCE5E8]">
                {academics.map((rec) => (
                  <div key={rec.id} className="py-3.5 flex items-start justify-between gap-4">
                    <div>
                      <StatusBadge tone="sage" className="mb-1.5">
                        {rec.qualification}
                      </StatusBadge>
                      <h4 className="text-xs font-bold text-[#263331]">{rec.institution}</h4>
                      <p className="text-[11px] text-[#546866] mt-0.5">
                        {rec.degree ? `${rec.degree} ` : ""}
                        {rec.specialisation ? `in ${rec.specialisation} ` : ""}
                        {rec.percentage ? ` • Score: ${rec.percentage}%` : ""}
                        {rec.cgpa ? ` • CGPA: ${rec.cgpa}` : ""}
                        {rec.backlogs > 0 ? ` • ${rec.backlogs} Backlog(s)` : " • 0 Backlogs"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAcademic(rec.id)}
                      className="text-[#546866] hover:text-[#A63A3A] p-1.5 rounded-lg hover:bg-[#FDF2F2] transition cursor-pointer"
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
            <div className="beyond-card border-[#B7CBC2] p-6">
              <h3 className="text-sm font-bold text-[#263331] mb-4">Add Academic Qualification</h3>
              <form onSubmit={handleAddAcademic} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#394B49] mb-1.5">Qualification Level</label>
                  <select
                    value={academicForm.qualification}
                    onChange={(e) => setAcademicForm({ ...academicForm, qualification: e.target.value })}
                    className={SELECT_CLASS}
                  >
                    <option value="Class X (10th Standard)">Class X (10th Standard)</option>
                    <option value="Class XII (12th / Intermediate)">Class XII (12th / Intermediate)</option>
                    <option value="Undergraduate / Bachelor's Degree">Undergraduate / Bachelor&apos;s Degree</option>
                    <option value="Postgraduate / Master's Degree">Postgraduate / Master&apos;s Degree</option>
                    <option value="Diploma / Polytechnic">Diploma / Polytechnic</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#394B49] mb-1.5">Institution / School / Board</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CBSE Board / Delhi Public School / JNTU"
                    value={academicForm.institution}
                    onChange={(e) => setAcademicForm({ ...academicForm, institution: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#394B49] mb-1.5">Degree / Stream</label>
                  <input
                    type="text"
                    placeholder="e.g. Science (MPC) / B.Tech Computer Science"
                    value={academicForm.degree}
                    onChange={(e) => setAcademicForm({ ...academicForm, degree: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#394B49] mb-1.5">Percentage / CGPA</label>
                  <input
                    type="text"
                    placeholder="e.g. 88.5% or 8.4 CGPA"
                    value={academicForm.percentage}
                    onChange={(e) => setAcademicForm({ ...academicForm, percentage: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#394B49] mb-1.5">Backlogs Count</label>
                  <input
                    type="number"
                    min="0"
                    value={academicForm.backlogs}
                    onChange={(e) => setAcademicForm({ ...academicForm, backlogs: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>

                <div className="flex items-end gap-2.5">
                  <Button type="submit" variant="primary" size="sm">
                    Save Qualification
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setAddingAcademic(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Tests (IELTS, TOEFL, PTE, Duolingo, GRE, GMAT, SAT) */}
      {activeTab === "tests" && (
        <div className="space-y-6">
          <div className="beyond-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-bold text-[#263331]">
                  Standardized &amp; English Language Tests
                </h2>
                <p className="text-xs text-[#546866]">
                  Record test scores for IELTS, TOEFL, PTE, Duolingo, GRE, GMAT, and SAT.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setAddingTest(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Test Score
              </Button>
            </div>

            {/* Test Cards List */}
            {languageTests.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#B7CBC2] bg-[#F3F0E8]/50 p-8 text-center text-xs text-[#546866]">
                <Award className="h-8 w-8 text-[#546866] mx-auto mb-2" />
                No standardized tests added yet. Click &quot;Add Test Score&quot; to log your IELTS, TOEFL, PTE, or GRE.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {languageTests.map((t) => (
                  <div key={t.id} className="rounded-xl border border-[#DCE5E8] bg-[#F3F0E8]/45 p-4 relative">
                    <button
                      type="button"
                      onClick={() => handleDeleteTest(t.id)}
                      className="absolute top-3 right-3 text-[#546866] hover:text-[#A63A3A] p-1 rounded-lg hover:bg-[#FDF2F2] transition cursor-pointer"
                      title="Delete test"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="flex items-center gap-2 mb-2 pr-6">
                      <StatusBadge tone="sage">{t.test_type}</StatusBadge>
                      <span className="text-sm font-bold text-[#263331] tabular-nums">
                        Overall: {t.overall_score}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-[10px] text-[#546866] font-mono mt-3 border-t border-[#DCE5E8] pt-2.5">
                      <div>
                        <span className="block text-[#546866]">L / Quant</span>
                        <span className="font-bold text-[#263331]">{t.listening ?? "—"}</span>
                      </div>
                      <div>
                        <span className="block text-[#546866]">R / Verbal</span>
                        <span className="font-bold text-[#263331]">{t.reading ?? "—"}</span>
                      </div>
                      <div>
                        <span className="block text-[#546866]">W / AWA</span>
                        <span className="font-bold text-[#263331]">{t.writing ?? "—"}</span>
                      </div>
                      <div>
                        <span className="block text-[#546866]">Speaking</span>
                        <span className="font-bold text-[#263331]">{t.speaking ?? "—"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Test Form */}
          {addingTest && (
            <div className="beyond-card border-[#B7CBC2] p-6">
              <h3 className="text-sm font-bold text-[#263331] mb-4">Add Test Score</h3>
              <form onSubmit={handleAddTest} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#394B49] mb-1.5">Test Type</label>
                  <select
                    value={testForm.test_type}
                    onChange={(e) => setTestForm({ ...testForm, test_type: e.target.value })}
                    className={SELECT_CLASS}
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
                  <label className="block font-semibold text-[#394B49] mb-1.5">Overall Band / Score</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="e.g. 7.5 or 320"
                    value={testForm.overall_score}
                    onChange={(e) => setTestForm({ ...testForm, overall_score: e.target.value })}
                    className={`${INPUT_CLASS} font-mono font-bold`}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#394B49] mb-1.5">Test Date</label>
                  <input
                    type="date"
                    value={testForm.test_date}
                    onChange={(e) => setTestForm({ ...testForm, test_date: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#394B49] mb-1.5">Listening / Quant</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="8.0 / 165"
                    value={testForm.listening}
                    onChange={(e) => setTestForm({ ...testForm, listening: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#394B49] mb-1.5">Reading / Verbal</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="7.5 / 158"
                    value={testForm.reading}
                    onChange={(e) => setTestForm({ ...testForm, reading: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#394B49] mb-1.5">Writing / Speaking</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="7.0"
                    value={testForm.writing}
                    onChange={(e) => setTestForm({ ...testForm, writing: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>

                <div className="md:col-span-3 flex items-center gap-2.5">
                  <Button type="submit" variant="primary" size="sm">
                    Save Test Score
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setAddingTest(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Work Experience & Projects */}
      {activeTab === "experience" && (
        <div className="space-y-6">
          <div className="beyond-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-[#263331]">
                  Work Experience &amp; Internships
                </h2>
                <p className="text-xs text-[#546866]">
                  Highlight relevant industry experience, internships, and technical roles.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setAddingExp(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Experience
              </Button>
            </div>

            {experiences.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#B7CBC2] bg-[#F3F0E8]/50 p-8 text-center text-xs text-[#546866]">
                <Briefcase className="h-8 w-8 text-[#546866] mx-auto mb-2" />
                No professional experience recorded. Click &quot;Add Experience&quot; to log your internships or full-time roles.
              </div>
            ) : (
              <div className="divide-y divide-[#DCE5E8]">
                {experiences.map((exp) => (
                  <div key={exp.id} className="py-3.5 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-bold text-[#263331]">{exp.designation}</h4>
                        <StatusBadge tone="misty">
                          {exp.employment_type || "Full-time"}
                        </StatusBadge>
                      </div>
                      <p className="text-xs font-semibold text-[#3F6258] mt-1">{exp.company}</p>
                      <p className="text-[11px] text-[#546866] mt-0.5">
                        {exp.start_date} &bull; {exp.is_current ? "Present" : exp.end_date || "Completed"}
                      </p>
                      {exp.description && (
                        <p className="text-xs text-[#394B49] mt-1.5 max-w-2xl leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="text-[#546866] hover:text-[#A63A3A] p-1.5 rounded-lg hover:bg-[#FDF2F2] transition cursor-pointer"
                      title="Delete experience"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Experience Form */}
          {addingExp && (
            <div className="beyond-card border-[#B7CBC2] p-6">
              <h3 className="text-sm font-bold text-[#263331] mb-4">Add Work Experience</h3>
              <form onSubmit={handleAddExperience} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#394B49] mb-1.5">
                    Company / Organization Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Infosys / Google / Start-up"
                    value={expForm.company}
                    onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#394B49] mb-1.5">
                    Job Title / Designation
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer Intern"
                    value={expForm.designation}
                    onChange={(e) => setExpForm({ ...expForm, designation: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#394B49] mb-1.5">Employment Type</label>
                  <select
                    value={expForm.employment_type}
                    onChange={(e) => setExpForm({ ...expForm, employment_type: e.target.value })}
                    className={SELECT_CLASS}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract / Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#394B49] mb-1.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={expForm.start_date}
                    onChange={(e) => setExpForm({ ...expForm, start_date: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-[#394B49] mb-1.5">
                    Key Responsibilities &amp; Impact
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Briefly describe your projects, tech stack, and achievements..."
                    value={expForm.description}
                    onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-2.5">
                  <Button type="submit" variant="primary" size="sm">
                    Save Experience
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setAddingExp(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Goals & Budget */}
      {activeTab === "goals" && (
        <div className="beyond-card p-6">
          <h2 className="text-base font-bold text-[#263331] mb-4">
            Study Abroad Destinations &amp; Budget
          </h2>
          <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#394B49] mb-1.5">Target Intake</label>
                <select className={SELECT_CLASS} {...register("preferred_intake")}>
                  <option value="Spring 2027">Spring 2027 (Jan/Feb)</option>
                  <option value="Fall 2027">Fall 2027 (Aug/Sep)</option>
                  <option value="Spring 2028">Spring 2028 (Jan/Feb)</option>
                  <option value="Fall 2028">Fall 2028 (Aug/Sep)</option>
                  <option value="Flexible / Undecided">Flexible / Undecided</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#394B49] mb-1.5">
                  Funding &amp; Financial Source
                </label>
                <select className={SELECT_CLASS} {...register("funding_preference")}>
                  <option value="Education Loan">Education Loan (Non-collateral / Collateral)</option>
                  <option value="Self / Family Funded">Self / Family Funded</option>
                  <option value="Merit Scholarship Dependent">Merit Scholarship Dependent</option>
                  <option value="Company Sponsored">Company Sponsored</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#394B49] mb-1.5">
                  Estimated Tuition Budget (Min INR)
                </label>
                <input
                  type="number"
                  placeholder="1500000"
                  className={INPUT_CLASS}
                  {...register("budget_min")}
                />
              </div>

              <div>
                <label className="block font-semibold text-[#394B49] mb-1.5">
                  Estimated Tuition Budget (Max INR)
                </label>
                <input
                  type="number"
                  placeholder="3500000"
                  className={INPUT_CLASS}
                  {...register("budget_max")}
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={savingProfile}
                disabled={savingProfile}
              >
                <Save className="h-3.5 w-3.5" />
                Save Study Goals
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
