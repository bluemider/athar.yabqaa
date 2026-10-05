/**
 * AI Smart Face & Subject Focus Utility
 * Analyzes portrait photos, detects face/subject focal point using skin-chroma
 * clustering and facial edge saliency, and produces optimal 16:9 framing.
 */

export interface FocalPoint {
  x: number; // percentage 0 to 100
  y: number; // percentage 0 to 100
  confidence: number;
  box?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Loads an image from a URL or DataURL into an HTMLImageElement safely
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Detects the face and upper-body focal point of an image.
 * Uses YCbCr skin chrominance filtering, edge contrast, and portrait spatial weighting.
 */
export async function detectFaceFocalPoint(
  imageSource: HTMLImageElement | string
): Promise<FocalPoint> {
  try {
    const img =
      typeof imageSource === 'string' ? await loadImage(imageSource) : imageSource;

    const naturalWidth = img.naturalWidth || img.width;
    const naturalHeight = img.naturalHeight || img.height;

    if (!naturalWidth || !naturalHeight) {
      return { x: 50, y: 25, confidence: 0 };
    }

    // Downscale to fast analysis grid (max 240px dimension for instant <15ms execution)
    const analysisSize = 240;
    let sw = analysisSize;
    let sh = Math.round((naturalHeight / naturalWidth) * analysisSize);
    if (sh > analysisSize) {
      sh = analysisSize;
      sw = Math.round((naturalWidth / naturalHeight) * analysisSize);
    }

    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      return { x: 50, y: 25, confidence: 0 };
    }

    ctx.drawImage(img, 0, 0, sw, sh);
    const imageData = ctx.getImageData(0, 0, sw, sh);
    const data = imageData.data;

    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;
    let minX = sw,
      maxX = 0,
      minY = sh,
      maxY = 0;
    let skinHitCount = 0;

    // Scan pixels
    for (let y = 0; y < sh; y++) {
      // Faces in portrait photography are predominantly in upper 65%
      const verticalRatio = y / sh;
      if (verticalRatio > 0.72) continue;

      // Gaussian spatial prior centered around (x=0.5, y=0.28)
      const vertDist = (verticalRatio - 0.28) / 0.22;
      const vertWeight = Math.exp(-0.5 * vertDist * vertDist);

      for (let x = 0; x < sw; x++) {
        const idx = (y * sw + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // 1. Standard RGB skin range
        const isRgbSkin =
          r > 75 &&
          g > 40 &&
          b > 20 &&
          r > g &&
          r > b &&
          r - g >= 12 &&
          Math.abs(r - g) > 12;

        // 2. YCbCr skin model
        // Cb = 128 - 0.168736*R - 0.331264*G + 0.5*B
        // Cr = 128 + 0.5*R - 0.418688*G - 0.081312*B
        const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
        const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
        const isYCbCrSkin = cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;

        if (isRgbSkin || isYCbCrSkin) {
          const horizRatio = x / sw;
          const horizDist = (horizRatio - 0.5) / 0.32;
          const horizWeight = Math.exp(-0.5 * horizDist * horizDist);

          // Additional weight for eye/eyebrow/beard/hair high-contrast edges
          let edgeBoost = 1.0;
          if (x > 0 && x < sw - 1) {
            const leftIdx = (y * sw + (x - 1)) * 4;
            const rightIdx = (y * sw + (x + 1)) * 4;
            const diff = Math.abs(data[leftIdx] - data[rightIdx]);
            if (diff > 25) edgeBoost = 1.4;
          }

          const weight = vertWeight * horizWeight * edgeBoost;
          weightedX += x * weight;
          weightedY += y * weight;
          totalWeight += weight;
          skinHitCount++;

          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (totalWeight > 0 && skinHitCount > 15) {
      const centerX = (weightedX / totalWeight / sw) * 100;
      const centerY = (weightedY / totalWeight / sh) * 100;

      return {
        x: Math.max(15, Math.min(85, centerX)),
        y: Math.max(12, Math.min(65, centerY)),
        confidence: Math.min(1.0, skinHitCount / 300),
        box: {
          x: (minX / sw) * 100,
          y: (minY / sh) * 100,
          width: ((maxX - minX) / sw) * 100,
          height: ((maxY - minY) / sh) * 100,
        },
      };
    }

    // Default portrait golden ratio upper-third focal point
    return {
      x: 50,
      y: 26,
      confidence: 0.1,
    };
  } catch (err) {
    console.warn('Smart focal detection fallback:', err);
    return { x: 50, y: 25, confidence: 0 };
  }
}

/**
 * Calculates optimal crop coordinates for a given aspect ratio (e.g. 16:9),
 * ensuring the detected face sits at the optimal optical position.
 */
export function calculateSmartCropRect(
  imageWidth: number,
  imageHeight: number,
  targetAspect = 16 / 9,
  focalPoint?: { x: number; y: number }
): CropRect {
  const fx = (focalPoint?.x ?? 50) / 100;
  const fy = (focalPoint?.y ?? 26) / 100;

  const currentAspect = imageWidth / imageHeight;

  let cropWidth = imageWidth;
  let cropHeight = imageHeight;

  if (currentAspect > targetAspect) {
    // Image is wider than 16:9: crop horizontally
    cropHeight = imageHeight;
    cropWidth = Math.round(cropHeight * targetAspect);

    // Center crop around focal X
    let cropX = Math.round(fx * imageWidth - cropWidth / 2);
    cropX = Math.max(0, Math.min(imageWidth - cropWidth, cropX));
    return {
      x: cropX,
      y: 0,
      width: cropWidth,
      height: cropHeight,
    };
  } else {
    // Image is taller than 16:9 (common for portrait photos): crop vertically
    // This is where heads get cut off if centered at 50%!
    cropWidth = imageWidth;
    cropHeight = Math.round(cropWidth / targetAspect);

    // Place the face around 32% - 35% down from the top of the crop box for golden framing
    let cropY = Math.round(fy * imageHeight - cropHeight * 0.35);
    cropY = Math.max(0, Math.min(imageHeight - cropHeight, cropY));

    return {
      x: 0,
      y: cropY,
      width: cropWidth,
      height: cropHeight,
    };
  }
}

/**
 * Automatically crops and adjusts an image to 16:9 focusing on the face.
 */
export async function smartAutoCropImage(
  imageSource: string | File | Blob,
  targetAspect = 16 / 9,
  maxWidth = 960,
  quality = 0.8
): Promise<string> {
  let sourceUrl = '';
  let needRevoke = false;

  if (typeof imageSource === 'string') {
    sourceUrl = imageSource;
  } else {
    sourceUrl = URL.createObjectURL(imageSource);
    needRevoke = true;
  }

  try {
    const img = await loadImage(sourceUrl);
    const naturalWidth = img.naturalWidth || img.width;
    const naturalHeight = img.naturalHeight || img.height;

    // Detect face focal point
    const focal = await detectFaceFocalPoint(img);

    // Compute optimal crop window
    const crop = calculateSmartCropRect(naturalWidth, naturalHeight, targetAspect, focal);

    // Render to output canvas
    const canvas = document.createElement('canvas');
    let outWidth = crop.width;
    let outHeight = crop.height;

    if (outWidth > maxWidth) {
      outHeight = Math.round((outHeight * maxWidth) / outWidth);
      outWidth = maxWidth;
    }

    canvas.width = outWidth;
    canvas.height = outHeight;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not get canvas 2d context');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      img,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      outWidth,
      outHeight
    );

    const resultDataUrl = canvas.toDataURL('image/jpeg', quality);
    return resultDataUrl;
  } finally {
    if (needRevoke) {
      URL.revokeObjectURL(sourceUrl);
    }
  }
}

/**
 * Crops an arbitrary sub-region of an image into a new data URL
 */
export async function cropImageRegion(
  imageSource: string,
  rect: CropRect,
  maxWidth = 960,
  quality = 0.82
): Promise<string> {
  const img = await loadImage(imageSource);
  const canvas = document.createElement('canvas');

  let outWidth = rect.width;
  let outHeight = rect.height;

  if (outWidth > maxWidth) {
    outHeight = Math.round((outHeight * maxWidth) / outWidth);
    outWidth = maxWidth;
  }

  canvas.width = Math.max(10, outWidth);
  canvas.height = Math.max(10, outHeight);

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    img,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas.toDataURL('image/jpeg', quality);
}
