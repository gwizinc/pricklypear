import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { changePassword } from "@/services/users/changePassword";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

const passwordSchema = z
  .string()
  .min(8, "Must be at least 8 characters long")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[0-9]/, "Must contain a number");

const formSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirm: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof formSchema>;

function computeStrength(pw: string): number {
  if (!pw) return 0;
  if (pw.length < 8) return 1;

  const categories =
    Number(/[a-z]/.test(pw)) +
    Number(/[A-Z]/.test(pw)) +
    Number(/[0-9]/.test(pw)) +
    Number(/[^A-Za-z0-9]/.test(pw));

  let score = categories; // 0-4
  if (pw.length >= 12) score += 1;
  return Math.min(score, 4);
}

export default function SecuritySettingsCard() {
  const enabled = useFeatureFlag("enablePasswordChange");

  // ----- all hooks must be called unconditionally -----
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirm: "",
    },
  });

  const newPassword = form.watch("newPassword");
  const strength = useMemo(() => computeStrength(newPassword), [newPassword]);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  // Stable keys for the strength-meter segments
  const strengthKeys = ["seg-0", "seg-1", "seg-2", "seg-3"];

  // Feature-flag gate (placed AFTER hooks are called)
  if (!enabled) return null;

  const onSubmit = async (values: FormValues) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      toast({
        title: "Password changed",
        description: "Please sign in again with your new password.",
      });

      await signOut();
      setTimeout(() => navigate("/auth"), 2000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to change password";
      toast({
        title: "Change password failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Security</CardTitle>
      </CardHeader>
      <CardContent>
        {!expanded ? (
          <Button onClick={() => setExpanded(true)}>Change Password</Button>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 max-w-md"
            >
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>

                    {/* Strength meter */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex flex-1 gap-1">
                        {strengthKeys.map((key, i) => (
                          <span
                            key={key}
                            className={`h-1 flex-1 rounded-full ${
                              strength > i ? "bg-primary" : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {strengthLabels[strength]}
                      </span>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="min-w-[8rem]"
                >
                  {form.formState.isSubmitting ? "Saving…" : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setExpanded(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
