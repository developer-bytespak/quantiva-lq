'use client';

import React, { useState, useEffect, useCallback } from 'react';

export default function ContactFormPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const openPopup = useCallback(() => {
    if (triggered) return;
    setTriggered(true);
    setIsOpen(true);
  }, [triggered]);

  const closePopup = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const html = document.documentElement;
    const body = document.body;

    // Save existing inline styles so we can restore them.
    const prevHtmlOverflow = html.style.overflow;
    const prevHtmlHeight = html.style.height;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyHeight = body.style.height;

    html.style.overflow = 'hidden';
    html.style.height = '100%';
    body.style.overflow = 'hidden';
    body.style.height = '100%';

    // Also block wheel/touch scrolling (some browsers still scroll even with overflow hidden).
    const prevent = (e: Event) => {
      e.preventDefault();
    };
    const preventKeys = (e: KeyboardEvent) => {
      // Allow closing with Escape, and allow typing into inputs.
      if (e.key === 'Escape') return;
      const blockedKeys = new Set([
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'PageUp',
        'PageDown',
        'Home',
        'End',
        ' ',
      ]);
      if (blockedKeys.has(e.key)) e.preventDefault();
    };

    window.addEventListener('wheel', prevent, { passive: false });
    window.addEventListener('touchmove', prevent, { passive: false });
    window.addEventListener('keydown', preventKeys, { passive: false });

    return () => {
      window.removeEventListener('wheel', prevent as any);
      window.removeEventListener('touchmove', prevent as any);
      window.removeEventListener('keydown', preventKeys as any);

      html.style.overflow = prevHtmlOverflow;
      html.style.height = prevHtmlHeight;
      body.style.overflow = prevBodyOverflow;
      body.style.height = prevBodyHeight;
    };
  }, [isOpen]);

  useEffect(() => {
    if (triggered) return;

    const onScroll = () => openPopup();
    const onClick = () => openPopup();

    window.addEventListener('scroll', onScroll, { once: true, passive: true });
    document.addEventListener('click', onClick, { once: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick);
    };
  }, [triggered, openPopup]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePopup();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closePopup]);

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
      setTimeout(() => {
        closePopup();
        setStatus('idle');
      }, 800);
    } catch {
      setStatus('error');
      setErrorMessage('Failed to send. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-form-title"
      onClick={closePopup}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close (cross) icon */}
        <button
          type="button"
          onClick={closePopup}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          aria-label="Close contact form"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 id="contact-form-title" className="text-xl sm:text-2xl font-bold text-black mb-6 text-center pr-8">
          Contact us
        </h2>

        {status === 'success' ? (
          <p className="text-green-600 font-medium">Thank you! We&apos;ll be in touch soon.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="contact-fullname" className="sr-only">
                Full Name
              </label>
              <input
                id="contact-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-transparent border-0 border-b border-gray-300 py-2 text-gray-900 placeholder-gray-600 focus:outline-none focus:border-black focus:ring-0"
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="sr-only">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent border-0 border-b border-gray-300 py-2 text-gray-900 placeholder-gray-600 focus:outline-none focus:border-black focus:ring-0"
                autoComplete="email"
                required
              />
            </div>
            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3 px-4 border-2 border-black text-black font-semibold uppercase tracking-wide hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {status === 'sending' ? 'Sending…' : 'Send'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
