import * as React from "react"
import { cn } from "cn"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, children, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, ((value || 0) / (max || 100)) * 100));

    return (
      <div
        ref={ref}
        data-slot="progress"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          "relative h-1.5 w-full overflow-hidden rounded-full bg-muted/60",
          className
        )}
        {...props}
      >
        <div
          data-slot="progress-indicator"
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
        {children}
      </div>
    );
  }
);
Progress.displayName = "Progress";

function ProgressTrack({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="progress-track"
      className={cn("relative h-1 w-full overflow-hidden rounded-full bg-muted/60", className)}
      {...props}
    />
  );
}

function ProgressIndicator({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="progress-indicator"
      className={cn("h-full bg-primary transition-all duration-300", className)}
      style={style}
      {...props}
    />
  );
}

function ProgressLabel({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="progress-label"
      className={cn("text-xs font-medium text-foreground", className)}
      {...props}
    />
  );
}

function ProgressValue({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="progress-value"
      className={cn("ml-auto text-xs text-muted-foreground font-mono tabular-nums", className)}
      {...props}
    />
  );
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
}
