const API_URL = "https://script.google.com/macros/s/AKfycbzvmK4xSp0TSvDP3vPLFYjYYHPjn81YPnRFEPrMaHOawOlsd0aHV_VmBEJoySOgQppv/exec";

// Fetch all shared data
export async function getAllData() {
  const res = await fetch(`${API_URL}?action=getAll`);
  return await res.json();
}

// Add a meal to the shared sheet
export async function addMeal(meal) {
  await fetch(`${API_URL}?action=addMeal&value=${encodeURIComponent(meal)}`);
}

// Add an ingredient to the shared sheet
export async function addIngredient(ingredient) {
  await fetch(`${API_URL}?action=addIngredient&value=${encodeURIComponent(ingredient)}`);
}

// Add an item to the weekly plan
export async function addPlan(planItem) {
  await fetch(`${API_URL}?action=addPlan&value=${encodeURIComponent(planItem)}`);
}

// Add to grocery list (Option 1)
export async function addGrocery(item) {
  await fetch(`${API_URL}?action=addGrocery&value=${encodeURIComponent(item)}`);
}
