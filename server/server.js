import express from 'express';
import authRoutes from './routes/auth.js'; // Adjust path to your auth.js file
import moviesRoutes from './routes/movies.js';
import favoritesRoutes from './routes/favourite.js'
import cors from 'cors';

const app = express();
app.use(cors());
// Middleware to parse JSON
app.use(express.json());

// Use the router from the auth module
app.use('/routes/auth', authRoutes);
app.use("/routes/movies", moviesRoutes);
app.use("/routes/favourite", favoritesRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
