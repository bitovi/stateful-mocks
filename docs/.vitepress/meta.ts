/* Texts */
export const name = "Stateful Mock Server";
export const shortName = "stateful-mocks";
export const description = "The API & Real-time Application Framework";

/* CDN fonts and styles */
export const googleapis = "https://fonts.googleapis.com";
export const gstatic = "https://fonts.gstatic.com";
export const font = `${googleapis}/css2?family=Readex+Pro:wght@200;400;600&display=swap`;

/* vitepress head */
export const ogUrl = "https://stateful-mocks.pages.dev/";
export const ogImage = `${ogUrl}og.png`;

/* GitHub and social links */
export const github = "https://github.com/bitovi/stateful-mocks";
// export const releases = 'https://github.com/bitovi/stateful-mocks/releases'
export const contributing =
  "https://github.com/bitovi/stateful-mocks/blob/main/.github/contributing.md";
export const twitter = "https://twitter.com/bitovi";

/* PWA runtime caching urlPattern regular expressions */
export const pwaFontsRegex = new RegExp(`^${googleapis}/.*`, "i");
export const pwaFontStylesRegex = new RegExp(`^${gstatic}/.*`, "i");
