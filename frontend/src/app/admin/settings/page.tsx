"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton";
import {
  Building,
  MapPin,
  ShieldCheck,
  CreditCard,
  Save,
} from "lucide-react";

interface AgencySettings {
  agency_name: string;
  tagline: string;
  support_email: string;
  contact_phone: string;
  emergency_whatsapp: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_postal_code: string;
  address_country: string;
  enable_student_self_registration: boolean;
  enable_simulated_payments: boolean;
  require_document_verification: boolean;
  updated_at?: string;
}

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState<AgencySettings>({
    agency_name: "Lugie Global Consultancy",
    tagline: "Dream Beyond Borders",
    support_email: "luckysomisetty17427@gmail.com",
    contact_phone: "+91 9392734699",
    emergency_whatsapp: "+91 8610506587",
    address_street: "Suite 402, EduTech Pinnacle, MG Road",
    address_city: "Bengaluru",
    address_state: "Karnataka",
    address_postal_code: "560001",
    address_country: "India",
    enable_student_self_registration: true,
    enable_simulated_payments: true,
    require_document_verification: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.get<AgencySettings>("settings");
        if (res) {
          setFormData((prev) => ({ ...prev, ...res }));
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleToggle = (key: keyof AgencySettings) => {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.patch<AgencySettings>("settings", formData);
      setFormData((prev) => ({ ...prev, ...updated }));
      toast.success("Agency profile and platform settings updated successfully!");
    } catch (err: unknown) {
      console.error("Failed to save settings:", err);
      const msg = err instanceof Error ? err.message : "Failed to save settings.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="space-y-2">
          <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331]">
            Platform &amp; Agency Settings
          </h1>
          <p className="text-sm text-[#546866]">Loading agency configuration…</p>
        </div>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition";

  const policyControls: {
    key: "enable_student_self_registration" | "enable_simulated_payments" | "require_document_verification";
    title: string;
    description: string;
  }[] = [
    {
      key: "enable_student_self_registration",
      title: "Public Student Self-Registration",
      description:
        "Allows prospective students to self-register accounts from the website landing page.",
    },
    {
      key: "enable_simulated_payments",
      title: "Simulated Advisory Payments Sandbox",
      description:
        "Enables students to experience full package enrollment without requiring active gateway API keys.",
    },
    {
      key: "require_document_verification",
      title: "Strict Counsellor Document Verification",
      description:
        "Requires academic transcripts and language test proofs to be verified before visa filing.",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8E572C]">
          Platform Configuration
        </span>
        <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331] mt-0.5">
          Platform &amp; Agency Settings
        </h1>
        <p className="mt-1 text-sm text-[#546866]">
          Manage agency branding, corporate headquarters contact channels, and operational access controls.
        </p>
      </div>

      {/* Production Payment Gateway Ready Banner (Forest Slate Highlight) */}
      <div className="rounded-2xl bg-[#394B49] text-white p-5 sm:p-6 border border-[#263331] shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-[#D9A879] text-[#263331] shrink-0 mt-0.5">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-sm font-semibold text-white">
                Payment Gateway Integration: Sandbox / Pre-Investment Mode
              </h2>
              <span className="text-[11px] font-semibold bg-[#D9A879] text-[#263331] px-2.5 py-0.5 rounded-full">
                Zero Code Changes Needed Later
              </span>
            </div>
            <p className="text-xs text-[#DCE5E8] leading-relaxed">
              The platform is actively operating with an end-to-end simulated transaction flow (order creation, reference assignment, and receipt generation). When you are ready to invest and go live, simply inject your live merchant credentials (Razorpay/Stripe) into the environment variables. The checkout interface will instantly transition to live gateway mode without needing any frontend modifications.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Agency Identity & Contact */}
        <div className="beyond-card p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#DCE5E8] text-[#263331]">
            <Building className="h-5 w-5 text-[#3F6258]" />
            <h2 className="text-base font-semibold">Brand Identity &amp; Official Channels</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-[#394B49] block mb-1.5">
                Official Agency Name
              </label>
              <input
                type="text"
                name="agency_name"
                value={formData.agency_name}
                onChange={handleChange}
                required
                className={`${inputClass} font-medium`}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#394B49] block mb-1.5">
                Brand Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                required
                className={`${inputClass} font-medium`}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#394B49] block mb-1.5">
                Support &amp; Inquiries Email
              </label>
              <input
                type="email"
                name="support_email"
                value={formData.support_email}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#394B49] block mb-1.5">
                Advisory Phone Hotline
              </label>
              <input
                type="text"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-[#394B49] block mb-1.5">
                Emergency WhatsApp Line (For Visa &amp; Airport Transit)
              </label>
              <input
                type="text"
                name="emergency_whatsapp"
                value={formData.emergency_whatsapp}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Corporate Address */}
        <div className="beyond-card p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#DCE5E8] text-[#263331]">
            <MapPin className="h-5 w-5 text-[#8E572C]" />
            <h2 className="text-base font-semibold">Headquarters Address</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-[#394B49] block mb-1.5">
                Street Address &amp; Suite
              </label>
              <input
                type="text"
                name="address_street"
                value={formData.address_street}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#394B49] block mb-1.5">City</label>
              <input
                type="text"
                name="address_city"
                value={formData.address_city}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#394B49] block mb-1.5">
                State / Province
              </label>
              <input
                type="text"
                name="address_state"
                value={formData.address_state}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#394B49] block mb-1.5">
                Postal / PIN Code
              </label>
              <input
                type="text"
                name="address_postal_code"
                value={formData.address_postal_code}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#394B49] block mb-1.5">
                Country
              </label>
              <input
                type="text"
                name="address_country"
                value={formData.address_country}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Operational Access & Security */}
        <div className="beyond-card p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#DCE5E8] text-[#263331]">
            <ShieldCheck className="h-5 w-5 text-[#3F6258]" />
            <h2 className="text-base font-semibold">Operational Controls &amp; Policies</h2>
          </div>

          <div className="space-y-3.5">
            {policyControls.map((ctrl) => {
              const enabled = formData[ctrl.key];
              return (
                <div
                  key={ctrl.key}
                  onClick={() => handleToggle(ctrl.key)}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[#DCE5E8] bg-[#F3F0E8]/45 hover:bg-[#EEF3F5]/60 cursor-pointer transition"
                >
                  <div>
                    <span className="font-semibold text-sm text-[#263331] block">
                      {ctrl.title}
                    </span>
                    <span className="text-[#546866] text-xs leading-relaxed">
                      {ctrl.description}
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name={ctrl.key}
                    checked={enabled}
                    onChange={() => {}}
                    tabIndex={-1}
                    className="sr-only"
                    aria-hidden="true"
                  />

                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={ctrl.title}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(ctrl.key);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors cursor-pointer ${
                      enabled
                        ? "bg-[#394B49] border-[#394B49]"
                        : "bg-[#DCE5E8] border-[#B7CBC2]"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                        enabled ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={saving}
            loadingText="Saving Changes…"
          >
            <Save className="h-4 w-4" /> Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
