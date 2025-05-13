import { supabase } from "@/integrations/supabase/client";

export const handleError = (error: unknown, context: string): boolean => {
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
