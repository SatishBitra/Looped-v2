import { toast } from "sonner";

const AUTH_KEY = "looped_authenticated";
const USER_KEY = "looped_user_email";

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(AUTH_KEY) === "true";
  } catch {
    return true;
  }
}

export function setAuthenticated(email = "sandy@looped.agency") {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTH_KEY, "true");
    localStorage.setItem(USER_KEY, email);
  } catch {
    // Ignore
  }
}

export function signOutUser(navigate?: (opts: { to: string; replace?: boolean }) => void) {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // Ignore
    }
  }

  toast.info("Signed out of Looped", {
    description: "Returning to login page...",
  });

  if (navigate) {
    navigate({ to: "/login", replace: true });
  } else if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
