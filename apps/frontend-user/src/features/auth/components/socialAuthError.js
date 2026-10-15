export function socialAuthError(error, provider = "Google or Telegram") {
  const code = error?.data?.code;
  if (code === "ACCOUNT_LINK_REQUIRED") return `${provider} is not linked to your existing account. Sign in with your password or another linked provider, then open Profile and link ${provider}.`;
  if (code === "IDENTITY_ALREADY_LINKED") return "This Google or Telegram identity is already linked to another account. Sign in to that account or use a different identity.";
  if (code === "IDENTITY_PROVIDER_MISMATCH") return "Your account already has a different identity linked for this provider. Use that identity to sign in.";
  return error?.message || "Could not complete authentication. Please try again.";
}
