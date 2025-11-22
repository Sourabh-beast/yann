"use client";

import { useState, useMemo, useEffect } from "react";
import useResidentSession from "@/hooks/useResidentSession";

const EXPERT_LIBRARY = [
  {
    id: "pro-1",
    name: "Nehu's DeepClean Crew",
    category: "Home Cleaning",
    rating: 4.9,
    jobs: 186,
    responseTime: "15 mins",
    tagline: "Sparkling 2BHK in 90 minutes with eco solutions",
  },
  {
    id: "pro-2",
    name: "VoltFix Electricians",
    category: "Electrical",
    rating: 4.8,
    jobs: 240,
    responseTime: "10 mins",
    tagline: "Certified electricians for smart home repairs",
  },
  {
    id: "pro-3",
    name: "ChillPro HVAC",
    category: "AC Service",
    rating: 5,
    jobs: 72,
    responseTime: "20 mins",
    tagline: "Premium AMC plans for all inverter AC models",
  },
  {
    id: "pro-4",
    name: "Urban Carpentry Co.",
    category: "Carpentry",
    rating: 4.7,
    jobs: 54,
    responseTime: "35 mins",
    tagline: "Modular fixes and bespoke shelving within 48 hrs",
  },
];

const CATEGORIES = ["All", "Home Cleaning", "Electrical", "AC Service", "Carpentry"];

export default function ResidentFavoritesPage() {
  const { resident } = useResidentSession({ autoRedirect: true });
  const [category, setCategory] = useState("All");
  const [pinned, setPinned] = useState(() => new Set(resident?.savedProviders?.map(String) || []));

  useEffect(() => {
    setPinned(new Set(resident?.savedProviders?.map(String) || []));
  }, [resident]);

  const filteredExperts = useMemo(() => {
    if (category === "All") return EXPERT_LIBRARY;
    return EXPERT_LIBRARY.filter((expert) => expert.category === category);
  }, [category]);

  const togglePinned = (id) => {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-500">Resident shortlist</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Saved experts</h1>
          <p className="text-sm text-slate-500">Curate your go-to professionals and fast-track repeat bookings.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
          {CATEGORIES.map((option) => (
            <button
              key={option}
              onClick={() => setCategory(option)}
              className={`rounded-full px-4 py-2 transition ${category === option ? "bg-slate-900 text-white" : ""}`}
            >
              {option}
            </button>
          ))}
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filteredExperts.map((expert) => {
          const isPinned = pinned.has(expert.id);
          return (
            <div key={expert.id} className="relative flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{expert.category}</p>
                <h2 className="text-xl font-semibold text-slate-900">{expert.name}</h2>
                <p className="text-sm text-slate-500">{expert.tagline}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-amber-500">★ {expert.rating.toFixed(1)}</span>
                  <span>{expert.jobs} jobs</span>
                  <span>Response {expert.responseTime}</span>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => togglePinned(expert.id)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    isPinned
                      ? "border border-emerald-300 bg-emerald-50 text-emerald-600"
                      : "border border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  {isPinned ? "Pinned" : "Pin to shortlist"}
                </button>
                <button className="rounded-full border border-blue-200 px-4 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50">
                  Request availability
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
