import { Navigate, useLocation, useParams } from "react-router-dom";

export default function LegacyRegistryRedirectPage() {
  const location = useLocation();
  const { platformId } = useParams<{ platformId: string }>();
  const search = new URLSearchParams(location.search);
  if (platformId) {
    search.set("workspace", platformId);
  }

  const platformRouteMatch = location.pathname.match(/^\/platform\/[^/]+\/npx-skills(\/.*)?$/);
  const legacyRouteMatch = location.pathname.match(/^\/registry(\/.*)?$/);
  const suffix = platformRouteMatch?.[1] ?? legacyRouteMatch?.[1] ?? "";
  const normalizedSuffix =
    suffix === "" || suffix === "/" ? "" : suffix;
  const query = search.toString();
  const target = `/npx-skills${normalizedSuffix}${query ? `?${query}` : ""}`;
  return <Navigate to={target} replace />;
}
