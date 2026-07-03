import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background shadow-[0_8px_24px_-12px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 hover:opacity-90 hover:shadow-[0_14px_36px_-12px_rgba(0,0,0,0.5)] active:translate-y-0 active:scale-[0.98]",
        outline:
          "border border-foreground/25 bg-foreground/[0.03] text-foreground backdrop-blur-md hover:-translate-y-0.5 hover:border-foreground/50 hover:bg-foreground/10 hover:shadow-[0_10px_30px_-14px_rgba(0,0,0,0.4)] active:translate-y-0 active:scale-[0.98]",
        ghost: "hover:bg-foreground/5 active:scale-[0.98]",
        glass:
          "glass border border-border text-foreground hover:-translate-y-0.5 hover:border-foreground/25 active:translate-y-0 active:scale-[0.98]",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4",
        lg: "h-13 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
