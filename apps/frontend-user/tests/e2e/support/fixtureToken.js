import { Buffer } from "node:buffer";

// Unsigned client-session fixture for intercepted browser requests only.
// This is not a backend credential and contains no signing key.
export const fixtureToken = [
  ...[{ alg: "none" }, { exp: 4102268800 }].map((part) =>
    Buffer.from(JSON.stringify(part)).toString("base64url"),
  ),
  "",
].join(".");
