const UPLOADED_WEBP = /\/site-media\/.+\.webp$/;

/**
 * `<img>` props for a site photo. Photos uploaded as `name.webp` have a 640px
 * `name-sm.webp` copy (made by the app), so phones skip the 1600px file.
 * Older JPEG uploads and sample photos keep a plain `src`. Never use for logos:
 * they are a single 512px file.
 */
export function photoProps(src, sizes) {
  if (typeof src !== "string" || !UPLOADED_WEBP.test(src)) return { src };
  return {
    src,
    srcSet: `${src.replace(/\.webp$/, "-sm.webp")} 640w, ${src} 1600w`,
    sizes,
  };
}
