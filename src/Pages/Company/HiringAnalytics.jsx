import { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardHeader from '../../../Components/DashboardHeader';
import CompanySidebar from '../Components/CompanySidebar';
import { api } from '../../../utils/api';

export default function HiringAnalytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getCompanyAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-slate-50">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} userRole="Company" />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const STAGE_COLORS = {
    Applied:     '#3B82F6',
    Shortlisted: '#8B5CF6',
    Test:        '#06B6D4',
    Interview:   '#F59E0B',
    Offer:       '#22C55E',
    Hired:       '#10B981',
    Rejected:    '#EF4444',
  };

  const funnelData = analytics ? [
    { step: 'Applied',     count: analytics.totalApplications },
    { step: 'Shortlisted', count: analytics.byStep.shortlisted },
    { step: 'Test',        count: analytics.byStep.test },
    { step: 'Interview',   count: analytics.byStep.interview },
    { step: 'Offer',       count: analytics.byStep.offer },
    { step: 'Hired',       count: analytics.byStep.hired },
  ] : [];

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {/* Header */}
      <DashboardHeader
        onMenuClick={() => setSidebarOpen(true)}
        userRole="Company"
        dashboardPath="/company/dashboard"
        profilePath="/company/profile"
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <CompanySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="analytics" />

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 lg:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Page header */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Hiring Analytics</h1>
              <p className="text-slate-600 mt-1">View your hiring funnel and recruitment metrics</p>
            </div>

            {/* Error alert */}
            {error && (
              <div className="border border-red-200 bg-red-50 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Stats Cards */}
            {analytics && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                    <p className="text-xs font-medium text-slate-500 mb-2">Total Applications</p>
                    <p className="text-3xl font-bold text-slate-900">{analytics.totalApplications}</p>
                    <p className="text-xs text-slate-600 mt-2">All time</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                    <p className="text-xs font-medium text-slate-500 mb-2">Shortlist Rate</p>
                    <p className="text-3xl font-bold" style={{ color: STAGE_COLORS.Shortlisted }}>{analytics.shortlistedRate.toFixed(1)}%</p>
                    <p className="text-xs text-slate-600 mt-2">{analytics.byStep.shortlisted} shortlisted</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                    <p className="text-xs font-medium text-slate-500 mb-2">Test Pass Rate</p>
                    <p className="text-3xl font-bold" style={{ color: STAGE_COLORS.Test }}>{analytics.testPassRate.toFixed(1)}%</p>
                    <p className="text-xs text-slate-600 mt-2">Of test takers</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                    <p className="text-xs font-medium text-slate-500 mb-2">Interview to Offer</p>
                    <p className="text-3xl font-bold" style={{ color: STAGE_COLORS.Interview }}>{analytics.interviewToOfferRate.toFixed(1)}%</p>
                    <p className="text-xs text-slate-600 mt-2">Move to offer stage</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                    <p className="text-xs font-medium text-slate-500 mb-2">Offer Acceptance Rate</p>
                    <p className="text-3xl font-bold" style={{ color: STAGE_COLORS.Hired }}>{analytics.offerAcceptanceRate.toFixed(1)}%</p>
                    <p className="text-xs text-slate-600 mt-2">{analytics.byStep.hired} accepted</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                    <p className="text-xs font-medium text-slate-500 mb-2">Avg Time to Hire</p>
                    <p className="text-3xl font-bold text-slate-900">{analytics.avgTimeToHireInDays.toFixed(0)}</p>
                    <p className="text-xs text-slate-600 mt-2">Days from application</p>
                  </div>
                </div>

                {/* Funnel Chart */}
                <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Hiring Funnel</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={funnelData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="step" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {funnelData.map((entry) => (
                            <Cell key={entry.step} fill={STAGE_COLORS[entry.step] || '#3B82F6'} />
                          ))}
                        </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Conversion Rates */}
                <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Pipeline Summary</h2>
                  <div className="space-y-3">
                    {[
                      { label: 'Shortlisted', count: analytics.byStep.shortlisted, hex: STAGE_COLORS.Shortlisted },
                      { label: 'Test',        count: analytics.byStep.test,        hex: STAGE_COLORS.Test },
                      { label: 'Interview',   count: analytics.byStep.interview,   hex: STAGE_COLORS.Interview },
                      { label: 'Offer',       count: analytics.byStep.offer,       hex: STAGE_COLORS.Offer },
                      { label: 'Hired',       count: analytics.byStep.hired,       hex: STAGE_COLORS.Hired },
                      { label: 'Rejected',    count: analytics.byStep.rejected,    hex: STAGE_COLORS.Rejected },
                    ].map((stage) => {
                      const pct = analytics.totalApplications
                        ? Math.round((stage.count / analytics.totalApplications) * 100)
                        : 0;
                      return (
                        <div key={stage.label} className="flex items-center gap-3">
                          <span
                            className="w-20 shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold text-center"
                            style={{ backgroundColor: stage.hex + '20', color: stage.hex }}
                          >
                            {stage.label}
                          </span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, backgroundColor: stage.hex }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-slate-800 w-8 text-right shrink-0">
                            {stage.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
