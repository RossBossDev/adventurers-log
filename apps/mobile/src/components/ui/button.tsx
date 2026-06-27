import { cva, type VariantProps } from "class-variance-authority";
import { Pressable, type PressableProps } from "react-native";

import { cn } from "../../lib/cn";
import { Text } from "./text";

const buttonVariants = cva(
  "items-center justify-center rounded-al-md border px-4 py-3",
  {
    variants: {
      variant: {
        primary: "border-al-forest bg-al-moss",
        danger: "border-al-error bg-al-error-bg",
        outline: "border-al-moss bg-transparent",
        ghost: "border-transparent bg-transparent",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

const labelVariants = cva("text-base font-extrabold", {
  variants: {
    variant: {
      primary: "text-al-cream",
      danger: "text-al-error",
      outline: "text-al-moss",
      ghost: "text-al-moss",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    children: string;
    className?: string;
    textClassName?: string;
  };

export function Button({
  children,
  className,
  disabled,
  textClassName,
  variant,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(
        buttonVariants({ variant }),
        disabled && "opacity-60",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      <Text className={cn(labelVariants({ variant }), textClassName)}>
        {children}
      </Text>
    </Pressable>
  );
}
