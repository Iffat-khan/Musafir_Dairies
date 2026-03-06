import React from "react";
import { cn } from "../../lib/cn";

export function Button({ className, variant = "primary", size = "md", ...props }) {
  const variants = {
    primary:
      "bg-indigo-500 hover:bg-indigo-400 text-white shadow-sm shadow-indigo-900/30",
    secondary:
      "bg-white/10 hover:bg-white/15 text-white border border-white/10",
    ghost: "hover:bg-white/10 text-white",
    danger: "bg-rose-500 hover:bg-rose-400 text-white",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

