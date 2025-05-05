import {Router} from 'express';
import userDataFunctions from '../data/index.js'

const router = Router();

router.post('/sync-user', async (req, res) => {
    console.log(req.user)
    try {
    
      const userExists = await userDataFunctions.userExists(req.user.uid);
  
      if (!userExists) {
        const insertedUser = await userDataFunctions.createUser(req.user.uid, req.user.displayName, req.user.photoURL);
  
        if (!insertedUser) {
          return res.status(500).json({ error: 'Failed to insert user' });
        }
  
        return res.status(403).json({ error: 'User created but access is denied on first sync' });
      }
  
      return res.status(200).json({ success: true });
  
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

export default router;
