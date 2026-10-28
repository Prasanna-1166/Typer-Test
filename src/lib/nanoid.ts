// Simple nanoid-like ID generator (no external dependency needed)
export function nanoid(size = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const randomValues = crypto.getRandomValues(new Uint8Array(size));
  for (const byte of randomValues) {
    id += chars[byte % chars.length];
  }
  return id;
}
