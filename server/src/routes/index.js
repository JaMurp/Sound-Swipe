import userRoutes from './userRoutes.js';
import songRoutes from './songRoutes.js';



const constructor = (app) => {
    // handles the user routes
    app.use('/api/users', userRoutes);
    // handles the song routes
    app.use('/api/songs', songRoutes);
    // handles all the other routes
    app.use((req, res) => {
        res.status(404).json({error: 'Route Not Found!'});
    });
};

export default constructor;