
import React, { useState } from 'react';
import { MealType } from '../types';
import { MEAL_TYPES } from '../constants';

interface AddSuggestedMealModalProps {
  mealName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: Date, mealType: MealType) => void;
}

export const AddSuggestedMealModal: React.FC<AddSuggestedMealModalProps> = ({ mealName, isOpen, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(MealType.Lunch);

  const handleConfirm = () => {
    // The input type="date" returns YYYY-MM-DD.
    // new Date('YYYY-MM-DD') creates a date at midnight UTC.
    // To avoid timezone issues where it might become the previous day, parse it carefully.
    const [year, month, day] = selectedDate.split('-').map(Number);
    // Month is 0-indexed in JS Date constructor
    const date = new Date(year, month - 1, day);
    onConfirm(date, selectedMealType);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">Add to Calendar</h2>
          <p className="text-gray-600 mt-1">Add "<span className="font-semibold">{mealName}</span>" to your meal plan.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="mealDate" className="block text-sm font-medium text-gray-700">Select Date</label>
              <input
                type="date"
                id="mealDate"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Meal</label>
              <div className="mt-2 flex gap-4">
                {MEAL_TYPES.map(mealType => (
                  <label key={mealType} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mealType"
                      value={mealType}
                      checked={selectedMealType === mealType}
                      onChange={() => setSelectedMealType(mealType)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-800">{mealType}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Meal
          </button>
        </div>
      </div>
    </div>
  );
};
