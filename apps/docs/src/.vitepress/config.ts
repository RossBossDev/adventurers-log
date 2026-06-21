import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Adventurers' Log",
  description:
    "Public documentation for the OSRS activity tracker and companion app.",
  themeConfig: {
    nav: [{ text: "Home", link: "/" }],
    sidebar: [
      { text: "Local development", link: "/development" },
      { text: "Architecture", link: "/architecture" },
      { text: "Deployment", link: "/deployment" },
    ],
  },
});
