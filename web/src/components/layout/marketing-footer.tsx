import { Building2, Mail, Phone } from "lucide-react";
import Link from "next/link";

import { appConfig } from "@/lib/config";

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Get started", href: "/get-started" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Demo", href: "/#demo" },
      { label: "Log in", href: "/login" },
    ],
  },
];

function MarketingFooter() {
  return (
    <footer className="border-border border-t bg-background">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="max-w-md">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Building2 className="size-4" />
            </span>
            <span className="font-semibold text-foreground">
              {appConfig.logoText}
            </span>
          </Link>
          <p className="mt-4 text-muted-foreground text-sm leading-6">
            A focused operating system for society admins, guards, staff, and
            residents.
          </p>
          <div className="mt-5 space-y-2 text-muted-foreground text-sm">
            <a
              href={`mailto:${appConfig.supportEmail}`}
              className="flex items-center gap-2 transition-colors hover:text-foreground"
            >
              <Mail className="size-4" />
              {appConfig.supportEmail}
            </a>
            <a
              href={`tel:${appConfig.supportPhoneTel}`}
              className="flex items-center gap-2 transition-colors hover:text-foreground"
            >
              <Phone className="size-4" />
              {appConfig.supportPhoneDisplay}
            </a>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h2 className="font-medium text-foreground text-sm">
                {section.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-border border-t">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-muted-foreground text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            Copyright {new Date().getFullYear()} {appConfig.logoText}. All
            rights reserved.
          </p>
          <p>Built for simple, reliable society operations.</p>
        </div>
      </div>
    </footer>
  );
}

export { MarketingFooter };
