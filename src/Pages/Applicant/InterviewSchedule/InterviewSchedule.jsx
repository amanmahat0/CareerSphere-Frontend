import React, { useState, useEffect } from 'react';
import Sidebar from '../Components/Applicant Sidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import { Calendar, Loader2 } from 'lucide-react';
import { api } from '../../../utils/api';

const InterviewSchedule = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch interview data
  const fetchInterviews = async () => {
    try {
      const response = await api.getUserApplications();
      if (response.success && response.data) {
        // Filter applications that have interview scheduled
        const scheduled = response.data
          .filter(app => app.interviewDate && app.interviewStep !== 'shortlisted')
          .map(app => ({
            id: app._id,
            role: app.jobId?.title || 'N/A',
            company: app.jobId?.company || 'N/A',
            date: app.interviewDate ? new Date(app.interviewDate).toLocaleDateString() : 'N/A',
            time: app.interviewTime || 'TBA',
            type: app.interviewType === 'online' ? 'Virtual' : 'In-Person',
            meetingLink: app.meetingLink || null,
            location: app.interviewLocation || null,
            step: app.interviewStep,
            status: app.interviewStatus,
          }));
        setInterviews(scheduled);
      }
    } catch (err) {
      console.error('Error fetching interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();

    // Poll for real-time updates every 30 seconds
    const interval = setInterval(fetchInterviews, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
      <DashboardHeader
        onMenuClick={() => setSidebarOpen(true)}
        userRole="Applicant"
        dashboardPath="/applicant/dashboard"
        profilePath="/applicant/profile"
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePage="interviews"
        />

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <section className="bg-blue-900 rounded-xl p-6 text-white shadow-md">
              <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
                <Calendar className="w-8 h-8" />
                Interview Schedule
              </h1>
              <p className="text-blue-100 mt-1">
                Track your upcoming interviews and prepare accordingly. (Auto-updates every 30 seconds)
              </p>
            </section>

            {loading ? (
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-center justify-center min-h-64">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="text-slate-600">Loading interviews...</p>
                </div>
              </section>
            ) : (
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold">Role</th>
                        <th className="text-left px-4 py-3 font-semibold">Company</th>
                        <th className="text-left px-4 py-3 font-semibold">Date</th>
                        <th className="text-left px-4 py-3 font-semibold">Time</th>
                        <th className="text-left px-4 py-3 font-semibold">Type</th>
                        <th className="text-left px-4 py-3 font-semibold">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interviews.length > 0 ? (
                        interviews.map((interview) => (
                          <tr
                            key={interview.id}
                            className="border-t border-slate-100 hover:bg-slate-50/80"
                          >
                            <td className="px-4 py-3 font-medium text-slate-900">{interview.role}</td>
                            <td className="px-4 py-3 text-slate-700">{interview.company}</td>
                            <td className="px-4 py-3 text-slate-700">{interview.date}</td>
                            <td className="px-4 py-3 text-slate-700">{interview.time}</td>
                            <td className="px-4 py-3 text-slate-700">{interview.type}</td>
                            <td className="px-4 py-3">
                              <div className="space-y-1 text-xs">
                                {interview.meetingLink && (
                                  <a
                                    href={interview.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline block"
                                  >
                                    Join Meeting Link
                                  </a>
                                )}
                                {interview.location && (
                                  <div className="text-slate-600">{interview.location}</div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-t border-slate-100">
                          <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                            No interviews scheduled yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default InterviewSchedule;
