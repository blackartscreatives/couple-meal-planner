
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { RecipeDetails, DietPreference } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set. Please create a .env file with VITE_API_KEY=YOUR_KEY");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getDietaryString = (preference: DietPreference): string => {
    switch (preference) {
        case DietPreference.Vegan: return "strictly vegan (no animal products)";
        case DietPreference.Vegetarian: return "vegetarian (no meat or fish, but dairy/eggs are okay)";
        case DietPreference.Pescatarian: return "pescatarian (vegetarian, but includes fish and seafood)";
        case DietPreference.Flexitarian: return "flexitarian (mostly plant-based, but occasionally includes meat)";
        case DietPreference.Carnivore: return "carnivore (includes all types of meat and animal products)";
        default: return "standard";
    }
}

const getSystemInstruction = (dietPreference: DietPreference) => {
    const dietContext = getDietaryString(dietPreference);
    return `You are a helpful culinary assistant for a couple in Australia of Sri Lankan descent. 
You specialize in suggesting creative Sri Lankan recipes, fusion dishes that blend Sri Lankan and Australian cuisines, and practical meal plans.
The user has a dietary preference for ${dietContext} meals. All your suggestions and recipes MUST adhere to this preference.
When asked for ingredients, provide them as a simple comma-separated list. 
When providing recipes, format them using Markdown with headings for titles, lists for ingredients and steps, and bold for emphasis.
Keep your suggestions exciting, practical, and tailored to a modern household.`;
}


export async function getAiResponse(prompt: string, dietPreference: DietPreference): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(dietPreference),
      },
    });
    return response.text ?? "Sorry, I couldn't fetch a response. Please try again.";
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return "Sorry, I couldn't fetch a response. Please try again.";
  }
}

export async function getIngredientsForMeal(mealName: string, dietPreference: DietPreference): Promise<string> {
  const prompt = `List the common ingredients for a ${getDietaryString(dietPreference)} version of "${mealName}" as a simple, comma-separated list.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(dietPreference),
      },
    });
    return response.text ?? "";
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return "";
  }
}

export async function getInitialMealSuggestions(dietPreference: DietPreference): Promise<string[]> {
  const dietContext = getDietaryString(dietPreference);
  const prompt = `List 5 simple, budget-conscious, ${dietContext} meal ideas focusing on international cuisine. 
  The meals should be easy for a couple to cook at home. 
  Return the list as a JSON array of strings, like ["Tuna Pasta Bake", "Chicken Fajitas", "Mushroom Risotto", "Vegetable Stir-fry", "Lentil Soup"].`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });
    const jsonStr = (response.text ?? '').trim();
    if (!jsonStr) return []; // Return empty array if response is empty
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error fetching meal suggestions:", error);
    // Provide relevant fallback suggestions based on diet
    switch(dietPreference) {
        case DietPreference.Vegan: return ["Lentil Soup", "Vegetable Stir-fry", "Chickpea Curry", "Mushroom Risotto (Vegan)", "Black Bean Burgers"];
        case DietPreference.Vegetarian: return ["Mushroom Risotto", "Vegetable Lasagna", "Egg Fried Rice", "Caprese Pasta", "Halloumi Skewers"];
        default: return ["Tuna Pasta Bake", "Chicken Fajitas", "Mushroom Risotto", "Vegetable Stir-fry", "Lentil Soup"];
    }
  }
}

async function fetchRecipeAndIngredients(mealName: string, dietPreference: DietPreference): Promise<{ recipe: string; ingredients: string; }> {
    const dietContext = getDietaryString(dietPreference);
    const prompt = `Provide a simple, step-by-step recipe for a ${dietContext} version of ${mealName}. Format the response as a JSON object with two keys: "recipe" (a string containing the full recipe in Markdown format, including title, description, ingredients list, and instructions) and "ingredients" (a string containing a simple comma-separated list of the ingredients).`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        recipe: { type: Type.STRING, description: "The full recipe in Markdown format." },
                        ingredients: { type: Type.STRING, description: "A comma-separated list of ingredients." },
                    },
                    required: ["recipe", "ingredients"],
                },
            },
        });
        const jsonStr = (response.text ?? '').trim();
        if (!jsonStr) throw new Error("Empty JSON response for recipe details.");
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error parsing recipe JSON:", error);
        // Fallback to text-based extraction if JSON fails.
        const recipeText = await getAiResponse(`Provide a simple, step-by-step recipe for a ${dietContext} version of ${mealName}. Format the response using Markdown. Include a title, a short description, an ingredients list, and instructions.`, dietPreference);
        const ingredientsText = await getIngredientsForMeal(mealName, dietPreference);
        return { recipe: recipeText, ingredients: ingredientsText };
    }
}


async function fetchImage(mealName: string, dietPreference: DietPreference): Promise<string> {
    const dietContext = getDietaryString(dietPreference);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: `A vibrant, appetizing, high-quality photo of a freshly made ${dietContext} version of ${mealName}, plated beautifully on a clean, modern dish.` }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        // Fix: Add a more robust check to ensure inlineData and its data property exist.
        if (part.inlineData?.data) {
            const base64ImageBytes = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
    }
    return "";
}

export async function getRecipeDetails(mealName: string, dietPreference: DietPreference): Promise<RecipeDetails> {
  try {
    const [recipeData, imageUrl] = await Promise.all([
      fetchRecipeAndIngredients(mealName, dietPreference),
      fetchImage(mealName, dietPreference),
    ]);
    return { ...recipeData, imageUrl };
  } catch (error) {
    console.error(`Error fetching details for ${mealName}:`, error);
    return {
      recipe: "Sorry, I couldn't fetch the recipe. Please try again.",
      imageUrl: "",
      ingredients: "",
    };
  }
}
