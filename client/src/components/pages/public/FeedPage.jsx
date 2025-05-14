import { useEffect, useState } from "react";
import app from "../../../firebase/FirebaseConfig";
import { getFirestore, collection, addDoc, setDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from 'uuid';
import "./FeedPage.css";

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth();

export default function FeedPage() {
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friendLikes, setFriendLikes] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [editedImage, setEditedImage] = useState(null);

  const groupLikesByUserSession = async (likes, thresholdMinutes = 45) => {
    const grouped = [];
    const userSessions = new Map();


    likes.forEach(like => {
      const userSession = userSessions.get(like.uid);
      const likeTime = new Date(like.likedAt.toDate());

      if (userSession && (likeTime - userSession.lastLikeTime) / 60000 < thresholdMinutes) {
        userSession.songs.push(like);
        userSession.lastLikeTime = likeTime;
      } else {
        const newGroup = {
          uid: like.uid,
          username: like.username,
          songs: [like],
          lastLikeTime: likeTime,
        }
        grouped.push(newGroup);
        userSessions.set(like.uid, newGroup);
      }
    });

    return grouped;
  };

  useEffect(() => {
    const fetchFriendsLikes = async () => {
      const q = query(collection(db, "likedSongsFeed"), orderBy("likedAt", "desc"));
      const likedSongsFeedDoc = await getDocs(q);

      const likes = await Promise.all(likedSongsFeedDoc.docs.map(async docSnap => {
        const data = docSnap.data();
        let username = "Unknown User";
        if (data.uid) {
          const userDoc = await getDoc(doc(db, "users", data.uid));
          if (userDoc.exists()) {
            username = userDoc.data().username || username;
          }
        }

        return { ...data, id: docSnap.id, username };
      }));
      likes.sort((a, b) => a.likedAt.toDate() - b.likedAt.toDate());

      const grouped = await groupLikesByUserSession(likes);
      setFriendLikes(grouped);
    };
    fetchFriendsLikes();
  }, []);

  const fetchPosts = async () => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    const postsData = await Promise.all(snapshot.docs.map(async docSnap => {
      const post = docSnap.data();
      let username = "Unknown User";
      if (post.uid) {
        const userDoc = await getDoc(doc(db, "users", post.uid));
        if (userDoc.exists()) {
          username = userDoc.data().username || username;
        }
      }
      return { ...post, id: docSnap.id, username };
    }));
    setPosts(postsData);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser || (!text.trim() && !image)) return;
  
    if (text.length > 300) {
      alert("Post text cannot exceed 300 characters.");
      return;
    }

    let postUid = uuidv4();
    let imageUrl = "";
    if (image) {
      const formData = new FormData();
      formData.append("photo", image);
      formData.append("postUid", postUid);
      const idToken = await currentUser.getIdToken();
      const response = await fetch("http://localhost:3000/api/profile-photo/upload-feed-photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (data.imageUrl) {
        imageUrl = data.imageUrl;
      }
    }
    await setDoc(doc(db, "posts", postUid), {
      text,
      imageUrl,
      imagePath: `feed_photos/${currentUser.uid}/${postUid}.jpg`,
      timestamp: new Date(),
      postUid,
      uid: currentUser.uid
    });

    setText("");
    setImage(null);
    setShowForm(false);
    fetchPosts();
  };

  const handleDelete = async (post) => {
    if (!auth.currentUser) {
      alert("You must be logged in to delete posts.");
      return;
    }
    if (post.imagePath) {
      const imageRef = ref(storage, post.imagePath);
      await deleteObject(imageRef);
    }
    await deleteDoc(doc(db, "posts", post.postUid));
    fetchPosts();
  };

  const handleEdit = (post) => {
    setEditingPostId(post.postUid);
    setEditedText(post.text);
    setEditedImage(null);
  };

  const handleSaveEdit = async (post) => {
    const postRef = doc(db, "posts", post.postUid);
    let updatedData = { text: editedText, imageUrl: "" };

    if (editedImage) {
      const formData = new FormData();
      formData.append("photo", editedImage);
      formData.append("postUid", post.postUid);
      const idToken = await currentUser.getIdToken();
      const response = await fetch("http://localhost:3000/api/profile-photo/change-feed-photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (data.imageUrl) {
        updatedData.imageUrl = data.imageUrl;
      }
    }
    await updateDoc(postRef, updatedData);
    setEditingPostId(null);
    setEditedText("");
    setEditedImage(null);
    fetchPosts();
  };

  const currentUser = auth.currentUser;

  return (
    <div className="feed-container">
      {/* ///////////////////////////////////////////////////////////////// */}
      <button className="create-post-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Create Post"}
      </button>

      {showForm && (
        //{/* ///////////////////////////////////////////////////////////////// */}

        <form onSubmit={handleSubmit} className="post-form">
          <textarea
            placeholder="What's on your mind? (Optional)"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />      
           {/* ///////////////////////////////////////////////////////////////// */}
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
          <button type="submit">Post</button>
        </form>
      )}
      <div className="feed">
        <div className="friends-likes">
          {friendLikes.length > 0 && friendLikes.map((session, index) => (
            <div key={index} className="post-item">
              <p><strong>{session.username}</strong> liked {session.songs.length} song{session.songs.length > 1 ? 's' : ''}</p>
              <ul>
                {session.songs.slice(0, 5).map(song => (
                  <li key={song.id}>
                    <p>{song.song_name} - {song.artist_name}</p>
                  </li>
                ))}
              </ul>
              {session.songs.length > 5 && (<p> plus {session.songs.length - 5} more...</p>)}
            </div>
          ))}
        </div>


        <div className="posts-list">
          <h2>Recent Posts</h2>
          {posts.map((post) => (
            <div className="post-item" key={post.postUid}>
              <p className="post-author">Posted by: {post.username}</p>
              {editingPostId === post.postUid ? (
                <>
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                  />
    {/* ///////////////////////////////////////////////////////////////// */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditedImage(e.target.files[0])}
                  />
                  <button onClick={() => handleSaveEdit(post)}>Save</button>
                  <button onClick={() => setEditingPostId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  {post.text && <p>{post.text}</p>}
                  {post.imageUrl && <img src={post.imageUrl} alt="post" className="post-image" />}
                  {currentUser?.uid === post.uid && (
 //      {/* ///////////////////////////////////////////////////////////////// */}

                    <div className="post-actions">
                      <button onClick={() => handleEdit(post)}>Edit</button>
                      <button onClick={() => handleDelete(post)}>Delete</button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
