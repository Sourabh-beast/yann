import "@/app/globals.css";

export default function ResidentLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16">{children}</div>
    </div>
  );
}
