"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Sparkles,
  Edit2,
  Save,
  Check,
  X,
  Loader2,
  ShieldAlert,
} from "lucide-react";

interface Package {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  is_recommended: boolean;
  is_active: boolean;
}

interface AdditionalService {
  id: string;
  name: string;
  slug: string;
  price_min: number;
  price_max: number;
  currency: string;
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [services, setServices] = useState<AdditionalService[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit states
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [pkgs, srvs] = await Promise.all([
        api.get<Package[]>("packages"),
        api.get<AdditionalService[]>("packages/services"),
      ]);
      setPackages(pkgs || []);
      setServices(srvs || []);
    } catch (err) {
      console.error("Failed to load packages:", err);
      toast.error("Failed to load pricing data.");
    } finally {
      setLoading(false);
    }
  }

  const handleStartEdit = (pkg: Package) => {
    setEditingPkgId(pkg.id);
    setNewPrice(pkg.price);
  };

  const handleSavePrice = async (pkgId: string) => {
    setSaving(true);
    try {
      const updated = await api.patch<Package>(`packages/${pkgId}`, {
        price: newPrice,
      });
      setPackages(packages.map((p) => (p.id === pkgId ? { ...p, price: updated.price } : p)));
      setEditingPkgId(null);
      toast.success("Package price updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update package price.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(174,85%,32%)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(215,50%,12%)]">Packages & Pricing Manager</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage live pricing for standard consultancy packages and 14 standalone modular services.
        </p>
      </div>

      {/* Core Packages Table */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4">Core Consultancy Packages</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-3">Package Name</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Price (INR)</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {packages.map((pkg) => {
                const isEditing = editingPkgId === pkg.id;
                return (
                  <tr key={pkg.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-3 font-bold text-gray-900">{pkg.name}</td>
                    <td className="p-3 font-mono text-gray-500">{pkg.slug}</td>
                    <td className="p-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={newPrice}
                          onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                          className="w-28 rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none"
                        />
                      ) : (
                        <span className="font-extrabold text-[hsl(215,50%,12%)]">
                          ₹{pkg.price.toLocaleString("en-IN")}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {pkg.is_recommended ? (
                        <span className="rounded bg-[hsl(174,85%,32%)]/10 text-[hsl(174,85%,32%)] px-2 py-0.5 font-bold text-[10px]">
                          Recommended
                        </span>
                      ) : (
                        <span className="text-gray-400">Standard</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSavePrice(pkg.id)}
                            disabled={saving}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                            title="Save"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingPkgId(null)}
                            className="p-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300"
                            title="Cancel"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(pkg)}
                          className="inline-flex items-center gap-1 text-[hsl(174,85%,32%)] font-semibold hover:underline"
                        >
                          <Edit2 className="h-3 w-3" /> Edit Price
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Standalone Modular Services */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-4">
          Standalone Add-On Services ({services.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-3">Service Name</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Price Range (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {services.map((srv) => (
                <tr key={srv.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-3 font-semibold text-gray-900">{srv.name}</td>
                  <td className="p-3 font-mono text-gray-500">{srv.slug}</td>
                  <td className="p-3 font-bold text-gray-800">
                    ₹{srv.price_min.toLocaleString("en-IN")}
                    {srv.price_max > srv.price_min ? ` – ₹${srv.price_max.toLocaleString("en-IN")}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
