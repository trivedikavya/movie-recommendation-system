# Movie Recommendation System Data Mining & Warehousing Project

**Student:** Kavya Trivedi | **Roll No.:** 1157 | **Semester:** VII (B.Tech CSE)

## Dataset

[MovieLens `ml-latest-small`](https://grouplens.org/datasets/movielens/) from GroupLens Research,
University of Minnesota. Contains `ratings.csv`, `movies.csv`, `tags.csv` (and `links.csv`).
Place these files in `data/` before running the notebook (already done for this project).

## Project structure

```
movie-recsys/
  data/                 the 4 MovieLens CSV files (ratings, movies, tags, links)
  notebooks/
    DMW_Recommender.ipynb      main data mining notebook (Phases A1-A5)
    build_report.py            regenerates the project report PDF
    DMW_Project_Report.pdf     the project report (living document, updated per phase)
  artifacts/             joblib files + chart figures saved from the notebook
  scripts/
    export_model.py            exports artifacts/*.joblib -> web/model-data/*.json
  web/                   Part B: Next.js + TypeScript + Postgres web app (see web/README.md)
  requirements.txt       Python deps for the notebook (Part A)
  README.md
```

## How to run

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
2. Open and run the notebook top to bottom ("Restart and Run All"):
   ```
   jupyter notebook notebooks/DMW_Recommender.ipynb
   ```
   or upload it to Google Colab (upload the `data/` CSVs alongside it, or mount Drive).
3. To regenerate the PDF project report after updating `notebooks/build_report.py`:
   ```
   python notebooks/build_report.py
   ```

## Part B — Web app

Part B is a **Next.js + TypeScript** web app (not Streamlit), deployable on Vercel, with a
Postgres database (via Prisma) for user accounts and interactions. It reuses 100% of Part A's
trained recommender: `scripts/export_model.py` exports the `.joblib` artifacts into compact
JSON files consumed directly by TypeScript (no Python runtime needed in the deployed app).

See **[`web/README.md`](web/README.md)** for full setup, environment variables, and run
instructions.

## Status

- [x] Phase A1 — Load and explore
- [x] Phase A2 — Clean and preprocess
- [x] Phase A3 — Models
- [x] Phase A4 — Evaluation
- [x] Phase A5 — Save the engine
- [x] Part B — Web app (Next.js, built and tested end-to-end)
- [ ] Deployed to Vercel

**Part A (data mining notebook) is complete.** `notebooks/DMW_Recommender.ipynb` runs top to
bottom with Restart & Run All, zero errors, 123 cells. The Hybrid model beat the Popularity
baseline on all 4 evaluation metrics, so no rework was required. The 6 engine artifacts in
`artifacts/` (movie table, item-similarity matrix, cluster labels, TF-IDF vectorizer,
association rules, popularity scores) are saved and load correctly via the `recommend()`
function. The project report `notebooks/DMW_Project_Report.pdf` (12 pages) is complete through
Section 6 (Conclusion).

**Part B (web app) is built and verified end-to-end**: signup, login, guest accounts, the
seeded demo account, onboarding, personalised recommendations, cold-start fallback, likes,
ratings, search, and the "because you liked X" row were all tested against a real Postgres
database and all work correctly, including recommendations persisting correctly across
logout/login.
