/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface FormProps {
  onSuccess: () => void;
}

export default function MembershipForm({ onSuccess }: FormProps) {
  const [fullName, setFullName] = useState('');
  const [classVal, setClassVal] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whyJoin, setWhyJoin] = useState('');
  const [agreement, setAgreement] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !classVal || !studentId || !phone || !email) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (!agreement) {
      setError('You must read and agree to the Red Crescent voluntary service guidelines.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          classVal,
          studentId,
          phone,
          email,
          whyJoin,
          agreement,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Something went wrong. Please check your data.');
      }

      setSubmitted(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div 
        id="success-alert-card"
        className="bg-[#121212] border border-emerald-500/30 rounded-2xl p-8 text-center shadow-2xl max-w-lg mx-auto"
      >
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-sans font-bold text-emerald-400 tracking-tight">Application Received</h3>
        <p className="mt-3 text-zinc-300 antialiased font-sans">
          “Thank you for applying. Your application has been received.”
        </p>
        <p className="mt-4 text-sm text-zinc-500">
          Our Team and Teacher In Charge will review your form. Accepted applicants will be notified via mobile phone number or email address.
        </p>
      </div>
    );
  }

  return (
    <form 
      id="applicant-signup-form"
      className="bg-[#121212]/90 backdrop-blur-md border border-white-5 rounded-2xl p-6 sm:p-10 shadow-2xl max-w-2xl mx-auto space-y-6"
      onSubmit={handleSubmit}
    >
      <div className="border-b border-white-5 pb-4 mb-2">
        <h3 className="text-xl font-bold text-white tracking-tight">Recruitment Registration</h3>
        <p className="text-sm text-zinc-400 mt-1">
          Apply to become an active youth volunteer with Sena Public School and College.
        </p>
      </div>

      {error && (
        <div id="form-error-banner" className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-4 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
            Full Name <span className="text-[#E01A22] font-bold">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Abdullah Al Mamun"
            className="w-full bg-[#080808] border border-white-5 hover:border-white-10 focus:border-[#E01A22] focus:ring-1 focus:ring-[#E01A22] text-white rounded-xl px-4 py-3 text-sm transition outline-none"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
            Class / Academic Year <span className="text-[#E01A22] font-bold">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Class 11, Section A"
            className="w-full bg-[#080808] border border-white-5 hover:border-white-10 focus:border-[#E01A22] focus:ring-1 focus:ring-[#E01A22] text-white rounded-xl px-4 py-3 text-sm transition outline-none"
            value={classVal}
            onChange={(e) => setClassVal(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
            Student ID Number <span className="text-[#E01A22] font-bold">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. SPSC-2026-892"
            className="w-full bg-[#080808] border border-white-5 hover:border-white-10 focus:border-[#E01A22] focus:ring-1 focus:ring-[#E01A22] text-white rounded-xl px-4 py-3 text-sm transition outline-none"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
            Phone Number <span className="text-[#E01A22] font-bold">*</span>
          </label>
          <input
            type="tel"
            required
            placeholder="e.g. +880 1XXXXXXXXX"
            className="w-full bg-[#080808] border border-white-5 hover:border-white-10 focus:border-[#E01A22] focus:ring-1 focus:ring-[#E01A22] text-white rounded-xl px-4 py-3 text-sm transition outline-none"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
          Email Address <span className="text-[#E01A22] font-bold">*</span>
        </label>
        <input
          type="email"
          required
          placeholder="e.g. abdullah@example.com"
          className="w-full bg-[#080808] border border-white-5 hover:border-white-10 focus:border-[#E01A22] focus:ring-1 focus:ring-[#E01A22] text-white rounded-xl px-4 py-3 text-sm transition outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
          Why do you want to join? (Optional)
        </label>
        <textarea
          rows={3}
          placeholder="Describe your motivation, emergency firstaid interest, or why you want to serve humanity..."
          className="w-full bg-[#080808] border border-white-5 hover:border-white-10 focus:border-[#E01A22] focus:ring-1 focus:ring-[#E01A22] text-white rounded-xl px-4 py-3 text-sm transition outline-none resize-none"
          value={whyJoin}
          onChange={(e) => setWhyJoin(e.target.value)}
        />
      </div>

      <div className="flex items-start space-x-3 pt-2">
        <input
          id="aggcheckbox"
          type="checkbox"
          required
          checked={agreement}
          onChange={(e) => setAgreement(e.target.checked)}
          className="mt-1.5 accent-[#E01A22] rounded bg-[#080808] border-white-5"
        />
        <label htmlFor="aggcheckbox" className="text-xs text-zinc-350 font-sans cursor-pointer select-none leading-relaxed">
          I promise to perform selflessly, respect volunteer directives, engage with humanity, and promote the Red Crescent Core Principles in and outside the Sena Public School & College campus.
        </label>
      </div>

      <button
        id="submit-form-button"
        type="submit"
        disabled={loading}
        className="w-full bg-[#E01A22] hover:bg-[#E01A22]/90 active:scale-98 text-white font-semibold font-sans py-3.5 rounded-xl transition-all duration-200 mt-2 hover:shadow-lg hover:shadow-[#E01A22]/20 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Processing Application...</span>
          </>
        ) : (
          <span>Submit Application</span>
        )}
      </button>
    </form>
  );
}
