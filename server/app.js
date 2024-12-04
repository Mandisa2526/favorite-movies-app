import 'dotenv/config';
import express, { json } from "express";
import authRoutes from "./routes/auth.js";
import moviesRoutes from './routes/movies.js';
import favoritesRoutes from './routes/favourite.js'

const app = express();

// Middleware
app.use(json());

// Routes
app.use("/routes/auth", authRoutes);
app.use("/routes/movies", moviesRoutes);
app.use('/routes/favourite', favoritesRoutes);


// Root Route
app.get("/", (req, res) => {
  res.send("API is running");
});

export default app;
