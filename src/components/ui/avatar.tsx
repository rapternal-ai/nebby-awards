import { cn } from "@/lib/utils";

interface AvatarProps {
  username: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

const colors = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-teal-500",
];

function hashUsername(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function Avatar({ username, size = "md", className }: AvatarProps) {
  const color = colors[hashUsername(username) % colors.length];
  // Extract the member number for display
  const num = username.match(/(\d+)$/)?.[1] ?? "?";

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold text-white shrink-0",
        sizeStyles[size],
        color,
        className,
      )}
      title={username}
      aria-label={username}
    >
      {num}
    </div>
  );
}
