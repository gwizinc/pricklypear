import * as React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type SizeVariant = "xs" | "sm" | "md" | "lg";

const avatarSizeClasses: Record<SizeVariant, string> = {
  xs: "h-6 w-6 text-[0.625rem]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

const nameSizeClasses: Record<SizeVariant, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export interface AvatarNameProps {
  /** Display name shown next to the avatar (also used for initials fallback). */
  name: string;
  /** Optional image source for the avatar. */
  avatarUrl?: string | null;
  /** Toggle avatar visibility. */
  showAvatar?: boolean;
  /** Toggle name visibility. */
  showName?: boolean;
  /** Preset sizing for both avatar & label. */
  size?: SizeVariant;
  /** Extra classes for the wrapper element. */
  className?: string;
  /** Extra classes for the Avatar element. */
  avatarClassName?: string;
}

/**
 * Reusable “avatar + username” component.
 *
 * Renders nothing if both `showAvatar` and `showName` are disabled.
 */
export function AvatarName({
  name,
  avatarUrl,
  showAvatar = true,
  showName = true,
  size = "md",
  className,
  avatarClassName,
}: AvatarNameProps) {
  if (!showAvatar && !showName) return null;

  const initials = React.useMemo(() => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  return (
    <span
      className={cn(
        "inline-flex items-center",
        showAvatar && showName && "gap-2",
        className,
      )}
    >
      {showAvatar && (
        <Avatar
          className={cn(
            "shrink-0 border-2 border-background",
            avatarSizeClasses[size],
            avatarClassName,
          )}
        >
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
          <AvatarFallback className="uppercase">{initials}</AvatarFallback>
        </Avatar>
      )}

      {showName && <span className={nameSizeClasses[size]}>{name}</span>}
    </span>
  );
}
