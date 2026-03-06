import React from "react";
import { cn } from "../../lib/cn";

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "w-full min-h-[110px] rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/50",
        className
      )}
      {...props}
    />
  );
}

