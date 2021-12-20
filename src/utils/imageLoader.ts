export type ImageLoader = (src: string, callback: Function) => void;

interface ImageSource {
  image?: HTMLImageElement;
  listeners: Record<string, Function>;
}

const loadedImage: Record<string, ImageSource> = {};

const browserImageLoader: ImageLoader = (src: string, callback: Function) => {
  const image = new Image();
  image.src = src;
  image.crossOrigin = '';
  image.onload = (): void => {
    callback(image);
  };
};

let imageLoader = browserImageLoader;

export function setImageLoader(loader: ImageLoader) {
  imageLoader = loader;
}

export function getImageLoader(): ImageLoader {
  return imageLoader;
}

export function getImage(
  src: string,
  listernId: string | number,
  callback?: (image: HTMLImageElement) => void,
): HTMLImageElement {
  if (loadedImage[src]) {
    if (callback && !loadedImage[src].image) {
      loadedImage[src].listeners[listernId] = callback;
    }
    return loadedImage[src].image;
  }
  loadedImage[src] = {image: undefined, listeners: {[listernId]: callback}};
  try {
    imageLoader(src, (image: HTMLImageElement) => {
     onImageLoad(loadedImage[src], image);
    });
  } catch (err) {
    onImageLoad(loadedImage[src], src as unknown as HTMLImageElement);
  }
  return loadedImage[src].image;
}

function onImageLoad(image: ImageSource, res: HTMLImageElement) {
  image.image = res;
  for (const id in image.listeners) {
    const cb = image.listeners[id];
    cb && cb(image);
  }
  delete image.listeners;
}