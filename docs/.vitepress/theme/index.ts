import DefaultTheme from 'vitepress/theme'
import 'uno.css'
import '../style/main.postcss'
import '../style/vars.postcss'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // register global components
  },
}
