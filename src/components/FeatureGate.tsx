import { ReactNode } from "react";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

interface Props {
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/** Renders children only when the named feature flag is enabled globally or granted to the current user. */
export default function FeatureGate({ flag, children, fallback = null }: Props) {
  const { enabled, loading } = useFeatureFlag(flag);
  if (loading) return null;
  if (!enabled) return <>{fallback}</>;
  return <>{children}</>;
}
