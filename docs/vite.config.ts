import { defineConfig } from "vite";
import Unocss from "unocss/vite";
import transformerDirective from "@unocss/transformer-directives";
import {
  presetAttributify,
  presetIcons,
  presetUno,
  presetTypography,
} from "unocss";

export default defineConfig({
  plugins: [
    Unocss({
      shortcuts: [
        [
          "btn",
          "px-4 py-1 rounded inline-flex justify-center gap-2 text-white leading-30px children:mya !no-underline cursor-pointer disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50",
        ],
      ],
      presets: [
        presetUno({
          dark: "media",
        }),
        presetAttributify(),
        presetIcons({
          scale: 1.2,
        }),
        presetTypography(),
      ],
      transformers: [transformerDirective()],
    }),
  ],
});
