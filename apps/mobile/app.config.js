const appJson = require("./app.json");

const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
const googleIosUrlScheme = googleIosClientId?.endsWith(
  ".apps.googleusercontent.com",
)
  ? `com.googleusercontent.apps.${googleIosClientId.replace(
      ".apps.googleusercontent.com",
      "",
    )}`
  : undefined;

const googleSignInPlugin = googleIosUrlScheme
  ? [
      "@react-native-google-signin/google-signin",
      { iosUrlScheme: googleIosUrlScheme },
    ]
  : "@react-native-google-signin/google-signin";

module.exports = {
  expo: {
    ...appJson.expo,
    plugins: [
      ...appJson.expo.plugins.filter(
        (plugin) => plugin !== "@react-native-google-signin/google-signin",
      ),
      googleSignInPlugin,
      "expo-secure-store",
    ],
  },
};
