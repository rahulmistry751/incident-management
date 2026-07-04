import React, { useState } from 'react';
import { Loader2, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { IncidentSeverity, IncidentStatus } from '@/types/incident';
import { getSeverityStyles, getStatusStyles } from '@/components/ui/badge';

interface CreateFormProps {
  onSubmit: (title: string, description: string, severity: IncidentSeverity, status: IncidentStatus) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const CreateForm: React.FC<CreateFormProps> = ({ onSubmit, isSubmitting, onCancel }) => {
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSeverity, setFormSeverity] = useState<IncidentSeverity>('LOW');
  const [formStatus, setFormStatus] = useState<IncidentStatus>('OPEN');
  const [formErrors, setFormErrors] = useState<{ title?: string; description?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { title?: string; description?: string } = {};
    if (!formTitle.trim()) {
      errors.title = 'Title is required';
    }
    if (!formDescription.trim()) {
      errors.description = 'Description is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    await onSubmit(formTitle, formDescription, formSeverity, formStatus);
  };

  return (
    <div className="bg-white rounded-lg border border-zinc-200/80 shadow-sm p-6 flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-bold tracking-tight text-zinc-900">Incident Intake Form</h3>
        <p className="text-[11px] text-zinc-500">Provide details to request AI diagnostics analysis.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="form-title" className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
            Incident Title <span className="text-red-500">*</span>
          </label>
          <input
            id="form-title"
            type="text"
            placeholder="e.g., Auth service returning 500 server errors…"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            className={`w-full px-3.5 py-2.5 bg-zinc-50 border rounded-lg text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus:bg-white transition-all font-semibold ${
              formErrors.title
                ? 'border-red-400 focus:border-red-500 focus-visible:ring-red-500/10'
                : 'border-zinc-200 focus:border-[#1a56db]'
            }`}
          />
          {formErrors.title && (
            <span className="text-xs text-red-600 flex items-center gap-1 mt-0.5 font-medium">
              <AlertCircle className="h-3 w-3" />
              {formErrors.title}
            </span>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="form-desc" className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="form-desc"
            rows={5}
            placeholder="Describe what occurred, any logs observed, and downstream system impact…"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            className={`w-full px-3.5 py-2.5 bg-zinc-50 border rounded-lg text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus:bg-white resize-none transition-all font-semibold ${
              formErrors.description
                ? 'border-red-400 focus:border-red-500 focus-visible:ring-red-500/10'
                : 'border-zinc-200 focus:border-[#1a56db]'
            }`}
          />
          {formErrors.description && (
            <span className="text-xs text-red-600 flex items-center gap-1 mt-0.5 font-medium">
              <AlertCircle className="h-3 w-3" />
              {formErrors.description}
            </span>
          )}
        </div>

        {/* Severity Pill Selectors */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Severity</span>
          <div className="grid grid-cols-2 gap-2.5 mt-0.5" role="radiogroup" aria-label="Incident severity level">
            {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as IncidentSeverity[]).map((sev) => {
              const style = getSeverityStyles(sev);
              const isSelected = formSeverity === sev;
              return (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setFormSeverity(sev)}
                  className={`py-2 px-3.5 border rounded-lg text-xs font-bold flex items-center justify-start gap-2 transition-all select-none focus-visible:outline-none focus-visible:ring-2 cursor-pointer ${
                    isSelected ? style.activeClass : style.inactiveClass
                  }`}
                  role="radio"
                  aria-checked={isSelected}
                >
                  <span className={`h-2 w-2 rounded-full shrink-0 ${style.dotColor}`} />
                  <span>{style.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Initial Status select */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Initial Status</span>
          <div className="grid grid-cols-2 gap-2.5 mt-0.5" role="radiogroup" aria-label="Initial status">
            {(['OPEN', 'IN_PROGRESS', 'RESOLVED'] as IncidentStatus[]).map((statVal) => {
              const style = getStatusStyles(statVal);
              const isSelected = formStatus === statVal;

              // Determine icon
              let iconEl = null;
              if (statVal === 'OPEN') {
                iconEl = (
                  <span
                    className={`h-3 w-3 rounded-full border-2 shrink-0 ${
                      isSelected ? 'border-red-600' : 'border-red-500'
                    }`}
                  />
                );
              } else if (statVal === 'IN_PROGRESS') {
                iconEl = (
                  <Clock
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isSelected ? 'text-blue-600' : 'text-zinc-400'
                    }`}
                  />
                );
              } else {
                iconEl = (
                  <CheckCircle2
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isSelected ? 'text-green-600' : 'text-zinc-400'
                    }`}
                  />
                );
              }

              return (
                <button
                  key={statVal}
                  type="button"
                  onClick={() => setFormStatus(statVal)}
                  className={`py-2 px-3.5 border rounded-lg text-xs font-bold flex items-center justify-start gap-2 transition-all select-none focus-visible:outline-none focus-visible:ring-2 cursor-pointer ${
                    isSelected
                      ? statVal === 'OPEN'
                        ? 'bg-red-50 text-red-700 border-red-300 focus-visible:ring-red-500/20'
                        : statVal === 'IN_PROGRESS'
                        ? 'bg-blue-50 text-blue-700 border-blue-300 focus-visible:ring-blue-500/20'
                        : 'bg-green-50 text-green-700 border-green-300 focus-visible:ring-green-500/20'
                      : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'
                  }`}
                  role="radio"
                  aria-checked={isSelected}
                >
                  {iconEl}
                  <span>{style.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-3 pt-4 border-t border-zinc-150 justify-end mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-zinc-200 hover:bg-zinc-50 rounded-lg text-xs font-bold text-zinc-700 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[#1a56db] hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 shadow-sm shadow-blue-500/10 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Registering…</span>
              </>
            ) : (
              <span>Register Incident</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
