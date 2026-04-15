
// ✅ Save token in cookies 
export const setToken = (token: string) => {
  document.cookie = `auth_token=${token}; path=/; SameSite=Strict; ${
    process.env.NODE_ENV === "production" ? "Secure" : ""
  }`;
};

// ✅ Get token from cookies
export const getToken = (): string | null => {
  if (typeof document === "undefined") return null; // SSR safety
  const match = document.cookie.match(/(^| )auth_token=([^;]+)/);
  return match ? match[2] : null;
};

// ✅ Remove token
export const removeToken = () => {
  document.cookie =
    "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict;";
};
