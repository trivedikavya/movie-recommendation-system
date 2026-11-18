import MovieCard, { type MovieCardData } from "./MovieCard";

export default function MovieRow({
  title,
  movies,
  emptyMessage = "Nothing to show yet.",
}: {
  title: string;
  movies: MovieCardData[];
  emptyMessage?: string;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 px-1 text-lg font-semibold text-text">{title}</h2>
      {movies.length === 0 ? (
        <p className="px-1 text-sm text-muted">{emptyMessage}</p>
      ) : (
        <div className="scroll-row px-1">
          {movies.map((m) => (
            <MovieCard key={m.movieId} movie={m} />
          ))}
        </div>
      )}
    </section>
  );
}
