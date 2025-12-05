'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Home, RotateCcw, Clock } from 'lucide-react';
import Footer from '@/components/Footer';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');
  
  const [status, setStatus] = useState('loading');
  const [paymentData, setPaymentData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (orderId) {
      verifyPayment();
    } else {
      setStatus('error');
    }
  }, [orderId]);

  const verifyPayment = async () => {
    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });

      const data = await res.json();
      
      if (data.success && data.payment_status === 'SUCCESS') {
        setStatus('success');
        setPaymentData(data);
      } else if (data.payment_status === 'PENDING' && retryCount < 3) {
        // Retry after 3 seconds for pending payments
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          verifyPayment();
        }, 3000);
      } else {
        setStatus('failed');
        setPaymentData(data);
      }
    } catch (error) {
      console.error('Verify error:', error);
      setStatus('failed');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Verifying Payment...</h2>
          <p className="text-gray-500 mt-2">Please wait while we confirm your payment</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-400 mt-2">Attempt {retryCount + 1} of 4</p>
          )}
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Your booking has been confirmed</p>
          
          <div className="bg-green-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Order ID</span>
              <span className="font-semibold text-gray-900 text-sm">{orderId}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Amount Paid</span>
              <span className="font-semibold text-green-600">₹{paymentData?.order_amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-semibold text-gray-900">{paymentData?.payment_method || 'UPI'}</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/my-services')}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">Something went wrong with your payment</p>
        
        <div className="bg-red-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-700">
            {paymentData?.message || 'Your payment could not be processed. Please try again.'}
          </p>
          {orderId && (
            <p className="text-xs text-red-500 mt-2">Order ID: {orderId}</p>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    }>
      <PaymentStatusContent />
    </Suspense>
  );
}
