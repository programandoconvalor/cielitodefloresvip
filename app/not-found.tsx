import Image from "next/image";
import { Flower2 } from "lucide-react";
import CatalogButton from "@/components/CatalogButton";
import ServicesButton from "@/components/ServicesButton";
import { getCurrentSiteData } from "@/services/siteRuntime";

export default async function NotFound() {
  const siteData = await getCurrentSiteData();
  const notFound = siteData.notFound;

  return (
    <main className="relative overflow-hidden px-4 py-10 md:px-6 md:py-14">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-8 h-52 w-52 rounded-full bg-pink-200/65 blur-3xl" />
        <div className="absolute -right-12 top-1/3 h-60 w-60 rounded-full bg-pink-300/55 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-rose-100/80 blur-3xl" />
      </div>

      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-pink-200/80 bg-white/95 p-6 text-center shadow-[0_22px_80px_rgba(236,72,153,0.18)] backdrop-blur md:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-pink-300 bg-pink-50 shadow-sm">
          <Flower2 className="h-8 w-8 text-pink-500" strokeWidth={2.2} />
        </div>

        <div className="space-y-4">
          <span className="inline-flex items-center rounded-full border border-pink-300 bg-pink-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-pink-600">
            {notFound.badgeLabel}
          </span>

          <p className="text-6xl font-black leading-none text-pink-500 md:text-7xl">{notFound.codeLabel}</p>

          <h1 className="mx-auto max-w-xl text-3xl font-extrabold text-slate-900 md:text-5xl">{notFound.title}</h1>

          <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">{notFound.description}</p>

          <div className="mx-auto flex w-full max-w-[250px] flex-col items-center justify-center gap-3 pt-2">
            <CatalogButton
              href={notFound.primaryAction.href || siteData.routes.catalogPath}
              label={notFound.primaryAction.label}
              variant="stacked"
              className="w-full"
            />
            <ServicesButton
              href={notFound.secondaryAction.href || siteData.routes.servicesPath}
              label={notFound.secondaryAction.label}
              variant="stacked"
              className="w-full"
            />
          </div>
        </div>

        <div className="relative mx-auto mt-8 w-full max-w-sm">
          <div className="absolute -inset-2 animate-pulse rounded-[2rem] bg-gradient-to-br from-pink-200/70 via-transparent to-pink-300/60 blur-xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-pink-200 bg-pink-50 shadow-xl">
            <div className="relative aspect-[5/4]">
              <Image
                src={notFound.image.src}
                alt={notFound.image.alt}
                fill
                sizes="(max-width: 768px) 88vw, 460px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 text-white">
                <p className="text-sm font-semibold tracking-wide">{siteData.brand.businessName}</p>
                <p className="text-xs opacity-90">{siteData.brand.businessType}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

