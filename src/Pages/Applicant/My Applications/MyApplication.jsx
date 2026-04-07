import React, { useEffect, useMemo, useState } from 'react';
import { Search, Eye, XCircle, Loader2, AlertCircle } from 'lucide-react';
import Sidebar from '../Components/Applicant Sidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import ApplicationDetailsModal from './ApplicationDetails';
import { api } from '../../../utils/api';

const statusStyles = {
	pending: 'bg-slate-100 text-slate-700',
	shortlisted: 'bg-blue-100 text-blue-700',
	test: 'bg-purple-100 text-purple-700',
	interview: 'bg-indigo-100 text-indigo-700',
	offer: 'bg-yellow-100 text-yellow-700',
	hired: 'bg-green-100 text-green-700',
	rejected: 'bg-red-100 text-red-700',
};

const formatDate = (dateString) => {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
};

const MyApplication = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [searchText, setSearchText] = useState('');
	const [activeQuery, setActiveQuery] = useState('');
	const [applications, setApplications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedApplication, setSelectedApplication] = useState(null);

	// Fetch applications from API
	useEffect(() => {
		const fetchApplications = async () => {
			try {
				setLoading(true);
				setError(null);
				const response = await api.getUserApplications();
				if (response.success) {
					setApplications(response.data || []);
				} else {
					setError('Failed to load applications');
				}
			} catch (err) {
				console.error('Error fetching applications:', err);
				setError(err.message || 'Failed to load applications');
			} finally {
				setLoading(false);
			}
		};

		fetchApplications();
	}, []);

	const filteredApplications = useMemo(() => {
		const query = activeQuery.trim().toLowerCase();

		if (!query) {
			return applications;
		}

		return applications.filter((application) => {
			return (
				application.jobId?.title?.toLowerCase().includes(query) ||
				application.jobId?.type?.toLowerCase().includes(query) ||
				application.jobId?.company?.toLowerCase().includes(query) ||
				application.jobId?.location?.toLowerCase().includes(query) ||
				application.status?.toLowerCase().includes(query)
			);
		});
	}, [activeQuery, applications]);

	const handleSearch = (event) => {
		event.preventDefault();
		setActiveQuery(searchText);
	};

	const handleWithdraw = async (applicationId) => {
		if (!window.confirm('Are you sure you want to withdraw this application?')) return;

		try {
			setError(null);
			const response = await api.request(`/applications/${applicationId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			if (response.success) {
				// Remove from local state
				setApplications(applications.filter(app => app._id !== applicationId));
				alert('Application withdrawn successfully');
			}
		} catch (err) {
			console.error('Error withdrawing application:', err);
			setError(err.message || 'Failed to withdraw application');
		}
	};

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
					activePage="applications"
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
							<h1 className="text-2xl lg:text-3xl font-bold">My Applications</h1>
							<p className="text-blue-100 mt-1">
								Track your job and internship applications in one place.
							</p>
						</section>

						<section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
							<div className="p-4 lg:p-6 border-b border-slate-100">
								<form
									onSubmit={handleSearch}
									className="flex flex-col sm:flex-row gap-3"
								>
									<div className="relative flex-1">
										<Search
											size={18}
											className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
										/>
										<input
											type="text"
											value={searchText}
											onChange={(event) => setSearchText(event.target.value)}
											placeholder="Search opportunity, company, location, or status"
											className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
										/>
									</div>
									<button
										type="submit"
										className="px-5 py-2.5 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800 transition-colors"
									>
										Search
									</button>
								</form>
							</div>

							{error && (
								<div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
									<AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
									<div>
										<p className="text-red-800 font-medium">Error</p>
										<p className="text-red-700 text-sm">{error}</p>
									</div>
								</div>
							)}

							<div className="overflow-x-auto">
								{loading ? (
									<div className="flex justify-center items-center py-12">
										<Loader2 className="animate-spin text-blue-600 mr-2" size={32} />
										<p className="text-slate-600">Loading applications...</p>
									</div>
								) : (
									<table className="w-full min-w-245 text-sm">
										<thead className="bg-slate-50 text-slate-600">
											<tr>
												<th className="text-left px-4 py-3 font-semibold">Opportunities</th>
												<th className="text-left px-4 py-3 font-semibold">Type</th>
												<th className="text-left px-4 py-3 font-semibold">Company</th>
												<th className="text-left px-4 py-3 font-semibold">Location</th>
												<th className="text-left px-4 py-3 font-semibold">Applied Date</th>
												<th className="text-left px-4 py-3 font-semibold">Status</th>
												<th className="text-left px-4 py-3 font-semibold">Actions</th>
											</tr>
										</thead>
										<tbody>
											{filteredApplications.length > 0 ? (
												filteredApplications.map((application) => (
													<tr
														key={application._id}
														className="border-t border-slate-100 hover:bg-slate-50/80"
													>
														<td className="px-4 py-3 font-medium text-slate-900">
															{application.jobId?.title || 'N/A'}
														</td>
														<td className="px-4 py-3 text-slate-700">{application.jobId?.type || 'N/A'}</td>
														<td className="px-4 py-3 text-slate-700">{application.jobId?.company || 'N/A'}</td>
														<td className="px-4 py-3 text-slate-700">{application.jobId?.location || 'N/A'}</td>
														<td className="px-4 py-3 text-slate-700">
															{formatDate(application.appliedDate)}
														</td>
														<td className="px-4 py-3">
															<span
															className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[application.interviewStep] || 'bg-slate-100 text-slate-700'}`}
														>
															{application.interviewStep || application.status}
															</span>
														</td>
														<td className="px-4 py-3">
															<div className="flex items-center gap-2">
																<button
																	type="button"
																	onClick={() => setSelectedApplication(application)}
																	className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors text-xs"
																>
																	<Eye size={15} />
																	View Details
																</button>
																<button
																	type="button"
																	onClick={() => handleWithdraw(application._id)}
																	className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-200 text-red-700 hover:bg-red-50 transition-colors text-xs"
																>
																	<XCircle size={15} />
																	Withdraw
																</button>
															</div>
														</td>
													</tr>
												))
											) : (
												<tr className="border-t border-slate-100">
													<td colSpan={7} className="px-4 py-10 text-center text-slate-500">
														{applications.length === 0 ? 'No applications yet. Start applying to opportunities!' : 'No applications found for your search.'}
													</td>
												</tr>
											)}
										</tbody>
									</table>
								)}
							</div>
						</section>
					</div>
				</main>
			</div>

			{selectedApplication && (
				<>
					<div
						className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
						onClick={() => setSelectedApplication(null)}
					>
						<div
							onClick={(e) => e.stopPropagation()}
						>
							<ApplicationDetailsModal
								application={selectedApplication}
								onClose={() => setSelectedApplication(null)}
							/>
						</div>
					</div>
				</>
			)}
		</div>
	);
};
export default MyApplication;
