'use client';

import React, { useState } from 'react';

export default function ContactFormSection() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email.');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/submit-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, name: trimmedName || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data?.error || 'Something went wrong.');
        return;
      }
      setStatus('success');
      setFullName('');
      setEmail('');
    } catch {
      setStatus('error');
      setErrorMessage('Failed to send. Please try again.');
    }
  };

  return (
    <section id="contact" className="relative w-full py-16 sm:py-20 md:py-24 text-gray-300 overflow-hidden">
      {/* Space-themed background - matches HowItWorks / Footer */}
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(to bottom, #000000 0%, #050505 20%, #0a0a1a 50%, #050505 80%, #000000 100%)' }}>
        <div className="absolute inset-0 space-stars" />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-blue-900/10" />
      </div>
      <div className="container mx-auto px-4 flex justify-center relative z-10">
        <div className="w-full max-w-md bg-[#141414] rounded-lg shadow-xl border-2 border-[#262626] p-6 sm:p-8">
          <h2 id="contact-section-title" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#f86c24] via-[#ffa500] to-[#ffd700] bg-clip-text text-transparent mb-6 text-center">
            Contact us
          </h2>

          {status === 'success' ? (
            <p className="text-emerald-400 font-medium text-center text-lg py-4">Thank You, Email Received</p>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="contact-section-fullname" className="sr-only">
                    Full Name
                  </label>
                  <input
                    id="contact-section-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-transparent border-0 border-b border-gray-600 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#ffa500] focus:ring-0"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="contact-section-email" className="sr-only">
                    Email
                  </label>
                  <input
                    id="contact-section-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-transparent border-0 border-b border-gray-600 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#ffa500] focus:ring-0"
                    autoComplete="email"
                    required
                  />
                </div>
                {errorMessage && (
                  <p className="text-sm text-red-400">{errorMessage}</p>
                )}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full py-3 px-4 rounded-lg font-semibold uppercase tracking-wide bg-gradient-to-r from-[#f86c24] via-[#ffa500] to-[#ffd700] text-black hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
                >
                  {status === 'sending' ? 'Sending…' : 'Send'}
                </button>
              </form>
              <p className="mt-4 text-xs text-gray-500 text-center">
                You can email us directly at{' '}
                <a href="mailto:contact@quantiva.com" className="underline hover:text-gray-300">
                  contact@quantiva.com
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
