import {Router} from 'express';
import userDataFunctions from '../data/index.js'

const router = Router();

router.get('/profile', async (req, res) => {
  // #TODO check the uid
  try {
      const getProfile = await userDataFunctions.getUser(req.user.uid) 
      if (!getProfile) return res.status(500).json({error: 'Internal Server Error'})
      return res.status(200).json(getProfile);
  } catch(e) {
      return res.status(500).json({error: 'Interal Server Error'})
  }
});

router.get('/profile/:id', async (req, res) => {
    // #TODO check the uid 
    //  (updated to not getUser using uid, may no longer be necessary)
    try {
        const getProfile = await userDataFunctions.getUser(req.params.id) 
        if (!getProfile) return res.status(404).json({error: 'Profile not found'})
        return res.status(200).json(getProfile);
    } catch(e) {
        return res.status(500).json({error: 'Interal Server Error'})
    }
});

router.patch('/profile', async (req, res) => {
    // #TODO check body and make sure the atleast 1 param provided also check the params if they are provided
    try {
        await userDataFunctions.updateUser(req.user.uid, req.body)
        return res.status(200).json({success: true, message: 'succesfully updated the user'}); 
    } catch(e) {
        console.log(e)
        return res.status(500).json({error: e})
    }
});

router.delete('/profile', async (req, res) => {
    // #TODO check uid
    try {
        await userDataFunctions.deleteUser(req.user.uid)
        return res.status(200).json({success: true, message: 'deleted profile successfully'})
    } catch(e){
        return res.status(500).json({error:e})
    }

});

router.post('/sync-user', async (req, res) => {
    // #TODO chdeck the inputs 
    try {
    
      const userExists = await userDataFunctions.userExists(req.user.uid);
  
      if (!userExists) {
        const insertedUser = await userDataFunctions.createUser(req.user.uid, req.user.displayName, req.user.photoURL);
  
        if (!insertedUser) {
          return res.status(500).json({ error: 'Failed to insert user' });
        }
  
        return res.status(200).json({success: true, message: 'synced profile'});
      }
  
      return res.status(200).json({ success: true });
  
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

export default router;
