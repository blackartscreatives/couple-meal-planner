import React, { useState, useEffect } from 'react';
// Fix: Import DietPreference type.
import { Meal, MealType, DietPreference } from '../types';
import { getIngredientsForMeal } from '../services/geminiService';
import { SparklesIcon } from './Icons';

interface MealModalProps {
  date: Date;
  mealType: MealType;
  meal: Meal | undefined;
  onSave: (date: Date, mealType: MealType, meal: Meal) => boolean;
  onClose: () => void;
  // Fix: Add dietPreference to props.
  dietPreference: DietPreference;
}

export const MealModal: React.FC<MealModalProps> = ({ date, mealType, meal, onSave, onClose, dietPreference }) => {
  const [mealName, setMealName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [isFetchingIngredients, setIsFetchingIngredients] = useState(false);

  useEffect(() => {
    if (meal) {
      setMealName(meal.name);
      setIngredients(meal.ingredients);
    }
  }, [meal]);

  const handleSave = () => {
    if (mealName.trim()) {
      const shouldClose = onSave(date, mealType, { id: meal?.id || new Date().toISOString(), name: mealName.trim(), ingredients: ingredients.trim() });
      if (shouldClose) {
        onClose();
      }
    }
  };

  const handleGetIngredients = async () => {
    if (!mealName.trim()) return;
    setIsFetchingIngredients(true);
    // Fix: Pass dietPreference to getIngredientsForMeal.
    const fetchedIngredients = await getIngredientsForMeal(mealName, dietPreference);
    if (fetchedIngredients) {
        setIngredients(prev => prev ? `${prev}, ${fetchedIngredients}` : fetchedIngredients);
    }
    setIsFetchingIngredients(false);
  };
  
  const formattedDate = date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">
                    {meal ? 'Edit Meal' : 'Add Meal'} for {mealType}
                </h2>
                <p className="text-gray-500">{formattedDate}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="mealName" className="block text-sm font-medium text-gray-700">Meal Name</label>
              <input
                type="text"
                id="mealName"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder="e.g., Chicken Kottu Roti"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">Ingredients (comma separated)</label>
              <div className="relative">
                <textarea
                  id="ingredients"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  rows={4}
                  placeholder="e.g., flour, chicken, carrots, leeks"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                    onClick={handleGetIngredients}
                    disabled={isFetchingIngredients || !mealName.trim()}
                    className="absolute bottom-2 right-2 flex items-center gap-1 text-sm bg-teal-100 text-teal-700 px-2 py-1 rounded-md hover:bg-teal-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <SparklesIcon className="w-4 h-4" />
                    {isFetchingIngredients ? 'Getting...' : 'AI Suggest'}
                </button>
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
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Meal
          </button>
        </div>
      </div>
    </div>
  );
};
