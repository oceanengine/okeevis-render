export type ImageLoader = (src: string, callback: Function) => void;

interface ImageSource {
  image?: HTMLImageElement;
  loaded: boolean;
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
  callback?: (image: HTMLImageElement) => void,
): HTMLImageElement {
  if (loadedImage[src]) {
    return loadedImage[src].image;
  }
  loadedImage[src] = {loaded: false, image: undefined};
  try {
    imageLoader(src, (image: HTMLImageElement) => {
      loadedImage[src].loaded = true;
      loadedImage[src].image = image;
      callback && callback(image);
    });
  } catch (err) {
    loadedImage[src].image = src as any;
    loadedImage[src].loaded = true;
  }
  return loadedImage[src].image;
}
