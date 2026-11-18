"""
build_report.py
----------------
Generates notebooks/DMW_Project_Report.pdf from the content defined in this
file. This is a LIVING DOCUMENT: as each notebook phase (A2, A3, A4, A5) is
completed, the matching section below gets updated with real numbers from
that phase, and this script is re-run to regenerate the PDF.

Numbering convention (as requested):
  - Title page: no page number.
  - Table of contents: roman numerals (i).
  - Main report body: Arabic numerals (1, 2, 3, ...).

Run with:  python notebooks/build_report.py
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, NextPageTemplate, PageBreak,
    Paragraph, Spacer, Table, TableStyle, Image, ListFlowable, ListItem
)
from reportlab.pdfgen import canvas as canvas_mod

HERE = os.path.dirname(os.path.abspath(__file__))
FIG_DIR = os.path.join(HERE, "..", "artifacts", "figures")
OUT_PATH = os.path.join(HERE, "DMW_Project_Report.pdf")

PAGE_W, PAGE_H = A4
MARGIN = 2.2 * cm

# ---------------------------------------------------------------------------
# STUDENT / SUBJECT DETAILS
# ---------------------------------------------------------------------------
STUDENT_NAME = "Kavya Trivedi"
ROLL_NO = "1157"
PROGRAMME = "B.Tech CSE"
SEMESTER = "VII"
SUBJECT = "Data Mining and Warehousing"
SUBJECT_CODE = "BTECHCSE230703"
SUBMISSION_DATE = "26/11/2026"
PROJECT_TITLE = "Movie Recommendation System Using Data Mining Techniques"

# ---------------------------------------------------------------------------
# PHASE COMPLETION STATUS (update as phases finish)
# ---------------------------------------------------------------------------
# Set each flag to True once that phase's real results are filled in below.
PHASE_A2_DONE = True
PHASE_A3_DONE = True
PHASE_A4_DONE = True
PHASE_A5_DONE = True

# ---------------------------------------------------------------------------
# STYLES
# ---------------------------------------------------------------------------
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="H1", fontSize=16, leading=20, spaceBefore=14,
                           spaceAfter=8, fontName="Helvetica-Bold",
                           textColor=colors.HexColor("#7A1E22")))
styles.add(ParagraphStyle(name="H2", fontSize=12.5, leading=16, spaceBefore=10,
                           spaceAfter=6, fontName="Helvetica-Bold"))
styles.add(ParagraphStyle(name="BodyText2", fontSize=10.5, leading=15,
                           alignment=TA_JUSTIFY, spaceAfter=8,
                           fontName="Helvetica"))
styles.add(ParagraphStyle(name="Caption", fontSize=9, leading=12,
                           alignment=TA_CENTER, fontName="Helvetica-Oblique",
                           textColor=colors.HexColor("#555555"), spaceAfter=12))
styles.add(ParagraphStyle(name="TitleBig", fontSize=20, leading=26,
                           alignment=TA_CENTER, fontName="Helvetica-Bold",
                           textColor=colors.HexColor("#7A1E22")))
styles.add(ParagraphStyle(name="TitleSub", fontSize=13, leading=18,
                           alignment=TA_CENTER, fontName="Helvetica"))
styles.add(ParagraphStyle(name="TitleMeta", fontSize=11.5, leading=20,
                           alignment=TA_CENTER, fontName="Helvetica"))
styles.add(ParagraphStyle(name="TOCEntry", fontSize=11, leading=20,
                           fontName="Helvetica"))
styles.add(ParagraphStyle(name="Pending", fontSize=10.5, leading=15,
                           alignment=TA_JUSTIFY, fontName="Helvetica-Oblique",
                           textColor=colors.HexColor("#8A6D00"), spaceAfter=8))


def to_roman(num: int) -> str:
    """Convert a small integer to a lowercase roman numeral (for front matter pages)."""
    vals = [(10, 'x'), (9, 'ix'), (5, 'v'), (4, 'iv'), (1, 'i')]
    out = ''
    for v, sym in vals:
        while num >= v:
            out += sym
            num -= v
    return out


# ---------------------------------------------------------------------------
# PAGE NUMBER DRAWING (different style per section of the document)
# ---------------------------------------------------------------------------
class NumberedCanvas(canvas_mod.Canvas):
    """Custom canvas that draws page numbers differently depending on which
    part of the report we are in: no number on the title page, roman
    numerals on the table of contents, Arabic numerals in the body."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        # Save this page's drawing state and start a fresh internal page
        # buffer WITHOUT flushing yet (flushing happens once, in save()).
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        total_pages = len(self._saved_page_states)
        for i, state in enumerate(self._saved_page_states, start=1):
            self.__dict__.update(state)
            self._draw_footer(i, total_pages)
            canvas_mod.Canvas.showPage(self)  # actually flush this page now
        canvas_mod.Canvas.save(self)

    def _draw_footer(self, page_num, total_pages):
        # Page 1 = title page -> no number.
        # Page 2 = table of contents -> roman numeral "i".
        # Page 3 onwards = body -> Arabic numerals starting at 1.
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#555555"))
        if page_num == 1:
            return
        elif page_num == 2:
            label = to_roman(1)
        else:
            label = str(page_num - 2)
        self.drawCentredString(PAGE_W / 2, 1.3 * cm, label)


# ---------------------------------------------------------------------------
# PAGE TEMPLATES (title page has no header/footer rule, body pages have a
# thin header rule with the subject name)
# ---------------------------------------------------------------------------
def _body_header(canv, doc):
    canv.saveState()
    canv.setStrokeColor(colors.HexColor("#CCCCCC"))
    canv.setLineWidth(0.6)
    canv.line(MARGIN, PAGE_H - 1.5 * cm, PAGE_W - MARGIN, PAGE_H - 1.5 * cm)
    canv.setFont("Helvetica", 8)
    canv.setFillColor(colors.HexColor("#777777"))
    canv.drawString(MARGIN, PAGE_H - 1.3 * cm, SUBJECT)
    canv.drawRightString(PAGE_W - MARGIN, PAGE_H - 1.3 * cm,
                          f"{STUDENT_NAME} | Roll No. {ROLL_NO}")
    canv.restoreState()


def _blank_header(canv, doc):
    pass


def build_doc():
    doc = BaseDocTemplate(OUT_PATH, pagesize=A4,
                           leftMargin=MARGIN, rightMargin=MARGIN,
                           topMargin=2.0 * cm, bottomMargin=2.0 * cm,
                           title=PROJECT_TITLE, author=STUDENT_NAME)

    # IMPORTANT: each PageTemplate needs its OWN Frame instance. Reusing the
    # same Frame object across multiple PageTemplates causes reportlab to
    # replay/duplicate pages because Frame keeps internal fill-state.
    def new_frame(frame_id):
        return Frame(MARGIN, 2.0 * cm, PAGE_W - 2 * MARGIN,
                      PAGE_H - 3.6 * cm, id=frame_id)

    title_template = PageTemplate(id="TitlePage", frames=[new_frame("f_title")],
                                   onPage=_blank_header)
    toc_template = PageTemplate(id="TOC", frames=[new_frame("f_toc")],
                                 onPage=_body_header)
    body_template = PageTemplate(id="Body", frames=[new_frame("f_body")],
                                  onPage=_body_header)

    doc.addPageTemplates([title_template, toc_template, body_template])
    return doc


# ---------------------------------------------------------------------------
# TITLE PAGE
# ---------------------------------------------------------------------------
def title_page():
    flow = []
    flow.append(Spacer(1, 2.5 * cm))
    flow.append(Paragraph("JG UNIVERSITY", styles["TitleSub"]))
    flow.append(Paragraph("School of Engineering", styles["TitleSub"]))
    flow.append(Spacer(1, 1.2 * cm))
    flow.append(Paragraph("Data Mining and Warehousing", styles["TitleMeta"]))
    flow.append(Paragraph(f"({SUBJECT_CODE})", styles["Caption"]))
    flow.append(Spacer(1, 0.6 * cm))
    flow.append(Paragraph("Project / Practical / Presentation &mdash; 12 Marks",
                           styles["TitleMeta"]))
    flow.append(Spacer(1, 1.8 * cm))
    flow.append(Paragraph(PROJECT_TITLE, styles["TitleBig"]))
    flow.append(Spacer(1, 2.2 * cm))

    meta_table = Table([
        ["Submitted by:", STUDENT_NAME],
        ["Roll Number:", ROLL_NO],
        ["Programme:", PROGRAMME],
        ["Semester:", SEMESTER],
        ["Submission Date:", SUBMISSION_DATE],
    ], colWidths=[5.5 * cm, 7 * cm])
    meta_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 11.5),
        ("ALIGN", (0, 0), (0, -1), "RIGHT"),
        ("ALIGN", (1, 0), (1, -1), "LEFT"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    flow.append(meta_table)
    flow.append(Spacer(1, 2.0 * cm))
    flow.append(Paragraph(
        "Dataset: MovieLens ml-latest-small &mdash; GroupLens Research "
        "(https://grouplens.org/datasets/movielens/)", styles["Caption"]))
    return flow


# ---------------------------------------------------------------------------
# TABLE OF CONTENTS (page ii)
# ---------------------------------------------------------------------------
TOC_ENTRIES = [
    ("1.", "Introduction and Problem Statement"),
    ("2.", "Dataset Description"),
    ("3.", "Data Preprocessing"),
    ("4.", "Algorithms Implemented"),
    ("5.", "Results and Comparison"),
    ("6.", "Conclusion"),
    ("7.", "References"),
]


def toc_page():
    flow = [Paragraph("Table of Contents", styles["H1"]), Spacer(1, 0.4 * cm)]
    rows = [[Paragraph(f"<b>{num}</b> {name}", styles["TOCEntry"])] for num, name in TOC_ENTRIES]
    t = Table(rows, colWidths=[PAGE_W - 2 * MARGIN])
    t.setStyle(TableStyle([
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LINEBELOW", (0, 0), (-1, -2), 0.3, colors.HexColor("#DDDDDD")),
    ]))
    flow.append(t)
    return flow


# ---------------------------------------------------------------------------
# BODY SECTIONS
# ---------------------------------------------------------------------------
def pending_note(phase_name):
    return Paragraph(
        f"<i>[This section will be completed with real results once "
        f"{phase_name} is finished in the notebook. No placeholder numbers "
        f"are written here, in line with the project rule of never "
        f"inventing data or results.]</i>", styles["Pending"])


def section_introduction():
    flow = [Paragraph("1. Introduction and Problem Statement", styles["H1"])]
    flow.append(Paragraph(
        "Recommendation systems help users discover relevant items from a "
        "large catalogue by learning patterns from historical behaviour. "
        "This project builds a movie recommendation system using classical "
        "data mining techniques taught in this course &mdash; popularity-based "
        "ranking, item-based collaborative filtering (k-nearest neighbours), "
        "k-means clustering, and association rule mining (Apriori and "
        "FP-Growth) &mdash; and combines several of them into a hybrid "
        "recommender.", styles["BodyText2"]))
    flow.append(Paragraph(
        "The problem statement is: given a catalogue of movies and a "
        "history of user ratings, recommend a ranked list of movies that a "
        "user is likely to enjoy but has not yet watched, using only "
        "information that is available at prediction time (i.e. without "
        "any data leakage from the future). The project treats this as a "
        "practical case of three syllabus topics applied together: "
        "association rule mining, classification/clustering, and similarity "
        "based retrieval, evaluated with standard information-retrieval "
        "metrics (Precision@10, Recall@10, Hit Rate@10 and NDCG@10).",
        styles["BodyText2"]))
    flow.append(Paragraph(
        "The same data mining pipeline built in the notebook is reused in a "
        "small Streamlit web application, so the project also demonstrates "
        "that the mined model can be deployed behind a usable interface, "
        "not just evaluated offline in a notebook.", styles["BodyText2"]))
    return flow


def section_dataset():
    flow = [Paragraph("2. Dataset Description", styles["H1"])]
    flow.append(Paragraph(
        "The dataset used is <b>MovieLens ml-latest-small</b>, published by "
        "GroupLens Research, University of Minnesota, and publicly "
        "available at "
        "<font color='#1a4fa0'>https://grouplens.org/datasets/movielens/</font>. "
        "It contains three files: <b>ratings.csv</b> (one row per user "
        "rating of a movie), <b>movies.csv</b> (movie titles and "
        "pipe-separated genres), and <b>tags.csv</b> (free-text tags users "
        "attached to movies). This satisfies the project requirement of a "
        "public dataset with at least 500 records and 5 attributes by a "
        "wide margin.", styles["BodyText2"]))

    flow.append(Paragraph("2.1 Dataset statistics (from Phase A1 exploration, computed directly from the raw files)",
                           styles["H2"]))
    stats_rows = [
        ["Metric", "Value"],
        ["Total ratings", "100,836"],
        ["Total users", "610"],
        ["Total movies in catalogue", "9,742"],
        ["Movies with at least 1 rating", "9,724"],
        ["Total tags", "3,683"],
        ["Mean rating", "3.502"],
        ["Median rating", "3.5"],
        ["Rating scale", "0.5 to 5.0, in 0.5 steps"],
        ["Minimum ratings per user", "20"],
        ["Median ratings per user", "70.5"],
        ["Most active user", "2,698 ratings"],
        ["Movies with only 1 rating", "3,446 (35.4% of rated movies)"],
        ["Unique genres", "20 (including \"(no genres listed)\")"],
        ["Sparsity of user-movie matrix", "98.300%"],
    ]
    t = Table(stats_rows, colWidths=[8 * cm, 7 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#7A1E22")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#CCCCCC")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F7F2F2")]),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    flow.append(t)
    flow.append(Spacer(1, 0.3 * cm))

    flow.append(Paragraph("2.2 Rating distribution", styles["H2"]))
    flow.append(Image(os.path.join(FIG_DIR, "rating_distribution.png"),
                       width=11 * cm, height=6.9 * cm))
    flow.append(Paragraph(
        "Figure 1: Distribution of rating values. Whole-star ratings "
        "(3.0, 4.0, 5.0) are more common than half-star ratings, and the "
        "distribution is skewed positive (mean 3.502), which is typical "
        "because users mostly rate movies they chose to watch.",
        styles["Caption"]))

    flow.append(Paragraph("2.3 Ratings per movie &mdash; the long tail", styles["H2"]))
    flow.append(Image(os.path.join(FIG_DIR, "ratings_per_movie.png"),
                       width=11 * cm, height=6.9 * cm))
    flow.append(Paragraph(
        "Figure 2: Ratings per movie, sorted and plotted on a log scale. "
        "A small number of movies receive the vast majority of ratings "
        "while 35.4% of rated movies have only a single rating &mdash; the "
        "classic long-tail pattern in recommendation data.",
        styles["Caption"]))

    flow.append(Paragraph("2.4 Ratings per user", styles["H2"]))
    flow.append(Image(os.path.join(FIG_DIR, "ratings_per_user.png"),
                       width=11 * cm, height=6.9 * cm))
    flow.append(Paragraph(
        "Figure 3: Ratings per user, log scale. GroupLens only included "
        "users with at least 20 ratings when building this dataset, which "
        "is why the minimum is exactly 20; a small number of power users "
        "rate into the thousands.", styles["Caption"]))

    flow.append(Paragraph("2.5 Genre distribution", styles["H2"]))
    flow.append(Image(os.path.join(FIG_DIR, "genre_counts.png"),
                       width=11 * cm, height=8.3 * cm))
    flow.append(Paragraph(
        "Figure 4: Number of movies per genre (a movie can belong to more "
        "than one genre). Drama and Comedy dominate the catalogue; "
        "34 movies have \"(no genres listed)\", which is handled explicitly "
        "during preprocessing rather than dropped.", styles["Caption"]))

    flow.append(Paragraph(
        "With 98.3% sparsity in the user-movie ratings matrix, a dense "
        "matrix-based approach is impractical. This motivates the choice "
        "of item-based similarity, content-based clustering (using genres "
        "and tags) and association rule mining over co-rated items as the "
        "core mining techniques for this project, described in Section 4.",
        styles["BodyText2"]))
    return flow


def section_preprocessing():
    flow = [Paragraph("3. Data Preprocessing", styles["H1"])]
    flow.append(Paragraph(
        "Before any model could be trained, the three raw MovieLens files were "
        "cleaned and transformed as follows. Every step was verified by "
        "printing BEFORE and AFTER counts in the notebook (Phase A2), so no "
        "number below is assumed &mdash; all are computed directly from the "
        "data.", styles["BodyText2"]))

    flow.append(Paragraph("3.1 Duplicates and missing values", styles["H2"]))
    flow.append(Paragraph(
        "No full-row duplicates were found in <b>ratings.csv</b> (100,836 "
        "rows), <b>movies.csv</b> (9,742 rows) or <b>tags.csv</b> (3,683 "
        "rows), and no column in any of the three files had a single "
        "missing value. This is expected because GroupLens pre-cleans this "
        "dataset before release; the duplicate/missing-value checks were "
        "still written defensively (drop_duplicates, dropna/fillna) since a "
        "live system ingesting new ratings would not have this guarantee.",
        styles["BodyText2"]))

    flow.append(Paragraph("3.2 Year extraction and genre encoding", styles["H2"]))
    flow.append(Paragraph(
        "The release year was extracted from each title using the pattern "
        "\"(YYYY)\" at the end of the string (e.g. \"Toy Story (1995)\" "
        "&rarr; year = 1995). 13 out of 9,742 titles had no such year "
        "(mostly TV series included in the catalogue, e.g. \"Black Mirror\", "
        "\"The OA\"); these were kept with a missing year rather than being "
        "dropped. The pipe-separated genre string (e.g. "
        "\"Adventure|Children|Fantasy\") was one-hot encoded into 20 binary "
        "columns, including an explicit \"(no genres listed)\" column for "
        "the 34 movies with no genre data, so that every movie keeps a "
        "valid genre vector.", styles["BodyText2"]))

    flow.append(Paragraph("3.3 Filtering sparse movies and users", styles["H2"]))
    header_after = Paragraph(
        "<b>After filter</b><br/>(movies \u2265 5, users \u2265 10 ratings)",
        ParagraphStyle(name="TblHdr", fontSize=9, leading=11,
                       fontName="Helvetica-Bold", textColor=colors.white,
                       alignment=TA_CENTER))
    filt_rows = [
        ["Metric", "Before filter", header_after],
        ["Total ratings", "100,836", "90,274"],
        ["Unique users", "610", "610"],
        ["Unique movies", "9,724", "3,650"],
    ]
    t = Table(filt_rows, colWidths=[6 * cm, 4 * cm, 6.5 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#7A1E22")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#CCCCCC")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F7F2F2")]),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    flow.append(t)
    flow.append(Spacer(1, 0.2 * cm))
    flow.append(Paragraph(
        "The movie filter removes movies with fewer than 5 ratings, which "
        "cuts the catalogue from 9,724 to 3,650 rated movies &mdash; "
        "consistent with the long-tail pattern found in Phase A1, where "
        "35.4% of movies had only a single rating. The user filter (\u2265 10 "
        "ratings) removes zero users, because MovieLens itself guarantees "
        "every included user has at least 20 ratings.", styles["BodyText2"]))

    flow.append(Paragraph("3.4 \"Liked\" label", styles["H2"]))
    flow.append(Paragraph(
        "A binary label <b>liked = 1</b> was created for every rating of "
        "4.0 or higher, and <b>liked = 0</b> otherwise. After filtering, "
        "44,765 of 90,274 ratings (49.6%) are \"liked\" &mdash; a close to "
        "balanced split, which matters for the optional classification "
        "models in Section 4.", styles["BodyText2"]))

    flow.append(Paragraph("3.5 Tag cleaning and TF-IDF features", styles["H2"]))
    flow.append(Paragraph(
        "Free-text tags were lowercased, stripped of punctuation/digits, "
        "and had common English stopwords removed. All tags for a movie "
        "were joined into one text blob and combined with that movie's "
        "genre words; a TF-IDF vectorizer (300 features, min_df=2) was fit "
        "on this combined text, producing a 3,650 &times; 300 feature "
        "matrix (one row per surviving movie). This TF-IDF matrix feeds "
        "directly into the k-means clustering and hybrid recommender in "
        "Section 4.", styles["BodyText2"]))

    flow.append(Paragraph("3.6 Scaling numeric features", styles["H2"]))
    flow.append(Paragraph(
        "A small numeric feature table (release year, average rating, "
        "number of ratings per movie) was standardised with "
        "<b>StandardScaler</b> (mean 0, standard deviation 1) before being "
        "used by any distance-based algorithm. Before scaling, "
        "<i>num_ratings</i> ranged up to 329 while <i>avg_rating</i> only "
        "ranged 0.8&ndash;4.9; without scaling, a k-means or KNN model "
        "using Euclidean distance would treat differences in rating count "
        "as far more important than differences in rating quality, purely "
        "because of unit scale, not real importance.", styles["BodyText2"]))
    return flow


def section_algorithms():
    flow = [Paragraph("4. Algorithms Implemented", styles["H1"])]
    flow.append(Paragraph(
        "Six models were implemented and kept as small, reusable functions so "
        "they could all be fairly compared in Section 5. This satisfies the "
        "\"at least two algorithms\" requirement several times over, spanning "
        "three different syllabus topics: association rule mining, "
        "classification, and clustering, plus similarity-based retrieval.",
        styles["BodyText2"]))

    flow.append(Paragraph("4.1 Popularity baseline", styles["H2"]))
    flow.append(Paragraph(
        "Every movie is scored with the same weighted-rating formula IMDB "
        "uses: WR = (v/(v+m))&middot;R + (m/(v+m))&middot;C, where v is the "
        "movie's rating count, R its average rating, m the median rating "
        "count across all movies (13 in this dataset), and C the overall "
        "mean rating (3.349). This prevents a movie with very few ratings "
        "from outranking a movie that hundreds of users consistently rated "
        "highly. The top-ranked title was <i>Shawshank Redemption (1994)</i> "
        "with a weighted score of 4.39 (317 ratings, average 4.43).",
        styles["BodyText2"]))

    flow.append(Paragraph("4.2 Item-based KNN (cosine similarity)", styles["H2"]))
    flow.append(Paragraph(
        "Each movie was represented as a vector of its ratings across all "
        "610 users (a 3,650 &times; 610 movie-user matrix), and cosine "
        "similarity was computed between every pair of movies, producing a "
        "3,650 &times; 3,650 item-item similarity matrix. This is "
        "collaborative filtering: two movies are similar if the same users "
        "rated them similarly, regardless of genre. As a sanity check, the "
        "nearest neighbours of <i>Toy Story (1995)</i> were Toy Story 2, "
        "Jurassic Park, Independence Day and Star Wars Episode IV &mdash; "
        "all mainstream mid-1990s blockbusters, confirming the model "
        "captures real co-rating behaviour.", styles["BodyText2"]))

    flow.append(Paragraph("4.3 k-means clustering (genres + tag TF-IDF)", styles["H2"]))
    flow.append(Image(os.path.join(FIG_DIR, "elbow_plot.png"), width=9 * cm, height=5.6 * cm))
    flow.append(Image(os.path.join(FIG_DIR, "silhouette_plot.png"), width=9 * cm, height=5.6 * cm))
    flow.append(Paragraph(
        "Figure 5/6: Elbow plot (inertia) and silhouette score across "
        "k = 2 to 20, on the combined genre one-hot + tag TF-IDF feature "
        "matrix (3,650 movies &times; 320 features).", styles["Caption"]))
    flow.append(Paragraph(
        "The elbow plot flattens out around k=8-10, while the silhouette "
        "score keeps slowly rising to k=20 with no clear peak &mdash; a "
        "common pattern with sparse, high-dimensional text features, where "
        "more clusters can always carve out marginally tighter groups. "
        "<b>k=10</b> was chosen using the elbow plus interpretability "
        "(a manageable, genre-like number of groups), giving a final "
        "silhouette score of <b>0.197</b>. Cluster sizes ranged from 199 to "
        "773 movies.", styles["BodyText2"]))
    flow.append(Image(os.path.join(FIG_DIR, "pca_clusters.png"), width=10 * cm, height=7.5 * cm))
    flow.append(Paragraph(
        "Figure 7: The 10 clusters visualised in 2D via PCA (capturing "
        "32.1% of total variance). Some grouping is visible but with "
        "overlap, since 2 components cannot fully represent a "
        "320-dimensional space &mdash; this plot is for intuition, not the "
        "clustering itself.", styles["Caption"]))

    flow.append(Paragraph("4.4 Association rule mining: Apriori vs FP-Growth", styles["H2"]))
    flow.append(Paragraph(
        "Each user's set of liked movies (rating &ge; 4.0) was treated as a "
        "transaction \"basket\", restricted to the 200 most-liked movies "
        "(599 users &times; 200 movies) to keep the search space tractable "
        "&mdash; rules on movies liked by only 1-2 users would not be "
        "statistically meaningful regardless. Both algorithms were run with "
        "min_support = 0.1 and a maximum itemset size of 3.", styles["BodyText2"]))
    arules_rows = [
        ["Algorithm", "Frequent itemsets", "Rules (lift \u2265 1.0)", "Runtime"],
        ["Apriori", "891", "2,838", "0.0222 s"],
        ["FP-Growth", "891", "2,838", "0.1917 s"],
    ]
    t = Table(arules_rows, colWidths=[4 * cm, 4.2 * cm, 4.2 * cm, 3.6 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#7A1E22")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#CCCCCC")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F7F2F2")]),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
    ]))
    flow.append(t)
    flow.append(Spacer(1, 0.2 * cm))
    flow.append(Paragraph(
        "Both algorithms find the identical 891 frequent itemsets (they "
        "solve the same problem by definition), so the only real "
        "difference is runtime. Apriori was actually faster here because, "
        "at this scale (599 transactions, 200 items), FP-Growth's "
        "advantage &mdash; avoiding repeated database scans for candidate "
        "generation &mdash; does not yet outweigh the overhead of building "
        "its tree structure; this advantage becomes significant on much "
        "larger transaction counts. The top rules by lift surfaced "
        "well-known franchise pairs purely from co-rating behaviour, e.g. "
        "<i>Kill Bill: Vol. 1</i> &rarr; <i>Kill Bill: Vol. 2</i> "
        "(confidence 0.90, lift 6.15), and <i>Godfather</i> &harr; "
        "<i>Godfather: Part II</i> (lift 4.43) &mdash; a strong sanity "
        "check since the model has no knowledge of which movies are "
        "sequels.", styles["BodyText2"]))

    flow.append(Paragraph("4.5 Optional: Decision Tree and Naive Bayes (predicting \"liked\")", styles["H2"]))
    clf_rows = [
        ["Model", "Accuracy", "Precision", "Recall", "F1-score", "5-fold CV accuracy"],
        ["Decision Tree", "0.5978", "0.5995", "0.5695", "0.5841", "0.5947"],
        ["Naive Bayes", "0.5561", "0.6154", "0.2793", "0.3843", "0.5575"],
    ]
    t2 = Table(clf_rows, colWidths=[3.2 * cm, 2.2 * cm, 2.2 * cm, 2 * cm, 2.1 * cm, 2.8 * cm])
    t2.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#7A1E22")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.7),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#CCCCCC")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F7F2F2")]),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
    ]))
    flow.append(t2)
    flow.append(Spacer(1, 0.2 * cm))
    flow.append(Image(os.path.join(FIG_DIR, "confusion_matrices.png"), width=14 * cm, height=6 * cm))
    flow.append(Paragraph(
        "Figure 8: Confusion matrices for both classifiers on the held-out "
        "test set (18,055 ratings, 49.6% liked).", styles["Caption"]))
    flow.append(Paragraph(
        "Both models were trained to predict the binary \"liked\" label "
        "(Phase A2.7) from only a rating's movie genres and release year. "
        "Accuracy for both is only modestly above the 50% chance level "
        "(given the near-balanced class split), which is an expected and "
        "important finding rather than a failure: genre and year describe "
        "the <i>movie</i>, not the <i>person</i> watching it, so they "
        "cannot capture individual taste &mdash; two users can watch the "
        "same film and disagree completely. This directly justifies why "
        "the remaining models in this project rely on personalised "
        "signals (actual rating patterns, content clusters, and co-liked "
        "movies across real users) rather than static movie attributes.",
        styles["BodyText2"]))

    flow.append(Paragraph("4.6 Hybrid: weighted blend of KNN, cluster and popularity", styles["H2"]))
    flow.append(Paragraph(
        "The Hybrid model combines all three personalised/impersonal "
        "signals into one score per candidate movie: "
        "<b>final_score = w<sub>knn</sub>&middot;knn_score + "
        "w<sub>cluster</sub>&middot;cluster_score + "
        "w<sub>pop</sub>&middot;pop_score</b>, with default weights "
        "{knn: 0.5, cluster: 0.3, pop: 0.2} stored in a single, easily "
        "editable dictionary. Given a demo profile of <i>Toy Story</i>, "
        "<i>Jurassic Park</i> and <i>Star Wars Episode IV</i>, the top "
        "recommendations were Star Wars Episodes V and VI, Terminator 2, "
        "The Matrix and Back to the Future &mdash; a coherent blend of "
        "\"people with similar taste also liked this\" (KNN), \"thematically "
        "similar\" (cluster), and \"safe, well-regarded pick\" (popularity). "
        "Setting any one weight to 1.0 and the rest to 0.0 turns this same "
        "function into a pure single-signal recommender, which is how "
        "Section 5 fairly compares every model using one shared scoring "
        "function.", styles["BodyText2"]))
    return flow


def section_results():
    flow = [Paragraph("5. Results and Comparison", styles["H1"])]
    flow.append(Paragraph(
        "To avoid data leakage, users (not individual ratings) were split "
        "80% / 20% into train and test groups (488 train users, 122 test "
        "users). The popularity, item-similarity and association-rule "
        "models were <b>refit using only the 488 train users' ratings</b>, "
        "so the 122 test users are genuinely unseen by these models &mdash; "
        "simulating real new users. Content-based cluster labels (from "
        "Section 4.3) were reused without refitting, since they are built "
        "from movie genres/tags rather than individual user behaviour "
        "(documented as a minor simplification, since a small number of "
        "tags were authored by test-set users).", styles["BodyText2"]))
    flow.append(Paragraph(
        "For each of the 119 eligible test users (3 users had fewer than "
        "6 liked movies and were excluded, as reported explicitly rather "
        "than hidden), only their <b>first 5 liked movies</b> (by rating "
        "date) were revealed to each model as a cold-start profile; the "
        "remaining liked movies were hidden as ground truth. Each model "
        "produced a top-10 recommendation list, scored with four standard "
        "ranking metrics.", styles["BodyText2"]))

    flow.append(Paragraph("5.1 Comparison table (all models, including the weakest)", styles["H2"]))
    results_rows = [
        ["Model", "Precision@10", "Recall@10", "Hit Rate@10", "NDCG@10"],
        ["Item-KNN", "0.2597", "0.0707", "0.6975", "0.2769"],
        ["Hybrid", "0.2538", "0.0620", "0.7395", "0.2764"],
        ["Association Rules", "0.2336", "0.0573", "0.6975", "0.2509"],
        ["Popularity (baseline)", "0.1891", "0.0419", "0.6303", "0.2072"],
        ["Cluster-only", "0.0479", "0.0071", "0.3109", "0.0471"],
    ]
    t = Table(results_rows, colWidths=[4.2 * cm, 3 * cm, 2.7 * cm, 2.9 * cm, 2.5 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#7A1E22")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#CCCCCC")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F7F2F2")]),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
    ]))
    flow.append(t)
    flow.append(Spacer(1, 0.2 * cm))
    flow.append(Paragraph(
        "(Rows sorted by NDCG@10, descending. Evaluated on 119 held-out "
        "test users, top-10 recommendations, 5 known liked movies per "
        "user.)", styles["Caption"]))

    flow.append(Paragraph("5.2 Chart", styles["H2"]))
    flow.append(Image(os.path.join(FIG_DIR, "model_comparison_chart.png"),
                       width=14.5 * cm, height=9 * cm))
    flow.append(Paragraph(
        "Figure 9: All five models compared across all four metrics on the "
        "same 119 held-out test users.", styles["Caption"]))

    flow.append(Paragraph("5.3 Checkpoint: does the Hybrid beat the Popularity baseline?", styles["H2"]))
    flow.append(Paragraph(
        "<b>Yes.</b> The Hybrid model beats the Popularity baseline on "
        "every one of the four metrics (Precision@10: 0.2538 vs 0.1891; "
        "Recall@10: 0.0620 vs 0.0419; Hit Rate@10: 0.7395 vs 0.6303; "
        "NDCG@10: 0.2764 vs 0.2072). Per the project's own evaluation "
        "rule, since the Hybrid clearly outperforms the baseline, there is "
        "no need to stop and revisit the modelling approach.",
        styles["BodyText2"]))
    return flow


def section_conclusion():
    flow = [Paragraph("6. Conclusion", styles["H1"])]
    flow.append(Paragraph(
        "This project built and fairly evaluated five movie recommendation "
        "approaches on the MovieLens ml-latest-small dataset, using a "
        "leakage-free, user-level train/test split and a realistic "
        "cold-start simulation (only 5 known liked movies per test user).",
        styles["BodyText2"]))
    flow.append(ListFlowable([
        ListItem(Paragraph(
            "<b>The Hybrid model (KNN + cluster + popularity) beats the "
            "Popularity baseline on all four metrics</b>, confirming that "
            "combining multiple mining signals is worth the added "
            "complexity rather than just being more complicated for no "
            "benefit.", styles["BodyText2"])),
        ListItem(Paragraph(
            "<b>Item-based KNN (collaborative filtering) is the single "
            "strongest individual signal</b>, slightly ahead of the "
            "Hybrid on raw Precision@10/Recall@10 &mdash; \"people who "
            "rated like you\" is a very direct predictor of taste.",
            styles["BodyText2"])),
        ListItem(Paragraph(
            "<b>The Hybrid achieves the best Hit Rate@10 (0.7395)</b>, "
            "meaning it is the most reliable model at giving at least one "
            "good recommendation to the widest range of users, which "
            "matters in a real product.", styles["BodyText2"])),
        ListItem(Paragraph(
            "<b>Content-based clustering alone is the weakest ranking "
            "model</b>, confirming that genre/tag similarity is a useful "
            "supporting signal inside a hybrid, but is not sufficient on "
            "its own for top-10 ranking.", styles["BodyText2"])),
        ListItem(Paragraph(
            "<b>Association rules perform competitively</b> using only "
            "co-liked movie patterns with a popularity fallback, "
            "validating market-basket-style mining as a genuine "
            "recommendation signal, not just a pattern-mining curiosity.",
            styles["BodyText2"])),
        ListItem(Paragraph(
            "<b>The optional Decision Tree / Naive Bayes classifiers "
            "(Section 4.5) confirmed that genre and release year alone "
            "cannot predict individual \"liked\" status well</b> "
            "(~60% / ~56% accuracy, barely above the 50% chance level), "
            "which justifies why this project relies on personalised, "
            "behaviour-based signals instead of static movie attributes.",
            styles["BodyText2"])),
    ], bulletType="bullet", start="circle"))
    flow.append(Paragraph(
        "Overall, the project demonstrates that classical data mining "
        "techniques &mdash; collaborative filtering, clustering, "
        "association rule mining and classification &mdash; can be "
        "combined into a single working recommender that is measurably "
        "better than a naive popularity-based approach, evaluated "
        "honestly on users the models never saw during fitting.",
        styles["BodyText2"]))
    flow.append(Paragraph("6.1 Saved engine (Phase A5)", styles["H2"]))
    flow.append(Paragraph(
        "The full-dataset versions of every model component (not the "
        "train-only versions used for evaluation) were persisted to disk "
        "with <b>joblib</b>: the movie table, the 3,650&times;3,650 "
        "item-similarity matrix, content-cluster labels, the fitted "
        "TF-IDF vectorizer, the Apriori association rules, and the "
        "popularity scores. A final <code>recommend(liked_movie_ids, "
        "n=10)</code> function loads these 6 files from disk (proving the "
        "save/load round-trip works exactly as the Streamlit app will use "
        "it) and returns the top-N unseen movies with a short, "
        "human-readable reason for each &mdash; \"because you liked X\" "
        "when item-similarity dominates, \"same cluster as X\" when "
        "content-clustering dominates, or \"popular pick\" for a true "
        "cold-start user with no liked movies at all. All three cases "
        "were verified directly in the notebook with real test profiles.",
        styles["BodyText2"]))
    flow.append(Paragraph(
        "With this, Part A (the data mining notebook) is complete: the "
        "notebook runs top to bottom with Restart &amp; Run All with zero "
        "errors, and the engine is ready to be consumed by the Part B web "
        "application.", styles["BodyText2"]))
    return flow


def section_references():
    flow = [Paragraph("7. References", styles["H1"])]
    refs = [
        "F. M. Harper and J. A. Konstan, \"The MovieLens Datasets: History "
        "and Context,\" ACM Transactions on Interactive Intelligent "
        "Systems, 2015. Dataset: https://grouplens.org/datasets/movielens/",
        "Pedregosa et al., \"Scikit-learn: Machine Learning in Python,\" "
        "Journal of Machine Learning Research, 2011.",
        "Raschka, S., \"MLxtend: Providing machine learning and data "
        "science utilities and extensions,\" Journal of Open Source "
        "Software, 2018. (used for Apriori and FP-Growth)",
        "pandas development team, \"pandas: powerful data analysis "
        "toolkit,\" https://pandas.pydata.org/",
    ]
    items = [ListItem(Paragraph(r, styles["BodyText2"])) for r in refs]
    flow.append(ListFlowable(items, bulletType="1", start=1))
    return flow


# ---------------------------------------------------------------------------
# ASSEMBLE
# ---------------------------------------------------------------------------
def main():
    doc = build_doc()
    story = []

    # --- Title page (template: TitlePage, no page number) ---
    story.append(NextPageTemplate("TitlePage"))
    story += title_page()
    story.append(PageBreak())

    # --- Table of contents (template: TOC, roman numeral "i") ---
    story.append(NextPageTemplate("TOC"))
    story += toc_page()
    story.append(PageBreak())

    # --- Body (template: Body, Arabic numerals starting at 1) ---
    story.append(NextPageTemplate("Body"))
    story += section_introduction()
    story.append(Spacer(1, 0.3 * cm))
    story += section_dataset()
    story.append(PageBreak())
    story += section_preprocessing()
    story.append(Spacer(1, 0.3 * cm))
    story += section_algorithms()
    story.append(Spacer(1, 0.3 * cm))
    story += section_results()
    story.append(Spacer(1, 0.3 * cm))
    story += section_conclusion()
    story.append(Spacer(1, 0.3 * cm))
    story += section_references()

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Report written to {OUT_PATH}")


if __name__ == "__main__":
    main()
