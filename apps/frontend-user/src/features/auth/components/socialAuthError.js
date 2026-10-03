export function socialAuthError(error) {
  const code = error?.data?.code;
  if (code === "ACCOUNT_LINK_REQUIRED") return "Sign in to your existing account with your password, or recover it first. Then open Profile and explicitly link Google or Telegram.";
  if (code === "IDENTITY_ALREADY_LINKED") return "This Google or Telegram identity is already linked to another account. Sign in to that account or use a different identity.";
  if (code === "IDENTITY_PROVIDER_MISMATCH") return "Your account already has a different identity linked for this provider. Use that identity to sign in.";
  return error?.message || "Could not complete authentication. Please try again.";
}
