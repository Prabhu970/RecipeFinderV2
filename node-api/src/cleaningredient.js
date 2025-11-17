export function cleanIngredient(raw) {
  if (!raw) return "";

  return raw
    .toLowerCase()
    // remove quantities (1, 1/2, ⅓, etc)
    .replace(/^\s*\d+([\/\.\s]\d+)?\s*/g, "")
    // remove tsp, tbsp, cup, lb, oz, g, ml, kg, etc
    .replace(/\b(tsp|tbsp|cup|cups|lb|lbs|oz|g|gram|grams|kg|ml|cloves?|pieces?)\b/gi, "")
    // remove punctuation
    .replace(/[.,]/g, "")
    // remove extra descriptors like "minced", "diced", "chopped"
    .replace(/\b(minced|diced|chopped|sliced|cubed|fresh|ground|grated)\b/gi, "")
    // collapse extra whitespace
    .replace(/\s{2,}/g, " ")
    .trim();
}
