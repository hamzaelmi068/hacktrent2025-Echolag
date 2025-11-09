export const ROUTES = {
  HOME: "/",
  SESSION: "/session",
  FEEDBACK: "/feedback",
  CUSTOMER: "/customer",
  FILLER_WORDS: "/filler-words",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteValue = (typeof ROUTES)[RouteKey];

