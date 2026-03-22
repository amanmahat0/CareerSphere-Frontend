import React, { useState } from 'react';
import Sidebar from '../Components/Applicant Sidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import { Calendar } from 'lucide-react';

const InterviewSchedule = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mockInterviews = [
    { id: 1, role: 'Frontend Developer', company: 'Leapfrog Technology', date: '2026-03-20', time: '10:00 AM', type: 'Virtual', status: 'Scheduled' },
    { id: 2, role: 'UI/UX Designer', company: 'Yomari', date: '2026-03-22', time: '2:00 PM', type: 'In-Person', status: 'Scheduled' },
    { id: 3, role: 'Data Analyst', company: 'Verisk Nepal', date: '2026-03-25', time: '3:30 PM', type: 'Virtual', status: 'Scheduled' },
  ];

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
                Track your upcoming interviews and prepare accordingly.
              </p>
            </section>

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
                      <th className="text-left px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockInterviews.length > 0 ? (
                      mockInterviews.map((interview) => (
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
                            <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-700">
                              {interview.status}
                            </span>
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default InterviewSchedule;
