"use client";

import { FormEvent, useEffect, useState } from "react";
import type { SiteContent } from "@/lib/siteContent";

type State = {
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  content: SiteContent | null;
};

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[#0a0e1a] shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20";

export default function AdminPage() {
  const [state, setState] = useState<State>({
    loading: true,
    saving: false,
    error: null,
    success: null,
    content: null,
  });

  useEffect(() => {
    void loadContent();
  }, []);

  async function loadContent() {
    setState((prev) => ({ ...prev, loading: true, error: null, success: null }));
    try {
      const res = await fetch("/api/admin/content", { cache: "no-store", credentials: "include" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message ?? "Impossible de charger les contenus.");
      }
      setState((prev) => ({ ...prev, loading: false, content: data.content }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur de chargement.";
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  }

  function updateField<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setState((prev) =>
      prev.content
        ? {
            ...prev,
            content: { ...prev.content, [key]: value },
            success: null,
          }
        : prev,
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!state.content) return;

    setState((prev) => ({ ...prev, saving: true, error: null, success: null }));
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(state.content),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message ?? "Enregistrement impossible.");
      }
      setState((prev) => ({
        ...prev,
        saving: false,
        content: data.content,
        success: "Modifie avec succes.",
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur d'enregistrement.";
      setState((prev) => ({ ...prev, saving: false, error: message }));
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#0a0e1a]">Admin DevCraft</h1>
            <p className="mt-1 text-sm text-slate-600">
              Modifiez les contenus principaux sans toucher au code.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Se deconnecter
          </button>
        </div>

        {state.loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Chargement...</div>
        )}

        {!state.loading && state.content && (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div>
              <label className="text-sm font-semibold text-[#0a0e1a]">Titre principal (hero)</label>
              <input
                className={inputClass}
                value={state.content.heroTitle}
                onChange={(e) => updateField("heroTitle", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#0a0e1a]">Sous-titre hero</label>
              <textarea
                className={inputClass}
                rows={3}
                value={state.content.heroSubtitle}
                onChange={(e) => updateField("heroSubtitle", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#0a0e1a]">Texte des services</label>
              <textarea
                className={inputClass}
                rows={3}
                value={state.content.servicesText}
                onChange={(e) => updateField("servicesText", e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-sm font-semibold text-[#0a0e1a]">Prix vitrine</label>
                <input
                  className={inputClass}
                  value={state.content.offerPrices.vitrine}
                  onChange={(e) =>
                    updateField("offerPrices", { ...state.content!.offerPrices, vitrine: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0a0e1a]">Prix complet</label>
                <input
                  className={inputClass}
                  value={state.content.offerPrices.complet}
                  onChange={(e) =>
                    updateField("offerPrices", { ...state.content!.offerPrices, complet: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0a0e1a]">Prix abonnement</label>
                <input
                  className={inputClass}
                  value={state.content.offerPrices.abonnement}
                  onChange={(e) =>
                    updateField("offerPrices", { ...state.content!.offerPrices, abonnement: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-[#0a0e1a]">Texte contact</label>
              <textarea
                className={inputClass}
                rows={3}
                value={state.content.contactText}
                onChange={(e) => updateField("contactText", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-[#0a0e1a]">Texte footer</label>
              <textarea
                className={inputClass}
                rows={3}
                value={state.content.footerText}
                onChange={(e) => updateField("footerText", e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={state.saving}
                className="rounded-xl bg-[#0a0e1a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {state.saving ? "Enregistrement..." : "Enregistrer"}
              </button>
              {state.success && <p className="text-sm font-medium text-emerald-700">{state.success}</p>}
            </div>
          </form>
        )}

        {state.error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        )}
      </div>
    </main>
  );
}

