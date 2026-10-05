import { getLayoutSiteData } from "@/services/siteRuntime";

export default async function ContactoPage() {
  const { siteData, siteConfig } = await getLayoutSiteData();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="mb-6 text-4xl font-bold">Contacto</h1>
      <div className="space-y-4 text-base text-slate-700">
        <p>
          <span className="font-semibold">Empresa:</span> {siteData.brand.businessName}
        </p>
        <p>
          <span className="font-semibold">Telefono:</span> {siteConfig.contact.phoneDisplay}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {siteConfig.contact.email}
        </p>
        <p>
          <span className="font-semibold">Direccion:</span> {siteConfig.contact.address}
        </p>
        <p>
          <a
            className="font-semibold text-pink-600 hover:text-pink-700"
            href={siteData.links.whatsappDeliveryContact || `https://wa.me/${siteConfig.contact.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Contactar por WhatsApp
          </a>
        </p>
      </div>
    </main>
  );
}
