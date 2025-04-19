export async function shareRecipe(recipe) {
    const url = `${window.location.origin}/recipes/${recipe.id}`;
    const shareData = {
      title: recipe.title,
      text: `Check out this recipe: ${recipe.title}`,
      url,
    };
  
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("Recipe link copied to clipboard!");
      } catch (err) {
        console.error("Copy failed:", err);
        alert("Could not copy link. Please copy manually: " + url);
      }
    }
  }
  