import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "../../lib/utils";

const variantClassMap = {
  default: "btn-primary",
  destructive: "btn-destructive",
  outline: "btn-outline",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  link: "btn-link",
};

const sizeClassMap = {
  default: "btn-size-default",
  sm: "btn-size-sm",
  lg: "btn-size-lg",
  icon: "btn-size-icon",
};

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const variantClass = variantClassMap[variant] ?? variantClassMap.default;
    const sizeClass = sizeClassMap[size] ?? sizeClassMap.default;

    return (
      <Comp
        className={cn("btn", variantClass, sizeClass, className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
