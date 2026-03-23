import { promises as fs } from "node:fs";
import path from "node:path";
import { OFFER_PRICES } from "@/config/offers";

const KV_CONTENT_KEY = "devcraft:site_content";

export type EditableOfferPrices = {
  vitrine: string;
  complet: string;
  abonnement: string;
};

export type SiteContent = {
  heroTitle: string;
  heroSubtitle: string;
  servicesText: string;
  contactText: string;
  footerText: string;
  offerPrices: EditableOfferPrices;
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  heroTitle: "Un design sur mesure qui convertit",
  heroSubtitle:
    "Votre site livre en moins de 7 jours. Design sur mesure, optimise mobile, pret a convertir.",
  servicesText: "Quatre types d'offres pour generer plus de visibilite, de demandes et de ventes.",
  contactText:
    "Chaque projet est different. Contactez-nous pour echanger sur vos besoins, vos contenus et le rendu souhaite. Nous vous repondrons pour definir ensemble la meilleure approche.",
  footerText:
    "Creation de sites professionnels sur mesure. Design, developpement et accompagnement pour votre presence en ligne.",
  offerPrices: {
    vitrine: "300 EUR",
    complet: "900 EUR",
    abonnement: "1 300 EUR",
  },
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "content.json");

/** Vercel / Upstash : variables injectées quand Redis (ex-KV) est relié au projet */
export function isKvStorageEnabled() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function normalizeValue(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function mergeWithDefaults(raw: unknown): SiteContent {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const rawPrices =
    obj.offerPrices && typeof obj.offerPrices === "object"
      ? (obj.offerPrices as Record<string, unknown>)
      : {};

  return {
    heroTitle: normalizeValue(obj.heroTitle, DEFAULT_SITE_CONTENT.heroTitle),
    heroSubtitle: normalizeValue(obj.heroSubtitle, DEFAULT_SITE_CONTENT.heroSubtitle),
    servicesText: normalizeValue(obj.servicesText, DEFAULT_SITE_CONTENT.servicesText),
    contactText: normalizeValue(obj.contactText, DEFAULT_SITE_CONTENT.contactText),
    footerText: normalizeValue(obj.footerText, DEFAULT_SITE_CONTENT.footerText),
    offerPrices: {
      vitrine: normalizeValue(rawPrices.vitrine, DEFAULT_SITE_CONTENT.offerPrices.vitrine),
      complet: normalizeValue(rawPrices.complet, DEFAULT_SITE_CONTENT.offerPrices.complet),
      abonnement: normalizeValue(rawPrices.abonnement, DEFAULT_SITE_CONTENT.offerPrices.abonnement),
    },
  };
}

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(DEFAULT_SITE_CONTENT, null, 2), "utf8");
  }
}

async function readFromFile(): Promise<SiteContent> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return mergeWithDefaults(parsed);
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

async function readFromKv(): Promise<SiteContent | null> {
  const { kv } = await import("@vercel/kv");
  const raw = await kv.get<string>(KV_CONTENT_KEY);
  if (raw == null) return null;
  try {
    const parsed = typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;
    return mergeWithDefaults(parsed);
  } catch {
    return null;
  }
}

export async function readSiteContent(): Promise<SiteContent> {
  if (isKvStorageEnabled()) {
    try {
      const fromKv = await readFromKv();
      if (fromKv) return fromKv;
      // Première fois : initialiser depuis le fichier du dépôt si possible
      const fromFile = await readFromFile().catch(() => DEFAULT_SITE_CONTENT);
      return fromFile;
    } catch {
      return readFromFile();
    }
  }
  return readFromFile();
}

export async function writeSiteContent(content: SiteContent): Promise<SiteContent> {
  const sanitized = mergeWithDefaults(content);

  if (isKvStorageEnabled()) {
    try {
      const { kv } = await import("@vercel/kv");
      await kv.set(KV_CONTENT_KEY, JSON.stringify(sanitized));
      return sanitized;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur Redis/KV.";
      throw new Error(`Sauvegarde distante impossible : ${message}`);
    }
  }

  try {
    await ensureDataFile();
    await fs.writeFile(DATA_FILE, JSON.stringify(sanitized, null, 2), "utf8");
    return sanitized;
  } catch (err) {
    if (process.env.VERCEL && !isKvStorageEnabled()) {
      throw new Error(
        "Impossible d'écrire sur le disque en production (Vercel : disque en lecture seule). " +
          "Ajoutez le stockage Redis : Vercel → Marketplace → Redis (Upstash) → connecter au projet. " +
          "Les variables KV_REST_API_URL et KV_REST_API_TOKEN seront ajoutées. Redéployez, puis enregistrez à nouveau.",
      );
    }
    throw new Error(err instanceof Error ? err.message : "Erreur d'écriture.");
  }
}

export function toOfferPrices(content: SiteContent) {
  return {
    ...OFFER_PRICES,
    vitrine: { ...OFFER_PRICES.vitrine, price: content.offerPrices.vitrine },
    complet: { ...OFFER_PRICES.complet, price: content.offerPrices.complet },
    abonnement: { ...OFFER_PRICES.abonnement, price: content.offerPrices.abonnement },
  };
}
