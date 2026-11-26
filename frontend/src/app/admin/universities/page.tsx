"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ModalShell, StatusBadge } from "@/components/ui/feedback";
import { GlobalOrbitLoader } from "@/components/ui/loading-concepts";
import { SkeletonRow } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  ExternalLink,
  Save,
  Building2,
} from "lucide-react";

interface University {
  id: string;
  name: string;
  country_id: string;
  city: string | null;
  type: string | null;
  website: string | null;
  ranking: number | null;
  is_verified: boolean;
}

interface Country {
  id: string;
  name: string;
}

export default function AdminUniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // New university form
  const [form, setForm] = useState({
    name: "",
    country_id: "",
    city: "",
    type: "Public University",
    website: "",
    ranking: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [unis, cnts] = await Promise.all([
        api.get<University[]>("universities", { params: { include_sample: "true" } }),
        api.get<Country[]>("countries"),
      ]);
      setUniversities(unis || []);
      setCountries(cnts || []);
      if (cnts?.length) {
        setForm((prev) => ({ ...prev, country_id: cnts[0].id }));
      }
    } catch (err) {
      console.error("Failed to load universities:", err);
      toast.error("Failed to load universities.");
    } finally {
      setLoading(false);
    }
  }

  const handleCreateUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.country_id) {
      toast.error("University name and country are required.");
      return;
    }
    setSaving(true);
    try {
      const created = await api.post<University>("universities", {
        name: form.name,
        country_id: form.country_id,
        city: form.city || null,
        type: form.type || null,
        website: form.website || null,
        ranking: form.ranking ? parseInt(form.ranking) : null,
      });
      setUniversities([created, ...universities]);
      setShowAddModal(false);
      setForm({
        name: "",
        country_id: countries[0]?.id || "",
        city: "",
        type: "Public University",
        website: "",
        ranking: "",
      });
      toast.success("University added to official registry!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create university.");
    } finally {
      setSaving(false);
    }
  };

  const countryMap = new Map(countries.map((c) => [c.id, c.name]));

  const filtered = universities.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.city && u.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8E572C]">
            Global Partners
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331] mt-0.5">
            University Registry
          </h1>
          <p className="mt-1 text-sm text-[#546866]">
            Total {universities.length} institutions verified for study abroad counseling.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setShowAddModal(true)}
          className="self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          Add University
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#F3F0E8]/75 border border-[#DCE5E8] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#546866]" />
          <input
            type="text"
            placeholder="Search universities by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#DCE5E8] bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#394B49] placeholder:text-[#546866]/70 focus:border-[#394B49] focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
          />
        </div>
        <span className="text-xs font-medium text-[#546866] shrink-0">
          Showing <strong className="text-[#263331]">{filtered.length}</strong> of{" "}
          <strong className="text-[#263331]">{universities.length}</strong> institutions
        </span>
      </div>

      {/* Directory Table */}
      <div className="beyond-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <GlobalOrbitLoader label="Syncing university registry…" size="md" className="py-4" />
            <SkeletonRow cols={6} />
            <SkeletonRow cols={6} />
            <SkeletonRow cols={6} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center px-4">
            <Building2 className="h-10 w-10 text-[#546866]/45 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#263331]">No institutions found</p>
            <p className="text-xs text-[#546866] mt-1">
              Try a different university name or city filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F0E8]/75 border-b border-[#DCE5E8] text-[11px] font-semibold uppercase tracking-wider text-[#546866]">
                <tr>
                  <th className="py-3.5 px-4">Institution Name</th>
                  <th className="py-3.5 px-4">Country</th>
                  <th className="py-3.5 px-4">City</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Ranking</th>
                  <th className="py-3.5 px-4 text-right">Official Site</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5E8]/80 text-[#394B49]">
                {filtered.map((uni) => (
                  <tr key={uni.id} className="hover:bg-[#EEF3F5]/45 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-sm text-[#263331]">
                      {uni.name}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#394B49]">
                      {countryMap.get(uni.country_id) || "International"}
                    </td>
                    <td className="py-3.5 px-4 text-[#546866]">{uni.city || "—"}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge tone="misty">{uni.type || "University"}</StatusBadge>
                    </td>
                    <td className="py-3.5 px-4">
                      {uni.ranking ? (
                        <StatusBadge tone="warm">#{uni.ranking}</StatusBadge>
                      ) : (
                        <span className="text-[#546866]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {uni.website ? (
                        <a
                          href={uni.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#3F6258] hover:text-[#263331] hover:underline inline-flex items-center gap-1 font-semibold transition"
                        >
                          Visit <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-[#546866]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <ModalShell
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Verified University"
        subtitle="Register an institution in the global advisory directory."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateUniversity} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1">
              University Name *
            </label>
            <input
              type="text"
              placeholder="e.g. University of Manchester"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1">
                Country *
              </label>
              <select
                value={form.country_id}
                onChange={(e) => setForm({ ...form, country_id: e.target.value })}
                className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
                required
              >
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1">City</label>
              <input
                type="text"
                placeholder="e.g. Manchester"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1">Type</label>
              <input
                type="text"
                placeholder="Public / Private"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1">
                Global Ranking
              </label>
              <input
                type="number"
                placeholder="e.g. 32"
                value={form.ranking}
                onChange={(e) => setForm({ ...form, ranking: e.target.value })}
                className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1">
              Official Website URL
            </label>
            <input
              type="url"
              placeholder="https://www.manchester.ac.uk"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#DCE5E8]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={saving}
              loadingText="Saving…"
            >
              <Save className="h-4 w-4" />
              Save University
            </Button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
}
