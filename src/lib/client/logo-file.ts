const ACCEPTED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
]);

export const LOGO_MAX_BYTES = 2 * 1024 * 1024;

export const LOGO_ACCEPT =
  "image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,.svg";

export function isAcceptedLogoFile(file: File): boolean {
  if (ACCEPTED_MIME.has(file.type)) return true;
  return file.name.toLowerCase().endsWith(".svg");
}

export function readLogoFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Logo okunamadı"));
    };
    reader.onerror = () => reject(new Error("Logo okunamadı"));
    reader.readAsDataURL(file);
  });
}
