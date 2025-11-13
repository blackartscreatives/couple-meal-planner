import React from 'react';
import { Meal, MealType, DayMeals } from '../types';
import { MEAL_TYPES } from '../constants';
import { PlusIcon, TrashIcon } from './Icons';

interface CalendarProps {
  dates: Date[];
  currentDisplayMonth: number;
  meals: Map<string, DayMeals>;
  onAddMeal: (date: Date, mealType: MealType) => void;
  onEditMeal: (date: Date, mealType: MealType, meal: Meal) => void;
  onDeleteMeal: (date: Date, mealType: MealType) => void;
  onToggleEatingOut: (date: Date) => void;
}

interface MealCardProps {
    meal: Meal;
    onEdit: () => void;
    onDelete: () => void;
    isDisabled: boolean;
}

const MealCard: React.FC<MealCardProps> = ({ meal, onEdit, onDelete, isDisabled }) => (
    <div 
        className={`
            bg-white p-2 rounded-lg text-sm group relative shadow-sm
            ${isDisabled 
                ? 'opacity-60 bg-stone-200 pointer-events-none' 
                : 'cursor-pointer'
            }
        `} 
        onClick={isDisabled ? undefined : onEdit}
    >
        <p className="font-semibold text-gray-800 truncate">{meal.name}</p>
        <p className="text-gray-500 truncate text-xs">{meal.ingredients || 'No ingredients listed'}</p>
        {!isDisabled && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="absolute top-1 right-1 p-1 bg-white rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity">
                <TrashIcon className="w-4 h-4" />
            </button>
        )}
    </div>
);

interface AddMealButtonProps {
    mealType: MealType;
    onClick: () => void;
    isDisabled: boolean;
}

const AddMealButton: React.FC<AddMealButtonProps> = ({ mealType, onClick, isDisabled }) => (
    <button 
        onClick={onClick} 
        disabled={isDisabled}
        className="w-full text-left p-2 text-gray-400 hover:bg-stone-200 hover:text-gray-600 rounded-lg transition-colors flex items-center gap-2 disabled:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
    >
        <PlusIcon className="w-4 h-4" />
        <span className="text-xs">Add {mealType}</span>
    </button>
);


export const Calendar: React.FC<CalendarProps> = ({ dates, currentDisplayMonth, meals, onAddMeal, onEditMeal, onDeleteMeal, onToggleEatingOut }) => {
  const toDateString = (date: Date) => date.toISOString().split('T')[0];
  const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
        <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 font-semibold mb-2">
            {WEEK_DAYS.map(day => <div key={day}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {dates.map((date) => {
            const dateStr = toDateString(date);
            const dayMeals = meals.get(dateStr);
            const isEatingOut = dayMeals?.isEatingOut ?? false;
            const isToday = toDateString(new Date()) === dateStr;
            const isCurrentMonth = date.getMonth() === currentDisplayMonth;

            return (
              <div 
                key={date.toISOString()} 
                className={`
                    rounded-lg p-2 flex flex-col gap-2 min-h-[160px] transition-colors
                    ${isCurrentMonth ? 'bg-stone-100' : 'bg-stone-50'}
                    ${isToday ? 'border-2 border-indigo-500' : 'border border-stone-200'}
                `}
              >
                <div className="flex justify-between items-start text-right">
                    <p className={`
                        font-semibold text-sm
                        ${isToday ? 'text-indigo-600' : isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}
                    `}>
                        {date.getDate()}
                    </p>
                    {isCurrentMonth && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 font-medium">
                            <input
                                type="checkbox"
                                id={`eat-out-${dateStr}`}
                                checked={isEatingOut}
                                onChange={() => onToggleEatingOut(date)}
                                className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <label htmlFor={`eat-out-${dateStr}`} className="cursor-pointer select-none">Eat Out</label>
                        </div>
                    )}
                </div>
                {isCurrentMonth && (
                    <div className="flex-1 flex flex-col gap-2 -mt-2">
                        {MEAL_TYPES.map((mealType) => {
                            const meal = dayMeals?.[mealType];
                            return (
                              <div key={mealType}>
                                {meal ? (
                                  <MealCard 
                                    meal={meal} 
                                    onEdit={() => onEditMeal(date, mealType, meal)} 
                                    onDelete={() => onDeleteMeal(date, mealType)}
                                    isDisabled={isEatingOut}
                                  />
                                ) : (
                                  <AddMealButton 
                                    mealType={mealType} 
                                    onClick={() => onAddMeal(date, mealType)} 
                                    isDisabled={isEatingOut}
                                  />
                                )}
                              </div>
                            );
                        })}
                    </div>
                )}
              </div>
            );
          })}
        </div>
    </div>
  );
};
