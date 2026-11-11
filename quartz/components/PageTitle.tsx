import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"

interface Options {
  // Continuum CC monogram above the site title (Ken, 2026-11-10)
  monogram?: boolean
}

export default ((opts?: Options) => {
const PageTitle: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
  const title = cfg?.pageTitle ?? i18n(cfg.locale).propertyDefaults.title
  const baseDir = pathToRoot(fileData.slug!)
  return (
    <h2 class={classNames(displayClass, "page-title")}>
      <a href={baseDir}>
        {opts?.monogram && (
          <picture class="continuum-monogram">
            <source
              type="image/webp"
              srcset="/static/continuum-monogram-160.webp 1x, /static/continuum-monogram-320.webp 2x"
            />
            <img
              src="/static/continuum-monogram-160.png"
              srcset="/static/continuum-monogram-160.png 1x, /static/continuum-monogram-320.png 2x"
              width="160"
              height="105"
              alt=""
            />
          </picture>
        )}
        <span class="page-title-text">{title}</span>
      </a>
    </h2>
  )
}

PageTitle.css = `
.page-title {
  font-size: 1.75rem;
  margin: 0;
  font-family: var(--titleFont);
}
.page-title a {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
}
.page-title .continuum-monogram img {
  display: block;
  width: 160px;
  height: auto;
  margin: 0;
  border-radius: 0;
}
@media all and (max-width: 800px) {
  .page-title .continuum-monogram img {
    width: 84px;
  }
  .page-title a {
    gap: 0.15rem;
  }
}
`
return PageTitle
}) satisfies QuartzComponentConstructor
