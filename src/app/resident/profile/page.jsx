"use client";

import { useState, useEffect } from "react";
import useResidentSession from "@/hooks/useResidentSession";

const PREFERENCE_LIBRARY = [
  "Deep cleaning",
  "Quick fixes",
  "Premium appliances",
  "Sustainable products",
  "Weekend visits",
  "Weekday mornings",
  "Pet-friendly crew",
  "Security vetted",
];

export default function ResidentProfilePage() {
  const { resident, refresh } = useResidentSession();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    addressLabel: "Home",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    preferences: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!resident) return;
    const address = resident.addressBook?.[0] || {};
    setForm({
      name: resident.name || "",
      email: resident.email || "",
      phone: resident.phone || "",
      addressLabel: address.label || "Home",
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      preferences: resident.preferences || [],
    });
  }, [resident]);

  const togglePreference = (preference) => {
    setForm((prev) => {
      const exists = prev.preferences.includes(preference);
      return {
        ...prev,
        preferences: exists
          ? prev.preferences.filter((item) => item !== preference)
          : [...prev.preferences, preference],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/homeowner/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          preferences: form.preferences,
          address: {
            label: form.addressLabel,
            street: form.street,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Unable to update profile");
      }
      alert("Profile updated successfully");
      window.dispatchEvent(new Event("auth:refresh"));
      refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">Resident identity</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Home profile</h1>
        <p className="text-sm text-slate-500">Keep your details updated so experts arrive prepared and on schedule.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Contact details</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Full name</span>
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Email address</span>
              <input value={form.email} disabled className="rounded-xl border border-slate-100 bg-slate-100 px-4 py-3 text-sm text-slate-500" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Phone number</span>
              <input
                value={form.phone}
                maxLength={10}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="10-digit contact"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Primary service address</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Label</span>
              <input
                value={form.addressLabel}
                onChange={(event) => setForm((prev) => ({ ...prev, addressLabel: event.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
              />
            </label>
            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Street & apartment</span>
              <input
                value={form.street}
                onChange={(event) => setForm((prev) => ({ ...prev, street: event.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">City</span>
              <input
                value={form.city}
                onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">State</span>
              <input
                value={form.state}
                onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Postal code</span>
              <input
                value={form.postalCode}
                maxLength={12}
                onChange={(event) => setForm((prev) => ({ ...prev, postalCode: event.target.value }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Service preferences</h2>
          <p className="mt-1 text-sm text-slate-500">Tune recommendations and crew selection to your lifestyle.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PREFERENCE_LIBRARY.map((preference) => {
              const active = form.preferences.includes(preference);
              return (
                <button
                  key={preference}
                  type="button"
                  onClick={() => togglePreference(preference)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active ? "bg-emerald-500 text-white shadow-lg" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {preference}
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save updates"}
          </button>
          <span className="text-xs text-slate-500">Profile sync keeps experts aligned with your comfort choices.</span>
        </div>
      </form>
    </div>
  );
}
