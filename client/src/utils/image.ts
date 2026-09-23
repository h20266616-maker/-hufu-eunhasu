const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;
const THUMBNAIL_MAX_DIMENSION = 720;
const THUMBNAIL_JPEG_QUALITY = 0.5;

/** 큰 사진(특히 앨범에서 고른 고해상도 사진)을 캔버스로 줄여서 미리보기·업로드가 무거워지지 않게 한다 */
export function resizeImageFile(file: File, maxDimension = MAX_DIMENSION): Promise<File> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const { width, height } = image;
      const scale = Math.min(1, maxDimension / Math.max(width, height));

      // 이미 충분히 작으면 다시 인코딩하지 않고 원본을 그대로 쓴다
      if (scale >= 1) {
        resolve(file);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('canvas 2d context를 만들지 못했어요'));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('이미지를 줄이지 못했어요'));
            return;
          }
          resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
        },
        'image/jpeg',
        JPEG_QUALITY,
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('이미지를 읽지 못했어요. 파일이 손상됐을 수 있어요.'));
    };

    image.src = objectUrl;
  });
}

/** 영수증 내역에 함께 저장할 작은 썸네일을 만든다. Firestore 문서 용량 제한 때문에 미리보기보다 훨씬 작게 압축한다 */
export function createReceiptThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const { width, height } = image;
      const scale = Math.min(1, THUMBNAIL_MAX_DIMENSION / Math.max(width, height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('canvas 2d context를 만들지 못했어요'));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', THUMBNAIL_JPEG_QUALITY));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('이미지를 읽지 못했어요. 파일이 손상됐을 수 있어요.'));
    };

    image.src = objectUrl;
  });
}
