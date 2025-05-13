export function checkPostUid(postUid) {
    if (typeof postUid !== 'string' || !postUid.trim()) {
      throw 'Invalid postUid';
    }
    return postUid.trim();
  }
  
  export function validateUploadedFile(file) {
    if (!file || typeof file !== 'object') {
      throw 'No file uploaded';
    }
  
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw 'Invalid file type';
    }
  
    return true;
  }
  