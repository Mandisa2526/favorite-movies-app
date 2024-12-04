import { Router } from "express";
import pgPkg from "pg";
import 'dotenv/config';
import { authenticateToken } from "../middleware/authMiddleware.js";

const { Client } = pgPkg;
const router = Router();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

client.connect()
  .then(() => console.log("Connected to database"))
  .catch((err) => console.error("Database connection error:", err));

// Add Favorite
router.post("/", authenticateToken, async (req, res) => {
  const { movieId, title, releaseDate, posterPath } = req.body;
  const userId = req.user.id;

  try {
    // Check if the movie exists in the database
    const movieResult = await client.query(
      `SELECT id FROM Movies WHERE tmdb_id = $1`,
      [movieId]
    );
    let movieDatabaseId = movieResult.rows[0]?.id;

    // If movie doesn't exist, insert it
    if (!movieDatabaseId) {
      const insertResult = await client.query(
        `INSERT INTO Movies (tmdb_id, title, release_date, poster_path)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [movieId, title, releaseDate, posterPath]
      );
      movieDatabaseId = insertResult.rows[0].id;
    }

    // Insert into Favorites
    await client.query(
      `INSERT INTO Favorites (user_id, movie_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userId, movieDatabaseId]
    );

    res.status(201).json({ message: "Added to favorites" });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(500).json({ error: "Error adding favorite" });
  }
});

// Get Favorites
router.get("/", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await client.query(
      `SELECT m.*
       FROM Movies m
       INNER JOIN Favorites f ON m.id = f.movie_id
       WHERE f.user_id = $1`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Error fetching favorites" });
  }
});

// Delete Favorite
router.delete("/:movieId", authenticateToken, async (req, res) => {
  const { movieId } = req.params;
  const userId = req.user.id;

  try {
    const movieResult = await client.query(
      `SELECT id FROM Movies WHERE tmdb_id = $1`,
      [movieId]
    );
    const movieDatabaseId = movieResult.rows[0]?.id;

    if (!movieDatabaseId) {
      return res.status(404).json({ error: "Movie not found" });
    }

    await client.query(
      `DELETE FROM Favorites WHERE user_id = $1 AND movie_id = $2`,
      [userId, movieDatabaseId]
    );

    res.status(200).json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ error: "Error removing favorite" });
  }
});

export default router;
