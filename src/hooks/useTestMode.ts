import { useCallback, useEffect, useState } from "react";
import type { Audience } from "@/lib/featureRegistry";

export interface FeatureRollout {
  /** version string pinned for this feature while test mode is on */
  version: string;
  /** audiences the pinned version is exposed to */
  audiences: Audience[];
  enabled: boolean;
}

export interface TestModeState {
  enabled: boolean;
  simulatedRole: Audience;
  simulatedUserId: string;
  rollouts: Record<string, FeatureRollout>;
}

const KEY = "travelista.testmode.v1";

const DEFAULT_STATE: TestModeState = {
  enabled: false,
  simulatedRole: "traveler",
  simulatedUserId: "",
  rollouts: {},
};

const read = (): TestModeState => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
};

const listeners = new Set<(s: TestModeState) => void>();
let current = read();

const publish = (next: TestModeState) => {
  current = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
  listeners.forEach(l => l(next));
};

/** Shared, persisted admin Test Mode state (survives tab switches and reloads). */
export function useTestMode() {
  const [state, setState] = useState<TestModeState>(current);

  useEffect(() => {
    listeners.add(setState);
    return () => { listeners.delete(setState); };
  }, []);

  const update = useCallback((patch: Partial<TestModeState>) => {
    publish({ ...current, ...patch });
  }, []);

  const setRollout = useCallback((featureKey: string, patch: Partial<FeatureRollout>) => {
    const existing = current.rollouts[featureKey] ?? { version: "", audiences: [], enabled: false };
    publish({ ...current, rollouts: { ...current.rollouts, [featureKey]: { ...existing, ...patch } } });
  }, []);

  const toggleAudience = useCallback((featureKey: string, audience: Audience) => {
    const existing = current.rollouts[featureKey] ?? { version: "", audiences: [], enabled: false };
    const audiences = existing.audiences.includes(audience)
      ? existing.audiences.filter(a => a !== audience)
      : [...existing.audiences, audience];
    publish({ ...current, rollouts: { ...current.rollouts, [featureKey]: { ...existing, audiences } } });
  }, []);

  const reset = useCallback(() => publish(DEFAULT_STATE), []);

  /** Would `featureKey` be visible to the simulated audience with the pinned version? */
  const isVisible = useCallback((featureKey: string) => {
    if (!state.enabled) return true;
    const r = state.rollouts[featureKey];
    if (!r || !r.enabled) return true;
    return r.audiences.length === 0 || r.audiences.includes(state.simulatedRole);
  }, [state]);

  return { state, update, setRollout, toggleAudience, reset, isVisible };
}
