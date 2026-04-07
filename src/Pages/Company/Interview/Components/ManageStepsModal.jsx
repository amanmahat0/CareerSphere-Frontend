import React, { useState } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';

export default function ManageStepsModal({ steps, onClose, onSave }) {
  const [editSteps, setEditSteps] = useState(steps);
  const [newStepName, setNewStepName] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);

  const handleAddStep = () => {
    if (newStepName.trim()) {
      const newStep = {
        id: Math.max(...editSteps.map(s => s.id), 0) + 1,
        name: newStepName,
        icon: '📌',
        color: 'bg-slate-100',
      };
      setEditSteps([...editSteps, newStep]);
      setNewStepName('');
    }
  };

  const handleDeleteStep = (id) => {
    if (editSteps.length > 1) {
      setEditSteps(editSteps.filter(s => s.id !== id));
    }
  };

  const handleDragStart = (idx) => {
    setDraggedItem(idx);
  };

  const handleDragOver = (idx) => {
    if (draggedItem === null || draggedItem === idx) return;

    const newSteps = [...editSteps];
    const draggedStep = newSteps[draggedItem];
    newSteps.splice(draggedItem, 1);
    newSteps.splice(idx, 0, draggedStep);

    setEditSteps(newSteps);
    setDraggedItem(idx);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleSave = () => {
    onSave(editSteps);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Manage Hiring Steps</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Add new step */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Add New Step</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newStepName}
                onChange={(e) => setNewStepName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
                placeholder="Enter step name..."
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddStep}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Current steps */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Current Steps (Drag to reorder)</label>
            <div className="space-y-2">
              {editSteps.map((step, idx) => (
                <div
                  key={step.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={() => handleDragOver(idx)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-move transition-all ${
                    draggedItem === idx
                      ? 'border-blue-500 bg-blue-50 opacity-50'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <GripVertical className="w-5 h-5 text-slate-400" />
                  <span className="text-2xl">{step.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{step.name}</p>
                    <p className="text-xs text-slate-500">Step {idx + 1}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteStep(step.id)}
                    disabled={editSteps.length === 1}
                    className={`p-2 rounded-lg transition-colors ${
                      editSteps.length === 1
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-medium mb-1">💡 Tip</p>
            <p>Drag steps to reorder them. The order determines the progression of candidates through the hiring pipeline.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
