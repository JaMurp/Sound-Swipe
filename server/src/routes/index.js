import userRoutes from './userRoutes.js';
import songRoutes from './songRoutes.js';
import leaderboardRoutes from './leaderboardRoutes.js'
import profilePhotoRoutes from './profilePhoto.js';


const constructor = (app) => {
    // handles the user routes
    app.use('/api/users', userRoutes);
    // handles the song routes
    app.use('/api/songs', songRoutes);
    // handles the leaderboard routes
    app.use('/api/leaderboards', leaderboardRoutes);
    app.use('/api/profile-photo', profilePhotoRoutes);
    // handles all the other routes
    app.use((req, res) => {
        res.status(404).json({error: 'Route Not Found!'});
    });
};

export default constructor;