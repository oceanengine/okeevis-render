import { ImageAttr } from "../shapes/Image";

export type ImageLoader = (src: string, callback: Function, crossOrigin?: string) => void;
export type LoadCallback = (image: HTMLImageElement) => void;
interface ImageSource {
  image?: HTMLImageElement;
  listeners: Record<string, LoadCallback>;
}

const loadedImage: Record<string, ImageSource> = {};

const browserImageLoader: ImageLoader = (src: string, callback: Function, crossOrigin: string) => {
  const image = new Image();
  image.src = src;
  image.crossOrigin = crossOrigin || '';
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
  config: Pick<ImageAttr, 'src' | 'crossOrigin'>,
  listenerId: string | number,
  callback: (image: HTMLImageElement) => void,
): HTMLImageElement {
  const { src, crossOrigin } = config;
  if (loadedImage[src]) {
    if (callback && !loadedImage[src].image) {
      loadedImage[src].listeners[listenerId] = callback;
    }
    return loadedImage[src].image;
  }
  loadedImage[src] = {image: undefined, listeners: {[listenerId]: callback}};
  try {
    imageLoader(src, (image: HTMLImageElement) => {
     onImageLoad(loadedImage[src], image);
    }, crossOrigin);
  } catch (err) {
    onImageLoad(loadedImage[src], src as unknown as HTMLImageElement);
  }
  return loadedImage[src].image;
}

function onImageLoad(image: ImageSource, res: HTMLImageElement) {
  image.image = res;
  for (const id in image.listeners) {
    const cb = image.listeners[id];
    cb && cb(image.image);
  }
  delete image.listeners;
}