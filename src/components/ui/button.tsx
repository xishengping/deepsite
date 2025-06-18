import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-neutral-950 focus-visible:ring-neutral-950/50 focus-visible:ring-[3px] aria-invalid:ring-red-500/20 dark:aria-invalid:ring-red-500/40 aria-invalid:border-red-500 dark:focus-visible:border-neutral-300 dark:focus-visible:ring-neutral-300/50 dark:aria-invalid:ring-red-900/20 dark:dark:aria-invalid:ring-red-900/40 dark:aria-invalid:border-red-900",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-900 text-neutral-50 shadow-xs hover:bg-neutral-900/90 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50/90",
        destructive: "bg-red-600 text-white shadow-xs hover:bg-red-500",
        outline:
          "border bg-white shadow-xs hover:bg-neutral-100 hover:text-neutral-900 dark:bg-neutral-200/30 dark:border-neutral-200 dark:hover:bg-neutral-200/50 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:dark:bg-neutral-800/30 dark:dark:border-neutral-800 dark:dark:hover:bg-neutral-800/50",
        secondary:
          "bg-neutral-100 text-neutral-900 shadow-xs hover:bg-neutral-100/80 dark:bg-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-800/80",
        ghost:
          "hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-100/50 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:dark:hover:bg-neutral-800/50",
        link: "text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50",
        pink: "bg-sky-500 text-white hover:brightness-110",
        gray: "bg-neutral-900 text-neutral-300 hover:brightness-110",
        ghostWhite: "bg-neutral-200/60 text-neutral-900 hover:bg-neutral-200",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-full text-[13px] gap-1.5 px-3",
        lg: "h-10 rounded-full px-6 has-[>svg]:px-4",
        icon: "size-9",
        iconXs: "size-7",
        iconXss: "size-6",
        xs: "h-6 text-xs rounded-full pl-2 pr-2 gap-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
