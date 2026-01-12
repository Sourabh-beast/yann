'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ProviderContent() {
    const searchParams = useSearchParams();
    const providerId = searchParams.get('id');

    useEffect(() => {
        if (providerId) {
            // Attempt deep link after a short delay
            const timer = setTimeout(() => {
                window.location.href = `yann://provider/${providerId}`;
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [providerId]);

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">👤</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Provider Profile</h1>
            <p className="text-gray-600 mb-6">
                Opening profile in the YANN app...
            </p>

            {providerId && (
                <a
                    href={`yann://provider/${providerId}`}
                    className="block w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg mb-4 hover:bg-blue-700 transition-colors no-underline"
                    style={{ backgroundColor: '#2563EB', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none' }}
                >
                    Open in App
                </a>
            )}

            <Link href="/" style={{ color: '#2563EB', textDecoration: 'underline' }}>
                Back to Home
            </Link>
        </div>
    );
}

export default function ProviderPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#F3F4F6', padding: '1rem' }}>
            <Suspense fallback={<div>Loading...</div>}>
                <ProviderContent />
            </Suspense>
        </div>
    );
}
