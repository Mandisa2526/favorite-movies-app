import { Router } from "express";
import axios from "axios";

const router = Router();

router.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        query,
      },
    });

    res.status(200).json(response.data.results);
  } catch (error) {
    res.status(500).json({ error: "Error fetching movies" });
  }
});

export default router;

