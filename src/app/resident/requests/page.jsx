"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import useResidentSession from "@/hooks/useResidentSession";

const STATUS_BADGE = {
  pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  scheduled: "bg-blue-50 text-blue-600 border border-blue-200",
  ongoing: "bg-purple-50 text-purple-600 border border-purple-200",
  completed: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  cancelled: "bg-red-50 text-red-500 border border-red-200",
  draft: "bg-slate-50 text-slate-500 border border-slate-200",
  accepted: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  denied: "bg-red-50 text-red-500 border border-red-200",
};

const formatDateLong = (value) => {
  if (!value) return "To be scheduled";
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function ResidentRequestsPage() {
  const { resident } = useResidentSession();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
  const [updatingId, setUpdatingId] = useState(null);
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }),
    []
  );

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resident/requests", { credentials: "include" });
      if (!res.ok) {
        throw new Error("Unable to fetch requests");
      }
      const data = await res.json();
      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (resident) {
      fetchRequests();
    }
  }, [resident, fetchRequests]);

  const filteredRequests = useMemo(() => {
    if (filter === "all") return requests;
    if (filter === "completed") {
      return requests.filter((request) => request.status === "completed");
    }
    return requests.filter((request) => !["completed", "cancelled"].includes(request.status));
  }, [requests, filter]);

  const updateStatus = async (requestId, status) => {
    setUpdatingId(requestId);
    try {
      const res = await fetch(`/api/resident/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Unable to update request");
      }
      setRequests((prev) => prev.map((request) => (request.id === requestId ? data.request : request)));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to update");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteRequest = async (requestId) => {
    if (!confirm("Are you sure you want to remove this request?")) return;
    setUpdatingId(requestId);
    try {
      const res = await fetch(`/api/resident/requests/${requestId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Unable to delete request");
      }
      setRequests((prev) => prev.filter((request) => request.id !== requestId));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to delete");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleNegotiation = async (requestId, action) => {
    setUpdatingId(`${requestId}-${action}`);
    try {
      const res = await fetch(`/api/resident/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ negotiationAction: action }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Unable to respond to negotiation");
      }
      setRequests((prev) => prev.map((request) => (request.id === requestId ? data.request : request)));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to respond");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">Resident service desk</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Service requests</h1>
          <p className="text-sm text-slate-500">Stay on top of every visit, reschedule with one tap, and keep notes aligned with experts.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
          {["active", "completed", "all"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded-full px-4 py-2 transition ${filter === option ? "bg-slate-900 text-white" : ""}`}
            >
              {option}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <p className="text-sm text-slate-500">Loading requests...</p>
      ) : filteredRequests.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-lg font-semibold text-slate-700">No requests in this view</p>
          <p className="mt-2 text-sm text-slate-500">Create a new service plan from the resident home to see it here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{request.serviceType}</p>
                  <h2 className="text-lg font-semibold text-slate-900">{request.title}</h2>
                  <p className="text-sm text-slate-500">{request.description || "No additional notes shared."}</p>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Preferred slot • {formatDateLong(request.scheduledFor)}
                  </p>
                  {request.negotiation?.isActive && request.negotiation.status === "pending" && (
                    <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-500 mb-2">Negotiation pending</p>
                      <p className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">{request.negotiation.providerName || "Provider"}</span> proposed
                        {" "}
                        <span className="font-semibold text-slate-900">
                          {request.negotiation.proposedAmount
                            ? currencyFormatter.format(request.negotiation.proposedAmount)
                            : "a new rate"}
                        </span>
                        {request.negotiation.note ? ` — "${request.negotiation.note}"` : ""}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleNegotiation(request.id, "accept")}
                          disabled={updatingId === `${request.id}-accept`}
                          className="rounded-full bg-emerald-600 px-4 py-1 text-xs font-semibold text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed"
                        >
                          Accept new rate
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNegotiation(request.id, "decline")}
                          disabled={updatingId === `${request.id}-decline`}
                          className="rounded-full border border-slate-300 px-4 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start gap-2 md:items-end">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest ${STATUS_BADGE[request.status] || STATUS_BADGE.pending}`}>
                    {request.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    Created on {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {request.status !== "completed" && request.status !== "cancelled" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(request.id, "completed")}
                        disabled={updatingId === request.id}
                        className="rounded-full border border-emerald-200 px-4 py-1 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed"
                      >
                        Mark completed
                      </button>
                    )}
                    {request.status !== "cancelled" && request.status !== "completed" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(request.id, "cancelled")}
                        disabled={updatingId === request.id}
                        className="rounded-full border border-red-200 px-4 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed"
                      >
                        Cancel visit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteRequest(request.id)}
                      disabled={updatingId === request.id}
                      className="rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
