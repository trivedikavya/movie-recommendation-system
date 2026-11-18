# Movie poster images (optional, manual)

This app does **not** fetch posters from any external API. Instead, every
movie card tries to load a local image from this folder, and only falls
back to a colourful dark gradient card (with the title as text) if no
matching file is found.

## How to add a poster for a specific movie

1. Run the app and find the movie's **numeric ID** -- either search for it
   on the **Browse** page and open its detail page (the URL will look like
   `/movie/1`, where `1` is the ID), or check `web/model-data/movies.json`.
2. Save your image file into this folder, named **exactly** as the movie's
   ID, with either a `.jpg` or `.png` extension:

   ```
   web/public/posters/1.jpg      <- Toy Story (1995), movieId = 1
   web/public/posters/480.png    <- Jurassic Park (1993), movieId = 480
   ```

3. Refresh the page. No restart, no code changes, no build step needed --
   the app checks for the file at request time.

That's it. Any portrait-ish image works; it will be cropped to fit the
card. If you don't have a poster for a movie, just don't add a file for
it -- the gradient fallback card (random-looking colour per movie, varying
between red/blue/green/purple/teal/etc.) is the permanent design for every
movie without a manually-added image, not just a placeholder.
