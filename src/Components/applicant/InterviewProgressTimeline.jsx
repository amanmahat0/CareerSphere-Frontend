import React, { useState } from "react";
import {
  Check,
  AlertCircle,
  Clock,
  MapPin,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  Gift,
  Trophy,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { api } from "../../utils/api";
import { toast } from "../../utils/toast";
import {
  formatTestType,
  formatDeadlineCountdown,
  formatInterviewCountdown,
  formatSalary,
  formatDate,
  formatTime,
  buildGoogleCalendarUrl,
  getStepStatus,
  shouldShowStepContent,
  formatWithdrawnStatus,
  formatRejectedStatus,
  getStatusSectionName,
} from "../../utils/interviewFormatters";

const InterviewProgressTimeline = ({ application, onUpdate }) => {
  const [offerNotes, setOfferNotes] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [modalState, setModalState] = useState(null); // "accept" | "reject" | "negotiate" | null
  // FIX 8: Negotiation form state
  const [negotiateForm, setNegotiateForm] = useState({ salary: '', joiningDate: '', notes: '' });

  const steps = [
    { name: "pending", label: "Pending", icon: "" },
    { name: "shortlisted", label: "Shortlisted", icon: "" },
    { name: "test", label: "Test", icon: "" },
    { name: "interview", label: "Interview", icon: "" },
    { name: "offer", label: "Offer", icon: "" },
    { name: "hired", label: "Hired", icon: "" },
  ];

  const currentStep = application?.interviewStep || "pending";
  const statusMap = {
    shortlisted: "blue",
    test: "amber",
    interview: "purple",
    offer: "green",
    hired: "green",
  };

  const getStepColor = (step) => {
    const status = getStepStatus(step.name, currentStep, application?.testResult, application?.skippedSteps, application);
    if (status === "completed") return "green";
    if (status === "active") return statusMap[step.name] || "blue";
    if (status === "skipped") return "gray";
    return "gray";
  };

  const handleOfferResponse = async (response) => {
    setLoadingAction(true);
    try {
      const result = await api.respondToOfferWithNegotiation(application._id, {
        offerResponse: response,
        offerResponseNotes: offerNotes,
      });

      if (result.success) {
        setModalState(null);
        setOfferNotes("");
        if (onUpdate) onUpdate(result.data);
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoadingAction(false);
    }
  };

  // FIX 8: Handle negotiation submission
  const handleNegotiate = async () => {
    if (!negotiateForm.notes.trim() && !negotiateForm.salary) {
      toast.error("Please enter a proposed salary or note.");
      return;
    }
    setLoadingAction(true);
    try {
      const result = await api.negotiateOffer(application._id, {
        offerResponseNotes:     negotiateForm.notes,
        counterOfferSalary:     negotiateForm.salary ? Number(negotiateForm.salary) : undefined,
        counterOfferJoiningDate: negotiateForm.joiningDate || undefined,
        counterOfferMessage:    negotiateForm.notes,
      });
      if (result.success) {
        setModalState(null);
        setNegotiateForm({ salary: '', joiningDate: '', notes: '' });
        if (onUpdate) onUpdate(result.data);
        toast.success("Counter-offer sent!");
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoadingAction(false);
    }
  };

  // Render step card
  const renderStepCard = (step) => {
    const status = getStepStatus(step.name, currentStep, application?.testResult, application?.skippedSteps, application);
    const showContent = shouldShowStepContent(step.name, currentStep);

    // Hide pending step if applicant has moved beyond pending
    if (step.name === "pending" && currentStep !== "pending") {
      return null;
    }

    return (
      <div key={step.name} className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-16 w-1 h-12 bg-gray-300"></div>

        {/* Step card */}
        <div
          className={`ml-20 pb-8 ${
            status === "active"
              ? "border-l-4 border-blue-500 pl-4"
              : "pl-4"
          }`}
        >
          {/* Step header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-white ${
                status === "completed"
                  ? "bg-green-600"
                  : status === "active"
                  ? `bg-${getStepColor(step)}-600`
                  : status === "skipped"
                  ? "bg-slate-400"
                  : "bg-gray-300"
              }`}
            >
              {status === "completed" ? (
                <Check size={20} />
              ) : status === "skipped" ? (
                <AlertCircle size={18} />
              ) : (
                steps.indexOf(step) + 1
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {step.label}
              </h3>
              {status === "active" && (
                <span className="text-sm text-blue-600 font-medium">Active</span>
              )}
              {status === "skipped" && (
                <span className="text-sm text-slate-500 font-medium">Skipped by company</span>
              )}
            </div>
          </div>

          {/* Skipped step card */}
          {status === "skipped" && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={16} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-600">
                  This step was skipped
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  The company moved you directly to the next stage without completing this step.
                </p>
              </div>
            </div>
          )}

          {/* Step content */}
          {showContent && status !== "pending" && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              {step.name === "shortlisted" && (
                <div className="space-y-2">
                  <p className="text-gray-700">
                    Your application has been shortlisted by{" "}
                    <span className="font-semibold">
                      {application?.jobId?.company}
                    </span>
                    .
                  </p>
                  <p className="text-sm text-gray-500">
                    Updated: {formatDate(application?.updatedDate, "short")}
                  </p>
                </div>
              )}

              {step.name === "test" && (
                <div className="space-y-4">
                  {application?.testResult === "skip" ? (
                    <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-3 rounded">
                      <AlertCircle size={18} />
                      <span>Test skipped by company</span>
                    </div>
                  ) : (
                    <>
                      {status === "active" && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Test Type
                            </label>
                            <p className="text-gray-900 font-semibold">
                              {formatTestType(application?.testType)}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            {application?.testMode === "online" && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                                Online
                              </span>
                            )}
                            {application?.testMode === "offline" && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                                In-person
                              </span>
                            )}
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Deadline
                            </label>
                            <p className="text-gray-900">
                              {formatDate(application?.testDeadline, "short")}
                            </p>
                            <p className="text-sm text-amber-600 font-medium">
                              {formatDeadlineCountdown(application?.testDeadline)}
                            </p>
                          </div>

                          {application?.testMode === "online" &&
                            application?.testLink && (
                              <a
                                href={application.testLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                <LinkIcon size={16} />
                                Open test platform
                              </a>
                            )}

                          {application?.testMode === "offline" &&
                            application?.testLocation && (
                              <div className="flex items-start gap-2 text-gray-700">
                                <MapPin size={16} className="mt-1" />
                                <div>
                                  <p className="text-sm font-medium">Venue</p>
                                  <p>{application.testLocation}</p>
                                </div>
                              </div>
                            )}

                          {application?.testSubmittedAt && (
                            <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded">
                              <CheckCircle2 size={18} />
                              <span>
                                Submitted on{" "}
                                {formatDate(application.testSubmittedAt, "short")}
                              </span>
                            </div>
                          )}
                        </>
                      )}

                      {status === "completed" && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Result
                            </label>
                            <div className="mt-2 flex items-center gap-2">
                              {application?.testResult === "pass" ? (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-1">
                                  <Check size={14} />
                                  Passed
                                </span>
                              ) : application?.testResult === "fail" ? (
                                <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full flex items-center gap-1">
                                  <XCircle size={14} />
                                  Did not pass
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full flex items-center gap-1">
                                  <AlertCircle size={14} />
                                  Step was skipped
                                </span>
                              )}
                            </div>
                          </div>

                          {application?.testFeedback && (
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                              <p className="text-sm font-medium text-blue-900 mb-2">
                                Feedback from company:
                              </p>
                              <p className="text-gray-700 whitespace-pre-wrap">
                                {application.testFeedback}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {step.name === "interview" && (
                <div className="space-y-4">
                  {status === "active" && (
                    <>
                      <div className="flex gap-2">
                        {application?.interviewType === "online" && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                            Online
                          </span>
                        )}
                        {application?.interviewType === "offline" && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                            In-person
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Date &amp; Time
                        </label>
                        <p className="text-gray-900 font-semibold">
                          {formatDate(application?.interviewDate, "long")}
                        </p>
                        <p className="text-gray-700">
                          {formatTime(application?.interviewTime)}
                        </p>
                        <p className="text-sm text-purple-600 font-medium">
                          {formatInterviewCountdown(application?.interviewDate)}
                        </p>
                      </div>

                      {application?.interviewType === "online" &&
                        application?.meetingLink && (
                          <div className="space-y-2">
                            <a
                              href={application.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                            >
                              <LinkIcon size={16} />
                              Join meeting
                            </a>
                            <p className="text-sm text-gray-600">
                              Link: {application.meetingLink}
                            </p>
                          </div>
                        )}

                      {application?.interviewType === "offline" &&
                        application?.interviewLocation && (
                          <div className="flex items-start gap-2 text-gray-700">
                            <MapPin size={16} className="mt-1" />
                            <div>
                              <p className="text-sm font-medium">Venue</p>
                              <p>{application.interviewLocation}</p>
                            </div>
                          </div>
                        )}

                      {buildGoogleCalendarUrl(application) && (
                        <a
                          href={buildGoogleCalendarUrl(application)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          <Calendar size={16} />
                          Add to Google Calendar
                        </a>
                      )}
                    </>
                  )}

                  {status === "completed" && (
                    <>
                      {application?.interviewResult === "selected" && (
                        <div className="bg-green-50 border border-green-200 p-4 rounded">
                          <p className="text-green-800 font-medium">
                            You have been selected for the next round
                          </p>
                        </div>
                      )}

                      {application?.interviewResult === "rejected" && (
                        <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                          <p className="text-gray-700 font-medium">
                            Thank you for interviewing with us
                          </p>
                        </div>
                      )}

                      {application?.interviewFeedback && (
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                          <p className="text-sm font-medium text-blue-900 mb-2">
                            Interviewer feedback:
                          </p>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {application.interviewFeedback}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {step.name === "offer" && (() => {
                const BURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
                const contractUrl = application?.contractFile
                  ? (application.contractFile.startsWith('/uploads') ? `${BURL}${application.contractFile}` : application.contractFile)
                  : null;

                return (
                  <div className="space-y-4">
                    <h4 className="text-base font-bold text-gray-900">Job Offer Contract</h4>

                    {/* Contract viewer */}
                    {contractUrl ? (
                      <div className="space-y-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                          <iframe
                            src={contractUrl}
                            title="Offer Contract"
                            className="w-full"
                            style={{ height: '360px' }}
                          />
                        </div>
                        <a
                          href={contractUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 border border-blue-200 rounded-lg px-4 py-2 hover:bg-blue-50 transition"
                        >
                          <LinkIcon size={14} /> Open / Download Contract
                        </a>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
                        <Clock size={18} className="text-amber-600 shrink-0" />
                        <p className="text-sm text-amber-800">The company hasn't uploaded the contract yet. You'll be notified once it's ready.</p>
                      </div>
                    )}

                    {/* Actions */}
                    {application?.offerResponse === "pending" && contractUrl && (
                      <div className="space-y-3 border-t pt-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Note (optional)</label>
                          <textarea
                            value={offerNotes}
                            onChange={(e) => setOfferNotes(e.target.value)}
                            placeholder="Add any questions or notes..."
                            maxLength={500}
                            rows={2}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setModalState("accept")}
                            disabled={loadingAction}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            {loadingAction && modalState === "accept" && <Loader2 size={14} className="animate-spin" />}
                            Accept Offer
                          </button>
                          <button
                            onClick={() => setModalState("reject")}
                            disabled={loadingAction}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            {loadingAction && modalState === "reject" && <Loader2 size={14} className="animate-spin" />}
                            Decline Offer
                          </button>
                        </div>
                      </div>
                    )}

                    {application?.offerResponse === "accepted" && (
                      <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                        <CheckCircle2 size={18} /><span className="font-semibold text-sm">You accepted this offer</span>
                      </div>
                    )}

                    {application?.offerResponse === "rejected" && (
                      <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <XCircle size={18} /><span className="font-semibold text-sm">You declined this offer</span>
                      </div>
                    )}

                    {application?.offerResponseNotes && (
                      <div className="bg-white p-3 rounded border border-gray-200 text-sm">
                        <p className="text-gray-500 mb-1">Your note:</p>
                        <p className="text-gray-800">{application.offerResponseNotes}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {step.name === "hired" && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <Trophy size={28} className="text-green-600" />
                      <h4 className="text-xl font-bold text-green-800">
                        Congratulations! You have been hired.
                      </h4>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Start Date
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(application?.startDate, "long")}
                      </p>
                    </div>

                    {application?.hiringSummary && (
                      <div className="mt-4 bg-white p-4 rounded border border-green-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Note from the company:
                        </p>
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {application.hiringSummary}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {showContent && status === "pending" && (
            <p className="text-gray-500 text-sm italic">Awaiting this step...</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Interview Progress</h2>

      <div className="space-y-4">
        {steps.map((step) => renderStepCard(step))}

        {/* Withdrawn Section */}
        {currentStep === "withdrawn" && (
          <div className="relative">
            <div className="ml-20 pb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full font-bold text-white bg-orange-600">
                  <XCircle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Withdrawn</h3>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-orange-200 p-6 shadow-sm">
                <div className="flex items-start gap-3 bg-orange-50 p-4 rounded">
                  <AlertCircle className="text-orange-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-orange-900 font-medium">Application Withdrawn</p>
                    {application?.withdrawalReason && (
                      <p className="text-sm text-orange-700 mt-1">{application.withdrawalReason}</p>
                    )}
                    <p className="text-xs text-orange-600 mt-2">
                      Withdrawn on: {formatDate(application?.updatedDate, "long")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rejected Section */}
        {currentStep === "rejected" && (
          <div className="relative">
            <div className="ml-20 pb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full font-bold text-white bg-red-600">
                  <XCircle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Rejected</h3>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-red-200 p-6 shadow-sm">
                <div className="flex items-start gap-3 bg-red-50 p-4 rounded">
                  <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-red-900 font-medium">Application Rejected</p>
                    {application?.rejectionReason && (
                      <p className="text-sm text-red-700 mt-1">{application.rejectionReason}</p>
                    )}
                    <p className="text-xs text-red-600 mt-2">
                      Rejected on: {formatDate(application?.updatedDate, "long")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalState === "accept" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Accept Offer</h3>
            <p className="text-gray-700 mb-6">
              By accepting this offer, you confirm you will join on{" "}
              <span className="font-semibold">
                {formatDate(application?.joiningDate, "long")}
              </span>
              . Is this correct?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalState(null)}
                disabled={loadingAction}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleOfferResponse("accepted")}
                disabled={loadingAction}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loadingAction ? <Loader2 size={16} className="animate-spin" /> : null}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {modalState === "reject" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Decline Offer</h3>
            <p className="text-gray-700 mb-4">Are you sure you want to decline this offer?</p>
            <div className="flex gap-3">
              <button onClick={() => setModalState(null)} disabled={loadingAction}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleOfferResponse("rejected")} disabled={loadingAction}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                {loadingAction && <Loader2 size={16} className="animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIX 8: Negotiate modal */}
      {modalState === "negotiate" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <MessageSquare size={18} className="text-amber-500" /> Counter-Offer
            </h3>
            <p className="text-sm text-gray-500 mb-4">Propose your preferred terms. The company will review and respond.</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Proposed Salary ({application?.currency || 'NPR'})</label>
                <input
                  type="number"
                  value={negotiateForm.salary}
                  onChange={e => setNegotiateForm(p => ({ ...p, salary: e.target.value }))}
                  placeholder={`e.g. ${application?.salary || ''}`}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Preferred Joining Date</label>
                <input
                  type="date"
                  value={negotiateForm.joiningDate}
                  onChange={e => setNegotiateForm(p => ({ ...p, joiningDate: e.target.value }))}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Note to Company *</label>
                <textarea
                  value={negotiateForm.notes}
                  onChange={e => setNegotiateForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Explain your counter-offer..."
                  rows={3}
                  maxLength={500}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-sm"
                />
                <p className="text-xs text-gray-400 mt-0.5">{negotiateForm.notes.length}/500</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setModalState(null)} disabled={loadingAction}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleNegotiate} disabled={loadingAction || (!negotiateForm.salary && !negotiateForm.notes.trim())}
                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                {loadingAction && <Loader2 size={16} className="animate-spin" />}
                Send Counter-Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewProgressTimeline;
