// Single source of truth for how much each interaction type counts towards
// a user's taste profile, matching the original project spec:
//   click = 1, like = 3, rating = the 1-5 rating value itself.
export function computeWeight(
  action: "click" | "like" | "rating",
  ratingValue?: number
): number {
  if (action === "click") return 1;
  if (action === "like") return 3;
  if (action === "rating") return ratingValue ?? 0;
  return 0;
}
