import { useEffect, useState } from "react";
import app from "../../../firebase/FirebaseConfig";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getAuth } from "firebase/auth";
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

    let imageUrl = "";
    let imagePath = "";

    if (image) {
      const imageRef = ref(storage, `images/${Date.now()}-${image.name}`);
      await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(imageRef);
      imagePath = imageRef.fullPath;
    }

    await addDoc(collection(db, "posts"), {
      text,
      imageUrl,
      imagePath,
      timestamp: new Date(),
      uid: currentUser.uid
    });

    setText("");
    setImage(null);
    setShowForm(false);
    fetchPosts();
  };

  const handleDelete = async (post) => {
    if (post.imagePath) {
      const imageRef = ref(storage, post.imagePath);
      await deleteObject(imageRef).catch(() => {});
    }
    await deleteDoc(doc(db, "posts", post.id));
    fetchPosts();
  };

  const handleEdit = (post) => {
    setEditingPostId(post.id);
    setEditedText(post.text);
    setEditedImage(null);
  };

  const handleSaveEdit = async (post) => {
    const postRef = doc(db, "posts", post.id);
    let updatedData = { text: editedText };

    if (editedImage) {
      if (post.imagePath) {
        const oldImageRef = ref(storage, post.imagePath);
        await deleteObject(oldImageRef).catch(() => {});
      }

      const newImageRef = ref(storage, `images/${Date.now()}-${editedImage.name}`);
      await uploadBytes(newImageRef, editedImage);
      const newImageUrl = await getDownloadURL(newImageRef);

      updatedData.imageUrl = newImageUrl;
      updatedData.imagePath = newImageRef.fullPath;
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
          <div className="post-item" key={post.id}>
            <p className="post-author">Posted by: {post.username}</p>
            {editingPostId === post.id ? (
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
