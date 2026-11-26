"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Loader2,
  X,
  Save,
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
          <h1 className="text-2xl font-bold text-[hsl(222,47%,11%)]">University Registry</h1>
          <p className="mt-1 text-sm text-gray-500">
            Total {universities.length} institutions verified for study abroad counseling.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(166,72%,40%)] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[hsl(166,72%,46%)] transition"
        >
          <Plus className="h-4 w-4" />
          Add University
        </button>
      </div>

      {/* Directory Table */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search universities by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[hsl(166,72%,40%)]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-3">Institution Name</th>
                <th className="p-3">Country</th>
                <th className="p-3">City</th>
                <th className="p-3">Type</th>
                <th className="p-3">Ranking</th>
                <th className="p-3 text-right">Official Site</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filtered.map((uni) => (
                <tr key={uni.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-3 font-bold text-gray-900">{uni.name}</td>
                  <td className="p-3">{countryMap.get(uni.country_id) || "International"}</td>
                  <td className="p-3">{uni.city || "-"}</td>
                  <td className="p-3">{uni.type || "University"}</td>
                  <td className="p-3">
                    {uni.ranking ? (
                      <span className="font-bold text-amber-600">#{uni.ranking}</span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {uni.website ? (
                      <a
                        href={uni.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[hsl(166,72%,40%)] hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        Visit <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="rounded-2xl bg-white p-6 shadow-xl max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-[hsl(222,47%,11%)]">Add Verified University</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUniversity} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">University Name *</label>
                <input
                  type="text"
                  placeholder="e.g. University of Manchester"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Country *</label>
                  <select
                    value={form.country_id}
                    onChange={(e) => setForm({ ...form, country_id: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none"
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
                  <label className="block font-semibold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Manchester"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Type</label>
                  <input
                    type="text"
                    placeholder="Public / Private"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Global Ranking</label>
                  <input
                    type="number"
                    placeholder="e.g. 32"
                    value={form.ranking}
                    onChange={(e) => setForm({ ...form, ranking: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Official Website URL</label>
                <input
                  type="url"
                  placeholder="https://www.manchester.ac.uk"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(166,72%,40%)] px-5 py-2 text-xs font-semibold text-white hover:bg-[hsl(166,72%,46%)] disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save University
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
