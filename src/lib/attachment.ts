export const ATTACHMENT_FIELD = 'dokumenPendukung';
export const ATTACHMENT_TEXT_PLACEHOLDER = '[Gambar dokumen pendukung terlampir]';

const MAX_ORIGINAL_BYTES = 10 * 1024 * 1024;
const MAX_DATA_URL_LENGTH = 120_000;
const MAX_DIMENSION = 1400;

export function isImageDataUrl(value: string | undefined): boolean {
  return !!value && /^data:image\/(?:png|jpe?g|webp);base64,/i.test(value);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Gambar tidak dapat diproses.'));
    image.src = src;
  });
}

export async function prepareImageAttachment(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File harus berupa gambar.');
  }
  if (file.size > MAX_ORIGINAL_BYTES) {
    throw new Error('Ukuran gambar maksimal 10 MB.');
  }

  const original = await readAsDataUrl(file);
  const image = await loadImage(original);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;

  if (!sourceWidth || !sourceHeight) {
    throw new Error('Ukuran gambar tidak valid.');
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Browser tidak mendukung pemrosesan gambar.');
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(sourceWidth, sourceHeight));
  let width = Math.max(1, Math.round(sourceWidth * scale));
  let height = Math.max(1, Math.round(sourceHeight * scale));

  const render = (quality: number): string => {
    canvas.width = width;
    canvas.height = height;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', quality);
  };

  let quality = 0.82;
  let result = render(quality);

  while (result.length > MAX_DATA_URL_LENGTH && quality > 0.45) {
    quality -= 0.1;
    result = render(quality);
  }

  while (result.length > MAX_DATA_URL_LENGTH && Math.max(width, height) > 640) {
    width = Math.max(1, Math.round(width * 0.8));
    height = Math.max(1, Math.round(height * 0.8));
    result = render(0.7);
  }

  if (result.length > MAX_DATA_URL_LENGTH) {
    throw new Error('Gambar terlalu besar. Silakan gunakan gambar lain.');
  }

  return result;
}
