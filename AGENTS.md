
- Post like/comment counts come from the `get_post_counts` database function, not by fetching rows (avoids the 1000-row cap).
- The feed loads 20 posts per page and ranks each page on its own, so posts already on screen never reorder.
