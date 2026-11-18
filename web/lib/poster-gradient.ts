// Deterministic dark gradient per movie, used as the poster fallback
// whenever a genre photo isn't available. Picking the gradient from the
// movie's own id keeps it stable across re-renders instead of flashing a
// different colour every reload.
const GRADIENTS = [
  "from-rose-950 via-neutral-900 to-black",
  "from-indigo-950 via-neutral-900 to-black",
  "from-emerald-950 via-neutral-900 to-black",
  "from-amber-950 via-neutral-900 to-black",
  "from-fuchsia-950 via-neutral-900 to-black",
  "from-sky-950 via-neutral-900 to-black",
  "from-red-950 via-neutral-900 to-black",
  "from-teal-950 via-neutral-900 to-black",
];

export function gradientForMovie(movieId: number): string {
  return GRADIENTS[movieId % GRADIENTS.length];
}
