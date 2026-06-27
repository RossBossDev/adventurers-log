import { cva, type VariantProps } from "class-variance-authority";
import { TextInput, type TextInputProps } from "react-native";

import { cn } from "../../lib/cn";

const textFieldVariants = cva(
  "rounded-al-md border px-4 py-3 text-base text-al-ink",
  {
    variants: {
      variant: {
        parchment: "border-al-forest bg-al-cream",
        dark: "border-al-moss bg-al-forest text-al-cream",
      },
    },
    defaultVariants: {
      variant: "parchment",
    },
  },
);

type TextFieldProps = TextInputProps &
  VariantProps<typeof textFieldVariants> & {
    className?: string;
  };

export function TextField({ className, variant, ...props }: TextFieldProps) {
  return (
    <TextInput
      className={cn(textFieldVariants({ variant }), className)}
      placeholderTextColor="#6a5840"
      {...props}
    />
  );
}
