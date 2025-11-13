import React from 'react';
import { DietPreference } from '../types';

interface DietSliderProps {
    value: DietPreference;
    onChange: (value: DietPreference) => void;
}

const dietLabels = {
    [DietPreference.Vegan]: "Vegan",
    [DietPreference.Vegetarian]: "Vegetarian",
    [DietPreference.Pescatarian]: "Pescatarian",
    [DietPreference.Flexitarian]: "Flexitarian",
    [DietPreference.Carnivore]: "Carnivore",
};

export const DietSlider: React.FC<DietSliderProps> = ({ value, onChange }) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(Number(event.target.value) as DietPreference);
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-1">
                <label htmlFor="diet-slider" className="text-sm font-medium text-gray-700">Dietary Preference:</label>
                <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                    {dietLabels[value]}
                </span>
            </div>
            <input
                id="diet-slider"
                type="range"
                min={DietPreference.Vegan}
                max={DietPreference.Carnivore}
                step="1"
                value={value}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                <span>|</span>
                <span>|</span>
                <span>|</span>
                <span>|</span>
                <span>|</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 -mt-1">
                <span className="transform -translate-x-1/2">Vegan</span>
                <span className="transform -translate-x-1/2">Vegetarian</span>
                <span className="transform -translate-x-1/2">Pescatarian</span>
                <span className="transform -translate-x-1/2">Flexitarian</span>
                <span className="transform -translate-x-1/2">Carnivore</span>
            </div>
        </div>
    );
};
