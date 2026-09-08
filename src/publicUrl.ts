/** Resolve a file from `public/` against the Vite base (needed on GitHub Pages). */
export function publicUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}
