"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/feedback";
import { SkeletonRow } from "@/components/ui/skeleton";
import { Edit2, Check, X } from "lucide-react";

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

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8E572C]">
          Commercial Catalog
        </span>
        <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331] mt-0.5">
          Packages &amp; Pricing Manager
        </h1>
        <p className="mt-1 text-sm text-[#546866]">
          Manage live pricing for standard consultancy packages and 14 standalone modular services.
        </p>
      </div>

      {/* Core Packages Table */}
      <div className="beyond-card overflow-hidden">
        <div className="px-6 py-4 border-b border-[#DCE5E8] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#263331]">
              Core Consultancy Packages
            </h2>
            <p className="text-xs text-[#546866] mt-0.5">
              Published advisory tiers billed to enrolled students
            </p>
          </div>
          <StatusBadge tone="sage">{packages.length} Tiers</StatusBadge>
        </div>

        {loading ? (
          <div className="p-6 space-y-2">
            <SkeletonRow cols={5} />
            <SkeletonRow cols={5} />
            <SkeletonRow cols={5} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F0E8]/75 border-b border-[#DCE5E8] text-[11px] font-semibold uppercase tracking-wider text-[#546866]">
                <tr>
                  <th className="py-3.5 px-6">Package Name</th>
                  <th className="py-3.5 px-6">Slug</th>
                  <th className="py-3.5 px-6">Price (INR)</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5E8]/80 text-[#394B49]">
                {packages.map((pkg) => {
                  const isEditing = editingPkgId === pkg.id;
                  return (
                    <tr key={pkg.id} className="hover:bg-[#EEF3F5]/45 transition-colors">
                      <td className="py-4 px-6 font-semibold text-sm text-[#263331]">
                        {pkg.name}
                      </td>
                      <td className="py-4 px-6 font-mono text-[#546866]">{pkg.slug}</td>
                      <td className="py-4 px-6">
                        {isEditing ? (
                          <input
                            type="number"
                            value={newPrice}
                            onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                            className="w-32 rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3 py-1.5 text-sm font-semibold text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2]"
                          />
                        ) : (
                          <span className="text-sm font-bold text-[#263331]">
                            ₹{pkg.price.toLocaleString("en-IN")}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {pkg.is_recommended ? (
                          <StatusBadge tone="warm">Recommended</StatusBadge>
                        ) : (
                          <StatusBadge tone="misty">Standard</StatusBadge>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isEditing ? (
                          <div className="inline-flex items-center justify-end gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              loading={saving}
                              onClick={() => handleSavePrice(pkg.id)}
                              title="Save"
                            >
                              <Check className="h-3.5 w-3.5" /> Save
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setEditingPkgId(null)}
                              title="Cancel"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="sage"
                            size="sm"
                            onClick={() => handleStartEdit(pkg)}
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Edit Price
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Standalone Modular Services */}
      <div className="beyond-card overflow-hidden">
        <div className="px-6 py-4 border-b border-[#DCE5E8] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#263331]">
              Standalone Add-On Services ({services.length})
            </h2>
            <p className="text-xs text-[#546866] mt-0.5">
              À la carte advisory modules available alongside core tiers
            </p>
          </div>
          <StatusBadge tone="misty">{services.length} Modules</StatusBadge>
        </div>

        {loading ? (
          <div className="p-6 space-y-2">
            <SkeletonRow cols={3} />
            <SkeletonRow cols={3} />
            <SkeletonRow cols={3} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F0E8]/75 border-b border-[#DCE5E8] text-[11px] font-semibold uppercase tracking-wider text-[#546866]">
                <tr>
                  <th className="py-3.5 px-6">Service Name</th>
                  <th className="py-3.5 px-6">Slug</th>
                  <th className="py-3.5 px-6">Price Range (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5E8]/80 text-[#394B49]">
                {services.map((srv) => (
                  <tr key={srv.id} className="hover:bg-[#EEF3F5]/45 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-[#263331]">{srv.name}</td>
                    <td className="py-3.5 px-6 font-mono text-[#546866]">{srv.slug}</td>
                    <td className="py-3.5 px-6 font-bold text-[#263331]">
                      ₹{srv.price_min.toLocaleString("en-IN")}
                      {srv.price_max > srv.price_min
                        ? ` – ₹${srv.price_max.toLocaleString("en-IN")}`
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
