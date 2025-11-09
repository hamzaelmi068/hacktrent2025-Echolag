export const ROUTES = {
  HOME: "/",
  SESSION: "/session",
  FEEDBACK: "/feedback",
  CUSTOMER: "/customer",
  FILLER_WORDS: "/filler-words",
  FILLER_WORDS_REPORT: "/filler-words/report",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteValue = (typeof ROUTES)[RouteKey];

