import React from 'react';
import { WarningIcon } from './Icons';

interface WarningModalProps {
  mealName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const WarningModal: React.FC<WarningModalProps> = ({ mealName, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 sm:mx-0 sm:h-10 sm:w-10">
                <WarningIcon className="h-6 w-6 text-amber-600" />
            </div>
            <div className="mt-0 text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Meal Repetition Warning
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-gray-600">
                        You have scheduled "{mealName}" for 3 days in a row. Are you sure you want to continue?
                    </p>
                </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
          <button
            onClick={onCancel}
            type="button"
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className="px-4 py-2 bg-amber-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
  );
};