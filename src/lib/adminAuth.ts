export const ADMIN_SESSION_COOKIE = "devcraft_admin_session";

function getRequiredEmail() {
  return process.env.ADMIN_EMAIL ?? "devcraft.store@gmail.com";
}

function getRequiredPassword() {
  return process.env.ADMIN_PASSWORD ?? "carm1004";
}

export function isAdminPasswordConfigured() {
  return getRequiredEmail().length > 0 && getRequiredPassword().length > 0;
}

export function createSessionToken() {
  return "authenticated";
}

export function verifyPassword(password: string) {
  const expected = getRequiredPassword();
  return expected.length > 0 && password.trim() === expected.trim();
}

export function verifyEmail(email: string) {
  const expected = getRequiredEmail();
  return expected.length > 0 && email.trim().toLowerCase() === expected.trim().toLowerCase();
}

