import Link from "next/link";
import Logo from "@/components/Logo";

const footerLinks = {
  navigation: [
    { href: "/", label: "Accueil" },
    { href: "/services", label: "Services" },
    { href: "/qualification", label: "Demander un devis" },
    { href: "/methode", label: "Méthode" },
    { href: "/realisations", label: "Réalisations" },
    { href: "/a-propos", label: "À propos" },
    { href: "/faq", label: "FAQ" },
    { href: "/#contact", label: "Contact" },
    { href: "/validation-projet", label: "Paiement acompte" },
  ],
  contact: {
    email: "devcraft.store@gmail.com",
    phone: "01 23 45 67 89",
  },
};

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0e1a]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Logo background="dark" href="/" className="mb-4 inline-block" />
            <p className="text-sm leading-relaxed text-slate-400">
              Création de sites professionnels sur mesure. Design, développement et accompagnement pour votre présence en ligne.
            </p>
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-12">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/90">Navigation</h3>
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                {footerLinks.navigation.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition hover:text-amber-400/90"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400/90">Contact</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li>
                  <a href={`mailto:${footerLinks.contact.email}`} className="transition hover:text-amber-400/90">
                    {footerLinks.contact.email}
                  </a>
                </li>
                <li>
                  <a href={`tel:${footerLinks.contact.phone.replace(/\s/g, "")}`} className="transition hover:text-amber-400/90">
                    {footerLinks.contact.phone}
                  </a>
                </li>
              </ul>
              <div className="mt-4 flex gap-3">
                <a href="#" className="text-slate-500 transition hover:text-amber-400/90" aria-label="LinkedIn">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" className="text-slate-500 transition hover:text-amber-400/90" aria-label="Twitter">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} DevCraft - Tous droits réservés
        </div>
      </div>
    </footer>
  );
}
