import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Calendar } from './components/Calendar';
import { AiSuggestions } from './components/AiSuggestions';
import { MealModal } from './components/MealModal';
import { WarningModal } from './components/WarningModal';
import { DayMeals, DietPreference, Ingredient, Meal, MealType } from './types';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ListBulletIcon, SparklesIcon } from './components/Icons';
import { GroceryList } from './components/GroceryList';
import { AiAssistant } from './components/AiAssistant';
import { DietSlider } from './components/DietSlider';

type ModalState = 
  | { type: 'none' }
  | { type: 'meal'; date: Date; mealType: MealType; meal?: Meal };

type WarningState =
  | { type: 'none' }
  | { type: 'meal_repetition'; date: Date; mealType: MealType; meal: Meal };

type ActiveView = 'none' | 'grocery' | 'assistant';

const MEALS_STORAGE_KEY = 'couples-meal-planner-meals';
const GROCERY_STORAGE_KEY = 'couples-meal-planner-grocery';
const DIET_PREF_STORAGE_KEY = 'couples-meal-planner-diet-pref';

const App: React.FC = () => {
  const [meals, setMeals] = useState<Map<string, DayMeals>>(() => {
    const storedMeals = localStorage.getItem(MEALS_STORAGE_KEY);
    try {
      return storedMeals ? new Map(JSON.parse(storedMeals)) : new Map();
    } catch {
      return new Map();
    }
  });

  const [groceryList, setGroceryList] = useState<Ingredient[]>(() => {
    const storedGrocery = localStorage.getItem(GROCERY_STORAGE_KEY);
    try {
      return storedGrocery ? JSON.parse(storedGrocery) : [];
    } catch {
      return [];
    }
  });

  const [dietPreference, setDietPreference] = useState<DietPreference>(() => {
    const storedPref = localStorage.getItem(DIET_PREF_STORAGE_KEY);
    return storedPref ? (JSON.parse(storedPref) as DietPreference) : DietPreference.Flexitarian;
  });

  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
  const [warningState, setWarningState] = useState<WarningState>({ type: 'none' });
  const [activeView, setActiveView] = useState<ActiveView>('none');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(Array.from(meals.entries())));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem(GROCERY_STORAGE_KEY, JSON.stringify(groceryList));
  }, [groceryList]);

  useEffect(() => {
    localStorage.setItem(DIET_PREF_STORAGE_KEY, JSON.stringify(dietPreference));
  }, [dietPreference]);

  // Listen for changes from other tabs to enable real-time sync
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === MEALS_STORAGE_KEY && event.newValue) {
        try {
          setMeals(new Map(JSON.parse(event.newValue)));
        } catch (e) {
          console.error("Failed to parse meals from localStorage", e);
        }
      }
      if (event.key === GROCERY_STORAGE_KEY && event.newValue) {
        try {
          setGroceryList(JSON.parse(event.newValue));
        } catch (e) {
          console.error("Failed to parse grocery list from localStorage", e);
        }
      }
      if (event.key === DIET_PREF_STORAGE_KEY && event.newValue) {
        try {
          setDietPreference(JSON.parse(event.newValue) as DietPreference);
        } catch (e) {
          console.error("Failed to parse diet preference from localStorage", e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toDateString = (date: Date) => date.toISOString().split('T')[0];

  const calendarDates = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay()); // Start from the Sunday of the first week

    const endDate = new Date(lastDayOfMonth);
    if (endDate.getDay() !== 6) { // if last day isn't Saturday
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on the Saturday of the last week
    }

    const dates = [];
    let dateIterator = new Date(startDate);
    while (dateIterator <= endDate) {
        dates.push(new Date(dateIterator));
        dateIterator.setDate(dateIterator.getDate() + 1);
    }
    return dates;
  }, [currentDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };


  const updateGroceryListFromMeals = useCallback((updatedMeals: Map<string, DayMeals>) => {
    const allIngredients = new Set<string>();
    const allowedMealTypes = new Set(Object.values(MealType));

    updatedMeals.forEach(dayMeals => {
      if (dayMeals.isEatingOut) {
        return; // Skip ingredients from days we eat out
      }
      Object.entries(dayMeals).forEach(([mealType, meal]) => {
        if (allowedMealTypes.has(mealType as MealType) && meal && typeof meal === 'object' && meal.ingredients) {
          meal.ingredients.split(',').forEach((ing: string) => {
            const trimmedIng = ing.trim().toLowerCase();
            if (trimmedIng) {
              allIngredients.add(trimmedIng);
            }
          });
        }
      });
    });

    setGroceryList(currentList => {
      const newItems = Array.from(allIngredients)
        .filter(name => !currentList.some(item => item.name.toLowerCase() === name))
        .map(name => ({ id: crypto.randomUUID(), name, checked: false }));

      const existingItems = currentList.filter(item => allIngredients.has(item.name.toLowerCase()));
      
      return [...existingItems, ...newItems];
    });
  }, []);

  // FIX: Rewrote to handle state immutably, preventing direct mutation of state objects.
  const saveMeal = useCallback((date: Date, mealType: MealType, meal: Meal) => {
    const key = toDateString(date);
    setMeals(prev => {
      const newMeals = new Map(prev);
      const currentDayMeals = newMeals.get(key);
      // Create a new DayMeals object, copying existing meals and adding/updating the new one.
      // Fix: Use default empty object for currentDayMeals if it's undefined to prevent spread error.
      const newDayMeals = { ...(currentDayMeals || {}), [mealType]: meal };
      newMeals.set(key, newDayMeals);
      updateGroceryListFromMeals(newMeals);
      return newMeals;
    });
  }, [updateGroceryListFromMeals]);

  const handleSaveMeal = useCallback((date: Date, mealType: MealType, meal: Meal): boolean => {
    const mealName = meal.name.trim().toLowerCase();

    const prevDate1 = new Date(date);
    prevDate1.setDate(date.getDate() - 1);
    const meal1 = meals.get(toDateString(prevDate1))?.[mealType];

    const prevDate2 = new Date(date);
    prevDate2.setDate(date.getDate() - 2);
    const meal2 = meals.get(toDateString(prevDate2))?.[mealType];

    if (
      meal1 && meal1.name.trim().toLowerCase() === mealName &&
      meal2 && meal2.name.trim().toLowerCase() === mealName
    ) {
      setWarningState({ type: 'meal_repetition', date, mealType, meal });
      return false; // Prevent meal modal from closing
    } else {
      saveMeal(date, mealType, meal);
      return true; // OK to close meal modal
    }
  }, [meals, saveMeal]);
  
  const handleAddSuggestedMeal = useCallback((date: Date, mealType: MealType, suggestedMeal: { name: string; ingredients: string; }) => {
    const newMeal: Meal = { ...suggestedMeal, id: crypto.randomUUID() };
    
    const mealName = newMeal.name.trim().toLowerCase();

    const prevDate1 = new Date(date);
    prevDate1.setDate(date.getDate() - 1);
    const meal1 = meals.get(toDateString(prevDate1))?.[mealType];

    const prevDate2 = new Date(date);
    prevDate2.setDate(date.getDate() - 2);
    const meal2 = meals.get(toDateString(prevDate2))?.[mealType];

    if (
      meal1 && meal1.name.trim().toLowerCase() === mealName &&
      meal2 && meal2.name.trim().toLowerCase() === mealName
    ) {
      setWarningState({ type: 'meal_repetition', date, mealType, meal: newMeal });
    } else {
      saveMeal(date, mealType, newMeal);
    }
}, [meals, saveMeal]);

  // FIX: Rewrote to handle state immutably, preventing direct mutation of state objects.
  const handleDeleteMeal = useCallback((date: Date, mealType: MealType) => {
    const key = toDateString(date);
    setMeals(prev => {
      const newMeals = new Map(prev);
      const currentDayMeals = newMeals.get(key);
      if (currentDayMeals) {
        const newDayMeals = { ...currentDayMeals }; // Create a shallow copy
        delete newDayMeals[mealType]; // Modify the copy

        // If no meals are left and not eating out, remove the day's entry entirely.
        if (!newDayMeals[MealType.Lunch] && !newDayMeals[MealType.Dinner] && !newDayMeals.isEatingOut) {
          newMeals.delete(key);
        } else {
          newMeals.set(key, newDayMeals);
        }
      }
      updateGroceryListFromMeals(newMeals);
      return newMeals;
    });
  }, [updateGroceryListFromMeals]);

  // FIX: Rewrote to handle state immutably and resolve potential type inference issues.
  const handleToggleEatingOut = useCallback((date: Date) => {
    const key = toDateString(date);
    setMeals(prev => {
        const newMeals = new Map(prev);
        const currentDayMeals = newMeals.get(key);
        // Create a new DayMeals object with the toggled 'isEatingOut' value.
        // Fix: Use default empty object for currentDayMeals if it's undefined to prevent spread error.
        const newDayMeals = { 
          ...(currentDayMeals || {}), 
          isEatingOut: !currentDayMeals?.isEatingOut 
        };

        // If not eating out and no meals planned, remove the day's entry.
        if (!newDayMeals.isEatingOut && !newDayMeals[MealType.Lunch] && !newDayMeals[MealType.Dinner]) {
            newMeals.delete(key);
        } else {
            newMeals.set(key, newDayMeals);
        }
        
        updateGroceryListFromMeals(newMeals);
        return newMeals;
    });
  }, [updateGroceryListFromMeals]);
  
  const handleAddGroceryItem = (name: string) => {
    setGroceryList(prev => {
        const trimmedName = name.trim();
        if (trimmedName && !prev.some(item => item.name.toLowerCase() === trimmedName.toLowerCase())) {
            return [...prev, { id: crypto.randomUUID(), name: trimmedName, checked: false }];
        }
        return prev;
    });
  };

  const handleToggleGroceryItem = (id: string) => {
    setGroceryList(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleRemoveGroceryItem = (id: string) => {
    setGroceryList(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen font-sans text-gray-800">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 md:px-6 py-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <CalendarIcon className="w-8 h-8 text-indigo-600"/>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Couple's Meal Planner</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setActiveView('grocery')} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-amber-600 bg-amber-100 rounded-md hover:bg-amber-200 transition-colors">
                        <ListBulletIcon className="w-5 h-5" />
                        <span className="hidden md:inline">Grocery List</span>
                    </button>
                    <button onClick={() => setActiveView('assistant')} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-teal-600 bg-teal-100 rounded-md hover:bg-teal-200 transition-colors">
                        <SparklesIcon className="w-5 h-5" />
                        <span className="hidden md:inline">AI Assistant</span>
                    </button>
                </div>
            </div>
            <div className="mt-4">
                <DietSlider value={dietPreference} onChange={setDietPreference} />
            </div>
        </div>
      </header>

      <main className="lg:grid lg:grid-cols-4 lg:gap-6 p-4 md:p-6">
        <div className="lg:col-span-3">
            <header className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-700 w-40 text-center md:text-left">
                        {currentDate.toLocaleString('en-AU', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex items-center gap-1">
                        <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-stone-200 transition-colors">
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-stone-200 transition-colors">
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <button onClick={goToToday} className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors">
                    Today
                </button>
            </header>
            <Calendar
                dates={calendarDates}
                currentDisplayMonth={currentDate.getMonth()}
                meals={meals}
                onAddMeal={(date, mealType) => setModalState({ type: 'meal', date, mealType })}
                onEditMeal={(date, mealType, meal) => setModalState({ type: 'meal', date, mealType, meal })}
                onDeleteMeal={handleDeleteMeal}
                onToggleEatingOut={handleToggleEatingOut}
            />
        </div>
        
        <div className="lg:col-span-1 mt-6 lg:mt-0">
            <AiSuggestions onAddMeal={handleAddSuggestedMeal} dietPreference={dietPreference} />
        </div>
      </main>

      {/* Sidebar for Grocery List and AI Assistant */}
      {activeView !== 'none' && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setActiveView('none')} aria-hidden="true"></div>
      )}
      <aside className={`
        fixed top-0 right-0 h-full w-full max-w-md bg-stone-50 shadow-2xl transform transition-transform duration-300 ease-in-out z-50
        ${activeView !== 'none' ? 'translate-x-0' : 'translate-x-full'}
      `}>
          {activeView === 'grocery' && (
              <GroceryList
                  items={groceryList}
                  onAddItem={handleAddGroceryItem}
                  onToggleItem={handleToggleGroceryItem}
                  onRemoveItem={handleRemoveGroceryItem}
                  onClose={() => setActiveView('none')}
              />
          )}
          {activeView === 'assistant' && (
              <AiAssistant onClose={() => setActiveView('none')} dietPreference={dietPreference} />
          )}
      </aside>

      {modalState.type === 'meal' && (
        <MealModal
          date={modalState.date}
          mealType={modalState.mealType}
          meal={modalState.meal}
          onSave={handleSaveMeal}
          onClose={() => setModalState({ type: 'none' })}
          // Fix: Pass dietPreference to MealModal.
          dietPreference={dietPreference}
        />
      )}

      {warningState.type === 'meal_repetition' && (
        <WarningModal
          mealName={warningState.meal.name}
          onConfirm={() => {
            saveMeal(warningState.date, warningState.mealType, warningState.meal);
            setWarningState({ type: 'none' });
            setModalState({ type: 'none' });
          }}
          onCancel={() => {
            setWarningState({ type: 'none' });
          }}
        />
      )}
    </div>
  );
};

export default App;