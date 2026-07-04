import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SuccessScreenProps {
  onResetForm: () => void;
  onViewDashboard: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  onResetForm,
  onViewDashboard,
}) => {
  return (
    <div className="bg-white rounded-lg border border-zinc-200/80 shadow-sm p-8 text-center flex flex-col items-center justify-center animate-in scale-in duration-300">
      <div className="h-16 w-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center text-green-600 mb-6">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <h3 className="text-lg font-bold text-zinc-950">Incident Registered Successfully</h3>
      <p className="text-xs text-zinc-500 max-w-sm mt-2 leading-relaxed">
        An anomaly ticket has been generated. The diagnostics logs have been seeded. You can query
        analyses directly.
      </p>

      <div className="flex items-center gap-3 mt-8 w-full sm:w-auto">
        <button
          onClick={onResetForm}
          className="flex-1 sm:flex-initial px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs transition-all active:scale-95 shadow-sm cursor-pointer"
        >
          Create another
        </button>
        <button
          onClick={onViewDashboard}
          className="flex-1 sm:flex-initial px-6 py-2.5 border border-zinc-200 hover:bg-zinc-50 font-semibold rounded-lg text-xs text-zinc-700 transition-all active:scale-95 cursor-pointer"
        >
          View Dashboard
        </button>
      </div>
    </div>
  );
};
