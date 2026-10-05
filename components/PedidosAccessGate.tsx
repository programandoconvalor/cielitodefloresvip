"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PEDIDOS_TAB_ACCESS_KEY = "cdf_pedidos_access_tab";

type PedidosAccessGateProps = {
  initialUnlocked: boolean;
  configError?: string | null;
  children: ReactNode;
};

export default function PedidosAccessGate({ initialUnlocked, configError, children }: PedidosAccessGateProps) {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(configError ?? null);

  useEffect(() => {
    if (configError) {
      setUnlocked(false);
      return;
    }

    const tabAccessGranted = window.sessionStorage.getItem(PEDIDOS_TAB_ACCESS_KEY) === "1";
    if (tabAccessGranted && initialUnlocked) {
      setUnlocked(true);
      return;
    }

    setUnlocked(false);
    setPassword("");

    // Clear stale cookie access when this tab has not authenticated yet.
    if (initialUnlocked) {
      void fetch("/api/pedidos/access", { method: "DELETE" });
    }
  }, [initialUnlocked, configError]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (configError) {
      setNotice(configError);
      return;
    }

    setSubmitting(true);
    setNotice(null);

    try {
      const response = await fetch("/api/pedidos/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        setNotice(data.message || "No se pudo validar la contraseña.");
        return;
      }

      setUnlocked(true);
      setPassword("");
      window.sessionStorage.setItem(PEDIDOS_TAB_ACCESS_KEY, "1");
      router.refresh();
    } catch {
      setNotice("No se pudo validar la contraseña. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(251,113,133,0.18),_transparent_38%),linear-gradient(180deg,_#fff8fb_0%,_#fff1f5_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center">
        <div className="w-full max-w-md rounded-[32px] border border-rose-200 bg-white/90 p-8 shadow-[0_24px_80px_rgba(244,63,94,0.18)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-rose-500">Acceso protegido</p>
          <h1 className="mt-3 text-3xl font-black text-slate-900">Módulo de pedidos</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Escribe la contraseña para continuar y ver el panel de administración.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-slate-700" htmlFor="pedidos-password">
              Contraseña
            </label>
            <input
              id="pedidos-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Escribe la contraseña para continuar"
              autoFocus
              className="w-full rounded-2xl border border-rose-200 bg-rose-50/60 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100"
            />

            {notice ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {notice}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting || Boolean(configError)}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Validando..." : "Continuar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}