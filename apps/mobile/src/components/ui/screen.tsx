import {
  SafeAreaView,
  type SafeAreaViewProps,
} from "react-native-safe-area-context";

import { cn } from "../../lib/cn";

type ScreenProps = SafeAreaViewProps & {
  className?: string;
};

export function Screen({ className, edges, style, ...props }: ScreenProps) {
  return (
    <SafeAreaView
      className={cn("flex-1 bg-al-bg", className)}
      edges={edges ?? ["top", "left", "right"]}
      style={[{ backgroundColor: "#14110d" }, style]}
      {...props}
    />
  );
}
