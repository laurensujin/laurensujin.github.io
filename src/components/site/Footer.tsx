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
    <footer className="mt-32 border-t border-line md:mt-44">
      <Container className="py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-serif text-3xl font-light leading-none">{settings.siteName}</p>
            {settings.footerLocation ? <p className="eyebrow mt-4">{settings.footerLocation}</p> : null}
          </div>

          <ul className="flex flex-wrap gap-x-8 gap-y-3 md:col-span-4">
            {visible.map((link) => {
              const href = footerHref(link)!;
              const external = !href.startsWith("mailto:");
              return (
                <li key={link.id}>
                  <a
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="eyebrow link-line text-fg"
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="md:col-span-3 md:text-right">
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 text-xs text-fg-muted md:flex-row md:justify-between">
          <p>{settings.footerCopyright}</p>
          <p>{settings.footerCredit}</p>
        </div>
      </Container>
    </footer>
  );
}
