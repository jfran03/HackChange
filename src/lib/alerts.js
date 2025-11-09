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
