'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Home, RotateCcw, Clock } from 'lucide-react';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const status = searchParams.get('status');
  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');
  const amount = searchParams.get('amount');

  // Determine payment status from URL params
  const isSuccess = status === 'success';
  const isFailed = status === 'failed';
  const isPending = !status || status === 'pending';

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Processing Payment...</h2>
          <p className="text-gray-500 mt-2">Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Your booking has been confirmed</p>
          
          <div className="bg-green-50 rounded-xl p-4 mb-6 text-left">
            {orderId && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Order ID</span>
                <span className="font-semibold text-gray-900 text-sm">{orderId}</span>
              </div>
            )}
            {paymentId && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Payment ID</span>
                <span className="font-semibold text-gray-900 text-sm">{paymentId}</span>
              </div>
            )}
            {amount && (
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-semibold text-green-600">₹{amount}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => router.push('/my-services')}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Browse More Services
          </button>
        </div>
      </div>
    );
  }

  // Failed status
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
            Your payment could not be processed. Please try again.
          </p>
          {orderId && (
            <p className="text-xs text-red-500 mt-2">Order ID: {orderId}</p>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/my-services')}
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
