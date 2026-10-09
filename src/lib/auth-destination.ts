export function authDestination(role: string, next?: string | null) {
  if (role === "ADMIN") return "/admin";
  if (role === "COURIER") return "/courier";
  const allowed = [
    "/dashboard/new-shipment",
    "/dashboard/business",
    "/dashboard/bulk",
    "/courier-apply",
  ];
  return next && allowed.includes(next) ? next : "/dashboard";
}
