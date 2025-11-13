
import React, { useState, useEffect } from 'react';
import { getInitialMealSuggestions, getRecipeDetails } from '../services/geminiService';
import { RecipeDetails, MealType, DietPreference } from '../types';
import { SparklesIcon, ChevronLeftIcon } from './Icons';
import { MarkdownRenderer } from './MarkdownRenderer';
import { AddSuggestedMealModal } from './AddSuggestedMealModal';
import { CalendarIcon } from './Icons';

const SuggestionsListSkeleton: React.FC = () => (
    <div className="space-y-3 animate-pulse">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-stone-200 rounded-lg"></div>
        ))}
    </div>
);

const RecipeDetailsSkeleton: React.FC = () => (
    <div className="animate-pulse">
        <div className="h-48 bg-stone-200 rounded-lg mb-4"></div>
        <div className="h-6 w-3/4 bg-stone-200 rounded mb-4"></div>
        <div className="space-y-2">
            <div className="h-4 bg-stone-200 rounded"></div>
            <div className="h-4 bg-stone-200 rounded w-5/6"></div>
            <div className="h-4 bg-stone-200 rounded w-1/2"></div>
        </div>
    </div>
);

interface AiSuggestionsProps {
    onAddMeal: (date: Date, mealType: MealType, meal: { name: string; ingredients: string }) => void;
    dietPreference: DietPreference;
}

export const AiSuggestions: React.FC<AiSuggestionsProps> = ({ onAddMeal, dietPreference }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
    const [details, setDetails] = useState<RecipeDetails | null>(null);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            setIsLoadingSuggestions(true);
            const mealSuggestions = await getInitialMealSuggestions(dietPreference);
            setSuggestions(mealSuggestions);
            setIsLoadingSuggestions(false);
        };
        fetchSuggestions();
    }, [dietPreference]);

    const handleSelectMeal = async (mealName: string) => {
        setSelectedMeal(mealName);
        setIsLoadingDetails(true);
        setDetails(null);
        const recipeDetails = await getRecipeDetails(mealName, dietPreference);
        setDetails(recipeDetails);
        setIsLoadingDetails(false);
    };

    const handleBack = () => {
        setSelectedMeal(null);
        setDetails(null);
    };
    
    const handleConfirmAddMeal = (date: Date, mealType: MealType) => {
        if (selectedMeal && details?.ingredients) {
            onAddMeal(date, mealType, { name: selectedMeal, ingredients: details.ingredients });
            setIsAddModalOpen(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-stone-100 rounded-lg shadow-lg p-4">
            {selectedMeal ? (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={handleBack} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                            <ChevronLeftIcon className="w-5 h-5" />
                            Back
                        </button>
                        {details && !isLoadingDetails && (
                             <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                <CalendarIcon className="w-4 h-4" />
                                <span>Add to Plan</span>
                            </button>
                        )}
                    </div>
                    {isLoadingDetails && <RecipeDetailsSkeleton />}
                    {details && (
                        <div className="overflow-y-auto custom-scrollbar" style={{maxHeight: 'calc(100vh - 150px)'}}>
                            {details.imageUrl && (
                                <img src={details.imageUrl} alt={selectedMeal} className="w-full h-48 object-cover rounded-lg mb-4 shadow-md" />
                            )}
                            <MarkdownRenderer content={details.recipe} />
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2 mb-4">
                        <SparklesIcon className="w-6 h-6 text-teal-600" />
                        <h2 className="text-xl font-bold text-gray-800">AI Meal Suggestions</h2>
                    </div>
                    {isLoadingSuggestions ? (
                        <SuggestionsListSkeleton />
                    ) : (
                        <div className="space-y-3">
                            {suggestions.map((meal, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelectMeal(meal)}
                                    className="w-full text-left p-3 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-indigo-50 transition-all transform hover:scale-[1.02]"
                                >
                                    <p className="font-semibold text-gray-700">{meal}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
            {selectedMeal && (
                <AddSuggestedMealModal 
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onConfirm={handleConfirmAddMeal}
                    mealName={selectedMeal}
                />
            )}
        </div>
    );
};