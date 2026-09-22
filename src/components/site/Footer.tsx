import type { SiteSettings, SocialLink } from "@/lib/data/types";
import { isSafeUrl } from "@/lib/utils";
import { Container } from "./Container";
import { ThemeToggle } from "./ThemeToggle";

function footerHref(link: SocialLink): string | null {
  const value = link.url.trim();
  if (!value) return null;
  if (link.kind === "email") return value.startsWith("mailto:") ? value : `mailto:${value}`;
  return isSafeUrl(value) ? value : null;
}

export function Footer({ settings, links }: { settings: SiteSettings; links: SocialLink[] }) {
  const visible = links.filter((l) => l.showInFooter && footerHref(l));

  return (
    <footer className="mt-16 border-t border-line md:mt-24">
      <Container className="py-12 md:py-16">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between md:gap-16">
          <div>
            <p className="t-title text-fg">{settings.siteName}</p>
            {settings.footerLocation ? <p className="t-body mt-1 text-fg-muted">{settings.footerLocation}</p> : null}
          </div>

          <div className="flex flex-col gap-10 md:flex-row md:gap-20">
            {visible.length ? (
              <div>
                <h2 className="eyebrow">Elsewhere</h2>
                <ul className="mt-4 flex flex-col gap-2">
                  {visible.map((link) => {
                    const href = footerHref(link)!;
                    const external = !href.startsWith("mailto:");
                    return (
                      <li key={link.id}>
                        <a
                          href={href}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noopener noreferrer" : undefined}
                          className="link-line t-body text-fg"
                        >
                          {link.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            <div>
              <h2 className="eyebrow">Theme</h2>
              <div className="mt-4">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-1 border-t border-line pt-6 text-xs text-fg-muted md:flex-row md:justify-between">
          <p>{settings.footerCopyright}</p>
          <p>{settings.footerCredit}</p>
        </div>
      </Container>
    </footer>
  );
}
