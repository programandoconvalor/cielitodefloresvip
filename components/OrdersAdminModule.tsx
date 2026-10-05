"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Search, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import { buildSiteCatalogData } from "@/services/catalogService";
import { useSiteData } from "@/context/SiteDataProvider";
import type { CatalogProduct } from "@/data/site/types";
import type { OrderDraft, OrderRecord, OrderStatus, PaymentMethod } from "@/interfaces/Order";

const GOOGLE_MAPS_SCRIPT_ID = "google-maps-places-script";

const STATUS_OPTIONS: OrderStatus[] = [
  "Pendiente",
  "En elaboracion",
  "Listo para entregar",
  "Entregado",
  "Cancelado",
];

const PAYMENT_OPTIONS: PaymentMethod[] = [
  "Efectivo",
  "Transferencia",
  "Tarjeta",
  "Deposito",
];

const HOUR_OPTIONS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const todayIso = () => new Date().toISOString().slice(0, 10);

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
});

function normalizeCode(input: string) {
  return input.replace(/\s+/g, "").toUpperCase();
}

function extractOrderSequence(value: string) {
  const match = value.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function getNextOrderNumber(orders: OrderRecord[]) {
  const max = orders.reduce((acc, item) => Math.max(acc, extractOrderSequence(item.numeroPedido)), 0);
  return `Pedido ${max + 1}`;
}

function buildReceiverText(cliente: string, whatsapp: string) {
  const trimmedClient = cliente.trim();
  const trimmedPhone = whatsapp.trim();
  if (!trimmedClient && !trimmedPhone) return "";
  if (!trimmedPhone) return trimmedClient;
  if (!trimmedClient) return trimmedPhone;
  return `${trimmedClient} - ${trimmedPhone}`;
}

function sanitizePhoneInput(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

function splitReceiverText(value: string) {
  const trimmed = value.trim();
  const withDash = trimmed.match(/^(.*?)\s*-\s*(\d{10})$/);
  if (withDash) {
    return {
      name: withDash[1].trim(),
      whatsapp: withDash[2],
    };
  }

  return {
    name: trimmed,
    whatsapp: "",
  };
}

function getAddressComponent(place: any, type: string) {
  const component = place?.address_components?.find((item: any) => item.types?.includes(type));
  return component?.long_name ?? "";
}

function getGeocodeComponent(components: Array<{ long_name: string; types: string[] }> | undefined, type: string) {
  const component = components?.find((item) => item.types?.includes(type));
  return component?.long_name ?? "";
}

function toCoords(rawLat: string, rawLng: string) {
  const lat = Number(rawLat);
  const lng = Number(rawLng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
}

function extractMapsCoordinates(link: string) {
  const directCoords = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (directCoords) {
    return toCoords(directCoords[1], directCoords[2]);
  }

  const qCoords = link.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/i);
  if (qCoords) {
    return toCoords(qCoords[1], qCoords[2]);
  }

  const encodedCoords = link.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/i);
  if (encodedCoords) {
    return toCoords(encodedCoords[1], encodedCoords[2]);
  }

  return null;
}

function extractMapsAddressQuery(link: string) {
  try {
    const url = new URL(link);
    const q = url.searchParams.get("q") || url.searchParams.get("query");
    if (q && !q.match(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/)) {
      return q;
    }

    const searchPath = url.pathname.match(/\/maps\/search\/(.+)$/i);
    if (searchPath?.[1]) {
      return decodeURIComponent(searchPath[1]);
    }
  } catch {
    return null;
  }

  return null;
}

function formatDateDDMMYYYY(isoDate: string) {
  if (!isoDate || isoDate.length < 10) return isoDate;
  const [year, month, day] = isoDate.split("-");
  return `${day}-${month}-${year}`;
}

function buildEmptyDraft(numeroPedido: string): OrderDraft {
  return {
    numeroPedido,
    fechaPedido: todayIso(),
    codigoProducto: "",
    nombreProducto: "",
    precioUnitario: 0,
    cantidad: 1,
    dedicatoriaFrase: "",
    datosQuienRecibe: "",
    clienteSolicita: "",
    whatsappCliente: "",
    fechaEntrega: todayIso(),
    horaEntrega: "13:00",
    direccionEntrega: "",
    ubicacionEntrega: "",
    coloniaEntrega: "",
    municipioEntrega: "",
    referenciaEntrega: "",
    formaPago: "Efectivo",
    anticipoPagado: 0,
    costoEnvio: 0,
    estatus: "Pendiente",
    notasInternas: "",
    imagenProducto: "",
  };
}

function findProductByCode(rawCode: string, products: CatalogProduct[]) {
  const code = normalizeCode(rawCode);
  if (!code) return null;

  return (
    products.find((p) => normalizeCode(p.sku) === code) ??
    products.find((p) => String(p.id) === code)
  );
}

function statusPillClass(status: OrderStatus) {
  if (status === "Entregado") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (status === "Listo para entregar") return "bg-cyan-100 text-cyan-700 border-cyan-200";
  if (status === "En elaboracion") return "bg-amber-100 text-amber-700 border-amber-200";
  if (status === "Cancelado") return "bg-rose-100 text-rose-700 border-rose-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

type DraftField =
  | "codigoProducto"
  | "cantidad"
  | "anticipoPagado"
  | "clienteSolicita"
  | "whatsappCliente"
  | "datosQuienRecibe"
  | "whatsappRecibe"
  | "fechaEntrega"
  | "horaEntrega"
  | "direccionEntrega"
  | "coloniaEntrega";

type DraftErrors = Partial<Record<DraftField, string>>;

const FIELD_ORDER: DraftField[] = [
  "codigoProducto",
  "cantidad",
  "anticipoPagado",
  "clienteSolicita",
  "whatsappCliente",
  "datosQuienRecibe",
  "whatsappRecibe",
  "fechaEntrega",
  "horaEntrega",
  "direccionEntrega",
  "coloniaEntrega",
];

type TrackingFilter = "TODOS" | OrderStatus;
type RecordsLimit = 10 | 20 | 50 | 100 | "ALL";

const RECORDS_LIMIT_OPTIONS: RecordsLimit[] = [10, 20, 50, 100, "ALL"];

function getFieldClass(error?: string) {
  return [
    "mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none transition",
    error
      ? "border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
      : "border-slate-200 bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100",
  ].join(" ");
}

function FieldLabel({ label, required = false }: { label: string; required?: boolean }) {
  return (
    <span className="text-xs font-semibold text-slate-500">
      {label}
      {required ? <span className="ml-1 text-rose-500">*</span> : null}
    </span>
  );
}

function AutofillBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">{label}</p>
      <p className="mt-1 text-sm font-bold text-blue-900">{value || "Pendiente de autocompletar"}</p>
    </div>
  );
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="mt-1 text-xs font-semibold text-rose-600">{error}</p>;
}

function OrderMetaCard({
  order,
  receiver,
  onCopyWhatsapp,
}: {
  order: OrderRecord;
  receiver: { name: string; whatsapp: string };
  onCopyWhatsapp: (whatsapp: string) => void;
}) {
  return (
    <div className="flex h-[268px] w-full flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-2.5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] lg:max-w-[192px]">
      <div>
        <p className="text-center text-[10px] font-black uppercase tracking-[0.24em] text-blue-600">Pedido</p>
        <p className="mt-1 text-base font-black text-slate-900">{order.numeroPedido}</p>
      </div>

      <div className="mt-2 rounded-2xl bg-slate-50 px-3 py-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Cliente</p>
        <p className="mt-1 truncate text-sm font-bold text-slate-800">{order.clienteSolicita || "-"}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="truncate text-xs font-semibold text-slate-500">{order.whatsappCliente || "Sin WhatsApp"}</p>
          {order.whatsappCliente ? (
            <button
              type="button"
              onClick={() => onCopyWhatsapp(order.whatsappCliente)}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 transition hover:scale-105 hover:bg-cyan-100"
              title="Copiar WhatsApp cliente"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="9" y="9" width="11" height="11" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-2 min-h-0 flex-1 rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#fff_0%,#f8fafc_100%)] px-3 py-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Recibe</p>
        <p className="mt-1 truncate text-sm font-bold text-slate-800">{receiver.name || "-"}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="truncate text-xs font-semibold text-slate-500">{receiver.whatsapp || "Sin WhatsApp"}</p>
          {receiver.whatsapp ? (
            <button
              type="button"
              onClick={() => onCopyWhatsapp(receiver.whatsapp)}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 transition hover:scale-105 hover:bg-cyan-100"
              title="Copiar WhatsApp"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="9" y="9" width="11" height="11" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ProductSnapshotCard({
  order,
  imageUrl,
  onPreview,
}: {
  order: OrderRecord;
  imageUrl: string;
  onPreview: () => void;
}) {
  return (
    <div className="flex h-[268px] w-full flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,247,250,0.98)_100%)] p-2.5 shadow-[0_14px_36px_rgba(244,63,94,0.08)] lg:max-w-[224px]">
      <div className="flex gap-3">
        {imageUrl ? (
          <button
            type="button"
            onClick={onPreview}
            className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-[18px] border border-rose-100 bg-white shadow-sm transition hover:scale-[1.03] hover:shadow-md"
            title="Ver imagen grande"
          >
            <img src={imageUrl} alt={order.nombreProducto || "Producto"} className="h-full w-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-slate-900/55 px-1.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-white opacity-0 transition group-hover:opacity-100">
              Ampliar
            </span>
          </button>
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] border border-dashed border-slate-300 bg-white text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
            Sin imagen
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div>
            <p className="text-center text-[10px] font-black uppercase tracking-[0.24em] text-blue-600">Producto</p>
            <p className="mt-1 line-clamp-2 text-sm font-black leading-5 text-slate-900">{order.nombreProducto || "Sin título"}</p>
            <p className="mt-1 text-[11px] font-black uppercase tracking-[0.14em] text-rose-700">Código: {order.codigoProducto || "-"}</p>
          </div>
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Precio</p>
          <p className="mt-1 text-sm font-black text-emerald-700">{currency.format(order.precioUnitario)}</p>
        </div>
        <div className="rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Piezas</p>
          <p className="mt-1 text-sm font-black text-slate-800">{order.cantidad}</p>
        </div>
      </div>

      <div className="mt-2 min-h-0 flex-1 rounded-2xl border border-rose-100 bg-white/80 px-3 py-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Dedicatoria</p>
        <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-slate-600">{order.dedicatoriaFrase || "Sin dedicatoria"}</p>
      </div>
    </div>
  );
}

function SaleBreakdownCard({ order }: { order: OrderRecord }) {
  return (
    <div className="h-[268px] w-full overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_100%)] p-2.5 shadow-[0_14px_34px_rgba(15,23,42,0.08)] lg:max-w-[208px]">
      <div>
        <p className="text-center text-[10px] font-black uppercase tracking-[0.26em] text-blue-600">Venta</p>
        <div className="mt-1 flex items-center justify-center gap-2">
          <p className="text-base font-black leading-none text-slate-900">{currency.format(order.total)}</p>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{order.formaPago}</span>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-slate-900/[0.03] p-1.5">
        <div className="rounded-2xl bg-white px-2.5 py-1.5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Cantidad</p>
          <p className="mt-1 text-sm font-black text-slate-800">{order.cantidad}</p>
        </div>
        <div className="rounded-2xl bg-white px-2.5 py-1.5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Precio</p>
          <p className="mt-1 text-[13px] font-black text-slate-800">{currency.format(order.precioUnitario)}</p>
        </div>
      </div>

      <div className="my-1.5 border-t border-dashed border-slate-200" />

      <div className="space-y-1 font-mono text-[11px] leading-4 text-slate-600">
        <div className="flex items-center justify-between gap-3">
          <span>Subtotal</span>
          <span className="font-black text-slate-900">{currency.format(order.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Costo de envío</span>
          <span className="font-black text-amber-700">{currency.format(order.costoEnvio || 0)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Anticipo</span>
          <span className="font-black text-cyan-700">{currency.format(order.anticipoPagado)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-dashed border-slate-200 pt-1.5">
          <span className="font-bold uppercase tracking-wide text-slate-500">Saldo pendiente</span>
          <span className="text-sm font-black text-rose-700">{currency.format(order.saldoPendiente)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-dashed border-slate-200 pt-1.5">
          <span className="font-bold uppercase tracking-wide text-slate-500">Total estimado</span>
          <span className="text-sm font-black text-slate-900">{currency.format(order.total)}</span>
        </div>
      </div>
    </div>
  );
}

function StatusControlCard({
  order,
  disabled,
  selectedStatus,
  deleting,
  onChange,
  onApply,
  onDelete,
}: {
  order: OrderRecord;
  disabled: boolean;
  selectedStatus: OrderStatus;
  deleting: boolean;
  onChange: (status: OrderStatus) => void;
  onApply: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="h-[268px] w-full overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-3 shadow-[0_14px_32px_rgba(15,23,42,0.06)] lg:max-w-[214px]">
      <p className="text-center text-[10px] font-black uppercase tracking-[0.24em] text-blue-600">Estatus</p>
      <select
        value={selectedStatus}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as OrderStatus)}
        className={`mt-2 w-full rounded-2xl border px-3 py-2 text-xs font-black outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${statusPillClass(selectedStatus)}`}
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>
      <div className="mt-4 rounded-2xl bg-slate-50 px-3 py-3">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Accion</p>
        <div className="mt-3 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onApply}
            disabled={disabled}
            className="inline-flex w-full max-w-[168px] items-center justify-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50 px-2 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-100 ring-1 ring-cyan-200">
              <Pencil className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />
            </span>
            Actualizar
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex w-full max-w-[168px] items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 ring-1 ring-rose-200">
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />
            </span>
            {deleting ? "Eliminando" : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeliveryCard({ order }: { order: OrderRecord }) {
  return (
    <div className="h-[268px] w-full overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.05)] lg:max-w-[214px]">
      <p className="text-center text-[10px] font-black uppercase tracking-[0.24em] text-blue-600">Entrega</p>
      <p className="mt-2 text-sm font-black text-slate-900">
        {formatDateDDMMYYYY(order.fechaEntrega)} <span className="text-slate-500">{order.horaEntrega}</span>
      </p>
      <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-slate-600">
        {order.direccionEntrega ? `${order.direccionEntrega}, ${order.coloniaEntrega}` : order.coloniaEntrega || "Sin dirección"}
      </p>
      <div className="mt-3">
        {order.ubicacionEntrega ? (
          <a
            href={order.ubicacionEntrega}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-rose-700 transition hover:scale-[1.02] hover:bg-rose-100"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            Ver mapa
          </a>
        ) : (
          <span className="text-[11px] font-semibold text-slate-400">Sin ubicación</span>
        )}
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Notas</p>
        <p className="mt-1 line-clamp-3 text-[12px] leading-5 text-slate-600">{order.notasInternas?.trim() || "NO HAY NOTAS ..."}</p>
      </div>
    </div>
  );
}

async function readApiPayload(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();
    return { ok: false, message: text?.trim() || null };
  } catch {
    return null;
  }
}

export default function OrdersAdminModule() {
  const siteData = useSiteData();
  const { catalogProducts } = useMemo(() => buildSiteCatalogData(siteData), [siteData]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [draft, setDraft] = useState<OrderDraft>(buildEmptyDraft("Pedido 1"));
  const [query, setQuery] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<TrackingFilter>("TODOS");
  const [recordsLimit, setRecordsLimit] = useState<RecordsLimit>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [trackingTab, setTrackingTab] = useState<"PEDIDOS" | "RESUMEN">("PEDIDOS");
  const [savingOrder, setSavingOrder] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [refreshingOrders, setRefreshingOrders] = useState(false);
  const [samePerson, setSamePerson] = useState(true);
  const [previewModalImage, setPreviewModalImage] = useState<{
    src: string;
    title: string;
    numeroPedido: string;
    codigoProducto: string;
  } | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "error" | "info"; text: string } | null>(null);
  const [anticipoFocused, setAnticipoFocused] = useState(false);
  const [costoEnvioFocused, setCostoEnvioFocused] = useState(false);
  const [notasFocused, setNotasFocused] = useState(false);
  const [receiverName, setReceiverName] = useState("");
  const [receiverWhatsapp, setReceiverWhatsapp] = useState("");
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<DraftErrors>({});
  const fieldRefs = useRef<Partial<Record<DraftField, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>>>({});
  const toastTimerRef = useRef<number | null>(null);

  const nextOrderNumber = useMemo(() => getNextOrderNumber(orders), [orders]);

  useEffect(() => {
    if (editingOrderId) return;
    setDraft((prev) => ({ ...prev, numeroPedido: nextOrderNumber }));
  }, [nextOrderNumber, editingOrderId]);

  useEffect(() => {
    if (!samePerson) return;
    const nextText = buildReceiverText(draft.clienteSolicita, draft.whatsappCliente);
    if (draft.datosQuienRecibe === nextText) return;
    setDraft((prev) => ({ ...prev, datosQuienRecibe: nextText }));
  }, [samePerson, draft.clienteSolicita, draft.whatsappCliente, draft.datosQuienRecibe]);

  useEffect(() => {
    if (samePerson) return;
    const nextText = buildReceiverText(receiverName, receiverWhatsapp);
    if (draft.datosQuienRecibe === nextText) return;
    setDraft((prev) => ({ ...prev, datosQuienRecibe: nextText }));
  }, [samePerson, receiverName, receiverWhatsapp, draft.datosQuienRecibe]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!previewModalImage) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewModalImage(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [previewModalImage]);

  const totals = useMemo(() => {
    const totalVentas = orders.reduce((acc, order) => acc + order.total, 0);
    const totalAnticipos = orders.reduce((acc, order) => acc + order.anticipoPagado, 0);
    const totalSaldo = orders.reduce((acc, order) => acc + order.saldoPendiente, 0);
    const totalEnvio = orders.reduce((acc, order) => acc + (order.costoEnvio || 0), 0);

    return { totalVentas, totalAnticipos, totalSaldo, totalEnvio };
  }, [orders]);

  const statusCounts = useMemo(() => {
    const summary: Record<OrderStatus, number> = {
      Pendiente: 0,
      "En elaboracion": 0,
      "Listo para entregar": 0,
      Entregado: 0,
      Cancelado: 0,
    };

    orders.forEach((order) => {
      summary[order.estatus] += 1;
    });

    return summary;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = activeStatusFilter === "TODOS" ? true : order.estatus === activeStatusFilter;
      if (!matchesStatus) return false;

      if (!q) return true;

      const blob = [
        order.numeroPedido,
        order.codigoProducto,
        order.nombreProducto,
        order.clienteSolicita,
        order.whatsappCliente,
        order.datosQuienRecibe,
        order.estatus,
      ]
        .join(" ")
        .toLowerCase();

      return blob.includes(q);
    });
  }, [orders, query, activeStatusFilter]);

  const totalPages = useMemo(() => {
    if (recordsLimit === "ALL") return 1;
    return Math.max(1, Math.ceil(filteredOrders.length / recordsLimit));
  }, [filteredOrders.length, recordsLimit]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, activeStatusFilter, recordsLimit]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const visibleOrders = useMemo(() => {
    if (recordsLimit === "ALL") return filteredOrders;
    const startIndex = (currentPage - 1) * recordsLimit;
    const endIndex = startIndex + recordsLimit;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, recordsLimit, currentPage]);

  const canGoPrevPage = recordsLimit !== "ALL" && currentPage > 1;
  const canGoNextPage = recordsLimit !== "ALL" && currentPage < totalPages;

  const copyWhatsapp = async (whatsapp: string) => {
    if (!whatsapp.trim()) {
      showToast("info", "Este pedido no tiene WhatsApp para copiar.");
      return;
    }

    if (!navigator.clipboard?.writeText) {
      showToast("error", "Tu navegador no permite copiar al portapapeles.");
      return;
    }

    try {
      await navigator.clipboard.writeText(whatsapp);
      showToast("ok", `WhatsApp copiado: ${whatsapp}`);
    } catch {
      showToast("error", "No se pudo copiar el WhatsApp.");
    }
  };

  const startEditingOrder = (order: OrderRecord) => {
    const receiver = splitReceiverText(order.datosQuienRecibe);
    const sameReceiverAsClient =
      receiver.name.trim().toLowerCase() === order.clienteSolicita.trim().toLowerCase() &&
      receiver.whatsapp.trim() === order.whatsappCliente.trim();

    setEditingOrderId(order.id);
    setSamePerson(sameReceiverAsClient);
    setReceiverName(sameReceiverAsClient ? "" : receiver.name);
    setReceiverWhatsapp(sameReceiverAsClient ? "" : receiver.whatsapp);
    setFieldErrors({});

    setDraft({
      numeroPedido: order.numeroPedido,
      fechaPedido: order.fechaPedido,
      codigoProducto: order.codigoProducto,
      nombreProducto: order.nombreProducto,
      precioUnitario: order.precioUnitario,
      cantidad: order.cantidad,
      dedicatoriaFrase: order.dedicatoriaFrase,
      datosQuienRecibe: sameReceiverAsClient
        ? buildReceiverText(order.clienteSolicita, order.whatsappCliente)
        : order.datosQuienRecibe,
      clienteSolicita: order.clienteSolicita,
      whatsappCliente: order.whatsappCliente,
      fechaEntrega: order.fechaEntrega,
      horaEntrega: order.horaEntrega,
      direccionEntrega: order.direccionEntrega,
      ubicacionEntrega: order.ubicacionEntrega,
      coloniaEntrega: order.coloniaEntrega,
      municipioEntrega: order.municipioEntrega,
      referenciaEntrega: order.referenciaEntrega,
      formaPago: order.formaPago,
      anticipoPagado: order.anticipoPagado,
      costoEnvio: order.costoEnvio,
      estatus: order.estatus,
      notasInternas: order.notasInternas === "NO HAY NOTAS ..." ? "" : order.notasInternas,
      imagenProducto: order.imagenProducto,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast("info", `Editando ${order.numeroPedido}. Modifica y guarda para actualizar Google Sheets.`);
  };

  const productCodeExists = useMemo(() => {
    const code = draft.codigoProducto.trim();
    if (!code) return true;
    return Boolean(findProductByCode(code, catalogProducts));
  }, [draft.codigoProducto]);
  const previewImageUrl = useMemo(() => {
    if (draft.imagenProducto.trim()) {
      return draft.imagenProducto;
    }

    const product = findProductByCode(draft.codigoProducto, catalogProducts);
    return product?.defaultImages?.[0] || "";
  }, [draft.imagenProducto, draft.codigoProducto]);

  const computedSubtotal = Number(draft.precioUnitario || 0) * Number(draft.cantidad || 0);
  const computedTotal = computedSubtotal + Number(draft.costoEnvio || 0);
  const computedSaldo = Math.max(0, computedTotal - Number(draft.anticipoPagado || 0));
  const getOrderImageUrl = (order: OrderRecord) => {
    if (order.imagenProducto?.trim()) return order.imagenProducto.trim();
    const product = findProductByCode(order.codigoProducto, catalogProducts);
    return product?.defaultImages?.[0] || "";
  };
  const summaryDateLabel = useMemo(() => {
    const label = new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "long",
    }).format(new Date());

    return label.toUpperCase();
  }, []);
  const shippingCost = totals.totalEnvio;

  const setFieldRef =
    (field: DraftField) => (element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null) => {
      fieldRefs.current[field] = element;
    };

  const focusField = (field: DraftField) => {
    const element = fieldRefs.current[field];
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      element.focus();
    }, 120);
  };

  const clearFieldError = (field: DraftField) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const updateDraftField = <K extends keyof OrderDraft>(field: K, value: OrderDraft[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    if (FIELD_ORDER.includes(field as DraftField)) {
      clearFieldError(field as DraftField);
    }
  };

  const showToast = (type: "ok" | "error" | "info", text: string) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToast({ type, text });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const loadOrdersFromCloud = async (initialLoad = false, silent = false) => {
    if (initialLoad) {
      setLoadingOrders(true);
    } else {
      setRefreshingOrders(true);
    }

    try {
      const res = await fetch("/api/pedidos", { method: "GET" });
      const data = await readApiPayload(res);

      if (!res.ok || !data?.ok || !Array.isArray(data?.orders)) {
        throw new Error(data?.message || "No se pudieron cargar los pedidos desde Google Sheets.");
      }

      setOrders(data.orders as OrderRecord[]);
    } catch (error) {
      if (!silent) {
        const message = error instanceof Error ? error.message : "Error al cargar pedidos desde la nube.";
        showToast("error", message);
      }
    } finally {
      if (initialLoad) {
        setLoadingOrders(false);
      } else {
        setRefreshingOrders(false);
      }
    }
  };

  useEffect(() => {
    void loadOrdersFromCloud(true);
  }, []);

  const resolveCode = (value: string) => {
    const cleaned = normalizeCode(value);
    const product = findProductByCode(cleaned, catalogProducts);
    if (!product) {
      clearFieldError("anticipoPagado");
      setDraft((prev) => ({
        ...prev,
        codigoProducto: cleaned,
        nombreProducto: "",
        precioUnitario: 0,
        anticipoPagado: 0,
        costoEnvio: 0,
        imagenProducto: "",
      }));
      return;
    }

    clearFieldError("codigoProducto");
    setDraft((prev) => ({
      ...prev,
      codigoProducto: product.sku,
      nombreProducto: product.baseTitle,
      precioUnitario: product.basePriceMxn,
      imagenProducto: product.defaultImages[0] ?? "",
    }));
  };

  const handleCodeInputChange = (value: string) => {
    const cleaned = normalizeCode(value);
    updateDraftField("codigoProducto", cleaned);
    resolveCode(cleaned);

    if (cleaned && !findProductByCode(cleaned, catalogProducts)) {
      setFieldErrors((prev) => ({ ...prev, codigoProducto: "El código no existe en el catálogo. Verifícalo (ejemplo: DM-470)." }));
      return;
    }

    clearFieldError("codigoProducto");
  };

  const handleSamePersonMode = (isSame: boolean) => {
    setSamePerson(isSame);
    if (isSame) {
      setReceiverName("");
      setReceiverWhatsapp("");
      setDraft((prev) => ({
        ...prev,
        datosQuienRecibe: buildReceiverText(prev.clienteSolicita, prev.whatsappCliente),
      }));
      clearFieldError("datosQuienRecibe");
      clearFieldError("whatsappRecibe");
      return;
    }

    setReceiverName("");
    setReceiverWhatsapp("");
    clearFieldError("datosQuienRecibe");
    clearFieldError("whatsappRecibe");
    setDraft((prev) => ({ ...prev, datosQuienRecibe: "" }));
  };

  const validateDraft = () => {
    const errors: DraftErrors = {};
    const product = findProductByCode(draft.codigoProducto, catalogProducts);

    if (!draft.codigoProducto.trim()) {
      errors.codigoProducto = "Escribe el código del producto.";
    } else if (!product) {
      errors.codigoProducto = "El código no existe en el catálogo. Verifícalo (ejemplo: DM-470).";
    }

    if (draft.cantidad <= 0) {
      errors.cantidad = "La cantidad debe ser mayor a 0.";
    }

    if (draft.precioUnitario > 0 && draft.anticipoPagado > draft.precioUnitario) {
      errors.anticipoPagado = `El anticipo no puede ser mayor al precio base (${currency.format(draft.precioUnitario)}).`;
    }

    if (!draft.clienteSolicita.trim()) {
      errors.clienteSolicita = "Escribe el nombre del cliente.";
    }

    if (!draft.whatsappCliente.trim()) {
      errors.whatsappCliente = "Escribe el WhatsApp del cliente.";
    } else if (!/^\d{10}$/.test(draft.whatsappCliente.trim())) {
      errors.whatsappCliente = "El WhatsApp debe tener exactamente 10 números.";
    }

    if (samePerson && !draft.datosQuienRecibe.trim()) {
      errors.datosQuienRecibe = samePerson
        ? "Completa cliente y WhatsApp para autocompletar quién recibe."
        : "Escribe los datos de quién recibe.";
    }

    if (!samePerson) {
      if (!receiverName.trim()) {
        errors.datosQuienRecibe = "Escribe el nombre de quién recibe.";
      }

      if (!receiverWhatsapp.trim()) {
        errors.whatsappRecibe = "Escribe el WhatsApp de quién recibe.";
      } else if (!/^\d{10}$/.test(receiverWhatsapp.trim())) {
        errors.whatsappRecibe = "El WhatsApp de quién recibe debe tener 10 números.";
      }
    }

    if (!draft.fechaEntrega) {
      errors.fechaEntrega = "Selecciona la fecha de entrega.";
    }

    if (!draft.horaEntrega) {
      errors.horaEntrega = "Selecciona la hora de entrega.";
    }

    return errors;
  };

  const submitOrder = async () => {
    const errors = validateDraft();
    setFieldErrors(errors);

    const firstErrorField = FIELD_ORDER.find((field) => errors[field]);
    if (firstErrorField) {
      showToast("error", "Revisa los campos obligatorios marcados en rojo.");
      focusField(firstErrorField);
      return;
    }

    const editingOrder = editingOrderId ? orders.find((order) => order.id === editingOrderId) || null : null;
    const isEditing = Boolean(editingOrderId);

    const newOrder: OrderRecord = {
      ...draft,
      id: editingOrderId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      creadoEn: editingOrder?.creadoEn || new Date().toISOString(),
      fechaPedido: isEditing ? draft.fechaPedido : new Date().toISOString().slice(0, 10),
      subtotal: computedSubtotal,
      total: computedTotal,
      saldoPendiente: Math.max(0, computedTotal - draft.anticipoPagado),
      costoEnvio: draft.costoEnvio,
      notasInternas: draft.notasInternas.trim() || "NO HAY NOTAS ...",
    };

    setSavingOrder(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEditing ? { order: newOrder } : { orders: [newOrder] }),
      });

      const data = await readApiPayload(res);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "No se pudo guardar y sincronizar el pedido.");
      }

      await loadOrdersFromCloud(false);
      const followingNumber = nextOrderNumber;
      setDraft(buildEmptyDraft(followingNumber));
      setSamePerson(true);
      setReceiverName("");
      setReceiverWhatsapp("");
      setEditingOrderId(null);
      setFieldErrors({});
      showToast("ok", isEditing ? "Pedido actualizado y sincronizado correctamente." : "Pedido guardado y sincronizado correctamente.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar y sincronizar en Google Sheets.";
      await loadOrdersFromCloud(false, true);
      showToast("error", `${message} Se mantuvo la información original de Google Sheets.`);
    } finally {
      setSavingOrder(false);
    }
  };

  const exportExcel = () => {
    const rows = orders.map((order) => {
      const receiver = splitReceiverText(order.datosQuienRecibe);
      return {
      "NUMERO PEDIDO": order.numeroPedido,
      "FECHA PEDIDO": formatDateDDMMYYYY(order.fechaPedido),
      "CÓDIGO PRODUCTO": order.codigoProducto,
      "NOMBRE PRODUCTO": order.nombreProducto,
      "PRECIO UNITARIO": order.precioUnitario,
      "CANTIDAD": order.cantidad,
      SUBTOTAL: order.subtotal,
      "COSTO ENVÍO": order.costoEnvio,
      TOTAL: order.total,
      "DEDICATORIA O FRASE": order.dedicatoriaFrase,
      "NOMBRE QUIÉN RECIBE": receiver.name,
      "WHATSAPP QUIÉN RECIBE": receiver.whatsapp,
      "DATOS DE QUIEN RECIBE": order.datosQuienRecibe,
      CLIENTE: order.clienteSolicita,
      WHATSAPP: order.whatsappCliente,
      "FECHA ENTREGA": formatDateDDMMYYYY(order.fechaEntrega),
      "HORA ENTREGA": order.horaEntrega,
      DIRECCION: order.direccionEntrega,
      "UBICACIÓN ENTREGA": order.ubicacionEntrega,
      COLONIA: order.coloniaEntrega,
      MUNICIPIO: order.municipioEntrega,
      REFERENCIA: order.referenciaEntrega,
      "FORMA DE PAGO": order.formaPago,
      ANTICIPO: order.anticipoPagado,
      SALDO: order.saldoPendiente,
      ESTATUS: order.estatus,
      "NOTAS INTERNAS": order.notasInternas,
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "PEDIDOS");
    XLSX.writeFile(wb, `PEDIDOS_${todayIso()}.xlsx`);
  };

  const removeOrder = async (order: OrderRecord) => {
    if (deletingOrderId) return;

    setDeletingOrderId(order.id);
    try {
      if (order.syncedAt) {
        const res = await fetch("/api/pedidos", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id, numeroPedido: order.numeroPedido }),
        });

        const data = await readApiPayload(res);
        if (!res.ok || !data?.ok) {
          throw new Error(data?.message || "No se pudo eliminar el pedido en Google Sheets.");
        }
      }

      setOrders((prev) => prev.filter((item) => item.id !== order.id));
      showToast(
        "ok",
        order.syncedAt
          ? "Pedido eliminado del panel y de Google Sheets."
          : "Pedido eliminado del panel local.",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar el pedido.";
      await loadOrdersFromCloud(false, true);
      showToast("error", `${message} Se restauró la información original de Google Sheets.`);
    } finally {
      setDeletingOrderId(null);
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    const targetOrder = orders.find((order) => order.id === id) || null;
    const previousStatus = targetOrder?.estatus || null;

    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, estatus: status } : order)));

    if (!targetOrder) {
      showToast("error", "No se encontró el pedido para actualizar estatus.");
      return;
    }

    setUpdatingStatusId(id);
    try {
      const res = await fetch("/api/pedidos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: targetOrder.id,
          numeroPedido: targetOrder.numeroPedido,
          estatus: status,
        }),
      });

      const data = await readApiPayload(res);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "No se pudo actualizar el estatus en Google Sheets.");
      }

      await loadOrdersFromCloud(false);
      showToast("ok", `Estatus actualizado a \"${status}\" y sincronizado con Google Sheets.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar el estatus.";
      if (previousStatus) {
        setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, estatus: previousStatus as OrderStatus } : order)));
      }
      await loadOrdersFromCloud(false, true);
      showToast("error", `${message} Se mantuvo el estatus original de Google Sheets.`);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <section className="relative bg-[radial-gradient(120%_80%_at_0%_0%,#ffe6f1_0%,#f8fafc_55%)] pb-14 pt-8">
      <div className="mx-auto w-full max-w-[1460px] px-3 md:px-6 lg:px-8">
        <div className="rounded-3xl border border-rose-200/70 bg-white/95 p-4 shadow-[0_20px_70px_rgba(190,24,93,0.12)] backdrop-blur md:p-6">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-500">Administración</p>
              <h1 className="text-2xl font-black text-slate-900 md:text-3xl">Módulo de Pedidos 10 de Mayo</h1>
              <p className="mt-1 text-sm text-slate-500">
                Flujo inteligente: inicia por <span className="font-semibold text-rose-600">Código producto</span> y se autocompleta desde catálogo.
              </p>
            </div>

            <div className="flex items-center">
              <button
                type="button"
                onClick={exportExcel}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-400 bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-600"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M4 3h10l6 6v12H4V3zm10 1.5V10h5.5" />
                  <path d="M8.2 12.2h1.7l1.2 2 1.2-2H14l-2 3.1 2.1 3.2h-1.7l-1.3-2.1-1.3 2.1H8l2.1-3.2-1.9-3.1z" />
                </svg>
                Exportar Excel
              </button>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-base font-extrabold text-slate-900">Nuevo Pedido</h2>

              <div className="space-y-6">
                <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-700">Datos del pedido</p>
                      <p className="mt-1 text-sm text-slate-500">Empieza por el código y el sistema llena producto y precio automáticamente.</p>
                    </div>
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600">Campos con * son obligatorios</span>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-3">
                    <label className="block lg:col-span-2">
                      <FieldLabel label="Código producto" required />
                      <input
                        ref={setFieldRef("codigoProducto")}
                        autoFocus
                        className={getFieldClass(fieldErrors.codigoProducto)}
                        value={draft.codigoProducto}
                        onChange={(e) => handleCodeInputChange(e.target.value)}
                        onBlur={(e) => resolveCode(e.target.value)}
                        placeholder="DM-470 ó 470"
                      />
                      <FieldError error={fieldErrors.codigoProducto} />
                      {draft.codigoProducto.trim() && !productCodeExists ? (
                        <div className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                          El código no existe en el catálogo. Verifícalo (ejemplo: DM-470).
                        </div>
                      ) : null}
                    </label>

                    <label className="block">
                      <FieldLabel label="Cantidad" required />
                      <input
                        ref={setFieldRef("cantidad")}
                        type="number"
                        min={1}
                        className={getFieldClass(fieldErrors.cantidad)}
                        value={draft.cantidad}
                        onChange={(e) => updateDraftField("cantidad", Number(e.target.value) || 1)}
                        placeholder="1"
                      />
                      <FieldError error={fieldErrors.cantidad} />
                    </label>

                    <AutofillBadge label="Número pedido" value={draft.numeroPedido} />
                    <AutofillBadge label="Producto detectado" value={draft.nombreProducto || "Aún no se detecta producto"} />
                    <AutofillBadge label="Precio unitario" value={draft.precioUnitario ? currency.format(draft.precioUnitario) : "Aún no se detecta precio"} />
                    <AutofillBadge label="Subtotal" value={computedSubtotal ? currency.format(computedSubtotal) : "Se calcula con precio y cantidad"} />
                    <AutofillBadge label="Saldo pendiente" value={currency.format(computedSaldo)} />
                    <AutofillBadge label="Total estimado" value={computedTotal ? currency.format(computedTotal) : "Se calcula con precio, cantidad y costo envío"} />

                    <label className="block">
                      <FieldLabel label="Forma de pago" />
                      <select
                        className={getFieldClass()}
                        value={draft.formaPago}
                        onChange={(e) => updateDraftField("formaPago", e.target.value as PaymentMethod)}
                      >
                        {PAYMENT_OPTIONS.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <FieldLabel label="Anticipo" />
                      <div className="relative mt-1">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-blue-700">$</span>
                        <input
                          ref={setFieldRef("anticipoPagado")}
                          type="text"
                          inputMode="decimal"
                          className={`w-full rounded-xl border bg-white py-2 pl-8 pr-3 text-sm outline-none transition ${
                            fieldErrors.anticipoPagado
                              ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                              : "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                          }`}
                          value={anticipoFocused && draft.anticipoPagado === 0 ? "" : String(draft.anticipoPagado)}
                          onFocus={() => setAnticipoFocused(true)}
                          onBlur={() => setAnticipoFocused(false)}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/,/g, ".").trim();
                            if (!raw) {
                              updateDraftField("anticipoPagado", 0);
                              clearFieldError("anticipoPagado");
                              return;
                            }

                            const sanitized = raw.replace(/[^0-9.]/g, "");
                            const parsed = Number(sanitized);
                            if (!Number.isFinite(parsed)) return;
                            updateDraftField("anticipoPagado", parsed);

                            if (draft.precioUnitario > 0 && parsed > draft.precioUnitario) {
                              setFieldErrors((prev) => ({
                                ...prev,
                                anticipoPagado: `El anticipo no puede ser mayor al precio base (${currency.format(draft.precioUnitario)}).`,
                              }));
                              return;
                            }

                            clearFieldError("anticipoPagado");
                          }}
                          placeholder="75"
                        />
                      </div>
                      <FieldError error={fieldErrors.anticipoPagado} />
                    </label>

                    <label className="block">
                      <FieldLabel label="Costo de envío" />
                      <div className="relative mt-1">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-blue-700">$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                          value={costoEnvioFocused && draft.costoEnvio === 0 ? "" : String(draft.costoEnvio)}
                          onFocus={() => setCostoEnvioFocused(true)}
                          onBlur={() => setCostoEnvioFocused(false)}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/,/g, ".").trim();
                            if (!raw) { updateDraftField("costoEnvio", 0); return; }
                            const sanitized = raw.replace(/[^0-9.]/g, "");
                            const parsed = Number(sanitized);
                            if (!Number.isFinite(parsed)) return;
                            updateDraftField("costoEnvio", parsed);
                          }}
                          placeholder="0"
                        />
                      </div>
                    </label>

                    <label className="block lg:col-span-3">
                      <FieldLabel label="Dedicatoria o frase" />
                      <textarea
                        rows={2}
                        className={getFieldClass()}
                        value={draft.dedicatoriaFrase}
                        onChange={(e) => updateDraftField("dedicatoriaFrase", e.target.value)}
                        placeholder="Ejemplo: Te amamos mamá, gracias por todo"
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/60 via-white to-white p-4 shadow-sm">
                    <div className="mb-4">
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-700">Datos cliente y quién recibe</p>
                      <p className="mt-1 text-sm text-slate-500">Decide si quién recibe es la misma persona o alguien distinto.</p>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                      <label className="block lg:col-span-2">
                        <FieldLabel label="Cliente (quién solicita)" required />
                        <input
                          ref={setFieldRef("clienteSolicita")}
                          className={getFieldClass(fieldErrors.clienteSolicita)}
                          value={draft.clienteSolicita}
                          onChange={(e) => updateDraftField("clienteSolicita", e.target.value)}
                          placeholder="Ejemplo: Juan López"
                        />
                        <FieldError error={fieldErrors.clienteSolicita} />
                      </label>

                      <label className="block">
                        <FieldLabel label="WhatsApp cliente" required />
                        <input
                          ref={setFieldRef("whatsappCliente")}
                          className={getFieldClass(fieldErrors.whatsappCliente)}
                          value={draft.whatsappCliente}
                          inputMode="numeric"
                          maxLength={10}
                          onChange={(e) => updateDraftField("whatsappCliente", sanitizePhoneInput(e.target.value))}
                          placeholder="Ejemplo: 7223456789"
                        />
                        <p className="mt-1 text-[11px] font-medium text-slate-500">Solo números, 10 dígitos.</p>
                        <FieldError error={fieldErrors.whatsappCliente} />
                      </label>

                      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 lg:col-span-3">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-bold text-blue-900">¿Quién recibe es la misma persona?</p>
                            <p className="mt-1 text-xs text-blue-700">Selecciona si quién recibe es la misma persona o alguien distinto.</p>
                          </div>
                          <div className="inline-flex rounded-full border border-blue-300 bg-white p-1 text-xs font-bold">
                            <button
                              type="button"
                              onClick={() => handleSamePersonMode(true)}
                              className={`rounded-full px-4 py-2 transition ${samePerson ? "bg-blue-500 text-white" : "text-blue-700 hover:bg-blue-50"}`}
                            >
                              Misma persona
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSamePersonMode(false)}
                              className={`rounded-full px-4 py-2 transition ${!samePerson ? "bg-blue-700 text-white" : "text-blue-700 hover:bg-blue-50"}`}
                            >
                              Persona distinta
                            </button>
                          </div>
                        </div>

                        {samePerson ? (
                          <div className="mt-4 rounded-2xl border border-blue-200 bg-white px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">Datos de quién recibe</p>
                            <p className="mt-1 text-sm font-bold text-blue-900">{draft.datosQuienRecibe || "Se llenará automáticamente con cliente y WhatsApp."}</p>
                          </div>
                        ) : (
                          <div className="mt-4 rounded-2xl border border-blue-200 bg-white p-3">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-blue-700">Persona distinta</p>
                            <div className="grid gap-2 md:grid-cols-[1fr_auto_1fr] md:items-start">
                              <label className="block">
                                <FieldLabel label="Nombre de quién recibe" required />
                                <input
                                  ref={setFieldRef("datosQuienRecibe")}
                                  className={getFieldClass(fieldErrors.datosQuienRecibe)}
                                  value={receiverName}
                                  onChange={(e) => {
                                    setReceiverName(e.target.value);
                                    clearFieldError("datosQuienRecibe");
                                  }}
                                  placeholder="Ejemplo: Sra Laura"
                                />
                                <FieldError error={fieldErrors.datosQuienRecibe} />
                              </label>

                              <div className="mt-6 hidden h-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-3 text-sm font-black text-blue-700 md:flex">
                                -
                              </div>

                              <label className="block">
                                <FieldLabel label="WhatsApp de quién recibe" required />
                                <input
                                  ref={setFieldRef("whatsappRecibe")}
                                  className={getFieldClass(fieldErrors.whatsappRecibe)}
                                  value={receiverWhatsapp}
                                  inputMode="numeric"
                                  maxLength={10}
                                  onChange={(e) => {
                                    setReceiverWhatsapp(sanitizePhoneInput(e.target.value));
                                    clearFieldError("whatsappRecibe");
                                  }}
                                  placeholder="Ejemplo: 7221112233"
                                />
                                <p className="mt-1 text-[11px] font-medium text-slate-500">Solo números, 10 dígitos.</p>
                                <FieldError error={fieldErrors.whatsappRecibe} />
                              </label>
                            </div>
                          </div>
                        )}

                        {samePerson && fieldErrors.datosQuienRecibe ? (
                          <p className="mt-2 text-xs font-semibold text-rose-600">{fieldErrors.datosQuienRecibe}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

              {editingOrderId ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                  Modo edición activo: guarda para actualizar la fila en Google Sheets.
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => void submitOrder()}
                  disabled={savingOrder}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingOrder ? "Guardando..." : editingOrderId ? "Actualizar pedido" : "Guardar pedido"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(buildEmptyDraft(nextOrderNumber));
                    setSamePerson(true);
                    setReceiverName("");
                    setReceiverWhatsapp("");
                    setEditingOrderId(null);
                    setFieldErrors({});
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-slate-300"
                >
                  {editingOrderId ? "Cancelar edición" : "Limpiar formulario"}
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h2 className="mb-3 text-base font-extrabold text-slate-900">Vista previa producto</h2>
                {previewImageUrl ? (
                  <div className="flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2">
                    <img
                      src={previewImageUrl.trim()}
                      alt={draft.nombreProducto || "Producto"}
                      className="max-h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                    Captura un código de producto para ver la imagen.
                  </div>
                )}

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-slate-500">Código</span>
                    <span className="font-bold text-slate-800">{draft.codigoProducto || "-"}</span>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-slate-500">Producto</p>
                    <p className="font-semibold text-slate-800">{draft.nombreProducto || "Sin seleccionar"}</p>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-slate-500">Precio base</span>
                    <span className="font-black text-emerald-600">{currency.format(draft.precioUnitario || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/60 via-white to-white p-4 shadow-sm">
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-700">Datos de la entrega</p>
                  <p className="mt-1 text-sm text-slate-500">Completa los datos esenciales de entrega.</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <label className="block">
                    <FieldLabel label="Estatus" />
                    <select
                      className={getFieldClass()}
                      value={draft.estatus}
                      onChange={(e) => updateDraftField("estatus", e.target.value as OrderStatus)}
                    >
                      {STATUS_OPTIONS.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <FieldLabel label="Fecha entrega" required />
                    <input
                      ref={setFieldRef("fechaEntrega")}
                      type="date"
                      className={getFieldClass(fieldErrors.fechaEntrega)}
                      value={draft.fechaEntrega}
                      onChange={(e) => updateDraftField("fechaEntrega", e.target.value)}
                    />
                    <FieldError error={fieldErrors.fechaEntrega} />
                  </label>

                  <label className="block">
                    <FieldLabel label="Hora entrega" required />
                    <select
                      ref={setFieldRef("horaEntrega")}
                      className={getFieldClass(fieldErrors.horaEntrega)}
                      value={draft.horaEntrega}
                      onChange={(e) => updateDraftField("horaEntrega", e.target.value)}
                    >
                      {HOUR_OPTIONS.map((hour) => (
                        <option key={hour} value={hour}>{hour}</option>
                      ))}
                    </select>
                    <FieldError error={fieldErrors.horaEntrega} />
                  </label>

                  <label className="block lg:col-span-3">
                    <FieldLabel label="Ubicación de entrega (link)" />
                    <div className="mt-1">
                      <input
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        value={draft.ubicacionEntrega}
                        onChange={(e) => updateDraftField("ubicacionEntrega", e.target.value)}
                        placeholder="Ejemplo: https://maps.app.goo.gl/76qbVEYvsozKgAWf6"
                      />
                    </div>
                  </label>

                  <div className="block lg:col-span-3">
                    <FieldLabel label="Dirección entrega" />
                    <div className="mt-1">
                      <input
                        ref={setFieldRef("direccionEntrega")}
                        className={getFieldClass(fieldErrors.direccionEntrega)}
                        value={draft.direccionEntrega}
                        onChange={(e) => updateDraftField("direccionEntrega", e.target.value)}
                        placeholder="Ejemplo: Calle Independencia 234"
                      />
                    </div>
                    <FieldError error={fieldErrors.direccionEntrega} />
                  </div>

                  <label className="block">
                    <FieldLabel label="Colonia" />
                    <input
                      ref={setFieldRef("coloniaEntrega")}
                      className={getFieldClass(fieldErrors.coloniaEntrega)}
                      value={draft.coloniaEntrega}
                      onChange={(e) => updateDraftField("coloniaEntrega", e.target.value)}
                      placeholder="Ejemplo Alvaro Obregón"
                    />
                    <FieldError error={fieldErrors.coloniaEntrega} />
                  </label>

                  <label className="block">
                    <FieldLabel label="Municipio" />
                    <input
                      className={getFieldClass()}
                      value={draft.municipioEntrega}
                      onChange={(e) => updateDraftField("municipioEntrega", e.target.value)}
                      placeholder="Ejemplo: San Mateo Atenco"
                    />
                  </label>

                  <label className="block">
                    <FieldLabel label="Referencia" />
                    <input
                      className={getFieldClass()}
                      value={draft.referenciaEntrega}
                      onChange={(e) => updateDraftField("referenciaEntrega", e.target.value)}
                      placeholder="Ejemplo: Portón negro, frente a la farmacia"
                    />
                  </label>

                  <label className="block lg:col-span-3">
                    <FieldLabel label="Notas internas" />
                    <textarea
                      rows={2}
                      className={`${getFieldClass()} placeholder:text-slate-400`}
                      value={draft.notasInternas}
                      onChange={(e) => updateDraftField("notasInternas", e.target.value)}
                      onFocus={() => setNotasFocused(true)}
                      onBlur={() => setNotasFocused(false)}
                      placeholder={notasFocused ? "Ejemplo: Entregar después de las 13:00" : "NO HAY NOTAS ..."}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {savingOrder ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 px-4">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-200 bg-white px-10 py-8 shadow-2xl">
              <svg className="h-10 w-10 animate-spin text-emerald-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 00-10 10h2z" />
              </svg>
              <p className="text-base font-black text-slate-800">Espere, guardando información...</p>
              <p className="text-sm text-slate-500">Sincronizando con Google Sheets</p>
            </div>
          </div>
        ) : null}

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <div className="sticky top-[112px] z-40 -mx-4 mb-4 flex flex-col gap-3 rounded-t-3xl bg-white/95 px-4 pb-3 pt-2 shadow-[0_12px_24px_rgba(15,23,42,0.06)] backdrop-blur supports-[backdrop-filter]:bg-white/88 md:top-20 md:-mx-6 md:px-6">
            <h2 className="text-lg font-black text-slate-900">Seguimiento de pedidos</h2>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="inline-flex w-fit rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setTrackingTab("PEDIDOS")}
                  className={`rounded-lg px-4 py-2 text-xs font-black tracking-wide transition ${
                    trackingTab === "PEDIDOS"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-white"
                  }`}
                >
                  PEDIDOS
                </button>
                <button
                  type="button"
                  onClick={() => setTrackingTab("RESUMEN")}
                  className={`rounded-lg px-4 py-2 text-xs font-black tracking-wide transition ${
                    trackingTab === "RESUMEN"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-white"
                  }`}
                >
                  RESUMEN
                </button>
              </div>

              {trackingTab === "PEDIDOS" ? (
                <div className="w-full space-y-2 md:max-w-sm">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input
                      className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-rose-400"
                      placeholder="Buscar por pedido, código, cliente, estado..."
                      value={query}
                      onChange={(e) => {
                        const value = e.target.value;
                        setQuery(value);
                        setActiveStatusFilter("TODOS");
                      }}
                    />
                  </div>
                  <select
                    value={activeStatusFilter}
                    onChange={(e) => {
                      setActiveStatusFilter(e.target.value as TrackingFilter);
                      setQuery("");
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="TODOS">Todos los estatus</option>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>

            {trackingTab === "PEDIDOS" ? (
              <div className="hidden lg:block">
                <div className="grid grid-cols-[18%_23%_20%_19%_20%] bg-[#e10087] text-[11px] uppercase tracking-[0.18em] text-white">
                  <div className="px-2 py-3 text-center font-black">Pedido</div>
                  <div className="px-2 py-3 text-center font-black">Producto</div>
                  <div className="px-2 py-3 text-center font-black">Entrega</div>
                  <div className="px-2 py-3 text-center font-black">Venta</div>
                  <div className="px-2 py-3 text-center font-black">Estatus</div>
                </div>
              </div>
            ) : null}
          </div>

          {trackingTab === "PEDIDOS" ? (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[980px] table-fixed border-separate border-spacing-y-2 text-left text-sm">
                  <colgroup>
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "23%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "19%" }} />
                    <col style={{ width: "20%" }} />
                  </colgroup>
                  <thead className="sr-only">
                    <tr className="text-[11px] uppercase tracking-[0.18em] text-white">
                      <th className="bg-[#e10087] px-3 py-2">Pedido</th>
                      <th className="bg-[#e10087] px-3 py-2">Producto</th>
                      <th className="bg-[#e10087] px-3 py-2">Entrega</th>
                      <th className="bg-[#e10087] px-3 py-2">Venta</th>
                      <th className="bg-[#e10087] px-3 py-2">Estatus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleOrders.length ? (
                      visibleOrders.map((order, rowIndex) => {
                        const receiver = splitReceiverText(order.datosQuienRecibe);
                        const imageUrl = getOrderImageUrl(order);
                        return (
                          <tr
                            key={order.id}
                            className={`rounded-3xl ring-1 transition duration-300 hover:bg-[linear-gradient(180deg,rgba(239,246,255,0.96)_0%,rgba(224,242,254,0.9)_100%)] hover:ring-sky-200 hover:shadow-[0_20px_42px_rgba(14,116,144,0.16)] motion-safe:animate-[orderCardIn_0.36s_ease-out] ${
                              rowIndex % 2 === 0
                                ? "bg-[linear-gradient(180deg,rgba(251,246,239,0.78)_0%,rgba(247,239,230,0.92)_100%)] ring-[#e6d8ca]"
                                : "bg-[linear-gradient(180deg,rgba(246,239,246,0.78)_0%,rgba(241,232,243,0.92)_100%)] ring-[#dfd0e0]"
                            }`}
                          >
                            <td className="px-2 py-2 align-top">
                              <OrderMetaCard order={order} receiver={receiver} onCopyWhatsapp={copyWhatsapp} />
                            </td>
                            <td className="px-2 py-2 align-top">
                              <ProductSnapshotCard
                                order={order}
                                imageUrl={imageUrl}
                                onPreview={() =>
                                  setPreviewModalImage({
                                    src: imageUrl,
                                    title: order.nombreProducto || order.codigoProducto || "Producto",
                                    numeroPedido: order.numeroPedido || "Pedido",
                                    codigoProducto: order.codigoProducto || "-",
                                  })
                                }
                              />
                            </td>
                            <td className="px-2 py-2 align-top">
                              <DeliveryCard order={order} />
                            </td>
                            <td className="px-2 py-2 align-top">
                              <SaleBreakdownCard order={order} />
                            </td>
                            <td className="px-2 py-2 align-top">
                              <StatusControlCard
                                order={order}
                                disabled={updatingStatusId === order.id}
                                selectedStatus={order.estatus}
                                deleting={deletingOrderId === order.id}
                                onChange={(status) => void updateOrderStatus(order.id, status)}
                                onApply={() => startEditingOrder(order)}
                                onDelete={() => void removeOrder(order)}
                              />
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-3 py-10 text-center text-sm font-medium text-slate-500">
                          Sin pedidos para mostrar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-2 hidden items-center justify-end gap-2 bg-[#e10087] px-4 py-1.5 text-white lg:flex">
                <span className="text-sm font-black">Mostrar</span>
                <select
                  value={String(recordsLimit)}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRecordsLimit(value === "ALL" ? "ALL" : (Number(value) as RecordsLimit));
                  }}
                  className="h-8 min-w-[102px] rounded border border-white/75 bg-white px-2 text-base font-black text-slate-800 outline-none transition focus:border-slate-100"
                >
                  {RECORDS_LIMIT_OPTIONS.map((option) => (
                    <option key={String(option)} value={String(option)}>
                      {option === "ALL" ? "Todos" : option}
                    </option>
                  ))}
                </select>
                <span className="text-sm font-black">registros</span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={!canGoPrevPage}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-800 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-55"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={!canGoNextPage}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-800 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-55"
                  aria-label="Página siguiente"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 lg:hidden">
                {visibleOrders.length ? (
                  visibleOrders.map((order) => {
                    const receiver = splitReceiverText(order.datosQuienRecibe);
                    const imageUrl = getOrderImageUrl(order);
                    return (
                      <article
                        key={order.id}
                        className="overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_54px_rgba(15,23,42,0.12)] motion-safe:animate-[orderCardIn_0.36s_ease-out]"
                      >
                        <div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">Seguimiento</p>
                            <h3 className="mt-1 text-lg font-black text-slate-900">{order.numeroPedido}</h3>
                            <p className="mt-1 text-xs font-semibold text-slate-500">{order.clienteSolicita || "Sin cliente"}</p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <OrderMetaCard order={order} receiver={receiver} onCopyWhatsapp={copyWhatsapp} />
                          <DeliveryCard order={order} />
                        </div>

                        <div className="mt-3">
                          <ProductSnapshotCard
                            order={order}
                            imageUrl={imageUrl}
                            onPreview={() =>
                              setPreviewModalImage({
                                src: imageUrl,
                                title: order.nombreProducto || order.codigoProducto || "Producto",
                                numeroPedido: order.numeroPedido || "Pedido",
                                codigoProducto: order.codigoProducto || "-",
                              })
                            }
                          />
                        </div>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <SaleBreakdownCard order={order} />
                          <StatusControlCard
                            order={order}
                            disabled={updatingStatusId === order.id}
                            selectedStatus={order.estatus}
                            deleting={deletingOrderId === order.id}
                            onChange={(status) => void updateOrderStatus(order.id, status)}
                            onApply={() => startEditingOrder(order)}
                            onDelete={() => void removeOrder(order)}
                          />
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm font-medium text-slate-500">
                    Sin pedidos para mostrar.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white p-4 md:p-6 lg:p-8">
              <p className="text-center text-xs font-bold uppercase tracking-[0.28em] text-pink-600">RESUMEN - {summaryDateLabel}</p>
              <h3 className="mt-1 text-center text-3xl font-black text-slate-900 md:text-4xl">VENTAS</h3>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/70 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md motion-safe:animate-[toastIn_0.28s_ease-out]">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Ventas totales</p>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-200 text-xs font-black text-emerald-800">V</span>
                  </div>
                  <p className="mt-1 break-words text-2xl font-black leading-none text-emerald-800 md:text-4xl">{currency.format(totals.totalVentas)}</p>
                </article>
                <article className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100/70 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md motion-safe:animate-[toastIn_0.33s_ease-out]">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-cyan-600">Anticipos</p>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-200 text-xs font-black text-cyan-800">A</span>
                  </div>
                  <p className="mt-1 break-words text-2xl font-black leading-none text-cyan-800 md:text-4xl">{currency.format(totals.totalAnticipos)}</p>
                </article>
                <article className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100/70 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md motion-safe:animate-[toastIn_0.38s_ease-out]">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-rose-600">Saldo pendiente</p>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-200 text-xs font-black text-rose-800">S</span>
                  </div>
                  <p className="mt-1 break-words text-2xl font-black leading-none text-rose-800 md:text-4xl">{currency.format(totals.totalSaldo)}</p>
                </article>
                <article className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-100/80 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md motion-safe:animate-[toastIn_0.43s_ease-out]">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Costos de envío</p>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-200 text-xs font-black text-amber-800">E</span>
                  </div>
                  <p className="mt-1 break-words text-2xl font-black leading-none text-amber-800 md:text-4xl">{currency.format(shippingCost)}</p>
                </article>
              </div>

              <h3 className="mt-8 text-center text-3xl font-black text-slate-900 md:text-4xl">ESTATUS PEDIDOS</h3>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <article className="rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md motion-safe:animate-[toastIn_0.48s_ease-out]">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Pendiente</p>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-black text-slate-700">P</span>
                  </div>
                  <p className="mt-1 text-2xl font-black leading-none text-slate-700 md:text-4xl">{statusCounts.Pendiente}</p>
                </article>
                <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md motion-safe:animate-[toastIn_0.53s_ease-out]">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-600">En elaboración</p>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-200 text-xs font-black text-amber-700">L</span>
                  </div>
                  <p className="mt-1 text-2xl font-black leading-none text-amber-700 md:text-4xl">{statusCounts["En elaboracion"]}</p>
                </article>
                <article className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md motion-safe:animate-[toastIn_0.58s_ease-out]">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-cyan-600">Listo para entregar</p>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-200 text-xs font-black text-cyan-700">R</span>
                  </div>
                  <p className="mt-1 text-2xl font-black leading-none text-cyan-700 md:text-4xl">{statusCounts["Listo para entregar"]}</p>
                </article>
                <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md motion-safe:animate-[toastIn_0.63s_ease-out]">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">Entregado</p>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-200 text-xs font-black text-emerald-700">E</span>
                  </div>
                  <p className="mt-1 text-2xl font-black leading-none text-emerald-700 md:text-4xl">{statusCounts.Entregado}</p>
                </article>
                <article className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md motion-safe:animate-[toastIn_0.68s_ease-out]">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-rose-500">Cancelado</p>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-200 text-xs font-black text-rose-700">C</span>
                  </div>
                  <p className="mt-1 text-2xl font-black leading-none text-rose-700 md:text-4xl">{statusCounts.Cancelado}</p>
                </article>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                Total de pedidos registrados: <span className="font-black text-slate-900">{orders.length}</span>
              </div>
            </div>
          )}
        </div>

        {previewModalImage ? (
          <div
            className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/70 p-4"
            onClick={() => setPreviewModalImage(null)}
          >
            <div
              className="w-full max-w-2xl rounded-3xl border border-white/20 bg-white p-4 shadow-2xl md:p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black uppercase tracking-wide text-slate-900 md:text-base">
                    {`${previewModalImage.numeroPedido} ${previewModalImage.title}`}
                  </p>
                  <p className="mt-1 truncate text-xs font-black uppercase tracking-[0.16em] text-rose-700">
                    {`Código ${previewModalImage.codigoProducto}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewModalImage(null)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-700 transition hover:scale-[1.03] hover:bg-slate-200"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>
              <div className="flex max-h-[70vh] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <img
                  src={previewModalImage.src}
                  alt={`${previewModalImage.numeroPedido} ${previewModalImage.title} ${previewModalImage.codigoProducto}`}
                  className="max-h-[64vh] w-auto rounded-2xl object-contain"
                />
              </div>
            </div>
          </div>
        ) : null}

        {toast ? (
          <div className="pointer-events-none fixed bottom-5 right-5 z-[120] w-full max-w-sm animate-[toastIn_0.28s_ease-out]">
            <div
              className={`pointer-events-auto overflow-hidden rounded-2xl border bg-white/95 shadow-[0_24px_45px_rgba(15,23,42,0.2)] backdrop-blur ${
                toast.type === "ok"
                  ? "border-emerald-200"
                  : toast.type === "error"
                    ? "border-rose-200"
                    : "border-sky-200"
              }`}
            >
              <div
                className={`h-1.5 w-full ${
                  toast.type === "ok"
                    ? "bg-emerald-500"
                    : toast.type === "error"
                      ? "bg-rose-500"
                      : "bg-sky-500"
                }`}
              />
              <div className="flex items-start gap-3 px-4 py-3">
                <div
                  className={`mt-0.5 h-2.5 w-2.5 rounded-full ${
                    toast.type === "ok"
                      ? "bg-emerald-500"
                      : toast.type === "error"
                        ? "bg-rose-500"
                        : "bg-sky-500"
                  }`}
                />
                <div>
                  <p className="text-sm font-black text-slate-900">
                    {toast.type === "ok" ? "Listo" : toast.type === "error" ? "Atención" : "Info"}
                  </p>
                  <p className="text-sm text-slate-600">{toast.text}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {loadingOrders ? (
          <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/35 px-4 backdrop-blur-[1px]">
            <div className="w-full max-w-sm rounded-2xl border border-cyan-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.28)]">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
                <div>
                  <p className="text-sm font-black text-slate-900">Sincronizando información de Google</p>
                  <p className="text-xs font-semibold text-slate-500">Espera un momento, estamos cargando los pedidos...</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

