

export type ImageLoader = (src: string, callback: Function) => void;


const loadedImage: Record<string, any> = {};


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