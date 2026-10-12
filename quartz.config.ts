import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
// One repo, one site per game (Bob, 2026-10-12). publish.sh sets WIKI_SITE.
// Each site's content is 80_Wiki/<site>/; it deploys to <site>.crystalcontinuum.org.
// Shadowdark is black and white; Darkspace adds a single accent colour as its link colour.
const SITES = {
  shadowdark: { title: "Shadowdark", link: "#1a1a1a", linkDark: "#e0e0e0", tert: "#707070" },
  darkspace: { title: "Darkspace", link: "#0047ab", linkDark: "#4d8fe8", tert: "#707070" },
} as const
const SITE = (process.env.WIKI_SITE ?? "shadowdark") as keyof typeof SITES
if (!(SITE in SITES)) throw new Error(`Unknown WIKI_SITE: ${SITE}`)
const S = SITES[SITE]

const config: QuartzConfig = {
  configuration: {
    pageTitle: S.title,
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "en-US",
    baseUrl: `${SITE}.crystalcontinuum.org`,
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#faf8f8",
          lightgray: "#e5e5e5",
          gray: "#b8b8b8",
          darkgray: "#4e4e4e",
          dark: "#2b2b2b",
          secondary: S.link,
          tertiary: S.tert,
          highlight: "rgba(128, 128, 128, 0.12)",
          textHighlight: "#cccccc88",
        },
        darkMode: {
          light: "#161618",
          lightgray: "#393639",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: S.linkDark,
          tertiary: S.tert,
          highlight: "rgba(128, 128, 128, 0.12)",
          textHighlight: "#55555588",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      // Plugin.CustomOgImages(), // off: needs sharp's native install script
    ],
  },
}

export default config
