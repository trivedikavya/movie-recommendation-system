"""
export_model.py
----------------
Run this ONCE locally (not on Vercel) after the notebook has produced the
artifacts/*.joblib files. It converts the trained Python recommender into
small, plain JSON files that the Next.js/TypeScript app can read directly,
with NO Python runtime needed in production.

The 3650 x 3650 item-similarity matrix is deliberately collapsed to each
movie's top-K most similar neighbours -- that is all the TypeScript scoring
logic will ever need, and it shrinks ~38MB down to a few MB.

Run with:  python scripts/export_model.py
"""

import json
import os
import joblib
import numpy as np

ARTIFACTS_DIR = "artifacts"
OUT_DIR = "web/model-data"
TOP_K_NEIGHBORS = 40

os.makedirs(OUT_DIR, exist_ok=True)


def main():
    print("Loading artifacts...")
    movies_table = joblib.load(f"{ARTIFACTS_DIR}/movies_table.joblib")
    sim_data = joblib.load(f"{ARTIFACTS_DIR}/item_similarity.joblib")
    cluster_map = joblib.load(f"{ARTIFACTS_DIR}/cluster_labels.joblib")
    popularity_df = joblib.load(f"{ARTIFACTS_DIR}/popularity_scores.joblib")
    rules_df = joblib.load(f"{ARTIFACTS_DIR}/association_rules.joblib")

    sim_matrix = sim_data["matrix"]
    movie_ids_order = sim_data["movie_ids_order"]
    id_to_idx = {int(mid): i for i, mid in enumerate(movie_ids_order)}

    # ---------------------------------------------------------------
    # 1. movies.json -- the master catalogue table
    # ---------------------------------------------------------------
    print("Building movies.json ...")
    movies_out = []
    for row in movies_table.itertuples():
        genres = [] if row.genres == "(no genres listed)" else row.genres.split("|")
        movies_out.append({
            "id": int(row.movieId),
            "title": row.title,
            "year": None if pd_isnull(row.year) else int(row.year),
            "genres": genres,
            "cluster": int(row.cluster),
        })
    with open(f"{OUT_DIR}/movies.json", "w", encoding="utf-8") as f:
        json.dump(movies_out, f, ensure_ascii=False, separators=(",", ":"))

    # ---------------------------------------------------------------
    # 2. similarity_topk.json -- top-K neighbours per movie
    # ---------------------------------------------------------------
    print(f"Building similarity_topk.json (top {TOP_K_NEIGHBORS} neighbours per movie) ...")
    topk_out = {}
    for mid, idx in id_to_idx.items():
        row = sim_matrix[idx]
        # argsort descending, skip the movie itself (always similarity 1.0 at its own index)
        order = np.argsort(-row)
        neighbors = []
        for j in order:
            if j == idx:
                continue
            score = float(row[j])
            if score <= 0:
                break  # sorted descending, so once we hit 0 the rest are 0 too
            neighbors.append([int(movie_ids_order[j]), round(score, 4)])
            if len(neighbors) >= TOP_K_NEIGHBORS:
                break
        topk_out[str(mid)] = neighbors
    with open(f"{OUT_DIR}/similarity_topk.json", "w", encoding="utf-8") as f:
        json.dump(topk_out, f, separators=(",", ":"))

    # ---------------------------------------------------------------
    # 3. popularity.json -- normalised popularity score per movie
    # ---------------------------------------------------------------
    print("Building popularity.json ...")
    pop_out = {
        str(int(row.movieId)): round(float(row.popularity_norm), 4)
        for row in popularity_df.itertuples()
    }
    with open(f"{OUT_DIR}/popularity.json", "w", encoding="utf-8") as f:
        json.dump(pop_out, f, separators=(",", ":"))

    # ---------------------------------------------------------------
    # 4. rules.json -- association rules (antecedent -> consequent, lift)
    # ---------------------------------------------------------------
    print("Building rules.json ...")
    rules_out = []
    for row in rules_df.itertuples():
        rules_out.append({
            "antecedent": [int(x) for x in row.antecedents],
            "consequent": [int(x) for x in row.consequents],
            "lift": round(float(row.lift), 4),
        })
    with open(f"{OUT_DIR}/rules.json", "w", encoding="utf-8") as f:
        json.dump(rules_out, f, separators=(",", ":"))

    # ---------------------------------------------------------------
    # 5. genres.json -- sorted list of distinct genres (for onboarding UI)
    # ---------------------------------------------------------------
    print("Building genres.json ...")
    all_genres = sorted({g for m in movies_out for g in m["genres"]})
    with open(f"{OUT_DIR}/genres.json", "w", encoding="utf-8") as f:
        json.dump(all_genres, f, separators=(",", ":"))

    # ---------------------------------------------------------------
    # Report file sizes
    # ---------------------------------------------------------------
    print("\nDone. File sizes:")
    for fname in ["movies.json", "similarity_topk.json", "popularity.json", "rules.json", "genres.json"]:
        path = f"{OUT_DIR}/{fname}"
        size_kb = os.path.getsize(path) / 1024
        print(f"  {fname}: {size_kb:,.1f} KB")


def pd_isnull(val):
    try:
        return val != val  # NaN != NaN is True
    except Exception:
        return val is None


if __name__ == "__main__":
    main()
