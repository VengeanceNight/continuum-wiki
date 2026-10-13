import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { i18n } from "../i18n"

interface Options {
  links: Record<string, string>
  note?: string
  // Continuum symbol as a small footer mark on every site (Ken, 2026-10-12)
  mark?: boolean
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const links = opts?.links ?? []
    return (
      <footer class={`${displayClass ?? ""}${opts?.mark ? " with-mark" : ""}`}>
        {opts?.mark && (
          <picture class="continuum-mark">
            <source
              type="image/webp"
              srcset="/static/continuum-mark-64.webp 1x, /static/continuum-mark-128.webp 2x"
            />
            <img
              src="/static/continuum-mark-64.png"
              srcset="/static/continuum-mark-64.png 1x, /static/continuum-mark-128.png 2x"
              width="48"
              height="48"
              alt="The Crystal Continuum"
              title="The Crystal Continuum"
              loading="lazy"
            />
          </picture>
        )}
        <div class="footer-text">
          <p>
            {i18n(cfg.locale).components.footer.createdWith}{" "}
            <a href="https://quartz.jzhao.xyz/">Quartz v{version}</a> © {year}
          </p>
          {opts?.note && <p>{opts.note}</p>}
          <ul>
            {Object.entries(links).map(([text, link]) => (
              <li>
                <a href={link}>{text}</a>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
