export const ROUTES = {
  HOME: "/",
  SESSION: "/session",
  FEEDBACK: "/feedback",
  CUSTOMER: "/customer",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteValue = (typeof ROUTES)[RouteKey];

