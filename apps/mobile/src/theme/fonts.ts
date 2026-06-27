import { Kalam_700Bold, useFonts } from "@expo-google-fonts/dev";

export const displayFontFamily = "Kalam_700Bold";

export function useAppFonts() {
  return useFonts({
    [displayFontFamily]: Kalam_700Bold,
  });
}
