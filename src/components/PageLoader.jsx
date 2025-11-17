'use client'
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Sparkles, Droplets, Zap, Paintbrush, Wind, Leaf, Users, Shirt } from 'lucide-react';

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentService, setCurrentService] = useState(0);

  const services = [
    { Icon: Sparkles, name: 'Deep Cleaning', color: 'from-blue-500 to-cyan-500' },
    { Icon: Leaf, name: 'Gardening', color: 'from-green-500 to-emerald-500' },
    { Icon: Droplets, name: 'Plumbing', color: 'from-orange-500 to-red-500' },
    { Icon: Zap, name: 'Electrical', color: 'from-yellow-500 to-orange-500' },
    { Icon: Paintbrush, name: 'Painting', color: 'from-purple-500 to-pink-500' },
    { Icon: Wind, name: 'AC Service', color: 'from-cyan-500 to-blue-500' },
    { Icon: Users, name: 'Puja Services', color: 'from-amber-500 to-orange-500' },
    { Icon: Shirt, name: 'Laundry', color: 'from-indigo-500 to-purple-500' },
  ];

  useEffect(() => {
    const serviceInterval = setInterval(() => {
      setCurrentService((prev) => (prev + 1) % services.length);
    }, 400);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(serviceInterval);
          setTimeout(() => setIsLoading(false), 800);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => {
      clearInterval(serviceInterval);
      clearInterval(progressInterval);
    };
  }, [services.length]);

  if (!isLoading) return null;

  const currentSvc = services[currentService];
  const CurrentIcon = currentSvc.Icon;

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />
      </div>

      <div className="absolute inset-0">
        {services.map(({ Icon }, idx) => (
          <div
            key={idx}
            className="absolute opacity-10 animate-float-random"
            style={{
              left: `${(idx * 12 + 10) % 90}%`,
              top: `${(idx * 15 + 5) % 80}%`,
              animationDelay: `${idx * 0.5}s`,
              animationDuration: `${8 + idx}s`,
            }}
          >
            <Icon size={48} strokeWidth={1.5} className="text-white" />
          </div>
        ))}
      </div>

      <div className="relative h-full flex flex-col items-center justify-center gap-12 px-4">
        <div className="relative group">
          <div className="absolute -inset-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-3xl opacity-50 animate-pulse-slow group-hover:opacity-75 transition-opacity duration-500" />
          
          <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl transform hover:scale-105 transition-transform duration-500">
            <Image
              src="/logo.svg"
              alt="YANN"
              width={240}
              height={80}
              priority
              className="relative z-10 drop-shadow-2xl"
            />
            
            <div className="absolute inset-0 border-2 border-blue-500/30 rounded-3xl animate-ping-slow" />
            <div className="absolute -inset-2 border-2 border-purple-500/30 rounded-3xl animate-ping-slower" />
          </div>
        </div>

        <div className="relative w-full max-w-md">
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className={`relative w-24 h-24 rounded-2xl bg-gradient-to-br ${currentSvc.color} shadow-2xl flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:rotate-12`}>
              <CurrentIcon size={48} strokeWidth={2} className="text-white animate-bounce-subtle" />
              <div className="absolute inset-0 border-4 border-white/30 rounded-2xl animate-spin-slow" />
            </div>
            
            <div className="text-left">
              <p className="text-sm text-blue-200 font-medium mb-1">Loading Service</p>
              <h3 className="text-3xl font-bold text-white animate-fade-in">{currentSvc.name}</h3>
            </div>
          </div>

          <div className="flex gap-2 justify-center mb-8 overflow-hidden">
            {services.map(({ Icon }, idx) => (
              <div
                key={idx}
                className={`transform transition-all duration-500 ${
                  idx === currentService
                    ? 'scale-110 opacity-100'
                    : 'scale-75 opacity-40'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${services[idx].color} flex items-center justify-center shadow-lg hover:scale-125 transition-transform cursor-pointer`}>
                  <Icon size={24} strokeWidth={2} className="text-white" />
                </div>
              </div>
            ))}
          </div>

          <div className="relative">
            <div className="h-3 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden border border-white/20 shadow-inner">
              <div
                className={`h-full bg-gradient-to-r ${currentSvc.color} rounded-full transition-all duration-300 ease-out relative`}
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer-fast" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm font-semibold text-blue-200">Getting things ready...</span>
              <span className="text-lg font-bold text-white tabular-nums">{progress}%</span>
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-xl text-white/90 font-medium animate-fade-in">
            Your Home Services, Simplified
          </p>
          <div className="flex items-center gap-2 justify-center">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-random {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(10px, -10px) rotate(5deg);
          }
          50% {
            transform: translate(-5px, 5px) rotate(-5deg);
          }
          75% {
            transform: translate(8px, 8px) rotate(3deg);
          }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(1.1); opacity: 0; }
        }
        @keyframes ping-slower {
          0% { transform: scale(1); opacity: 0.2; }
          100% { transform: scale(1.15); opacity: 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer-fast {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float-random { animation: float-random ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-ping-slower { animation: ping-slower 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-spin-slow { animation: spin-slow 4s linear infinite; }
        .animate-shimmer-fast { animation: shimmer-fast 1.5s infinite; }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
