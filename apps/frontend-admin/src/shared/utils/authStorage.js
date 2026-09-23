import { clearAuth, readAuth } from "./index";

export const getAccessToken = () => readAuth()?.accessToken || null;
export { clearAuth };