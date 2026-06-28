import { cva, type VariantProps } from "class-variance-authority";
import {
  Text as NativeText,
  type TextProps as NativeTextProps,
} from "react-native";

import { cn } from "../../lib/cn";
import { displayFontFamily } from "../../theme/fonts";

const textVariants = cva("text-al-ink", {
  variants: {
    variant: {
      display: "text-3xl leading-[56px] text-al-cream",
      title: "text-2xl font-extrabold text-al-ink",
      subtitle: "text-base leading-6 text-al-cream/85",
      label: "text-sm font-bold uppercase tracking-[1.2px] text-al-muted",
      body: "text-base leading-6 text-al-ink",
      muted: "text-sm leading-5 text-al-muted",
      error: "text-sm font-semibold text-al-error",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

type TextProps = NativeTextProps &
  VariantProps<typeof textVariants> & {
    className?: string;
  };

export function Text({ className, variant, style, ...props }: TextProps) {
  const displayStyle =
    variant === "display" ? { fontFamily: displayFontFamily } : null;

  return (
    <NativeText
      className={cn(textVariants({ variant }), className)}
      style={[displayStyle, style]}
      {...props}
    />
  );
}
