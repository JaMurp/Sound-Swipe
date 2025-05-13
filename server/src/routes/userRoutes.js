import { Router } from 'express';
import * as swipingFunctions from '../data/swipingFunctions.js'
import userDataFunctions from '../data/index.js'

const router = Router();

router.get('/profile', async (req, res) => {
  try {
    const currentUserId = req.user.uid;
    const userExists = await userDataFunctions.userExists(currentUserId);
    if (!userExists) {
      return res.status(404).json({ error: `Could not fetch profile ${currentUserId}` });
    }
    const getProfile = await userDataFunctions.getUser(currentUserId)
    if (!getProfile) return res.status(404).json({ error: `Could not fetch profile ${req.user.username}` })
    return res.status(200).json(getProfile);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: `Interal Server Error` })
  }
});

router.get('/profile/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const userExists = await userDataFunctions.userExists(userId);
    if (!userExists) {
      return res.status(404).json({ error: `Could not fetch profile with id '${userId}'` });
    }
    const getProfile = await userDataFunctions.getUser(userId)
    if (!getProfile) return res.status(404).json({ error: 'Profile not found' })
    return res.status(200).json(getProfile);
  } catch (e) {
    return res.status(500).json({ error: 'Interal Server Error' })
  }
});


// router.get('/liked-songs/:id', async (req, res) => {
//   // #TODO check the uid
//   console.log("hi")
//   try {
//     const likedSongs = await userDataFunctions.getLikedSongs(req.params.id)
//     console.log(likedSongs)
//     if (!likedSongs) return res.status(500).json({error :'Internal Server Error'})
//     return res.status(200).json(likedSongs)
//   } catch (e) {
//     console.log(e)
//     return res.status(500).json({ error: 'Interal Server Error' })
//   }
// })

router.get('/notifications', async (req, res) => {
  try {
    if (req.query.startAfter && typeof req.query.startAfter !== 'string') return res.status(400).json({ error: 'Invalid startAfter value' });
    const getNotifs = await userDataFunctions.getNotifications(req.user.uid, req.query.startAfter)
    return res.status(200).json(getNotifs);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.patch('/profile', async (req, res) => {
  // #TODO check body and make sure the atleast 1 param provided also check the params if they are provided
  try {
    await userDataFunctions.updateUser(req.user.uid, req.body)
    return res.status(200).json({ success: true, message: 'succesfully updated the user' });
  } catch (e) {
    console.log(e)
    return res.status(500).json({ error: e })
  }
});

router.delete('/profile', async (req, res) => {
  // #TODO check uid
  try {
    await userDataFunctions.deleteUser(req.user.uid)
    return res.status(200).json({ success: true, message: 'deleted profile successfully' })
  } catch (e) {
    console.log(e)

    return res.status(500).json({ error: e })

  }

});

router.delete('/notifications/:id', async (req, res) => {
  try {
    console.log(req.user.uid)
    console.log(req.params.id)
    await userDataFunctions.deleteNotif(req.user.uid, req.params.id)
    return res.status(200).json({ success: true, message: 'deleted notification successfully' })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ error: e })

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

      return res.status(200).json({ success: true, message: 'synced profile' });
    }

    return res.status(200).json({ success: true });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/friend-request/:id', async (req, res) => {
  try {
    const currentUserId = req.user.uid;
    const friendId = req.params.id;
    const userExists = await userDataFunctions.userExists(currentUserId);
    const friendExists = await userDataFunctions.userExists(friendId);
    if (!userExists) {
      return res.status(404).json({ error: `Could not fetch profile ${currentUserId}` });
    }
    if (!friendExists) {
      return res.status(404).json({ error: `Could not fetch profile ${friendId}` });
    }
    if (!friendId || currentUserId === friendId) {
      return res.status(400).json({ error: 'Invalid friend ID' });
    }

    const status = await userDataFunctions.requestFriend(currentUserId, friendId);
    return res.status(200).json(status);

  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/accept-request/:id', async (req, res) => {
  try {
    const currentUserId = req.user.uid;
    const friendId = req.params.id;
    const userExists = await userDataFunctions.userExists(currentUserId);
    const friendExists = await userDataFunctions.userExists(friendId);
    if (!userExists) {
      return res.status(404).json({ error: `Could not fetch profile ${currentUserId}` });
    }
    if (!friendExists) {
      return res.status(404).json({ error: `Could not fetch profile ${friendId}` });
    }
    if (!friendId || currentUserId === friendId) {
      return res.status(400).json({ error: 'Invalid friend ID' });
    }

    const status = await userDataFunctions.acceptRequest(currentUserId, friendId);
    return res.status(200).json(status);

  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/reject-request/:id', async (req, res) => {
  try {
    const currentUserId = req.user.uid;
    const friendId = req.params.id;
    const userExists = await userDataFunctions.userExists(currentUserId);
    const friendExists = await userDataFunctions.userExists(friendId);
    if (!userExists) {
      return res.status(404).json({ error: `Could not fetch profile ${currentUserId}` });
    }
    if (!friendExists) {
      return res.status(404).json({ error: `Could not fetch profile ${friendId}` });
    }
    if (!friendId || currentUserId === friendId) {
      return res.status(400).json({ error: 'Invalid friend ID' });
    }

    const status = await userDataFunctions.rejectRequest(currentUserId, friendId);
    return res.status(200).json(status);

  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/remove-friend/:id', async (req, res) => {
  try {
    const currentUserId = req.user.uid;
    const friendId = req.params.id;
    const userExists = await userDataFunctions.userExists(currentUserId);
    const friendExists = await userDataFunctions.userExists(friendId);
    if (!userExists) {
      return res.status(404).json({ error: `Could not fetch profile ${currentUserId}` });
    }
    if (!friendExists) {
      return res.status(404).json({ error: `Could not fetch profile ${friendId}` });
    }
    if (!friendId || currentUserId === friendId) {
      return res.status(400).json({ error: 'Invalid friend ID' });
    }

    const status = await userDataFunctions.removeFriend(currentUserId, friendId);
    return res.status(200).json(status);

  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/login-recommendations', async (req, res) => {
  try {
    const currentUserId = req.user.uid;
    const userExists = await userDataFunctions.userExists(currentUserId);
    if (!userExists) {
      return res.status(404).json({ error: `Could not fetch profile ${currentUserId}` });
    }
    const getProfile = await userDataFunctions.getUser(currentUserId);
    if (!getProfile) return res.status(404).json({ error: `Could not fetch profile ${req.user.username}` });
    const status = await userDataFunctions.notifyRecommendations(currentUserId);
    console.log(status);
    return res.status(200).json(status);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: `Interal Server Error` })
  }
});



router.get('/liked-songs/:id', async (req, res) => {
  if (req.params.id === 'me') {
    try {
      const getLikesSongs = await userDataFunctions.getLikedSongs(req.user.uid);
      if (!getLikesSongs) return res.status(404).json({ error: 'No liked songs found' });
      return res.status(200).json(getLikesSongs);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    try {

      const showLikesOnProfile = await userDataFunctions.checkShowLikesOnProfile(req.params.id);


      if (!showLikesOnProfile) {
        return res.status(200).json({ success: true, message: 'User has hidden their liked songs', private: true });
      }

      const requestingUser = await userDataFunctions.getUser(req.user.uid);
      const targetUser = await userDataFunctions.getUser(req.params.id);



      if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      let isFriend = false;
      for (const friend of requestingUser.friends) {
        if (friend.id === req.params.id) {
          isFriend = true;
          break;
        }
      }

      if (!isFriend) {
        return res.status(403).json({ error: 'Not authorized to view liked songs' });
      }

      const getLikesSongs = await userDataFunctions.getLikedSongs(req.params.id);
      if (!getLikesSongs) return res.status(404).json({ error: 'No liked songs found' });
      return res.status(200).json(getLikesSongs);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});


router.get('/swipe-songs', async (req, res) => {
  // #TODO check the inputs
  try {

    const getSongs = await swipingFunctions.getSwipeSongs(req.user.uid);
    return res.status(200).json(getSongs);

  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: `Interal Server Error` })
  }
});


export default router;
