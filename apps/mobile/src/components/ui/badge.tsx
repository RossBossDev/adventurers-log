import { cva, type VariantProps } from "class-variance-authority";
import { View, type ViewProps } from "react-native";

import { cn } from "../../lib/cn";
import { Text } from "./text";

const badgeVariants = cva("self-start rounded-al-sm border px-2.5 py-1", {
  variants: {
    variant: {
      moss: "border-al-forest bg-al-moss",
      parchment: "border-al-forest bg-al-card-light",
    },
  },
  defaultVariants: {
    variant: "moss",
  },
});

const badgeTextVariants = cva(
  "text-xs font-extrabold uppercase tracking-[1px]",
  {
    variants: {
      variant: {
        moss: "text-al-cream",
        parchment: "text-al-forest",
      },
    },
    defaultVariants: {
      variant: "moss",
    },
  },
);

type BadgeProps = ViewProps &
  VariantProps<typeof badgeVariants> & {
    children: string;
    className?: string;
    textClassName?: string;
  };

export function Badge({
  children,
  className,
  textClassName,
  variant,
  ...props
}: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)} {...props}>
      <Text className={cn(badgeTextVariants({ variant }), textClassName)}>
        {children}
      </Text>
    </View>
  );
}
