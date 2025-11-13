"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import useResidentSession from "@/hooks/useResidentSession";

const SERVICE_LIBRARY = [
  "Home Cleaning",
  "Deep Cleaning",
  "Appliance Repair",
  "AC Service",
  "Plumbing Fix",
  "Electrical Check",
  "Painting Touch-up",
];

const STATUS_BADGE = {
  pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  scheduled: "bg-blue-50 text-blue-600 border border-blue-200",
  ongoing: "bg-purple-50 text-purple-600 border border-purple-200",
  completed: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  cancelled: "bg-red-50 text-red-500 border border-red-200",
  draft: "bg-slate-50 text-slate-500 border border-slate-200",
};

const formatDate = (value) => {
  if (!value) return "To be scheduled";
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function ResidentHome() {
  const { resident, loading } = useResidentSession();
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formState, setFormState] = useState({
    title: "",
    serviceType: SERVICE_LIBRARY[0],
    scheduledFor: "",
    priority: "routine",
    description: "",
  });

  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const res = await fetch("/api/resident/requests", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Unable to load requests");
      }
      const data = await res.json();
      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (error) {
      console.error(error);
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (resident) {
      fetchRequests();
    } else {
      setRequests([]);
    }
  }, [resident, fetchRequests]);

  const activeRequests = useMemo(
    () => requests.filter((request) => !["completed", "cancelled"].includes(request.status)),
    [requests]
  );

  const upcomingRequest = useMemo(() => {
    const sorted = [...requests]
      .filter((r) => r.scheduledFor)
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
    return sorted[0];
  }, [requests]);

  const handleCreateRequest = async (event) => {
    event.preventDefault();
    if (!formState.title.trim()) {
      alert("Please add a short title for the request");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/resident/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: formState.title.trim(),
          serviceType: formState.serviceType,
          description: formState.description.trim(),
          scheduledFor: formState.scheduledFor || undefined,
          priority: formState.priority,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to create request");
      }

      setRequests((prev) => [data.request, ...prev]);
      setFormState({
        title: "",
        serviceType: SERVICE_LIBRARY[0],
        scheduledFor: "",
        priority: "routine",
        description: "",
      });
      alert("Request created. Our concierge will reach out soon.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const emptyState = !loading && resident && requests.length === 0;

  return (
    <div className="space-y-12">
      <header className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-100/80">Resident workspace</p>
            <h1 className="text-3xl font-semibold lg:text-4xl">
              {loading ? "Loading resident..." : `Hi ${resident?.name?.split(" ")[0] || "there"}, let's shape your next service visit`}
            </h1>
            <p className="text-sm text-blue-100">
              Plan maintenance, track professionals, and keep your home running smoothly with concierge-level support.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 text-sm">
            <p className="text-xs uppercase tracking-widest text-blue-100/90">Upcoming visit</p>
            {upcomingRequest ? (
              <div className="mt-2 space-y-1">
                <p className="text-base font-semibold">{upcomingRequest.title}</p>
                <p className="text-xs text-blue-100/80">{formatDate(upcomingRequest.scheduledFor)}</p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-blue-100/80">No visits scheduled. Plan one below.</p>
            )}
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Plan a new service visit</h2>
                <p className="text-sm text-slate-500">Share quick details and we will align the right expert within 30 minutes.</p>
              </div>
            </header>
            <form onSubmit={handleCreateRequest} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Service focus</span>
                <select
                  value={formState.serviceType}
                  onChange={(event) => setFormState((prev) => ({ ...prev, serviceType: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
                >
                  {SERVICE_LIBRARY.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Visit title</span>
                <input
                  value={formState.title}
                  onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="e.g. AC tune-up for living room"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Preferred slot</span>
                <input
                  type="datetime-local"
                  value={formState.scheduledFor}
                  onChange={(event) => setFormState((prev) => ({ ...prev, scheduledFor: event.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Priority</span>
                <div className="flex gap-2">
                  {[
                    { label: "Routine", value: "routine" },
                    { label: "Urgent", value: "urgent" },
                  ].map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => setFormState((prev) => ({ ...prev, priority: option.value }))}
                      className={`flex-1 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                        formState.priority === option.value
                          ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </label>
              <label className="md:col-span-2 flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Notes for the expert</span>
                <textarea
                  value={formState.description}
                  onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Mention entry instructions, brand details or any concerns"
                  rows={3}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
                />
              </label>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating ? "Scheduling..." : "Schedule a professional"}
                </button>
              </div>
            </form>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Live requests</h2>
              <Link href="/resident/requests" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                View all
              </Link>
            </div>
            {requestsLoading ? (
              <p className="text-sm text-slate-500">Loading your requests...</p>
            ) : emptyState ? (
              <p className="text-sm text-slate-500">No requests yet — use the planner above to create your first visit.</p>
            ) : (
              <div className="space-y-4">
                {activeRequests.slice(0, 4).map((request) => (
                  <div
                    key={request.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{request.title}</h3>
                      <p className="text-xs text-slate-500">{request.serviceType}</p>
                    </div>
                    <div className="flex flex-col items-start gap-2 md:items-end">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest ${STATUS_BADGE[request.status] || STATUS_BADGE.pending}`}>
                        {request.status}
                      </span>
                      <span className="text-xs text-slate-500">{formatDate(request.scheduledFor)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Suggested experts</h2>
            <p className="mt-1 text-sm text-slate-500">
              Based on your recent activity and neighborhood demand.
            </p>
            <div className="mt-4 space-y-4">
              {["DeepClean Co.", "Spark Electricals", "ClimateCare Pros"].map((pro, index) => (
                <div key={pro} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-900">{pro}</p>
                    <p className="text-xs text-slate-500">4.9 ★ • Trusted by 120 residents</p>
                    <button className="mt-2 rounded-full border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50">
                      Request callback
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-lg shadow-slate-900/20">
            <h2 className="text-lg font-semibold">Seasonal care checklist</h2>
            <p className="mt-1 text-sm text-slate-200">Stay ahead with curated reminders.</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200">✓</span>
                <div>
                  <p className="font-semibold">Water purifier filter swap</p>
                  <p className="text-xs text-slate-300">Due every 90 days — last serviced 72 days ago</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200">✓</span>
                <div>
                  <p className="font-semibold">AC coil inspection</p>
                  <p className="text-xs text-slate-300">Pre-summer tune-up recommended in the next 10 days</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-100">•</span>
                <div>
                  <p className="font-semibold">Pest control refresh</p>
                  <p className="text-xs text-slate-300">Schedule before monsoon for best coverage</p>
                </div>
              </li>
            </ul>
            <Link
              href="/resident/plans"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Explore full maintenance plans
            </Link>
          </section>
        </aside>
      </section>
    </div>
  );
}
