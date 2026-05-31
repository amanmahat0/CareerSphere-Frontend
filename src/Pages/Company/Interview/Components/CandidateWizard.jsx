import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import {
  ArrowLeft, Check, CheckCircle, XCircle, Loader2, AlertTriangle,
  Clock, User, Plus, Trash2, ChevronLeft, ChevronRight, Send, MessageSquare, RotateCcw, Bell, Download,
} from 'lucide-react';
import { api } from '../../../../utils/api';
import { toast } from '../../../../utils/toast';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const STEPS = [
  { key: 'shortlisted', label: 'Review' },
  { key: 'test',        label: 'Test' },
  { key: 'interview',   label: 'Interview' },
  { key: 'offer',       label: 'Offer' },
  { key: 'hired',       label: 'Hired' },
];
const STEP_IDX = Object.fromEntries(STEPS.map((s, i) => [s.key, i]));
const STEP_ORDER = STEPS.map(s => s.key);
const CURRENCIES = ['NPR', 'USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'SGD'];

const inputCls = (err) =>
  `w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
    err ? 'border-red-400 focus:border-red-400 bg-red-50/30' : 'border-slate-200 focus:border-blue-500'
  }`;

const Label = ({ children, required }) => (
  <label className="block text-xs font-bold text-slate-700 mb-1">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const ResultBtn = ({ active, color, icon: Icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
      active
        ? color === 'blue' ? 'border-blue-500 bg-blue-50' : 'border-red-500 bg-red-50'
        : 'border-slate-200 hover:border-slate-300'
    }`}
  >
    <Icon
      size={20}
      className={active ? (color === 'blue' ? 'text-blue-600' : 'text-red-600') : 'text-slate-400'}
    />
    <span className={`font-semibold text-sm ${active ? (color === 'blue' ? 'text-blue-700' : 'text-red-700') : 'text-slate-600'}`}>
      {label}
    </span>
  </button>
);

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

// ─────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────
function StepBar({ activeIdx, terminatedStep }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < activeIdx && !terminatedStep;
        const isActive    = idx === activeIdx && !terminatedStep;
        const isFuture    = idx > activeIdx && !terminatedStep;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                isCompleted ? 'bg-green-500 text-white'
                  : isActive ? 'bg-blue-900 text-white shadow-md shadow-blue-900/30'
                  : terminatedStep ? 'bg-red-200 text-red-600'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {isCompleted ? <Check size={14} /> : idx + 1}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap hidden sm:block ${
                isActive ? 'text-blue-900' : isCompleted ? 'text-green-600' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 sm:mx-2 rounded-full transition-all ${
                idx < activeIdx && !terminatedStep ? 'bg-green-400' : 'bg-slate-200'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}


// ─────────────────────────────────────────────
// STEP 1: Review (shortlisted)
// ─────────────────────────────────────────────
function StepReview({ candidate, onMoveToStep, loading }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Candidate Review</h3>
        <p className="text-sm text-slate-500">
          Review this applicant and choose the next step in the hiring pipeline.
        </p>
      </div>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 grid grid-cols-2 gap-3 text-sm">
        <div><span className="text-xs text-slate-500 font-medium block">Name</span><span className="font-semibold text-slate-900">{candidate.userId?.fullname}</span></div>
        <div><span className="text-xs text-slate-500 font-medium block">Email</span><span className="text-slate-700">{candidate.userId?.email}</span></div>
        <div><span className="text-xs text-slate-500 font-medium block">Position</span><span className="text-slate-700">{candidate.jobId?.title}</span></div>
        <div><span className="text-xs text-slate-500 font-medium block">Applied On</span><span className="text-slate-700">{formatDate(candidate.appliedDate)}</span></div>
      </div>

      <div>
        <p className="text-xs font-bold text-slate-700 mb-3">Choose next step</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { value: 'test',      label: 'Assign Test',       desc: 'Send a written or skill test first' },
            { value: 'interview', label: 'Schedule Interview', desc: 'Go directly to interview' },
            { value: 'offer',     label: 'Send Offer',         desc: 'Skip to offer stage' },
            { value: 'hired',     label: 'Mark as Hired',      desc: 'Directly confirm this candidate' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => onMoveToStep(opt.value)}
              disabled={loading}
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group disabled:opacity-50"
            >
              <div className="font-semibold text-sm text-slate-900 group-hover:text-blue-800">{opt.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 2: Test
// ─────────────────────────────────────────────
function StepTest({ candidate, onUpdate, loading, setLoading, setError }) {
  // Determine sub-state
  const hasAssigned  = !!candidate.testDeadline;
  const hasResult    = !!candidate.testResult;

  // FIX 3: Deadline status
  const now = new Date();
  const deadline = candidate.testDeadline ? new Date(candidate.testDeadline) : null;
  const hoursUntilDeadline = deadline ? (deadline - now) / 3600000 : null;
  const isDeadlineNear     = hoursUntilDeadline !== null && hoursUntilDeadline > 0 && hoursUntilDeadline < 48;
  const isDeadlinePassed   = deadline && now > deadline;
  const { testOverdue }    = candidate;

  // Test assignment form state
  const [assignForm, setAssignForm] = useState({
    testType:     candidate.testType     || 'skill_assessment',
    description:  candidate.description  || '',
    testDeadline: candidate.testDeadline ? candidate.testDeadline.split('T')[0] : '',
    testMode:     candidate.testMode     || 'online',
    testLink:     candidate.testLink     || '',
    testLocation: candidate.testLocation || '',
  });

  // Test evaluation form state
  const [evalForm, setEvalForm] = useState({
    testResult:   candidate.testResult   || 'pass',
    testFeedback: candidate.testFeedback || '',
  });

  const handleAssign = async () => {
    if (!assignForm.testDeadline) { setError('Please select a deadline'); return; }
    setLoading(true);
    try {
      const res = await api.updateInterviewStep(candidate._id, {
        interviewStep:  'test',
        interviewStatus:'in progress',
        testType:       assignForm.testType,
        description:    assignForm.description,
        testDeadline:   new Date(assignForm.testDeadline).toISOString(),
        testMode:       assignForm.testMode,
        testLink:       assignForm.testMode === 'online'  ? assignForm.testLink     : null,
        testLocation:   assignForm.testMode === 'offline' ? assignForm.testLocation : null,
      });
      if (res.success) { onUpdate(res.data); toast.success('Test assigned!'); }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const res = await api.updateInterviewStep(candidate._id, {
        testResult:      evalForm.testResult,
        testFeedback:    evalForm.testFeedback,
        interviewStatus: 'completed',
      });
      if (res.success) {
        evalForm.testResult === 'pass'
          ? toast.success('Test passed! Moving to Interview.')
          : toast.error('Test failed. Candidate will be rejected.');
        onUpdate(res.data);
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // Result summary
  if (hasResult) {
    const passed = candidate.testResult === 'pass';
    return (
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800">Test Result</h3>
        <div className={`rounded-xl border p-4 flex items-start gap-3 ${passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {passed ? <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" /> : <XCircle size={20} className="text-red-600 shrink-0 mt-0.5" />}
          <div>
            <p className={`font-semibold text-sm ${passed ? 'text-green-800' : 'text-red-800'}`}>{passed ? 'Test Passed' : 'Test Failed'}</p>
            <p className="text-xs text-slate-600 mt-1">{candidate.testFeedback}</p>
          </div>
        </div>
        {passed && (
          <p className="text-sm text-slate-500">Candidate is now moved to the Interview stage. Proceed to Step 3.</p>
        )}
      </div>
    );
  }

  // Evaluation form (test assigned, awaiting result)
  if (hasAssigned) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 mb-1">Evaluate Test</h3>
          <div className="text-xs text-slate-500 space-y-0.5">
            <p>Type: <span className="font-medium text-slate-700 capitalize">{candidate.testType?.replace('_', ' ')}</span></p>
            <p>Deadline: <span className="font-medium text-slate-700">{formatDate(candidate.testDeadline)}</span></p>
            {candidate.testLink && <p>Link: <a href={candidate.testLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{candidate.testLink}</a></p>}
          </div>
        </div>

        {/* FIX 3: Deadline banners */}
        {testOverdue && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle size={14} className="text-red-600 mt-0.5 shrink-0" />
            <p className="text-xs text-red-700"><span className="font-semibold">Test overdue (7+ days)</span> — applicant has not submitted. Consider rejecting or extending.</p>
          </div>
        )}
        {!testOverdue && isDeadlinePassed && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <Clock size={14} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700"><span className="font-semibold">Deadline has passed.</span> {candidate.testSubmittedAt ? `Submitted on ${formatDate(candidate.testSubmittedAt)}.` : 'No submission confirmed yet.'}</p>
          </div>
        )}
        {!isDeadlinePassed && isDeadlineNear && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <Clock size={14} className="text-yellow-600 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-700"><span className="font-semibold">Deadline approaching</span> — less than 48 hours remaining.</p>
          </div>
        )}

        {/* FIX 4: Test submission info */}
        {candidate.testSubmittedAt && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700"><span className="font-semibold">Submitted on</span> {formatDate(candidate.testSubmittedAt)} — ready for evaluation.</p>
          </div>
        )}
        {isDeadlinePassed && !candidate.testSubmittedAt && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-xs text-slate-600 italic">No submission confirmed by the applicant.</p>
          </div>
        )}

        <div>
          <Label>Result</Label>
          <div className="grid grid-cols-2 gap-3">
            <ResultBtn active={evalForm.testResult === 'pass'} color="blue" icon={CheckCircle} label="Pass" onClick={() => setEvalForm(p => ({ ...p, testResult: 'pass' }))} />
            <ResultBtn active={evalForm.testResult === 'fail'} color="red"  icon={XCircle}     label="Fail" onClick={() => setEvalForm(p => ({ ...p, testResult: 'fail' }))} />
          </div>
        </div>

        <div>
          <Label required>Feedback</Label>
          <textarea
            value={evalForm.testFeedback}
            onChange={e => setEvalForm(p => ({ ...p, testFeedback: e.target.value }))}
            placeholder="Feedback on test performance..."
            rows={3}
            className={inputCls(false) + ' resize-none'}
          />
        </div>

        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Complete Evaluation
        </button>
      </div>
    );
  }

  // Assign form
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Assign Test</h3>
        <p className="text-sm text-slate-500">Set up the test details for {candidate.userId?.fullname}.</p>
      </div>

      <div>
        <Label>Test Type</Label>
        <select
          value={assignForm.testType}
          onChange={e => setAssignForm(p => ({ ...p, testType: e.target.value }))}
          className={inputCls(false)}
        >
          <option value="skill_assessment">Skill Assessment</option>
          <option value="coding_test">Coding Test</option>
          <option value="aptitude_test">Aptitude Test</option>
        </select>
      </div>

      <div>
        <Label>Description</Label>
        <textarea
          value={assignForm.description}
          onChange={e => setAssignForm(p => ({ ...p, description: e.target.value }))}
          placeholder="e.g. React assessment, 2 hours duration"
          rows={3}
          className={inputCls(false) + ' resize-none'}
        />
      </div>

      <div>
        <Label required>Deadline</Label>
        <input
          type="date"
          value={assignForm.testDeadline}
          onChange={e => setAssignForm(p => ({ ...p, testDeadline: e.target.value }))}
          min={new Date().toISOString().split('T')[0]}
          className={inputCls(!assignForm.testDeadline)}
        />
      </div>

      <div>
        <Label>Mode</Label>
        <div className="flex gap-4">
          {['online', 'offline'].map(m => (
            <label key={m} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 capitalize">
              <input type="radio" name="testMode" value={m} checked={assignForm.testMode === m}
                onChange={e => setAssignForm(p => ({ ...p, testMode: e.target.value }))}
                className="w-4 h-4" />
              {m}
            </label>
          ))}
        </div>
      </div>

      {assignForm.testMode === 'online' && (
        <div>
          <Label>Test Link</Label>
          <input type="url" value={assignForm.testLink}
            onChange={e => setAssignForm(p => ({ ...p, testLink: e.target.value }))}
            placeholder="https://..." className={inputCls(false)} />
        </div>
      )}
      {assignForm.testMode === 'offline' && (
        <div>
          <Label>Location</Label>
          <input type="text" value={assignForm.testLocation}
            onChange={e => setAssignForm(p => ({ ...p, testLocation: e.target.value }))}
            placeholder="e.g. Office Room 201" className={inputCls(false)} />
        </div>
      )}

      <button onClick={handleAssign} disabled={loading}
        className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
        {loading && <Loader2 size={14} className="animate-spin" />}
        Assign Test
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 3: Interview (FIX 7: multi-round support)
// ─────────────────────────────────────────────
function StepInterview({ candidate, onUpdate, loading, setLoading, setError }) {
  const currentRound = candidate.interviewRound || 1;
  const hasScheduled = !!candidate.interviewDate;
  const hasResult    = !!candidate.interviewResult;
  const [showRoundChoice, setShowRoundChoice] = useState(false);

  const [schedForm, setSchedForm] = useState({
    interviewType:     candidate.interviewType     || 'online',
    interviewDate:     candidate.interviewDate     ? candidate.interviewDate.split('T')[0] : '',
    interviewTime:     candidate.interviewTime     || '',
    meetingLink:       candidate.meetingLink       || '',
    interviewLocation: candidate.interviewLocation || '',
    notes:             candidate.interviewNotes    || '',
  });
  const [conflicts, setConflicts] = useState([]);

  const [resultForm, setResultForm] = useState({
    result:       candidate.interviewResult || 'selected',
    feedback:     candidate.interviewFeedback || '',
    interviewers: candidate.interviewers || [{ name: '', feedback: '' }],
  });

  // Conflict check
  useEffect(() => {
    if (!schedForm.interviewDate || !schedForm.interviewTime) return;
    const t = setTimeout(async () => {
      try {
        const res = await api.getScheduleForDate(schedForm.interviewDate);
        if (res.success) {
          const [h] = schedForm.interviewTime.split(':');
          const hour = parseInt(h);
          setConflicts(res.data?.filter(s => {
            const sh = new Date(s.interviewDate).getHours();
            return sh === hour && s.applicationId !== candidate._id;
          }) || []);
        }
      } catch (_) {}
    }, 500);
    return () => clearTimeout(t);
  }, [schedForm.interviewDate, schedForm.interviewTime]);

  const handleSchedule = async () => {
    if (!schedForm.interviewDate) { setError('Please select a date'); return; }
    if (!schedForm.interviewTime) { setError('Please enter a time'); return; }
    if (schedForm.interviewType === 'online'  && !schedForm.meetingLink.trim())       { setError('Please enter the meeting link'); return; }
    if (schedForm.interviewType === 'offline' && !schedForm.interviewLocation.trim()) { setError('Please enter the location'); return; }
    setLoading(true);
    try {
      const res = await api.scheduleInterview(candidate._id, {
        interviewType:     schedForm.interviewType,
        interviewDate:     new Date(schedForm.interviewDate).toISOString(),
        interviewTime:     schedForm.interviewTime,
        meetingLink:       schedForm.interviewType === 'online'  ? schedForm.meetingLink       : '',
        interviewLocation: schedForm.interviewType === 'offline' ? schedForm.interviewLocation : '',
        notes:             schedForm.notes,
      });
      if (res.success) {
        onUpdate(res.data);
        toast.success(`Round ${currentRound} scheduled!`);
        // Show cross-applicant conflict warning if any returned
        if (res.conflicts?.length) {
          toast.error(`Warning: ${candidate.userId?.fullname} has ${res.conflicts.length} other interview(s) near this time.`);
        }
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // FIX 7: Validate before showing round choice
  const handleResult = () => {
    if (resultForm.result === 'selected') {
      setShowRoundChoice(true);
    } else {
      submitResult('rejected');
    }
  };

  const getValidInterviewers = () => resultForm.interviewers.filter(iv => iv.name && iv.feedback);

  // FIX 7: Move to Offer
  const handleMoveToOffer = async () => {
    setLoading(true);
    try {
      const res = await api.updateInterviewStep(candidate._id, {
        interviewResult:   'selected',
        interviewFeedback: resultForm.feedback,
        interviewStatus:   'completed',
        interviewers:      getValidInterviewers(),
      });
      if (res.success) {
        toast.success('Interview passed! Moving to Offer.');
        onUpdate(res.data);
        setShowRoundChoice(false);
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // FIX 7: Add another round
  const handleAddRound = async () => {
    setLoading(true);
    try {
      const res = await api.updateInterviewStep(candidate._id, {
        interviewStep:     'interview',
        interviewStatus:   'pending',
        interviewRound:    currentRound + 1,
        interviewResult:   '',
        interviewFeedback: resultForm.feedback,
        interviewDate:     null,
        interviewTime:     '',
        meetingLink:       '',
        interviewLocation: '',
        interviewers:      getValidInterviewers(),
      });
      if (res.success) {
        toast.success(`Round ${currentRound + 1} started. Schedule the next interview.`);
        onUpdate(res.data);
        setShowRoundChoice(false);
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const submitResult = async (result) => {
    setLoading(true);
    try {
      const res = await api.updateInterviewStep(candidate._id, {
        interviewResult:   result,
        interviewFeedback: resultForm.feedback,
        interviewStatus:   'completed',
        interviewers:      getValidInterviewers(),
      });
      if (res.success) {
        toast.error('Interview rejected. Candidate will be rejected.');
        onUpdate(res.data);
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const addInterviewer    = () => setResultForm(p => ({ ...p, interviewers: [...p.interviewers, { name: '', feedback: '' }] }));
  const removeInterviewer = (i) => setResultForm(p => ({ ...p, interviewers: p.interviewers.filter((_, j) => j !== i) }));
  const updateInterviewer = (i, field, val) => setResultForm(p => {
    const arr = [...p.interviewers]; arr[i] = { ...arr[i], [field]: val }; return { ...p, interviewers: arr };
  });

  // Result summary
  if (hasResult) {
    const passed = candidate.interviewResult === 'selected';
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Interview Result</h3>
          {currentRound > 1 && (
            <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Round {currentRound}</span>
          )}
        </div>
        <div className={`rounded-xl border p-4 flex items-start gap-3 ${passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {passed ? <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" /> : <XCircle size={20} className="text-red-600 shrink-0 mt-0.5" />}
          <div>
            <p className={`font-semibold text-sm ${passed ? 'text-green-800' : 'text-red-800'}`}>{passed ? 'Selected' : 'Not Selected'}</p>
            <p className="text-xs text-slate-600 mt-1">{candidate.interviewFeedback}</p>
          </div>
        </div>
        {passed && <p className="text-sm text-slate-500">Candidate moved to the Offer stage. Proceed to Step 4.</p>}
      </div>
    );
  }

  // Result recording form
  if (hasScheduled) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Record Interview Result</h3>
          {currentRound > 1 && (
            <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Round {currentRound}</span>
          )}
        </div>
        <div className="text-xs text-slate-500 space-y-0.5">
          <p>Date: <span className="font-medium text-slate-700">{formatDate(candidate.interviewDate)}</span> at <span className="font-medium text-slate-700">{candidate.interviewTime}</span></p>
          <p>Type: <span className="font-medium text-slate-700 capitalize">{candidate.interviewType}</span></p>
          {candidate.meetingLink && <p>Link: <a href={candidate.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{candidate.meetingLink}</a></p>}
          {candidate.interviewLocation && <p>Location: <span className="font-medium text-slate-700">{candidate.interviewLocation}</span></p>}
        </div>

        {/* FIX 7: Previous rounds list */}
        {candidate.interviews?.length > 1 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-xs font-bold text-slate-600 mb-2">Previous Rounds</p>
            <div className="space-y-1">
              {candidate.interviews.slice(0, -1).map((iv, i) => (
                <div key={i} className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px] shrink-0">{iv.round}</span>
                  <span>{formatDate(iv.date)}</span>
                  {iv.result && <span className={`font-semibold ${iv.result === 'selected' ? 'text-green-600' : 'text-red-600'}`}>· {iv.result}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label>Overall Result</Label>
          <div className="grid grid-cols-2 gap-3">
            <ResultBtn active={resultForm.result === 'selected'} color="blue" icon={CheckCircle} label="Selected"     onClick={() => setResultForm(p => ({ ...p, result: 'selected' }))} />
            <ResultBtn active={resultForm.result === 'rejected'} color="red"  icon={XCircle}     label="Not Selected" onClick={() => setResultForm(p => ({ ...p, result: 'rejected' }))} />
          </div>
        </div>

        <div>
          <Label>Overall Feedback <span className="text-slate-400 font-normal">(optional)</span></Label>
          <textarea value={resultForm.feedback} onChange={e => setResultForm(p => ({ ...p, feedback: e.target.value }))}
            placeholder="Overall interview feedback..." rows={3}
            className={inputCls(false) + ' resize-none'} />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2"><User size={14} /> Interviewer Feedback <span className="text-xs font-normal text-slate-400">(optional)</span></h4>
            <button type="button" onClick={addInterviewer}
              className="text-xs font-medium text-blue-700 hover:text-blue-800 flex items-center gap-1 px-2 py-1 hover:bg-blue-100 rounded-lg">
              <Plus size={12} /> Add
            </button>
          </div>
          <div className="space-y-3">
            {resultForm.interviewers.map((iv, i) => (
              <div key={i} className="bg-white rounded-lg p-3 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600">Interviewer {i + 1}</span>
                  {resultForm.interviewers.length > 1 && (
                    <button type="button" onClick={() => removeInterviewer(i)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={12} /></button>
                  )}
                </div>
                <input type="text" value={iv.name} onChange={e => updateInterviewer(i, 'name', e.target.value)}
                  placeholder="Interviewer name" className={inputCls(false) + ' mb-2'} />
                <textarea value={iv.feedback} onChange={e => updateInterviewer(i, 'feedback', e.target.value)}
                  placeholder="Feedback from this interviewer..." rows={2}
                  className={inputCls(false) + ' resize-none'} />
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleResult} disabled={loading}
          className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
          {loading && <Loader2 size={14} className="animate-spin" />}
          Complete Interview
        </button>

        {/* FIX 7: Round choice modal */}
        {showRoundChoice && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600" /> Interview Passed — What's next?
              </h3>
              <p className="text-sm text-slate-500 mb-5">
                Round <span className="font-semibold">{currentRound}</span> completed for {candidate.userId?.fullname}.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddRound}
                  disabled={loading}
                  className="flex-1 py-3 border-2 border-blue-200 rounded-xl text-sm font-semibold text-blue-800 hover:bg-blue-50 transition-colors flex flex-col items-center gap-1 disabled:opacity-50"
                >
                  <Plus size={18} />
                  Add Round {currentRound + 1}
                </button>
                <button
                  onClick={handleMoveToOffer}
                  disabled={loading}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-sm font-semibold text-white transition-colors flex flex-col items-center gap-1 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                  Move to Offer
                </button>
              </div>
              <button onClick={() => setShowRoundChoice(false)} className="w-full mt-3 py-2 text-xs text-slate-500 hover:text-slate-700">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Schedule form
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">Schedule Interview</h3>
          <p className="text-sm text-slate-500">Set up the interview for {candidate.userId?.fullname}.</p>
        </div>
        {currentRound > 1 && (
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full shrink-0">Round {currentRound}</span>
        )}
      </div>

      {conflicts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-lg flex gap-2">
          <AlertTriangle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-800">
            <p className="font-semibold mb-1">Schedule conflict — {conflicts.length} interview(s) at this time</p>
            {conflicts.map((c, i) => <p key={i}>• {c.userId?.fullname} – {c.jobId?.title}</p>)}
          </div>
        </div>
      )}

      <div>
        <Label>Interview Type</Label>
        <div className="flex gap-4">
          {[['online', 'Online'], ['offline', 'In-Person']].map(([v, l]) => (
            <label key={v} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
              <input type="radio" name="itype" value={v} checked={schedForm.interviewType === v}
                onChange={e => setSchedForm(p => ({ ...p, interviewType: e.target.value }))} className="w-4 h-4" />
              {l}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required>Date</Label>
          <input type="date" value={schedForm.interviewDate}
            onChange={e => setSchedForm(p => ({ ...p, interviewDate: e.target.value }))}
            min={new Date().toISOString().split('T')[0]}
            className={inputCls(!schedForm.interviewDate)} />
        </div>
        <div>
          <Label required>Time</Label>
          <input type="time" value={schedForm.interviewTime}
            onChange={e => setSchedForm(p => ({ ...p, interviewTime: e.target.value }))}
            className={inputCls(!schedForm.interviewTime)} />
        </div>
      </div>

      {schedForm.interviewType === 'online' && (
        <div>
          <Label required>Meeting Link</Label>
          <input type="url" value={schedForm.meetingLink}
            onChange={e => setSchedForm(p => ({ ...p, meetingLink: e.target.value }))}
            placeholder="https://zoom.us/... or https://meet.google.com/..."
            className={inputCls(!schedForm.meetingLink)} />
        </div>
      )}
      {schedForm.interviewType === 'offline' && (
        <div>
          <Label required>Location</Label>
          <input type="text" value={schedForm.interviewLocation}
            onChange={e => setSchedForm(p => ({ ...p, interviewLocation: e.target.value }))}
            placeholder="e.g. Conference Room A"
            className={inputCls(!schedForm.interviewLocation)} />
        </div>
      )}

      <div>
        <Label>Notes (Optional)</Label>
        <textarea value={schedForm.notes} onChange={e => setSchedForm(p => ({ ...p, notes: e.target.value }))}
          placeholder="Any additional instructions..." rows={2}
          className={inputCls(false) + ' resize-none'} />
      </div>

      <button onClick={handleSchedule} disabled={loading}
        className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
        {loading && <Loader2 size={14} className="animate-spin" />}
        Schedule Interview
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 4: Offer — contract upload only
// ─────────────────────────────────────────────
const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const resolveContract = (url) => !url ? null : url.startsWith('/uploads') ? `${BACKEND_URL}${url}` : url;

function StepOffer({ candidate, onUpdate, loading, setLoading, setError }) {
  const hasSent     = !!candidate.contractFile && candidate.interviewStatus === 'offer_sent';
  const offerStatus = candidate.offerStatus || 'pending';

  const [contractFile, setContractFile] = useState(null);
  const [nudgeSending, setNudgeSending] = useState(false);
  const fileRef = React.useRef(null);

  const contractUrl = resolveContract(candidate.contractFile);

  const handleUploadAndSend = async () => {
    if (!contractFile) { setError('Please select a contract PDF to upload'); return; }
    setLoading(true);
    try {
      const res = await api.sendOfferContract(candidate._id, contractFile);
      if (res.success) { onUpdate(res.data); toast.success('Contract uploaded and offer sent!'); setContractFile(null); }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleNudge = async () => {
    setNudgeSending(true);
    try {
      await api.nudgeOffer(candidate._id);
      toast.success('Reminder sent to applicant.');
    } catch (e) { toast.error(e.message || 'Failed to send reminder'); }
    finally { setNudgeSending(false); }
  };

  // Offer accepted
  if (candidate.offerResponse === 'accepted') {
    return (
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800">Offer Accepted</h3>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-green-800">{candidate.userId?.fullname} accepted the offer</p>
            <p className="text-xs text-slate-500 mt-1">Proceed to Step 5 to confirm the hire.</p>
          </div>
        </div>
        {contractUrl && (
          <a href={contractUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 border border-blue-200 rounded-xl px-4 py-2.5 hover:bg-blue-50 transition">
            <Download size={14} /> View / Download Contract
          </a>
        )}
      </div>
    );
  }

  // Offer declined
  if (candidate.offerResponse === 'rejected') {
    return (
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800">Offer Declined</h3>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <XCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-red-800">{candidate.userId?.fullname} declined the offer</p>
            {candidate.offerResponseNotes && <p className="text-xs text-slate-600 mt-1">Note: {candidate.offerResponseNotes}</p>}
          </div>
        </div>
      </div>
    );
  }

  // Awaiting response (offer already sent)
  if (hasSent) {
    return (
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800">Offer Sent</h3>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Clock size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-amber-800">Awaiting applicant response</p>
            <p className="text-xs text-amber-700 mt-1">
              The contract has been shared with <strong>{candidate.userId?.fullname}</strong>. They can view it and respond from their dashboard.
            </p>
          </div>
        </div>
        {contractUrl && (
          <a href={contractUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 border border-blue-200 rounded-xl px-4 py-2.5 hover:bg-blue-50 transition">
            <Download size={14} /> View / Download Contract
          </a>
        )}
        <button type="button" onClick={handleNudge} disabled={nudgeSending}
          className="w-full py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2 disabled:opacity-50">
          {nudgeSending ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
          Send Reminder to Applicant
        </button>
      </div>
    );
  }

  // Upload contract form
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Upload Job Offer Contract</h3>
        <p className="text-sm text-slate-500">Upload the signed offer letter / contract as a PDF. The applicant will be able to view it and respond.</p>
      </div>

      <div
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${contractFile ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
      >
        <Download size={28} className={`mx-auto mb-2 ${contractFile ? 'text-blue-600' : 'text-slate-300'}`} />
        {contractFile ? (
          <>
            <p className="text-sm font-semibold text-blue-800">{contractFile.name}</p>
            <p className="text-xs text-slate-400 mt-1">{(contractFile.size / 1024).toFixed(0)} KB — click to change</p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-600">Click to select contract PDF</p>
            <p className="text-xs text-slate-400 mt-1">PDF only · max 20 MB</p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={e => { if (e.target.files?.[0]) setContractFile(e.target.files[0]); }}
        />
      </div>

      <button onClick={handleUploadAndSend} disabled={loading || !contractFile}
        className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
        {loading && <Loader2 size={14} className="animate-spin" />}
        Upload Contract &amp; Send Offer
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 5: Hired
// ─────────────────────────────────────────────
function StepHired({ candidate, onUpdate, loading, setLoading, setError }) {
  const isConfirmed = !!candidate.startDate;
  const [startDate, setStartDate]         = useState(candidate.startDate ? new Date(candidate.startDate).toISOString().split('T')[0] : '');
  const [hiringSummary, setHiringSummary] = useState(candidate.hiringSummary || '');

  const handleConfirm = async () => {
    if (!startDate) { setError('Please select a start date'); return; }
    setLoading(true);
    try {
      const res = await api.confirmHire(candidate._id, { startDate, hiringSummary });
      if (res.success) { onUpdate(res.data); toast.success('🎉 Candidate successfully hired!'); }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  if (isConfirmed) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center py-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{candidate.userId?.fullname} is Hired!</h3>
          <p className="text-sm text-slate-500 mt-1">Start date: <span className="font-semibold">{formatDate(candidate.startDate)}</span></p>
          {candidate.hiringSummary && <p className="text-sm text-slate-600 mt-2 max-w-sm">{candidate.hiringSummary}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Confirm Hiring</h3>
        <p className="text-sm text-slate-500">Finalize the hire for {candidate.userId?.fullname}.</p>
      </div>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-1.5 text-sm">
        <div><span className="font-semibold text-slate-600">Position: </span>{candidate.jobId?.title}</div>
        {candidate.contractFile && (
          <a href={resolveContract(candidate.contractFile)} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-900 text-xs font-semibold">
            <Download size={12} /> View Contract
          </a>
        )}
      </div>

      <div>
        <Label required>Start Date</Label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className={inputCls(!startDate)} />
      </div>

      <div>
        <Label>Welcome Note</Label>
        <textarea value={hiringSummary} onChange={e => setHiringSummary(e.target.value)}
          placeholder="e.g. We're excited to have you! Please report to HR on day one."
          rows={3} className={inputCls(false) + ' resize-none'} />
      </div>

      <button onClick={handleConfirm} disabled={loading}
        className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
        {loading && <Loader2 size={14} className="animate-spin" />}
        Confirm Hire
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Wizard wrapper
// ─────────────────────────────────────────────
export default function CandidateWizard({ candidate, onUpdate, onBack }) {
  const [local, setLocal]           = useState(candidate);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [showRevert, setShowRevert] = useState(false);
  const [revertReason, setRevertReason] = useState('');
  // FIX 1: Revoke hire
  const [showRevokeHire, setShowRevokeHire]   = useState(false);
  const [revokeHireReason, setRevokeHireReason] = useState('');
  // FIX 2: Skip confirmation
  const [skipConfirm, setSkipConfirm] = useState(null); // { targetStep, skippedSteps[] }
  const socketRef = useRef(null);

  useEffect(() => { setLocal(candidate); setError(''); }, [candidate._id]);

  // FIX 11: Socket listener for pipeline updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    let userId = localStorage.getItem('userId');
    if (!userId) {
      try { userId = JSON.parse(localStorage.getItem('user') || '{}')._id; } catch (_) {}
    }
    if (!token || !userId) return;

    const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
    const socket = io(socketUrl, { auth: { token, userId }, reconnection: true });
    socketRef.current = socket;

    socket.on('connect', () => socket.emit('join-notifications', userId));
    socket.on('pipeline_update', (payload) => {
      if (String(payload.applicationId) === String(candidate._id)) {
        setLocal(prev => ({ ...prev, ...payload }));
      }
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [candidate._id]);

  const handleUpdate = (data) => { setLocal(data); onUpdate(data); setError(''); };

  const activeIdx = STEP_IDX[local.interviewStep] ?? 0;
  const isTerminated = local.interviewStep === 'rejected' || local.status === 'rejected' || local.status === 'withdrawn';

  const prevStepKey = () => {
    const i = STEP_ORDER.indexOf(local.interviewStep);
    return i > 0 ? STEP_ORDER[i - 1] : null;
  };

  // FIX 2: Detect skip before moving to a step
  const handleMoveToStep = (nextStep) => {
    const fromIdx = STEP_ORDER.indexOf(local.interviewStep);
    const toIdx   = STEP_ORDER.indexOf(nextStep);
    if (toIdx > fromIdx + 1) {
      const skipped = STEP_ORDER.slice(fromIdx + 1, toIdx);
      setSkipConfirm({ targetStep: nextStep, skippedSteps: skipped });
      return;
    }
    doMoveToStep(nextStep);
  };

  const doMoveToStep = async (nextStep) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.updateInterviewStep(local._id, { interviewStep: nextStep });
      if (res.success) { handleUpdate(res.data); toast.success(`Moved to ${nextStep}`); }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleRevert = async () => {
    if (!revertReason.trim()) { setError('Please enter a reason'); return; }
    const prev = prevStepKey();
    if (!prev) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.updateInterviewStep(local._id, { interviewStep: prev, revertReason });
      if (res.success) {
        handleUpdate(res.data);
        toast.success(`Reverted to ${prev}`);
        setShowRevert(false);
        setRevertReason('');
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // FIX 1: Revoke hire
  const handleRevokeHire = async () => {
    if (!revokeHireReason.trim()) { setError('Please enter a reason'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.revokeHire(local._id, revokeHireReason.trim());
      if (res.success) {
        handleUpdate(res.data);
        toast.success('Hire revoked. Candidate moved back to Offer step.');
        setShowRevokeHire(false);
        setRevokeHireReason('');
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const stepProps = { candidate: local, onUpdate: handleUpdate, loading, setLoading, setError };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Back button */}
      <div className="px-4 py-2 border-b border-slate-100 shrink-0">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={14} /> Back to List
        </button>
      </div>

      {/* Step indicator */}
      <StepBar activeIdx={activeIdx} terminatedStep={isTerminated} />

      {/* Error banner */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
          <AlertTriangle size={14} className="shrink-0" /> {error}
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {isTerminated ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-10">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle size={28} className="text-red-600" />
            </div>
            <p className="text-base font-bold text-slate-700">
              {local.status === 'withdrawn' ? 'Application Withdrawn' : 'Candidate Rejected'}
            </p>
            <p className="text-sm text-slate-500 max-w-xs">
              {local.status === 'withdrawn'
                ? 'The applicant has withdrawn this application.'
                : `Rejection reason: ${local.interviewFeedback || 'No reason provided'}`}
            </p>
          </div>
        ) : activeIdx === 0 ? (
          <StepReview   candidate={local} onMoveToStep={handleMoveToStep} loading={loading} />
        ) : activeIdx === 1 ? (
          <StepTest     {...stepProps} />
        ) : activeIdx === 2 ? (
          <StepInterview {...stepProps} />
        ) : activeIdx === 3 ? (
          <StepOffer    {...stepProps} />
        ) : (
          <StepHired    {...stepProps} />
        )}
      </div>

      {/* Footer actions */}
      {!isTerminated && (
        <div className="border-t border-slate-100 px-6 py-3 flex items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2">
            {/* Revert step (steps 1-3, not hired) */}
            {activeIdx > 0 && activeIdx < 4 && (
              <button onClick={() => setShowRevert(true)} disabled={loading}
                className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">
                <ChevronLeft size={13} /> Revert Step
              </button>
            )}
            {/* FIX 1: Revoke hire (step 4 — hired) */}
            {activeIdx === 4 && local.startDate && (
              <button onClick={() => setShowRevokeHire(true)} disabled={loading}
                className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 px-3 py-1.5 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50">
                <RotateCcw size={13} /> Revoke Hire
              </button>
            )}
          </div>
          {activeIdx < 4 && (
            <button onClick={() => handleMoveToStep(STEP_ORDER[activeIdx + 1])} disabled={loading}
              className="flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50">
              Next Step <ChevronRight size={13} />
            </button>
          )}
        </div>
      )}

      {/* Revert modal */}
      {showRevert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <ChevronLeft size={18} className="text-yellow-600" /> Revert to Previous Step
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              This will move {local.userId?.fullname} back to <span className="font-semibold capitalize">{prevStepKey()}</span>.
            </p>
            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
            <textarea value={revertReason} onChange={e => setRevertReason(e.target.value)}
              placeholder="Enter reason for reverting..." rows={3} maxLength={300}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-400 resize-none" />
            <p className="text-xs text-slate-400 mt-1 mb-4">{revertReason.length}/300</p>
            <div className="flex gap-3">
              <button onClick={() => { setShowRevert(false); setRevertReason(''); setError(''); }}
                className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleRevert} disabled={loading || !revertReason.trim()}
                className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {loading && <Loader2 size={13} className="animate-spin" />} Revert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIX 1: Revoke hire modal */}
      {showRevokeHire && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <RotateCcw size={18} className="text-orange-600" /> Revoke Hire
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              This will move {local.userId?.fullname} back to the <span className="font-semibold">Offer</span> step. This action is logged.
            </p>
            {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
            <textarea value={revokeHireReason} onChange={e => setRevokeHireReason(e.target.value)}
              placeholder="Enter reason for revoking hire..." rows={3} maxLength={300}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 resize-none" />
            <p className="text-xs text-slate-400 mt-1 mb-4">{revokeHireReason.length}/300</p>
            <div className="flex gap-3">
              <button onClick={() => { setShowRevokeHire(false); setRevokeHireReason(''); setError(''); }}
                className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleRevokeHire} disabled={loading || !revokeHireReason.trim()}
                className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {loading && <Loader2 size={13} className="animate-spin" />} Revoke Hire
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIX 2: Skip confirmation modal */}
      {skipConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" /> Skip Steps?
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              Moving to <span className="font-semibold capitalize">{skipConfirm.targetStep}</span> will skip:
            </p>
            <ul className="mb-4 space-y-1">
              {skipConfirm.skippedSteps.map(s => (
                <li key={s} className="text-sm text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                  <span className="capitalize">{s}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-400 mb-4">Skipped steps will be recorded in the candidate's history.</p>
            <div className="flex gap-3">
              <button onClick={() => setSkipConfirm(null)}
                className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => { const t = skipConfirm.targetStep; setSkipConfirm(null); doMoveToStep(t); }} disabled={loading}
                className="flex-1 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {loading && <Loader2 size={13} className="animate-spin" />} Yes, Skip &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
