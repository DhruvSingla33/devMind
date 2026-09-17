import { Platform } from 'react-native';
import { uploadLocalFile } from '../api/upload.api';

// Web-only: opens a real browser file picker via a hidden <input type="file">
// and resolves with the selected File. There's no native file/document picker
// dependency installed (and the admin panel is web-only anyway), so this
// talks to the DOM directly rather than adding one.
export function pickFile(accept = '*/*') {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'web') {
      reject(new Error('File picking is only supported on web.'));
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';
    input.onchange = () => {
      const file = input.files && input.files[0];
      document.body.removeChild(input);
      if (file) resolve(file);
      else reject(new Error('No file selected'));
    };
    document.body.appendChild(input);
    input.click();
  });
}

// Uploads straight to the backend's local-disk storage (multipart/form-data
// -> multer -> uploads/<folder>/, see localUpload.middleware.js on the
// backend). The S3 presigned-PUT flow (getPresignedUrl in upload.api.js) is
// kept for later but not used here anymore.
export async function uploadFile(file, folder = 'general') {
  const { fileKey, publicUrl } = await uploadLocalFile(file, folder);
  return { fileKey, publicUrl };
}
