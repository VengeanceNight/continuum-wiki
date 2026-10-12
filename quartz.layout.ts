import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// Footer credits per site (WIKI_SITE comes from publish.sh): link the game creators.
const ARCANE_LIBRARY = { "Shadowdark RPG by The Arcane Library": "https://www.thearcanelibrary.com" }
const FOOTER_LINKS: Record<string, Record<string, string>> = {
  shadowdark: ARCANE_LIBRARY,
  darkspace: {
    "DarkSpace by DMing the World Press": "https://www.dmingtheworld.com/darkspace",
    ...ARCANE_LIBRARY,
  },
}

const UNOFFICIAL: Record<string, string> = {
  shadowdark: "Unofficial fan site; not affiliated with The Arcane Library.",
  darkspace: "Unofficial fan site; not affiliated with DMing the World Press or The Arcane Library.",
}

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: FOOTER_LINKS[process.env.WIKI_SITE ?? "shadowdark"] ?? {},
    note: UNOFFICIAL[process.env.WIKI_SITE ?? "shadowdark"],
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [],
}
