import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EmojiPicker from "emoji-picker-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sun, Moon, ScreenShare, MessageSquareText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
});

type FormValues = z.infer<typeof formSchema>;

const Preferences = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [messageTone, setMessageTone] = useState<string>("friendly");
  const [avatarEmoji, setAvatarEmoji] = useState<string>(
    (user?.user_metadata?.avatar_emoji as string) ?? "",
  );
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
    },
  });

  // Handle theme change
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user profile data and preferences when component mounts
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setProfileLoading(true);

        // Get user profile from the profiles table
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("name, message_tone")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          throw profileError;
        }

        // Get the user's metadata for the full name
        const fullName =
          user.user_metadata?.full_name ||
          (profileData ? profileData.name : "") ||
          "";

        // Update form with fetched data
        form.reset({
          fullName: fullName,
        });

        // Set message tone if it exists in profile
        if (profileData && profileData.message_tone) {
          setMessageTone(profileData.message_tone);
        }

        // Avatar emoji lives in user metadata, make sure local state is up-to-date
        if (user.user_metadata?.avatar_emoji) {
          setAvatarEmoji(user.user_metadata.avatar_emoji as string);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Error loading profile",
          description: "There was a problem loading your profile data.",
          variant: "destructive",
        });
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, navigate, form, toast]);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { full_name: data.fullName },
      });

      if (metadataError) throw metadataError;

      // Also update the profile name for consistency
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ name: data.fullName })
        .eq("id", user.id);

      if (profileError) throw profileError;

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageToneChange = async (value: string) => {
    if (!user) return;

    setMessageTone(value);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ message_tone: value })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Message tone updated",
        description: `Your messages will now be rephrased with a ${value} tone.`,
      });
    } catch (error) {
      console.error("Error updating message tone:", error);
      toast({
        title: "Update failed",
        description:
          "There was a problem updating your message tone preference.",
        variant: "destructive",
      });
    }
  };

  /**
   * Store the chosen emoji in Supabase user metadata
   */
  const handleEmojiSelect = async (emoji: string) => {
    if (!user) return;

    setAvatarEmoji(emoji);
    setShowEmojiPicker(false);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { avatar_emoji: emoji },
      });

      if (error) throw error;

      toast({
        title: "Avatar updated",
        description: "Your avatar emoji has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating avatar emoji:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your avatar emoji.",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold mb-8">Preferences</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <div className="flex justify-center py-4">
              Loading profile information...
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the name that will be displayed on your profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>

                {/* Avatar emoji preference */}
                <div className="space-y-4 pt-6">
                  <FormLabel>Avatar Emoji</FormLabel>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{avatarEmoji || "🙂"}</span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      {avatarEmoji ? "Change" : "Choose"} Emoji
                    </Button>
                  </div>
                  {showEmojiPicker && (
                    <EmojiPicker
                      onEmojiClick={(e) => handleEmojiSelect(e.emoji)}
                      height={350}
                    />
                  )}
                  <FormDescription>
                    The selected emoji will be used whenever you do not have a
                    profile image.
                  </FormDescription>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Message Preferences</CardTitle>
          <CardDescription>
            Customize how your messages are rephrased
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MessageSquareText className="h-5 w-5" />
                <h3 className="text-lg font-medium">Message Tone</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Choose how you want your messages to be rephrased when they're
                reviewed.
              </p>
              <Select
                value={messageTone}
                onValueChange={handleMessageToneChange}
              >
                <SelectTrigger className="w-full normal-case">
                  <SelectValue placeholder="Select a tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly" className="normal-case">
                    Friendly
                  </SelectItem>
                  <SelectItem value="professional" className="normal-case">
                    Professional
                  </SelectItem>
                  <SelectItem value="casual" className="normal-case">
                    Casual
                  </SelectItem>
                  <SelectItem value="formal" className="normal-case">
                    Formal
                  </SelectItem>
                  <SelectItem value="encouraging" className="normal-case">
                    Encouraging
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                <p className="italic">
                  {messageTone === "friendly" &&
                    "Messages will be rephrased to sound warm and approachable."}
                  {messageTone === "professional" &&
                    "Messages will be rephrased to sound polished and business-like."}
                  {messageTone === "casual" &&
                    "Messages will be rephrased to sound relaxed and conversational."}
                  {messageTone === "formal" &&
                    "Messages will be rephrased to sound structured and precise."}
                  {messageTone === "encouraging" &&
                    "Messages will be rephrased to sound positive and supportive."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the application looks</CardDescription>
        </CardHeader>
        <CardContent>
          {!mounted ? (
            <div className="flex justify-center py-4">
              Loading theme preferences...
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme</h3>
                <RadioGroup
                  defaultValue={theme}
                  onValueChange={(value) => setTheme(value)}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label
                      htmlFor="theme-light"
                      className="flex items-center gap-2"
                    >
                      <Sun className="h-5 w-5" />
                      Light
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label
                      htmlFor="theme-dark"
                      className="flex items-center gap-2"
                    >
                      <Moon className="h-5 w-5" />
                      Dark
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="theme-system" />
                    <Label
                      htmlFor="theme-system"
                      className="flex items-center gap-2"
                    >
                      <ScreenShare className="h-5 w-5" />
                      System
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark mode
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Preferences;
