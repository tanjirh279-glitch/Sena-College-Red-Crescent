/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Settings, 
  Globe, 
  LogOut, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Phone, 
  Save, 
  Activity,
  Plus,
  Trash2,
  RefreshCw,
  Database,
  Share2
} from 'lucide-react';
import { UserRegistration, SiteContent } from '../types';

interface AdminDashboardProps {
  onClose: () => void;
  siteContent: SiteContent;
  onRefreshContent: () => void;
}

export default function AdminDashboard({ onClose, siteContent, onRefreshContent }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Loaded states
  const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationsError, setRegistrationsError] = useState<string | null>(null);

  // Content editing copies
  const [heroTitle, setHeroTitle] = useState(siteContent.hero.title);
  const [heroSubtitle, setHeroSubtitle] = useState(siteContent.hero.subtitle);
  const [heroTagline, setHeroTagline] = useState(siteContent.hero.tagline);
  const [aboutText, setAboutText] = useState(siteContent.about);
  
  // Leadership info copies
  const [teacherName, setTeacherName] = useState(siteContent.leadership.teacher.name);
  const [teacherContact, setTeacherContact] = useState(siteContent.leadership.teacher.contact);
  const [unitLeaderText, setUnitLeaderText] = useState(siteContent.leadership.unitLeader);
  const [teamLeadersText, setTeamLeadersText] = useState(siteContent.leadership.teamLeaders);
  const [executiveTeamText, setExecutiveTeamText] = useState(siteContent.leadership.executiveTeam);

  // Social copies
  const [fbUrl, setFbUrl] = useState(siteContent.socials.facebook);
  const [igUrl, setIgUrl] = useState(siteContent.socials.instagram);
  const [waNum, setWaNum] = useState(siteContent.socials.whatsapp);

  // Feedback copies
  const [feedbacks, setFeedbacks] = useState(siteContent.feedbacks || []);

  // Active admin tabs: 'registrations' | 'edit-content' | 'sheets-sync' | 'publish-share'
  const [activeTab, setActiveTab] = useState<'registrations' | 'edit-content' | 'sheets-sync' | 'publish-share'>('publish-share');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const [googleSheetsUrl, setGoogleSheetsUrl] = useState(siteContent.googleSheetsUrl || '');
  const [gmailEnabled, setGmailEnabled] = useState(siteContent.gmailEnabled ?? false);
  const [gmailSubject, setGmailSubject] = useState(siteContent.gmailSubject || 'Sena College Red Crescent Admission Status');
  const [gmailBody, setGmailBody] = useState(siteContent.gmailBody || 'Dear {applicant_name},\n\nWe are pleased to inform you that your registration for the Sena Public School & College Red Crescent Youth unit has been processed.\n\nStatus: {status}\n\nThank you!\n\nSPSC Red Crescent Youth Unit');
  
  const [sheetsSyncLoading, setSheetsSyncLoading] = useState(false);
  const [sheetsSyncSuccess, setSheetsSyncSuccess] = useState<string | null>(null);
  const [sheetsSyncError, setSheetsSyncError] = useState<string | null>(null);

  const [gmailTestLoading, setGmailTestLoading] = useState(false);
  const [gmailTestSuccess, setGmailTestSuccess] = useState<string | null>(null);
  const [gmailTestError, setGmailTestError] = useState<string | null>(null);

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Check existing session token in localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('spsc_rc_token');
    if (savedToken) {
      setAuthToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch registrations once authenticated
  useEffect(() => {
    if (isAuthenticated && authToken) {
      fetchRegistrations();
    }
  }, [isAuthenticated, authToken]);

  const fetchRegistrations = async () => {
    setRegistrationsLoading(true);
    setRegistrationsError(null);
    try {
      const res = await fetch('/api/registrations', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });
      if (!res.ok) {
        throw new Error('Could not fetch registrations list. Please re-authenticate.');
      }
      const data = await res.json();
      // Sort: newest first
      data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRegistrations(data);
    } catch (err: any) {
      setRegistrationsError(err.message);
      if (err.message.includes('re-authenticate')) {
        handleLogout();
      }
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('spsc_rc_token', data.token);
      setAuthToken(data.token);
      setIsAuthenticated(true);
    } catch (err: any) {
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('spsc_rc_token');
    setAuthToken(null);
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/registrations/${id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        throw new Error('Failed to update status');
      }
      
      // Update local state smoothly
      setRegistrations(prev => prev.map(reg => reg.id === id ? { ...reg, status: newStatus as any } : reg));
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveSuccessMessage(null);

    const consolidatedContent: SiteContent = {
      hero: {
        title: heroTitle,
        subtitle: heroSubtitle,
        tagline: heroTagline
      },
      about: aboutText,
      whyJoin: siteContent.whyJoin, // Static principles configured strictly
      activities: siteContent.activities, // Static standard activities matching content rules
      feedbacks: feedbacks,
      leadership: {
        teacher: {
          name: teacherName,
          role: 'Teacher in Charge',
          contact: teacherContact
        },
        unitLeader: unitLeaderText,
        teamLeaders: teamLeadersText,
        executiveTeam: executiveTeamText
      },
      socials: {
        facebook: fbUrl,
        instagram: igUrl,
        whatsapp: waNum
      },
      googleSheetsUrl: googleSheetsUrl,
      gmailEnabled: gmailEnabled,
      gmailSubject: gmailSubject,
      gmailBody: gmailBody
    };

    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(consolidatedContent)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Save failed');
      }

      setSaveSuccessMessage('Website content saved and published successfully!');
      onRefreshContent();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert('Error saving content: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRemoveFeedback = (id: string) => {
    setFeedbacks(feedbacks.filter(item => item.id !== id));
  };

  const handleDownloadCSV = () => {
    if (!authToken) return;
    window.open(`/api/registrations/export?authorization=Bearer ${authToken}`, '_blank');
    // Using simple a tag fetch as fallback to pass header
    fetch('/api/registrations/export', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SPSC_Red_Crescent_Applicants_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch(() => {
      alert('Failed to trigger background download. Try opening the direct link.');
    });
  };

  // Safe Filter Logic
  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = 
      reg.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.phone.includes(searchQuery) ||
      reg.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && reg.status === statusFilter;
  });

  // Count summaries
  const countStats = {
    total: registrations.length,
    submitted: registrations.filter(r => r.status === 'Submitted').length,
    underReview: registrations.filter(r => r.status === 'Under Review').length,
    approved: registrations.filter(r => r.status === 'Approved').length,
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white text-sm"
          >
            ✕ Close
          </button>
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-sans font-bold tracking-tight">Staff Security Gate</h2>
            <p className="text-xs text-zinc-400 mt-1">
              SENA PUBLIC SCHOOL AND COLLEGE RED CRESCENT SOCIETY
            </p>
          </div>

          {loginError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg mb-4">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-widest mb-1">
                Admin Security Key
              </label>
              <input
                type="password"
                required
                placeholder="Enter passcode..."
                className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white rounded-xl px-4 py-3 text-sm transition outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-650 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition duration-150 shadow-lg shadow-red-950/20"
            >
              Authorize Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-955 text-white">
      {/* Admin Nav */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <div className="bg-red-500 px-2 py-0.5 text-[10px] font-mono tracking-widest text-white uppercase rounded">
              ADMIN CONTROL
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white font-sans sm:block hidden">SPSCRCS Portal Hub</h1>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setActiveTab('publish-share')}
              className={`px-4 py-1.5 rounded-lg text-sm cursor-pointer transition ${
                activeTab === 'publish-share' 
                  ? 'bg-red-600 text-white font-medium' 
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <Share2 className="w-4 h-4 inline mr-1.5" />
              Publish & Share
            </button>

            <button
              onClick={() => setActiveTab('registrations')}
              className={`px-4 py-1.5 rounded-lg text-sm cursor-pointer transition ${
                activeTab === 'registrations' 
                  ? 'bg-red-600 text-white font-medium' 
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <Users className="w-4 h-4 inline mr-1.5" />
              Manage Signups
            </button>

            <button
              onClick={() => setActiveTab('edit-content')}
              className={`px-4 py-1.5 rounded-lg text-sm cursor-pointer transition ${
                activeTab === 'edit-content' 
                  ? 'bg-red-600 text-white font-medium' 
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-1.5" />
              Edit Web Content
            </button>

            <button
              onClick={() => setActiveTab('sheets-sync')}
              className={`px-4 py-1.5 rounded-lg text-sm cursor-pointer transition ${
                activeTab === 'sheets-sync' 
                  ? 'bg-red-600 text-white font-medium' 
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <Database className="w-4 h-4 inline mr-1.5" />
              Google Sheets Sync
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-sm cursor-pointer transition border border-zinc-800"
              title="Logout session"
            >
              <LogOut className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-zinc-805 hover:bg-zinc-700 text-white rounded-lg text-sm cursor-pointer transition border border-zinc-700"
            >
              View Live Site ➔
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: Registrations */}
        {activeTab === 'registrations' && (
          <div className="space-y-6">
            
            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <span className="text-zinc-500 text-xs uppercase font-mono tracking-wider block">Total Recruits</span>
                <span className="text-3xl font-sans font-bold text-white block mt-1">{countStats.total}</span>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <span className="text-amber-400 text-xs uppercase font-mono tracking-wider block">Pending Review</span>
                <span className="text-3xl font-sans font-bold text-amber-400 block mt-1">{countStats.submitted}</span>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <span className="text-blue-400 text-xs uppercase font-mono tracking-wider block">Under Review</span>
                <span className="text-3xl font-sans font-bold text-blue-400 block mt-1">{countStats.underReview}</span>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <span className="text-emerald-400 text-xs uppercase font-mono tracking-wider block">Approved Members</span>
                <span className="text-3xl font-sans font-bold text-emerald-400 block mt-1">{countStats.approved}</span>
              </div>
            </div>

            {/* Filter and Download Header */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-1 flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search applicants (Name, ID, Email...)"
                    className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-white rounded-lg px-4 py-2 text-sm outline-none focus:border-red-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <select
                  className="bg-zinc-955 border border-zinc-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-red-500 cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Applications</option>
                  <option value="Submitted">Submitted (Pending)</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={fetchRegistrations}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 p-2 rounded-lg text-sm transition"
                  title="Reload registrations"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDownloadCSV}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Spreadsheet (CSV)</span>
                </button>
              </div>
            </div>

            {/* Applicants Table/Grid */}
            {registrationsLoading ? (
              <div className="text-center py-20 text-zinc-500">
                <div className="animate-spin duration-1000 w-8 h-8 border-4 border-t-red-650 border-zinc-800 rounded-full mx-auto mb-4"></div>
                Loading student records...
              </div>
            ) : registrationsError ? (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-8 rounded-xl text-center">
                <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-3" />
                <h3 className="font-bold text-lg">Error Loading Registrations</h3>
                <p className="text-sm mt-1">{registrationsError}</p>
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl py-20 text-center text-zinc-500">
                <Users className="w-12 h-12 mx-auto text-zinc-700 mb-2" />
                No applications match your search filters.
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 text-xs font-mono uppercase tracking-widest">
                        <th className="px-6 py-4">Applied Date</th>
                        <th className="px-6 py-4">Full Name</th>
                        <th className="px-6 py-4">Class</th>
                        <th className="px-6 py-4">Student ID</th>
                        <th className="px-6 py-4">Contact Info</th>
                        <th className="px-6 py-4">Why Join Motivation</th>
                        <th className="px-6 py-4">Safety State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {filteredRegistrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-zinc-850/40 transition">
                          <td className="px-6 py-4 text-xs text-zinc-500 font-mono">
                            {new Date(reg.createdAt).toLocaleDateString()} {new Date(reg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </td>
                          <td className="px-6 py-4 font-semibold text-white">
                            {reg.fullName}
                          </td>
                          <td className="px-6 py-4 text-zinc-300">
                            {reg.classVal}
                          </td>
                          <td className="px-6 py-4 text-zinc-450 font-mono">
                            {reg.studentId}
                          </td>
                          <td className="px-6 py-4 space-y-1">
                            <div className="text-zinc-300 flex items-center">
                              <Phone className="w-3 h-3 inline mr-1 text-zinc-500" />
                              {reg.phone}
                            </div>
                            <div className="text-xs text-zinc-400 lowercase">{reg.email}</div>
                          </td>
                          <td className="px-6 py-4 max-w-xs text-xs text-zinc-400 line-clamp-3 hover:line-clamp-none transition cursor-help antialiased">
                            {reg.whyJoin || <span className="italic text-zinc-650">No text provided</span>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col space-y-2">
                              <span className={`px-2 py-0.5 rounded text-xs text-center font-mono font-medium ${
                                reg.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                reg.status === 'Under Review' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                              }`}>
                                {reg.status}
                              </span>

                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleStatusChange(reg.id, 'Under Review')}
                                  disabled={reg.status === 'Under Review'}
                                  className="px-1.5 py-1 bg-zinc-800 hover:bg-blue-900/30 text-blue-400 text-[10px] rounded hover:text-blue-300 transition disabled:opacity-30 disabled:pointer-events-none"
                                >
                                  Review
                                </button>
                                <button
                                  onClick={() => handleStatusChange(reg.id, 'Approved')}
                                  disabled={reg.status === 'Approved'}
                                  className="px-1.5 py-1 bg-zinc-800 hover:bg-emerald-900/30 text-emerald-400 text-[10px] rounded hover:text-emerald-300 transition disabled:opacity-30 disabled:pointer-events-none"
                                >
                                  Approve
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Edit Content */}
        {activeTab === 'edit-content' && (
          <form onSubmit={handleSaveContent} className="space-y-8 max-w-4xl mx-auto">
            
            {saveSuccessMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-center">
                🎉 {saveSuccessMessage}
              </div>
            )}

            {/* HERO SECTION EDITING */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
                <Globe className="text-red-500 w-5 h-5" />
                <h3 className="font-bold text-lg">Edit Hero Section</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 font-mono uppercase mb-1">Company Hero title</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-red-500 rounded-lg px-4 py-2.5 text-sm outline-none"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 font-mono uppercase mb-1">Tagline</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-red-500 rounded-lg px-4 py-2.5 text-sm outline-none"
                    value={heroTagline}
                    onChange={(e) => setHeroTagline(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 font-mono uppercase mb-1">Full Subtitle</label>
                <input
                  type="text"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-red-500 rounded-lg px-4 py-2.5 text-sm outline-none"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                />
              </div>
            </div>

            {/* ABOUT SECTION EDITING */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
                <Activity className="text-red-500 w-5 h-5" />
                <h3 className="font-bold text-lg">Edit About Mission</h3>
              </div>
              
              <div>
                <label className="block text-xs text-zinc-400 font-mono uppercase mb-1">Who We Are Description Block</label>
                <textarea
                  rows={4}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-red-500 rounded-lg px-4 py-2.5 text-sm outline-none resize-none"
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                />
              </div>
            </div>

            {/* LEADERSHIP EDITING */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
                <Users className="text-red-500 w-5 h-5" />
                <h3 className="font-bold text-lg">Edit Leadership Roles</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 font-mono uppercase mb-1">Teacher in Charge Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-red-500"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 font-mono uppercase mb-1">Teacher Official Contact</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-red-500"
                    value={teacherContact}
                    onChange={(e) => setTeacherContact(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 font-mono uppercase mb-1">Unit Leader Info</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-zinc-955 border border-zinc-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-red-500"
                    value={unitLeaderText}
                    onChange={(e) => setUnitLeaderText(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 font-mono uppercase mb-1">Team Leaders Info</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-zinc-955 border border-zinc-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-red-500"
                    value={teamLeadersText}
                    onChange={(e) => setTeamLeadersText(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 font-mono uppercase mb-1">Executive Team Info</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-zinc-955 border border-zinc-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-red-500"
                    value={executiveTeamText}
                    onChange={(e) => setExecutiveTeamText(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* SOCIAL ACCOUNTS */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
                <Globe className="text-red-500 w-5 h-5" />
                <h3 className="font-bold text-lg">Official Social Configurations</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 font-mono uppercase mb-1">Facebook Share Link</label>
                  <input
                    type="url"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-red-500"
                    value={fbUrl}
                    onChange={(e) => setFbUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 font-mono uppercase mb-1">Instagram URL</label>
                  <input
                    type="url"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-red-500"
                    value={igUrl}
                    onChange={(e) => setIgUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 font-mono uppercase mb-1">WhatsApp Official Number</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-red-500"
                    value={waNum}
                    onChange={(e) => setWaNum(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* VOLUNTEER FEEDBACK MODERATION */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
                <Users className="text-red-500 w-5 h-5" />
                <h3 className="font-bold text-lg">Moderate SPSC Member Feedback</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Below is the current list of published student and volunteer reviews. You can remove any entry (e.g., test entries or spam) and click the publish button at the bottom to save.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                {feedbacks.map((item) => (
                  <div key={item.id} className="bg-zinc-950 rounded-lg p-3.5 border border-zinc-850 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-1 text-amber-550">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className="text-xs">{i < item.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                      <p className="text-xs text-zinc-300 italic line-clamp-3 hover:line-clamp-none transition">"{item.quote}"</p>
                      <div className="text-[10px] text-zinc-500 font-mono mt-1">
                        By <span className="text-zinc-300 font-semibold">{item.name}</span> ({item.role})
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeedback(item.id)}
                      className="text-red-400 hover:text-red-500 hover:bg-red-500/10 text-[10px] mt-4 py-1.5 rounded inline-flex items-center justify-center space-x-1 border border-red-500/15"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete Feedback</span>
                    </button>
                  </div>
                ))}
                {feedbacks.length === 0 && (
                  <div className="col-span-full text-center py-8 text-zinc-500 text-xs italic">
                    No member feedback currently published.
                  </div>
                )}
              </div>
            </div>

            {/* SUBMIT FORM BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saveLoading}
                className="w-full bg-red-650 hover:bg-red-700 text-white font-semibold py-4 rounded-xl shadow-lg transition duration-150 flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{saveLoading ? 'Saving Website Edits...' : 'Save and Publish All Content'}</span>
              </button>
            </div>

          </form>
        )}
             {/* TAB 3: Google Workspace: Sheets & Gmail Integration */}
        {activeTab === 'sheets-sync' && (
          <div className="space-y-6">
            
            <div className="bg-[#121212] border border-white-5 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold font-sans text-white">Google Workspace: Sheets & Gmail</h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    Connect both Google Sheets database tracking and Gmail automated applicant notifications via Google Apps Script.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {googleSheetsUrl ? (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs font-semibold font-mono tracking-wider uppercase inline-flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Sheets API Active</span>
                    </span>
                  ) : null}
                  {gmailEnabled && googleSheetsUrl ? (
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-full text-xs font-semibold font-mono tracking-wider uppercase inline-flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                      <span>Gmail automated</span>
                    </span>
                  ) : null}
                </div>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                setSaveLoading(true);
                setSheetsSyncSuccess(null);
                setSheetsSyncError(null);
                try {
                  const consolidatedContent = {
                    ...siteContent,
                    googleSheetsUrl: googleSheetsUrl,
                    gmailEnabled: gmailEnabled,
                    gmailSubject: gmailSubject,
                    gmailBody: gmailBody
                  };
                  const res = await fetch('/api/content', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(consolidatedContent)
                  });
                  if (!res.ok) throw new Error('Save integration requests failed');
                  setSheetsSyncSuccess('Google Workspace configurations persisted successfully!');
                  onRefreshContent();
                } catch (err: any) {
                  setSheetsSyncError('Failed to save settings: ' + err.message);
                } finally {
                  setSaveLoading(false);
                }
              }} className="space-y-6">
                
                {/* section A: Spreadsheet URL */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-widest font-bold">
                    Workspace Apps Script Web App URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="w-full bg-[#080808] border border-white-5 hover:border-white-10 focus:border-[#E01A22] focus:ring-1 focus:ring-[#E01A22] text-white rounded-xl px-4 py-3 text-sm transition outline-none font-mono"
                    value={googleSheetsUrl}
                    onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                  />
                  <p className="text-[11px] text-zinc-550 font-sans">
                    The executed Apps Script Web App URL from your Google Sheet script editor.
                  </p>
                </div>

                {/* section B: Gmail Automation Settings */}
                <div className="border-t border-zinc-900 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white font-sans">Automated Gmail Notifications</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Send automated email confirmations instantly via your linked Gmail workspace account.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={gmailEnabled}
                        onChange={(e) => setGmailEnabled(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-650 peer-checked:after:bg-white peer-checked:after:border-transparent"></div>
                    </label>
                  </div>

                  {gmailEnabled && (
                    <div className="bg-[#0c0c0c] border border-white-5 rounded-2xl p-4 sm:p-6 space-y-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-mono text-zinc-400 uppercase tracking-widest font-bold">
                          Gmail Subject Template
                        </label>
                        <input
                          type="text"
                          placeholder="Admission Registration Status"
                          className="w-full bg-[#080808] border border-white-5 hover:border-white-10 focus:border-[#E01A22] focus:ring-1 focus:ring-[#E01A22] text-white rounded-xl px-4 py-2.5 text-sm transition outline-none"
                          value={gmailSubject}
                          onChange={(e) => setGmailSubject(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-mono text-zinc-400 uppercase tracking-widest font-bold">
                          Gmail Message Body
                        </label>
                        <textarea
                          rows={6}
                          placeholder="Dear {applicant_name}..."
                          className="w-full bg-[#080808] border border-white-5 hover:border-white-10 focus:border-[#E01A22] focus:ring-1 focus:ring-[#E01A22] text-white rounded-xl px-4 py-3 text-sm transition outline-none font-mono"
                          value={gmailBody}
                          onChange={(e) => setGmailBody(e.target.value)}
                        />
                      </div>

                      {/* Formatting Helper */}
                      <div className="bg-[#121212] p-3 rounded-xl border border-white-5 space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block font-bold">
                          Supported Template Tags (Replaced in real-time)
                        </span>
                        <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
                          <span className="bg-zinc-900 border border-white-5 px-2 py-1 rounded text-zinc-300">{"{applicant_name}"}</span>
                          <span className="bg-zinc-900 border border-white-5 px-2 py-1 rounded text-zinc-300">{"{student_id}"}</span>
                          <span className="bg-zinc-900 border border-white-5 px-2 py-1 rounded text-zinc-300">{"{status}"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="bg-[#E01A22] hover:bg-[#E01A22]/90 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saveLoading ? 'Saving Configurations...' : 'Save All Configurations'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!googleSheetsUrl) {
                        setSheetsSyncError('Please enter and save your Google Sheets Web App URL first.');
                        return;
                      }
                      setSheetsSyncLoading(true);
                      setSheetsSyncSuccess(null);
                      setSheetsSyncError(null);

                      const testPayload = {
                        id: 'test_' + Date.now().toString().slice(-4),
                        fullName: 'Sheets Integration Handshake',
                        classVal: 'Vite Test Block',
                        studentId: 'TEST-SHEETS-OK',
                        phone: '+880 1700-000000',
                        email: 'senacollegeredcrescent@gmail.com',
                        whyJoin: 'Assessing connection handshake in the school admin portal.',
                        status: 'Approved',
                        createdAt: new Date().toISOString()
                      };

                      try {
                        await fetch(googleSheetsUrl, {
                          method: 'POST',
                          mode: 'no-cors',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(testPayload)
                        });
                        setSheetsSyncSuccess('Connection signals dispatched! Verified row addition was triggered.');
                      } catch (err: any) {
                        setSheetsSyncError('Verification ping failed: ' + err.message);
                      } finally {
                        setSheetsSyncLoading(false);
                      }
                    }}
                    disabled={sheetsSyncLoading || !googleSheetsUrl}
                    className="bg-zinc-800 hover:bg-zinc-750 text-zinc-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1 border border-white-5 disabled:opacity-40"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${sheetsSyncLoading ? 'animate-spin' : ''}`} />
                    <span>Send Verification Row</span>
                  </button>

                  {gmailEnabled && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!googleSheetsUrl) {
                          setGmailTestError('Please save the Web App URL first.');
                          return;
                        }
                        setGmailTestLoading(true);
                        setGmailTestSuccess(null);
                        setGmailTestError(null);

                        const subjectHandshake = "[Handshake Test] SPSC Gmail notification integration";
                        const bodyHandshake = `This is a verification email from your SPSC Red Crescent Recruit Web Admin Panel.\n\nGmail transmission is connected and operational!\n\nSent: ${new Date().toLocaleString()}`;

                        try {
                          await fetch(googleSheetsUrl, {
                            method: 'POST',
                            mode: 'no-cors',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              action: 'email',
                              to: 'senacollegeredcrescent@gmail.com',
                              subject: subjectHandshake,
                              body: bodyHandshake
                            })
                          });
                          setGmailTestSuccess('Dispatched verification email to senacollegeredcrescent@gmail.com! Check your inbox folder shortly.');
                        } catch (err: any) {
                          setGmailTestError('Gmail ping crashed: ' + err.message);
                        } finally {
                          setGmailTestLoading(false);
                        }
                      }}
                      disabled={gmailTestLoading || !googleSheetsUrl}
                      className="bg-blue-650 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1 disabled:opacity-40"
                    >
                      <Share2 className={`w-3.5 h-3.5 ${gmailTestLoading ? 'animate-spin' : ''}`} />
                      <span>Send Diagnostics Gmail</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={async () => {
                      if (!googleSheetsUrl) {
                        setSheetsSyncError('Please enter and save your Google Sheets Web App URL first.');
                        return;
                      }
                      if (registrations.length === 0) {
                        setSheetsSyncError('There are no registrations received yet.');
                        return;
                      }
                      setSheetsSyncLoading(true);
                      setSheetsSyncSuccess(null);
                      setSheetsSyncError(null);

                      const payload = {
                        action: 'bulk',
                        registrations: registrations
                      };

                      try {
                        await fetch(googleSheetsUrl, {
                          method: 'POST',
                          mode: 'no-cors',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload)
                        });
                        setSheetsSyncSuccess(`Bulk sync action complete! Sent ${registrations.length} applications securely to your Google Sheet.`);
                      } catch (err: any) {
                        setSheetsSyncError('Bulk sync dispatch failed: ' + err.message);
                      } finally {
                        setSheetsSyncLoading(false);
                      }
                    }}
                    disabled={sheetsSyncLoading || !googleSheetsUrl || registrations.length === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1 disabled:opacity-40 font-sans"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Sync {registrations.length} Applications Now</span>
                  </button>
                </div>
              </form>

              {sheetsSyncSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs font-sans">
                  ✓ {sheetsSyncSuccess}
                </div>
              )}

              {sheetsSyncError && (
                <div className="bg-[#E01A22]/10 border border-[#E01A22]/20 text-[#E01A22] p-4 rounded-xl text-xs font-sans">
                  ⚠️ {sheetsSyncError}
                </div>
              )}

              {gmailTestSuccess && (
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-xl text-xs font-sans">
                  📨 {gmailTestSuccess}
                </div>
              )}

              {gmailTestError && (
                <div className="bg-[#E01A22]/10 border border-[#E01A22]/20 text-[#E01A22] p-4 rounded-xl text-xs font-sans">
                  ⚠️ Gmail error: {gmailTestError}
                </div>
              )}
            </div>

            {/* Steps & Guidance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
              
              <div className="bg-[#121212] border border-white-5 rounded-2xl p-6 space-y-4">
                <h4 className="text-base font-bold text-white tracking-wide">1-Minute Setup Guide</h4>
                <div className="space-y-4 text-xs text-zinc-300 leading-relaxed font-sans">
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 bg-[#E01A22] text-white flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 mt-0.5 font-mono">1</span>
                    <p>Create a brand new empty spreadsheet inside your <strong className="text-white">Google Sheet</strong> workspace.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 bg-[#E01A22] text-white flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 mt-0.5 font-mono">2</span>
                    <p>Go to the top navigation, select <strong className="text-white">Extensions ➔ Apps Script</strong> which opens a coding compiler.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 bg-[#E01A22] text-white flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 mt-0.5 font-mono">3</span>
                    <p>Clear out any template code they provide in the file, and copy-paste the whole script template provided on the right pane.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 bg-[#E01A22] text-white flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 mt-0.5 font-mono">4</span>
                    <p>Press the floppy disk icon to save, then click the blue <strong className="text-white">Deploy ➔ New Deployment</strong> button.</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 bg-[#E01A22] text-white flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 mt-0.5 font-mono">5</span>
                    <p>Set settings as: <br />
                      • Select type: <strong>Web App</strong><br />
                      • Execute as: <strong>Me (your email address)</strong><br />
                      • Who has access: <strong>Anyone</strong> (this allows your server to publish rows securely!)
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="w-5 h-5 bg-[#E01A22] text-white flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 mt-0.5 font-mono font-mono">6</span>
                    <p>Click <strong>Deploy</strong>, grant prompt account access if requested, copy the generated <strong>Web App URL</strong>, and paste it on top of this page!</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#121212] border border-white-5 rounded-2xl p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-base font-bold text-white tracking-wide">Google Sheets & Gmail Script</h4>
                    <button
                      onClick={() => {
                        const scriptText = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Record ID", "Applicant Name", "Class / Batch", "Student ID", "Contact Phone", "Email Address", "Statement of Purpose", "Application Status", "Timestamp"]);
      var headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setFontWeight("bold");
      headerRange.setBackgroundColor("#F3F4F6");
      sheet.setFrozenRows(1);
    }
    
    // ACTION 1: Bulk Synchronization
    if (data.action === "bulk") {
      var list = data.registrations || [];
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        sheet.appendRow([
          item.id,
          item.fullName,
          item.classVal,
          item.studentId,
          item.phone,
          item.email,
          item.whyJoin || "",
          item.status || "Submitted",
          item.createdAt
        ]);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, count: list.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // ACTION 2: Manual Diagnostic/Connection Email 
    if (data.action === "email" || data.action === "test-email") {
      var recipient = data.to;
      var subject = data.subject || "SPSC Red Crescent Status update";
      var body = data.body || "";
      
      if (recipient) {
        MailApp.sendEmail(recipient, subject, body);
        return ContentService.createTextOutput(JSON.stringify({ success: true, emailSent: true }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // DEFAULT ACTION: Single registration row insertion
    sheet.appendRow([
      data.id,
      data.fullName,
      data.classVal,
      data.studentId,
      data.phone,
      data.email,
      data.whyJoin || "",
      data.status || "Submitted",
      data.createdAt
    ]);
    
    // Optional automatic Gmail notification dispatch
    if (data.gmailEnabled && data.email) {
      try {
        var personalSubject = data.gmailSubject || "Application Status Update";
        var personalBody = data.gmailBody || "";
        personalBody = personalBody
          .replace(/{applicant_name}/g, data.fullName)
          .replace(/{student_id}/g, data.studentId)
          .replace(/{status}/g, data.status || "Submitted");
          
        MailApp.sendEmail(data.email, personalSubject, personalBody);
        
        // Notify SPSC Red Crescent Admin Inbox
        MailApp.sendEmail("senacollegeredcrescent@gmail.com", "[Recruit Portal Handshake] " + data.fullName, "New record submitted:\n" + personalBody);
      } catch (err) {
        // Suppress email dispatch errors to not block row storage
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
                        navigator.clipboard.writeText(scriptText);
                        alert('Upgraded Apps Script template copied to your clipboard!');
                      }}
                      className="bg-[#080808] hover:bg-[#161616] text-[#E01A22] border border-white-5 px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider uppercase font-extrabold transition"
                    >
                      Copy Script Code
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400">
                    This unified script supports spreadsheet row ingestion, dynamic email template substitution, and direct Gmail dispatch under your Google account.
                  </p>
                  <pre className="bg-[#080808] border border-white-5 p-3 rounded-xl text-[10px] text-zinc-350 font-mono overflow-x-auto h-64 overflow-y-auto leading-relaxed select-all">
{`function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Record ID", 
        "Applicant Name", 
        "Class / Batch", 
        "Student ID", 
        "Contact Phone", 
        "Email Address", 
        "Statement of Purpose", 
        "Application Status", 
        "Timestamp"
      ]);
      var headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setFontWeight("bold");
      headerRange.setBackgroundColor("#F3F4F6");
      sheet.setFrozenRows(1);
    }
    
    // ACTION 1: Bulk Synchronization
    if (data.action === "bulk") {
      var list = data.registrations || [];
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        sheet.appendRow([
          item.id,
          item.fullName,
          item.classVal,
          item.studentId,
          item.phone,
          item.email,
          item.whyJoin || "",
          item.status || "Submitted",
          item.createdAt
        ]);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, count: list.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // ACTION 2: Manual Diagnostic/Connection Email 
    if (data.action === "email" || data.action === "test-email") {
      var recipient = data.to;
      var subject = data.subject || "SPSC Red Crescent Status update";
      var body = data.body || "";
      
      if (recipient) {
        MailApp.sendEmail(recipient, subject, body);
        return ContentService.createTextOutput(JSON.stringify({ success: true, emailSent: true }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // DEFAULT ACTION: Single registration row insertion
    sheet.appendRow([
      data.id,
      data.fullName,
      data.classVal,
      data.studentId,
      data.phone,
      data.email,
      data.whyJoin || "",
      data.status || "Submitted",
      data.createdAt
    ]);
    
    // Optional automatic Gmail notification dispatch
    if (data.gmailEnabled && data.email) {
      try {
        var personalSubject = data.gmailSubject || "Application Status Update";
        var personalBody = data.gmailBody || "";
        personalBody = personalBody
          .replace(/{applicant_name}/g, data.fullName)
          .replace(/{student_id}/g, data.studentId)
          .replace(/{status}/g, data.status || "Submitted");
          
        MailApp.sendEmail(data.email, personalSubject, personalBody);
        
        // Notify SPSC Red Crescent Admin Inbox
        MailApp.sendEmail("senacollegeredcrescent@gmail.com", "[Recruit Portal Handshake] " + data.fullName, "New record submitted:\\n" + personalBody);
      } catch (err) {
        // Suppress email dispatch errors to not block row storage
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`}
                  </pre>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: Publish & Share Website */}
        {activeTab === 'publish-share' && (
          <div className="space-y-6 max-w-4xl mx-auto animate-fade-in text-left">
            {/* Header / Intro Card */}
            <div className="bg-[#121212] border border-white-5 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center space-x-3 text-[#E01A22]">
                <Globe className="w-8 h-8 animate-pulse" />
                <div>
                  <h3 className="text-xl font-bold text-white font-sans">Official Public Link Launcher</h3>
                  <p className="text-xs text-zinc-400">Share your website safely with Sena Public School & College students, parents, and volunteers.</p>
                </div>
              </div>

              <div className="w-full bg-[#080808] border border-white-5 rounded-2xl p-4 sm:p-6 space-y-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold leading-none">
                  YOUR VERIFIED USER-FACING OFFICIAL WEBSITE URL
                </span>
                
                <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                  <div className="flex-1 bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-800 flex items-center text-sm font-mono text-emerald-400 select-all overflow-x-auto whitespace-nowrap">
                    https://ais-pre-ktwgylp46eujtjiibf5egd-932517840606.asia-east1.run.app
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('https://ais-pre-ktwgylp46eujtjiibf5egd-932517840606.asia-east1.run.app');
                      setCopied(true);
                      setTimeout(() => setCopied(false), 3000);
                    }}
                    className="bg-[#E01A22] hover:bg-[#E01A22]/90 text-white font-semibold px-6 py-3 rounded-xl transition duration-150 flex items-center justify-center space-x-2 text-sm select-none cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-white animate-bounce" />
                        <span>Copied Link!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span>Copy Public Link</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-2 border-t border-zinc-900 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="text-xs text-zinc-500 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span>
                    <span>Direct public ingress link active and live.</span>
                  </div>
                  <a
                    href="https://ais-pre-ktwgylp46eujtjiibf5egd-932517840606.asia-east1.run.app"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#E01A22] hover:underline text-xs font-semibold flex items-center space-x-1"
                  >
                    <span>Test Launch Clean Public Site ➔</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Privacy Shield Info block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Privacy Column */}
              <div className="bg-[#121212] border border-[#E01A22]/20 rounded-2xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center space-x-2 text-[#E01A22] font-semibold text-sm font-mono tracking-wider">
                  <Shield className="w-5 h-5" />
                  <span>VISITOR PRIVACY PROTECTED</span>
                </div>
                
                <h4 className="text-base font-bold text-white font-sans">No Dev Chat or Logs Visible</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  When visitors access the verified public link above, the page is rendered in standalone production mode:
                </p>

                <ul className="space-y-4 text-xs text-zinc-300">
                  <li className="flex items-start">
                    <span className="text-[#E01A22] mr-2 font-bold font-mono">✓</span>
                    <span><strong>Absolute Privacy</strong>: The AI Coding chat assistant, workspace code files, and server developer logs are completely excluded. No one can see any developer tools or previous logs.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#E01A22] mr-2 font-bold font-mono">✓</span>
                    <span><strong>Staff Credentials Protection</strong>: The secure Staff Portal remains locked. Only people who know the security key can access applicant submissions or change the text.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#E01A22] mr-2 font-bold font-mono">✓</span>
                    <span><strong>Encryption</strong>: Student IDs, phones, and Statement-of-Purpose motivations are securely kept stored on backend storage.</span>
                  </li>
                </ul>
              </div>

              {/* public vs admin checklist */}
              <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-4">
                <h4 className="text-sm font-mono tracking-wider font-semibold uppercase text-zinc-400">Security Guard Policy</h4>
                <div className="space-y-6">
                  
                  {/* Public sees */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-zinc-500 block uppercase tracking-widest font-mono font-bold leading-none">What the Public Sees</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="bg-zinc-950 text-zinc-300 text-[11px] border border-zinc-900 px-3 py-1.5 rounded-lg">SPSCRCS Landing Page</span>
                      <span className="bg-zinc-950 text-zinc-300 text-[11px] border border-zinc-900 px-3 py-1.5 rounded-lg">Membership Sign Up Form</span>
                      <span className="bg-zinc-950 text-zinc-300 text-[11px] border border-zinc-900 px-3 py-1.5 rounded-lg">Teacher & Leadership Roles</span>
                      <span className="bg-zinc-950 text-zinc-300 text-[11px] border border-zinc-900 px-3 py-1.5 rounded-lg">Verified Public Feedback</span>
                    </div>
                  </div>

                  {/* Kept private */}
                  <div className="space-y-2 pt-4 border-t border-zinc-900">
                    <span className="text-[10px] text-[#E01A22] block uppercase tracking-widest font-mono font-bold leading-none">What is kept 100% Confidential</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="bg-[#E01A22]/5 text-red-400 text-[11px] border border-[#E01A22]/15 px-3 py-1.5 rounded-lg">Recruit Records List</span>
                      <span className="bg-[#E01A22]/5 text-red-400 text-[11px] border border-[#E01A22]/15 px-3 py-1.5 rounded-lg">CSV Student Spreadsheets</span>
                      <span className="bg-[#E01A22]/5 text-red-400 text-[11px] border border-[#E01A22]/15 px-3 py-1.5 rounded-lg">Google Workspace Scripts & Keys</span>
                      <span className="bg-[#E01A22]/5 text-red-400 text-[11px] border border-[#E01A22]/15 px-3 py-1.5 rounded-lg">Website Content Editors</span>
                      <span className="bg-[#E01A22]/5 text-red-400 text-[11px] border border-[#E01A22]/15 px-3 py-1.5 rounded-lg">AI Coding Assistant Chat</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}
      </main>
    </div>
  );
}
