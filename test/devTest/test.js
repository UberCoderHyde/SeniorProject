const API_URL = "https://therecipedbapi.vercel.app/api/recipes/";

const fetchTest = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch test");
  }
  return response.json();
};

(async () => {
  try {
    const data = await fetchTest();

    // Log the full data for inspection.
    //console.log("Full data:", JSON.stringify(data, null, 2));

    // The API returns an object with a 'recipes' key which is an array.
    if (data && data.recipes && Array.isArray(data.recipes)) {
      data.recipes.forEach((recipe, recipeIndex) => {
        console.log(`\nRecipe ${recipeIndex + 1}: ${recipe.name}`);

        console.log("Tags:");
        if (Array.isArray(recipe.tags)) {
          recipe.tags.forEach((tag, index) => {
            console.log(`  ${index + 1}: ${tag}`);
          });
        } else {
          console.log(recipe.tags);
        }

        console.log("Nutrition:");
        if (Array.isArray(recipe.nutrition)) {
          recipe.nutrition.forEach((item, index) => {
            console.log(`  ${index + 1}:`, item);
          });
        } else {
          console.log(recipe.nutrition);
        }

        console.log("Ingredients:");
        if (Array.isArray(recipe.ingredients)) {
          recipe.ingredients.forEach((ingredient, index) => {
            console.log(`  ${index + 1}: ${ingredient}`);
          });
        } else {
          console.log(recipe.ingredients);
        }

        console.log("Steps:");
        if (Array.isArray(recipe.steps)) {
          recipe.steps.forEach((step, index) => {
            console.log(`  Step ${index + 1}: ${step}`);
          });
        } else {
          console.log(recipe.steps);
        }
      });
    } else {
      console.log("No recipes found in the data.");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
})();
