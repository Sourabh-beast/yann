'use client';

import useProviderSession from "@/hooks/useProviderSession";

const serviceBlueprint = {
  "bridal makeup": {
    category: "Bridal",
    priceRange: "₹4,500 – ₹8,500",
    duration: "150 mins",
    popularity: "High demand",
    description: "Luxe bridal package with trial, HD makeup, and travel buffer.",
  },
  "pre-wedding shoot makeup": {
    category: "Editorial",
    priceRange: "₹3,200 – ₹5,000",
    duration: "120 mins",
    popularity: "Trending",
    description: "Camera-ready looks with humidity control and quick touch-ups.",
  },
  "haldi minimal glam": {
    category: "Ceremonial",
    priceRange: "₹1,400 – ₹2,200",
    duration: "90 mins",
    popularity: "Seasonal",
    description: "Fresh daytime glow with stain-proof base and flower-safe styling.",
  },
  "cocktail party styling": {
    category: "Events",
    priceRange: "₹2,800 – ₹4,500",
    duration: "110 mins",
    popularity: "Evening favourite",
    description: "Glam hair and makeup combo with long-wear finish for nightlife events.",
  },
  "men's grooming": {
    category: "Groom",
    priceRange: "₹1,200 – ₹2,000",
    duration: "75 mins",
    popularity: "Steady",
    description: "Polished grooming with HD concealing and humidity-proof setting.",
  },
};

const defaultServiceInfo = {
  category: "Custom",
  priceRange: "On request",
  duration: "90 mins",
  popularity: "Emerging",
  description: "Curated experience tailored to client preferences.",
};

const serviceRequests = [
  {
    id: "RQ-2088",
    client: "Vaishnavi Patel",
    service: "Luxury Bridal Makeup",
    preferredDate: "22 Jun 2024",
    status: "Awaiting quote",
    channel: "App",
  },
  {
    id: "RQ-2082",
    client: "Rahul & Simran",
    service: "Couple Cocktail Styling",
    preferredDate: "18 Jun 2024",
    status: "Proposal sent",
    channel: "Website",
  },
  {
    id: "RQ-2075",
    client: "Studio Eagle",
    service: "Shoot Makeup (2 models)",
    preferredDate: "15 Jun 2024",
    status: "Pending deposit",
    channel: "Agency",
  },
];

const availabilityMatrix = [
  { day: "Monday", slots: "09:00 – 18:00", status: "Open" },
  { day: "Tuesday", slots: "09:00 – 14:00", status: "Half-day" },
  { day: "Wednesday", slots: "Closed", status: "Blocked" },
  { day: "Thursday", slots: "11:00 – 20:00", status: "Open" },
  { day: "Friday", slots: "10:00 – 19:00", status: "Open" },
  { day: "Saturday", slots: "08:00 – 21:00", status: "Peak" },
  { day: "Sunday", slots: "08:00 – 14:00", status: "Limited" },
];

const availabilityStyles = {
  Open: "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Half-day": "bg-blue-50 text-blue-600 border-blue-100",
  Peak: "bg-purple-50 text-purple-600 border-purple-100",
  Limited: "bg-amber-50 text-amber-600 border-amber-100",
  Blocked: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function ServicesManager() {
  const { provider, loading } = useProviderSession();
  const activeServices = provider?.services?.length ? provider.services : [];
  const firstName = provider?.name?.split(" ")[0];
  const heading = firstName ? `${firstName}'s offerings` : "Your service catalogue";
  const ratingValue = typeof provider?.rating === "number" ? provider.rating.toFixed(1) : "4.8";
  const reviewsTotal = typeof provider?.totalReviews === "number" ? provider.totalReviews : 112;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Services command centre</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{heading}</h1>
          <p className="text-gray-600 max-w-3xl">
            Review every package you provide, refine pricing, and keep availability aligned with demand. Update your
            listings in one place and watch them sync across the Yann marketplace.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[{
            label: "Active services",
            value: activeServices.length,
            helper: "Published to clients",
          }, {
            label: "Average rating",
            value: ratingValue,
            helper: `${reviewsTotal} reviews tallied`,
          }, {
            label: "Upcoming requests",
            value: serviceRequests.length,
            helper: "Awaiting your response",
          }, {
            label: "Peak day",
            value: "Saturday",
            helper: "Highest conversions last week",
          }].map((card) => (
            <article key={card.label} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <p className="text-sm font-medium text-gray-500 mb-2">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-widest">{card.helper}</p>
            </article>
          ))}
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-10">
          <div className="px-6 py-5 border-b border-gray-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Active catalog</h2>
              <p className="text-sm text-gray-500">Optimise each service card to highlight transformations clients love.</p>
            </div>
            <button type="button" className="self-start md:self-auto px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-full shadow hover:bg-purple-700">
              Create new service
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {activeServices.length === 0 && (
              <div className="md:col-span-2 p-6 border border-dashed border-gray-300 rounded-2xl text-center text-gray-500">
                Add your first service to start receiving requests from the Yann community.
              </div>
            )}

            {activeServices.map((serviceName) => {
              const lookupKey = serviceName.toLowerCase();
              const blueprint = serviceBlueprint[lookupKey] || defaultServiceInfo;

              return (
                <article key={serviceName} className="border border-gray-100 rounded-2xl p-6 shadow-sm bg-white">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-xs font-semibold text-purple-600 uppercase tracking-widest">{blueprint.category}</p>
                      <h3 className="text-lg font-semibold text-gray-900 mt-1 capitalize">{serviceName}</h3>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-widest">Active</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{blueprint.description}</p>
                  <dl className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                    <div>
                      <dt className="font-semibold text-gray-900">Pricing</dt>
                      <dd>{blueprint.priceRange}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-gray-900">Duration</dt>
                      <dd>{blueprint.duration}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-gray-900">Demand</dt>
                      <dd>{blueprint.popularity}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-gray-900">Last updated</dt>
                      <dd>3 days ago</dd>
                    </div>
                  </dl>
                  <div className="flex flex-wrap gap-3 mt-5">
                    <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Edit details</button>
                    <button type="button" className="text-sm font-semibold text-gray-500 hover:text-gray-700">Duplicate</button>
                    <button type="button" className="text-sm font-semibold text-red-500 hover:text-red-600">Pause</button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <article className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Latest service requests</h3>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Action in under 4 hours</p>
            </div>
            <div className="space-y-4">
              {serviceRequests.map((request) => (
                <div key={request.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{request.client}</p>
                      <p className="text-xs text-gray-500">{request.channel}</p>
                    </div>
                    <span className="text-xs font-semibold text-blue-600">{request.status}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Requested: {request.service}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-sm text-gray-500">Preferred date: {request.preferredDate}</p>
                    <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Respond</button>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Availability planner</h3>
              <button type="button" className="text-sm font-semibold text-purple-600 hover:text-purple-700">Adjust weekly slots</button>
            </div>
            <ul className="space-y-3">
              {availabilityMatrix.map((slot) => (
                <li key={slot.day} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 bg-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{slot.day}</p>
                    <p className="text-xs text-gray-500">{slot.slots}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border uppercase tracking-widest ${availabilityStyles[slot.status]}`}>
                    {slot.status}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Optimisation checklist</h3>
              <p className="text-sm text-gray-600">
                Keep your listings up to Yann's recommended quality score. Completing each task lifts visibility within the marketplace.
              </p>
            </div>
            <ul className="md:col-span-2 space-y-3">
              {[{
                title: "Upload portfolio before/after shots",
                status: "Pending",
                detail: "Add five recent transformations to boost conversion by 22%.",
              }, {
                title: "Define add-on pricing",
                status: "In progress",
                detail: "Specify rates for travel and premium product upgrades.",
              }, {
                title: "Update service prep instructions",
                status: "Completed",
                detail: "Clients receive prep email 48 hours before the appointment.",
              }].map((task) => (
                <li key={task.title} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{task.status}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{task.detail}</p>
                </li>
              ))}
            </ul>
          </div>
          {loading && (
            <div className="mt-6 p-3 text-xs text-purple-700 bg-purple-50 border border-purple-100 rounded-lg">
              Syncing live service data… Your catalogue reflects the latest updates from Yann once verification completes.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
