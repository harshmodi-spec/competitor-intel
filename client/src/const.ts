// Inlined constants — no @shared/const dependency in standalone mode.
export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

// In standalone mode there is no real OAuth portal, so just return "#".
export const getLoginUrl = () => "#";
