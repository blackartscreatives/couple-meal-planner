
export enum MealType {
  Lunch = 'Lunch',
  Dinner = 'Dinner',
}

export enum DietPreference {
  Vegan = 0,
  Vegetarian = 1,
  Pescatarian = 2,
  Flexitarian = 3,
  Carnivore = 4,
}

export interface Ingredient {
  id: string;
  name: string;
  checked: boolean;
}

export interface Meal {
  id:string;
  name: string;
  ingredients: string; // Stored as a comma-separated string for simplicity in UI
}

export interface DayMeals {
  [MealType.Lunch]?: Meal;
  [MealType.Dinner]?: Meal;
  isEatingOut?: boolean;
}

export interface Conversation {
  role: 'user' | 'model';
  text: string;
}

export interface RecipeDetails {
  recipe: string;
  imageUrl: string;
  ingredients: string;
}