const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

export const USER_APP_URL = trimTrailingSlash(
  import.meta.env.VITE_USER_APP_URL || "http://localhost:5173",
);

export const userTemplateUrl = (templatePath) =>
  `${USER_APP_URL}/templates/${templatePath}`;
