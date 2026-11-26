"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Settings,
  Building,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  ShieldCheck,
  CreditCard,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
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
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(166,72%,40%)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[hsl(222,47%,11%)]">Platform & Agency Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage agency branding, corporate headquarters contact channels, and operational access controls.
        </p>
      </div>

      {/* Production Payment Gateway Ready Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
              Payment Gateway Integration: Sandbox / Pre-Investment Mode
              <span className="text-[11px] font-semibold bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                Zero Code Changes Needed Later
              </span>
            </h3>
            <p className="text-xs text-blue-800/80 leading-relaxed">
              The platform is actively operating with an end-to-end simulated transaction flow (order creation, reference assignment, and receipt generation). When you are ready to invest and go live, simply inject your live merchant credentials (Razorpay/Stripe) into the environment variables. The checkout interface will instantly transition to live gateway mode without needing any frontend modifications.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Agency Identity & Contact */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100 text-[hsl(222,47%,11%)]">
            <Building className="h-5 w-5 text-[hsl(166,72%,40%)]" />
            <h2 className="text-base font-bold">Brand Identity & Official Channels</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="font-semibold text-gray-700 block mb-1.5">
                Official Agency Name
              </label>
              <input
                type="text"
                name="agency_name"
                value={formData.agency_name}
                onChange={handleChange}
                required
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[hsl(166,72%,40%)] font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1.5">
                Brand Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                required
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[hsl(166,72%,40%)] font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1.5">
                Support & Inquiries Email
              </label>
              <input
                type="email"
                name="support_email"
                value={formData.support_email}
                onChange={handleChange}
                required
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[hsl(166,72%,40%)]"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1.5">
                Advisory Phone Hotline
              </label>
              <input
                type="text"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                required
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[hsl(166,72%,40%)]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-semibold text-gray-700 block mb-1.5">
                Emergency WhatsApp Line (For Visa & Airport Transit)
              </label>
              <input
                type="text"
                name="emergency_whatsapp"
                value={formData.emergency_whatsapp}
                onChange={handleChange}
                required
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[hsl(166,72%,40%)]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Corporate Address */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100 text-[hsl(222,47%,11%)]">
            <MapPin className="h-5 w-5 text-[hsl(166,72%,40%)]" />
            <h2 className="text-base font-bold">Headquarters Address</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="md:col-span-2">
              <label className="font-semibold text-gray-700 block mb-1.5">
                Street Address & Suite
              </label>
              <input
                type="text"
                name="address_street"
                value={formData.address_street}
                onChange={handleChange}
                required
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[hsl(166,72%,40%)]"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1.5">City</label>
              <input
                type="text"
                name="address_city"
                value={formData.address_city}
                onChange={handleChange}
                required
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[hsl(166,72%,40%)]"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1.5">State / Province</label>
              <input
                type="text"
                name="address_state"
                value={formData.address_state}
                onChange={handleChange}
                required
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[hsl(166,72%,40%)]"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1.5">Postal / PIN Code</label>
              <input
                type="text"
                name="address_postal_code"
                value={formData.address_postal_code}
                onChange={handleChange}
                required
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[hsl(166,72%,40%)]"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1.5">Country</label>
              <input
                type="text"
                name="address_country"
                value={formData.address_country}
                onChange={handleChange}
                required
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[hsl(166,72%,40%)]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Operational Access & Security */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100 text-[hsl(222,47%,11%)]">
            <ShieldCheck className="h-5 w-5 text-[hsl(166,72%,40%)]" />
            <h2 className="text-base font-bold">Operational Controls & Policies</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div
              onClick={() => handleToggle("enable_student_self_registration")}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50/50 cursor-pointer transition"
            >
              <div>
                <span className="font-bold text-gray-900 block">
                  Public Student Self-Registration
                </span>
                <span className="text-gray-500 text-[11px]">
                  Allows prospective students to self-register accounts from the website landing page.
                </span>
              </div>
              <input
                type="checkbox"
                name="enable_student_self_registration"
                checked={formData.enable_student_self_registration}
                onChange={() => {}}
                className="h-4 w-4 text-[hsl(166,72%,40%)] rounded focus:ring-0 cursor-pointer"
              />
            </div>

            <div
              onClick={() => handleToggle("enable_simulated_payments")}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50/50 cursor-pointer transition"
            >
              <div>
                <span className="font-bold text-gray-900 block">
                  Simulated Advisory Payments Sandbox
                </span>
                <span className="text-gray-500 text-[11px]">
                  Enables students to experience full package enrollment without requiring active gateway API keys.
                </span>
              </div>
              <input
                type="checkbox"
                name="enable_simulated_payments"
                checked={formData.enable_simulated_payments}
                onChange={() => {}}
                className="h-4 w-4 text-[hsl(166,72%,40%)] rounded focus:ring-0 cursor-pointer"
              />
            </div>

            <div
              onClick={() => handleToggle("require_document_verification")}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50/50 cursor-pointer transition"
            >
              <div>
                <span className="font-bold text-gray-900 block">
                  Strict Counsellor Document Verification
                </span>
                <span className="text-gray-500 text-[11px]">
                  Requires academic transcripts and language test proofs to be verified before visa filing.
                </span>
              </div>
              <input
                type="checkbox"
                name="require_document_verification"
                checked={formData.require_document_verification}
                onChange={() => {}}
                className="h-4 w-4 text-[hsl(166,72%,40%)] rounded focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[hsl(166,72%,40%)] text-white text-xs font-semibold hover:bg-[hsl(174,85%,28%)] transition flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Configuration
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
