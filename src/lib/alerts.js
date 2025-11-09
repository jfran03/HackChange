import { supabase } from "./supabaseClient";

const ALERTS_TABLE = "alerts";

export const createAlert = async ({
  type,
  latitude,
  longitude,
  description = null,
  created_by,
}) => {
  const payload = {
    type,
    latitude,
    longitude,
    description,
    created_by,
  };

  const { data, error } = await supabase
    .from(ALERTS_TABLE)
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const fetchAlerts = async () => {
  const { data, error } = await supabase
    .from(ALERTS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
};

/**
 * Resolve/mark an alert as completed
 */
export const resolveAlert = async (alertId, userId) => {
  const { data, error } = await supabase
    .from(ALERTS_TABLE)
    .update({
      resolved: true,
      resolved_by: userId,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", alertId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Unresolve an alert (reopen it)
 */
export const unresolveAlert = async (alertId) => {
  const { data, error } = await supabase
    .from(ALERTS_TABLE)
    .update({
      resolved: false,
      resolved_by: null,
      resolved_at: null,
    })
    .eq("id", alertId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};
