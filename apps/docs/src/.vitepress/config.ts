import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Adventurers' Log",
  description:
    "Public documentation for the OSRS activity tracker and companion app.",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Product", link: "/product/vision" },
    ],
    sidebar: [
      {
        text: "Product",
        items: [
          { text: "Vision", link: "/product/vision" },
          { text: "Roadmap", link: "/product/roadmap" },
          { text: "Brand direction", link: "/product/brand-direction" },
        ],
      },
      {
        text: "Project",
        items: [
          { text: "Local development", link: "/development" },
          { text: "Architecture", link: "/architecture" },
          { text: "Deployment", link: "/deployment" },
        ],
      },
    ],
  },
});
