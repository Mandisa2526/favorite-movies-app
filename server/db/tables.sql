-- Create Users table
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);



-- Create Movies table
CREATE TABLE Movies (
    id SERIAL PRIMARY KEY,
    tmdb_id INT UNIQUE NOT NULL,   -- ID from TMDB API
    title VARCHAR(255) NOT NULL,
    release_date DATE,
    poster_path VARCHAR(255),       -- Path to movie poster
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Favorites table (linking Users and Movies)
CREATE TABLE Favorites (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    movie_id INT REFERENCES Movies(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_id)       -- Ensure no duplicate favorite entries
);