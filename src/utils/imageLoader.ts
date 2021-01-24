

export type ImageLoader = (src: string, callback: Function) => void;


const loadedImage: Record<string, HTMLImageElement> = {};


const browserImageLoader: ImageLoader = (src: string, callback: Function)  => {
  const image = new Image();
  image.src =  src
  image.crossOrigin = '';
  image.onload = (): void => {
    callback(image);
  };
}

let imageLoader = browserImageLoader;


export function setImageLoader(loader: ImageLoader) {
  imageLoader = loader;
}

export function getImageLoader(): ImageLoader {
  return imageLoader;
}

export function getImage(src: string, callback?: (image: HTMLImageElement) => void): HTMLImageElement {
  if (loadedImage[src]) {
    return loadedImage[src]
  }
  try {
  imageLoader(src, (image: HTMLImageElement) => {
    loadedImage[src] = image;
    callback && callback(image);
  })
  } catch(err) {
    loadedImage[src] = src as any;
  }
  return loadedImage[src]
}