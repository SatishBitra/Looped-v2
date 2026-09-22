import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-[#E6E6EB] dark:bg-[#28282E]", className)}
      {...props}
    />
  );
}

export { Skeleton };
