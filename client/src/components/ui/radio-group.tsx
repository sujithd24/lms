import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ className, ...props }) => {
  return <div className={cn("space-y-2", className)} {...props} />;
};

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, ...props }, ref) => (
    <input type="radio" className={cn("hidden", className)} ref={ref} {...props} />
  )
);

RadioGroupItem.displayName = "RadioGroupItem"; // Helps with debugging

export { RadioGroup, RadioGroupItem };
