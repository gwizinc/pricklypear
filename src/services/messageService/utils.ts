import { supabase } from "@/integrations/supabase/client";
import * as Sentry from "@sentry/react";

export const handleError = (error: unknown, context: string): boolean => {
  const err = new Error(`${context}: ${error.message}`, error);
  Sentry.captureException(err, { extra: error });
  console.error(`Error in ${context}:`, error);
  return false;
};

export const getOrCreateSystemProfile = async (): Promise<string | null> => {
  try {
    const { data: systemProfileData, error: systemProfileError } =
      await supabase
        .from("profiles")
        .select("id")
        .eq("name", "system")
        .single();

    if (systemProfileData?.id) {
      return systemProfileData.id;
    }

    // Create system profile if it doesn't exist
    const systemProfileId = crypto.randomUUID();
    const { error: newProfileError } = await supabase.from("profiles").insert({
      id: systemProfileId,
      name: "system",
    });

    if (newProfileError) {
      console.error("Error creating system profile:", newProfileError);
      return null;
    }

    return systemProfileId;
  } catch (error) {
    console.error("Exception in getOrCreateSystemProfile:", error);
    return null;
  }
};
