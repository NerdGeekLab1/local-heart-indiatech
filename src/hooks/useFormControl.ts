import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FormControlState {
  enabled: boolean;
  loading: boolean;
  message: string;
}

export function useFormControl(formKey: string): FormControlState {
  const [state, setState] = useState<FormControlState>({ enabled: true, loading: true, message: "" });

  useEffect(() => {
    let active = true;
    supabase
      .from("form_controls")
      .select("enabled,disabled_message")
      .eq("form_key", formKey)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !data) {
          setState({ enabled: true, loading: false, message: "" });
          return;
        }
        setState({ enabled: data.enabled, loading: false, message: data.disabled_message });
      });
    return () => { active = false; };
  }, [formKey]);

  return state;
}