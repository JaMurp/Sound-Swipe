import express from "express";
import configRoutes from './routes/index.js';
import cors from 'cors';
import { verifyFirebaseToken } from './middleware/authMiddleware.js';


// create a server
const app = express();
app.use(express.json());

app.use(cors({ origin: 'http://localhost:5173', }));

//middleware to check the validation of the jwt token 
app.use(verifyFirebaseToken);
// mounts the routes
configRoutes(app);

// server is running on port 3000
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

export default app;