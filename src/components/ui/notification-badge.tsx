import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

const NotificationBadge = ({ count, className }: NotificationBadgeProps) => {
  if (count <= 0) return null;

  return (
    <div
      className={cn(
        "absolute -top-1 -right-1 bg-accent text-white text-xs font-medium rounded-full min-w-[18px] h-[18px]",
        "flex items-center justify-center px-1",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </div>
  );
};

export default NotificationBadge;
