import { Router } from 'express';
import * as swipingFunctions from '../data/swipingFunctions.js'
import userDataFunctions from '../data/index.js'
import { isValidUid, isValidString, isNotEmpty, isValidUsername } from '../helpers/userHelpers.js';


const router = Router();

router.get('/profile', async (req, res) => {
  try {
    const currentUserId = req.user.uid;
    const userExists = await userDataFunctions.userExists(currentUserId);
    if (!userExists) {
      return res.status(404).json({ error: `Could not fetch profile ${currentUserId}` });
    }
    const getProfile = await userDataFunctions.getUser(currentUserId)
    if (!getProfile) return res.status(404).json({ error: `Could not fetch profile ${req.user.username}` });
    return res.status(200).json(getProfile);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: `Interal Server Error` });
  }
});

router.get('/profile/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    if (!isValidUid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    const userExists = await userDataFunctions.userExists(userId);
    if (!userExists) {
      return res.status(404).json({ error: `Could not fetch profile with id '${userId}'` });
    }
    const getProfile = await userDataFunctions.getUser(userId)
    if (!getProfile) return res.status(404).json({ error: 'Profile not found' });
    return res.status(200).json(getProfile);
  } catch (e) {
    return res.status(500).json({ error: 'Interal Server Error' });
  }
});

router.get('/notifications', async (req, res) => {
  try {
    if (req.query.startAfter && !isValidString(req.query.startAfter)) return res.status(400).json({ error: 'Invalid startAfter value' });
    const getNotifs = await userDataFunctions.getNotifications(req.user.uid, req.query.startAfter)
    return res.status(200).json(getNotifs);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.patch('/profile', async (req, res) => {
  if (!isNotEmpty(req.body)) {
    console.log('err')
    return res.status(400).json({ error: 'At least one field is required for update' });
  }
  for (const [key, value] of Object.entries(req.body)) {
    if (!isValidString(value)) {
      console.log('1' + value)
      return res.status(400).json({ error: `Invalid value for ${key}` });
    }
  }
  if (req.body.username && !isValidUsername(req.body.username)) {
    console.log('here')
    return res.status(400).json({ error: `Username cannot contain spaces or be more than 15 characters long` });
  }
  try {
    const response = await userDataFunctions.userExists(req.body.username)
    if (!response) throw 'success';
    console.log(response);
  } catch {
    try {
      console.log('update');
      await userDataFunctions.updateUser(req.user.uid, req.body)
      return res.status(200).json({ success: true, message: 'succesfully updated the user' });
    } catch (e) {
      console.log(e)
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  console.log('joe')
  return res.status(400).json({ error: 'username is taken' })
  // I said username in the error as I don't want to potentially reveal that this is someones uid, for security purposes

});

router.delete('/profile', async (req, res) => {

  try {
    await userDataFunctions.deleteUser(req.user.uid)
    return res.status(200).json({ success: true, message: 'deleted profile successfully' });
  } catch (e) {
    console.log(e)

    return res.status(500).json({ error: 'Internal Server Error' });

  }

});

router.delete('/notifications/:id', async (req, res) => {
  try {
    await userDataFunctions.deleteNotif(req.user.uid, req.params.id)
    return res.status(200).json({ success: true, message: 'deleted notification successfully' });
  } catch (e) {
    console.log(e)
    return res.status(500).json({ error: 'Internal Server Error' });

  }
});

router.post('/sync-user', async (req, res) => {
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

    if (!isValidUid(friendId) || req.user.uid === friendId) {
      return res.status(400).json({ error: 'Invalid friend ID' });
    }

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

    if (!friendId || currentUserId === friendId) {
      return res.status(400).json({ error: 'Invalid friend ID' });
    }

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

    if (!isValidUid(friendId) || req.user.uid === friendId) {
      return res.status(400).json({ error: 'Invalid friend ID' });
    }

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

    if (!isValidUid(friendId) || req.user.uid === friendId) {
      return res.status(400).json({ error: 'Invalid friend ID' });
    }

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
    return res.status(200).json(status);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: `Interal Server Error` });
  }
});



router.get('/liked-songs/:id', async (req, res) => {
  const uid = req.params.id;

  if (!isValidUid(uid)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  if (uid === 'me') {
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
    return res.status(500).json({ error: `Interal Server Error` });
  }
});


export default router;
