// components/ui/combobox.tsx
"use client";

import * as React from "react";
import * as ComboboxPrimitive from "@radix-ui/react-combobox";
import { Check, ChevronsUpDown } from "lucide-react";

// A utility function to merge class names (you can replace this with your own or a library like clsx)
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const Combobox = ComboboxPrimitive.Root;

const ComboboxInput = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Input>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      className
    )}
    {...props}
  />
));
ComboboxInput.displayName = "ComboboxInput";

const ComboboxPopover = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <ComboboxPrimitive.Portal>
    <ComboboxPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 w-full overflow-hidden rounded-md border bg-white shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </ComboboxPrimitive.Content>
  </ComboboxPrimitive.Portal>
));
ComboboxPopover.displayName = "ComboboxPopover";

const ComboboxList = ComboboxPrimitive.List;

const ComboboxOption = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Option>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Option>
>(({ className, children, ...props }, ref) => (
  <ComboboxPrimitive.Option
    ref={ref}
    className={cn(
      "cursor-pointer select-none rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100",
      className
    )}
    {...props}
  >
    {children}
  </ComboboxPrimitive.Option>
));
ComboboxOption.displayName = "ComboboxOption";

export {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
};
