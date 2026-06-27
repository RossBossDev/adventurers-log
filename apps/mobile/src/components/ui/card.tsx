import { cva, type VariantProps } from "class-variance-authority";
import { View, type ViewProps } from "react-native";

import { cn } from "../../lib/cn";

const cardVariants = cva("border p-5 shadow-sm", {
  variants: {
    variant: {
      parchment: "rounded-al-lg border-al-forest bg-al-card",
      cream: "rounded-al-md border-al-forest/80 bg-al-cream",
      dark: "rounded-al-lg border-al-moss bg-al-forest",
    },
  },
  defaultVariants: {
    variant: "parchment",
  },
});

type CardProps = ViewProps &
  VariantProps<typeof cardVariants> & {
    className?: string;
  };

export function Card({ className, variant, ...props }: CardProps) {
  return (
    <View className={cn(cardVariants({ variant }), className)} {...props} />
  );
}
