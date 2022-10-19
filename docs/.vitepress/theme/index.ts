import DefaultTheme from "vitepress/theme";
import "uno.css";
import "../style/main.postcss";
import "../style/vars.postcss";
import googleAnalytics from "vitepress-plugin-google-analytics";

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // register global components and plugins
    googleAnalytics({
      id: "UA-2302003-12",
    });
  },
};
