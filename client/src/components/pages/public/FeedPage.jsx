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
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [editedImage, setEditedImage] = useState(null);

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
      <button className="create-post-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Create Post"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="post-form">
          <textarea
            placeholder="What's on your mind? (Optional)"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
          <button type="submit">Post</button>
        </form>
      )}

      <div className="posts-list">
        {posts.map((post) => (
          <div className="post-item" key={post.postUid}>
            <p className="post-author">Posted by: {post.username}</p>
            {editingPostId === post.postUid ? (
              <>
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                />
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
  );
}
