import { Navigate, useParams } from "react-router-dom";

export default function LegacyRegistryRedirectPage() {
  const { platformId } = useParams<{ platformId: string }>();
  const target = platformId
    ? `/registry?workspace=${encodeURIComponent(platformId)}`
    : "/registry";
  return <Navigate to={target} replace />;
}
