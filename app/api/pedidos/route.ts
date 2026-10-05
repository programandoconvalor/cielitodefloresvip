import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { google } from "googleapis";
import type { sheets_v4 } from "googleapis";
import type { OrderRecord } from "@/interfaces/Order";
import { isPedidosAccessAuthorized, PEDIDOS_ACCESS_COOKIE } from "@/lib/pedidosAccess";
import { defaultSiteConfig } from "@/data/site/siteConfig";

const SHEET_HEADERS = [
  "# PEDIDO",
  "FECHA PEDIDO",
  "CLIENTE",
  "WHATSAPP",
  "DATOS QUIÉN RECIBE",
  "CÓDIGO DE PRODUCTO",
  "NOMBRE PRODUCTO",
  "DEDICATORIA",
  "FECHA ENTREGA",
  "HORA ENTREGA",
  "CALLE Y NÚMERO",
  "COLONIA",
  "MUNICIPIO",
  "REFERENCIA",
  "UBICACIÓN ENTREGA",
  "FORMA DE PAGO",
  "PRECIO UNITARIO $",
  "CANT",
  "SUBTOTAL $",
  "COSTO ENVÍO",
  "ANTICIPO",
  "SALDO",
  "TOTAL $",
  "ESTATUS",
  "NOTAS INTERNAS",
  "CREADO EN",
  "ID_INTERNO",
] as const;

const TOTAL_COLUMNS = SHEET_HEADERS.length;
const DATA_START_ROW = 4;
const INTERNAL_ID_COL_INDEX = TOTAL_COLUMNS - 1;
const STATUS_COL_INDEX = 23;

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta variable de entorno: ${name}`);
  }
  return value;
}

function columnToA1(index: number) {
  let dividend = index;
  let columnName = "";
  while (dividend > 0) {
    const modulo = (dividend - 1) % 26;
    columnName = String.fromCharCode(65 + modulo) + columnName;
    dividend = Math.floor((dividend - modulo) / 26);
  }
  return columnName;
}

async function getAuthorizedClient() {
  const serviceEmail = getEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = getEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");
  const sheetId = getEnv("GOOGLE_SHEET_ID");
  const sheetName = process.env.GOOGLE_SHEET_NAME || "PEDIDOS";

  const auth = new google.auth.JWT({
    email: serviceEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  return { sheets, sheetId, sheetName };
}

async function ensureSheetLayout(sheets: sheets_v4.Sheets, spreadsheetId: string, sheetName: string, catalogUrl: string) {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties,bandedRanges)",
  });

  let sheet = spreadsheet.data.sheets?.find((item) => item.properties?.title === sheetName);
  if (sheet?.properties?.sheetId == null) {
    const created = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title: sheetName },
            },
          },
        ],
      },
    });

    const createdSheetId = created.data.replies?.[0]?.addSheet?.properties?.sheetId;
    if (!createdSheetId) {
      throw new Error("No se pudo crear la hoja de pedidos.");
    }

    sheet = { properties: { sheetId: createdSheetId, title: sheetName } };
  }

  const sheetInternalId = sheet.properties?.sheetId;
  if (sheetInternalId == null) {
    throw new Error("No se pudo resolver el id interno de la hoja.");
  }

  const existingBandedRangeId = (sheet.bandedRanges || [])
    .map((band) => band.bandedRangeId)
    .find((id): id is number => id != null);

  const titleRow = new Array(TOTAL_COLUMNS).fill("");
  titleRow[0] = "CONTROL DE PEDIDOS - DIA DE LAS MADRES 10 DE MAYO";
  const subtitleRow = new Array(TOTAL_COLUMNS).fill("");
  subtitleRow[0] = `Catalogo en linea: ${catalogUrl}`;

  const lastColumn = columnToA1(TOTAL_COLUMNS);

  const existingTop = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:${lastColumn}3`,
  });
  const topRows = existingTop.data.values || [];
  const hasHeaderRow = (topRows[2]?.[0] || "").trim() === SHEET_HEADERS[0];
  const legacyHasData = topRows.some((row) => row.some((cell) => String(cell || "").trim().length > 0));

  if (!hasHeaderRow && legacyHasData) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            insertDimension: {
              range: {
                sheetId: sheetInternalId,
                dimension: "ROWS",
                startIndex: 0,
                endIndex: 3,
              },
              inheritFromBefore: false,
            },
          },
        ],
      },
    });
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1:${lastColumn}3`,
    valueInputOption: "RAW",
    requestBody: {
      values: [titleRow, subtitleRow, [...SHEET_HEADERS]],
    },
  });

  const styleRequests: sheets_v4.Schema$Request[] = [
    {
      repeatCell: {
        range: {
          sheetId: sheetInternalId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: TOTAL_COLUMNS,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.83, green: 0.18, blue: 0.54 },
            textFormat: { bold: true, fontSize: 15, foregroundColor: { red: 1, green: 1, blue: 1 } },
            horizontalAlignment: "LEFT",
            verticalAlignment: "MIDDLE",
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: sheetInternalId,
          startRowIndex: 1,
          endRowIndex: 2,
          startColumnIndex: 0,
          endColumnIndex: TOTAL_COLUMNS,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.94, green: 0.91, blue: 0.94 },
            textFormat: { italic: true, fontSize: 10, foregroundColor: { red: 0.22, green: 0.22, blue: 0.22 } },
            verticalAlignment: "MIDDLE",
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,verticalAlignment)",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: sheetInternalId,
          startRowIndex: 2,
          endRowIndex: 3,
          startColumnIndex: 0,
          endColumnIndex: TOTAL_COLUMNS,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.9, green: 0.1, blue: 0.55 },
            textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: sheetInternalId,
          startRowIndex: 3,
          startColumnIndex: 0,
          endColumnIndex: INTERNAL_ID_COL_INDEX,
        },
        cell: {
          userEnteredFormat: {
            textFormat: { fontSize: 11, foregroundColor: { red: 0.32, green: 0.2, blue: 0.1 } },
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
          },
        },
        fields: "userEnteredFormat(textFormat,verticalAlignment,wrapStrategy)",
      },
    },
    {
      ...(existingBandedRangeId != null
        ? {
            updateBanding: {
              bandedRange: {
                bandedRangeId: existingBandedRangeId,
                range: {
                  sheetId: sheetInternalId,
                  startRowIndex: 3,
                  startColumnIndex: 0,
                  endColumnIndex: INTERNAL_ID_COL_INDEX,
                },
                rowProperties: {
                  firstBandColor: { red: 0.992, green: 0.973, blue: 0.94 },
                  secondBandColor: { red: 0.956, green: 0.92, blue: 0.952 },
                },
              },
              fields: "range,rowProperties.firstBandColor,rowProperties.secondBandColor",
            },
          }
        : {
            addBanding: {
              bandedRange: {
                range: {
                  sheetId: sheetInternalId,
                  startRowIndex: 3,
                  startColumnIndex: 0,
                  endColumnIndex: INTERNAL_ID_COL_INDEX,
                },
                rowProperties: {
                  firstBandColor: { red: 0.992, green: 0.973, blue: 0.94 },
                  secondBandColor: { red: 0.956, green: 0.92, blue: 0.952 },
                },
              },
            },
          }),
    },
    {
      updateBorders: {
        range: {
          sheetId: sheetInternalId,
          startRowIndex: 2,
          startColumnIndex: 0,
          endColumnIndex: INTERNAL_ID_COL_INDEX,
        },
        top: { style: "SOLID", width: 1, color: { red: 0.76, green: 0.66, blue: 0.63 } },
        bottom: { style: "SOLID", width: 1, color: { red: 0.76, green: 0.66, blue: 0.63 } },
        left: { style: "SOLID", width: 1, color: { red: 0.76, green: 0.66, blue: 0.63 } },
        right: { style: "SOLID", width: 1, color: { red: 0.76, green: 0.66, blue: 0.63 } },
        innerHorizontal: { style: "DOTTED", width: 1, color: { red: 0.73, green: 0.65, blue: 0.62 } },
        innerVertical: { style: "DOTTED", width: 1, color: { red: 0.73, green: 0.65, blue: 0.62 } },
      },
    },
    {
      updateDimensionProperties: {
        range: {
          sheetId: sheetInternalId,
          dimension: "ROWS",
          startIndex: 2,
          endIndex: 3,
        },
        properties: { pixelSize: 34 },
        fields: "pixelSize",
      },
    },
    {
      updateDimensionProperties: {
        range: {
          sheetId: sheetInternalId,
          dimension: "ROWS",
          startIndex: 3,
          endIndex: 1000,
        },
        properties: { pixelSize: 30 },
        fields: "pixelSize",
      },
    },
    {
      updateSheetProperties: {
        properties: {
          sheetId: sheetInternalId,
          gridProperties: {
            frozenRowCount: 3,
          },
        },
        fields: "gridProperties.frozenRowCount",
      },
    },
    {
      updateDimensionProperties: {
        range: {
          sheetId: sheetInternalId,
          dimension: "COLUMNS",
          startIndex: INTERNAL_ID_COL_INDEX,
          endIndex: INTERNAL_ID_COL_INDEX + 1,
        },
        properties: {
          hiddenByUser: true,
        },
        fields: "hiddenByUser",
      },
    },
    {
      setBasicFilter: {
        filter: {
          range: {
            sheetId: sheetInternalId,
            startRowIndex: 2,
            endRowIndex: 3,
            startColumnIndex: 0,
            endColumnIndex: INTERNAL_ID_COL_INDEX,
          },
        },
      },
    },
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: styleRequests,
    },
  });

  return { sheetInternalId, lastColumn };
}

// Explicit pixel widths per column index (matches SHEET_HEADERS order)
const COLUMN_WIDTHS_PX = [
  100, // 0  # PEDIDO
  110, // 1  FECHA PEDIDO
  160, // 2  CLIENTE
  125, // 3  WHATSAPP
  185, // 4  DATOS QUIÉN RECIBE
  130, // 5  CÓDIGO DE PRODUCTO
  220, // 6  NOMBRE PRODUCTO
  220, // 7  DEDICATORIA
  110, // 8  FECHA ENTREGA
  90,  // 9  HORA ENTREGA
  200, // 10 CALLE Y NÚMERO
  140, // 11 COLONIA
  140, // 12 MUNICIPIO
  170, // 13 REFERENCIA
  150, // 14 UBICACIÓN ENTREGA
  120, // 15 FORMA DE PAGO
  110, // 16 PRECIO UNITARIO $
  65,  // 17 CANT
  95,  // 18 SUBTOTAL $
  120, // 19 COSTO ENVÍO
  100, // 20 ANTICIPO
  100, // 21 SALDO
  100, // 22 TOTAL $
  145, // 23 ESTATUS
  200, // 24 NOTAS INTERNAS
  160, // 25 CREADO EN
  80,  // 26 ID_INTERNO (hidden)
];

async function setSheetColumnWidths(sheets: sheets_v4.Sheets, spreadsheetId: string, sheetId: number) {
  const requests: sheets_v4.Schema$Request[] = COLUMN_WIDTHS_PX.map((pixelSize, colIndex) => ({
    updateDimensionProperties: {
      range: {
        sheetId,
        dimension: "COLUMNS",
        startIndex: colIndex,
        endIndex: colIndex + 1,
      },
      properties: { pixelSize },
      fields: "pixelSize",
    },
  }));

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  });
}

async function assertAuthorizedRequest() {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(PEDIDOS_ACCESS_COOKIE)?.value;
  if (!isPedidosAccessAuthorized(accessCookie)) {
    throw new Error("UNAUTHORIZED");
  }
}

function formatDateDDMMYYYY(isoDate: string) {
  if (!isoDate || isoDate.length < 10) return isoDate;
  const [year, month, day] = isoDate.split("-");
  return `${day}-${month}-${year}`;
}

function parseIsoDate(ddmmyyyyDate: string) {
  if (!ddmmyyyyDate || !ddmmyyyyDate.includes("-")) return ddmmyyyyDate;
  const parts = ddmmyyyyDate.split("-");
  if (parts.length === 3 && parts[0].length === 2) {
    // dd-mm-yyyy format
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }
  return ddmmyyyyDate;
}

function toSheetRow(order: OrderRecord) {
  return [
    order.numeroPedido,
    formatDateDDMMYYYY(order.fechaPedido),
    order.clienteSolicita,
    order.whatsappCliente,
    order.datosQuienRecibe,
    order.codigoProducto,
    order.nombreProducto,
    order.dedicatoriaFrase,
    formatDateDDMMYYYY(order.fechaEntrega),
    order.horaEntrega,
    order.direccionEntrega,
    order.coloniaEntrega,
    order.municipioEntrega,
    order.referenciaEntrega,
    order.ubicacionEntrega,
    order.formaPago,
    order.precioUnitario,
    order.cantidad,
    order.subtotal,
    order.costoEnvio,
    order.anticipoPagado,
    order.saldoPendiente,
    order.total,
    order.estatus,
    order.notasInternas,
    order.creadoEn,
    order.id,
  ];
}

function parseNumber(value: string | undefined) {
  if (!value) return 0;
  const normalized = String(value).replace(/,/g, ".").replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isStatus(value: string): value is OrderRecord["estatus"] {
  return ["Pendiente", "En elaboracion", "Listo para entregar", "Entregado", "Cancelado"].includes(value);
}

function isPayment(value: string): value is OrderRecord["formaPago"] {
  return ["Efectivo", "Transferencia", "Tarjeta", "Deposito"].includes(value);
}
function looksLikeProductCode(value: string) {
  return /^[A-Z]{1,5}-?\d{2,}$/i.test((value || "").trim());
}

function isReorderedSheetLayout(row: string[]) {
  return row.length >= TOTAL_COLUMNS && !looksLikeProductCode(row[2] || "") && looksLikeProductCode(row[5] || "");
}

function fromSheetRow(row: string[], rowIndex: number): OrderRecord | null {
  const looksLikeDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
  const isLegacy = !looksLikeDate(row[9] || "") && looksLikeDate(row[11] || "");
  const isReordered = isReorderedSheetLayout(row);

  // Detect layout: 
  // - Legacy: pre-25-column format
  // - Old (25 cols): before SUBTOTAL added, COSTO ENVÍO not present
  // - Medium (26 cols): with COSTO ENVÍO but before SUBTOTAL
  // - Current (27 cols): previous front order
  // - Reordered (27 cols): grouped by Pedido > Cliente > Producto > Entrega > Venta > Estatus
  const hasSubtotal = row.length > 26 && /^\d+$|^\d+\.\d+$/.test((row[6] || "").trim());

  const idx = isLegacy
    ? {
      codigoProducto: 2,
      nombreProducto: 3,
        precioUnitario: 4,
        cantidad: 5,
        subtotal: -1,
        costoEnvio: -1,
        total: 6,
        cliente: 9,
        whatsapp: 10,
        fechaEntrega: 11,
        horaEntrega: 12,
        direccion: 13,
        ubicacion: 14,
        colonia: 15,
        municipio: 16,
        referencia: 17,
        formaPago: 18,
        anticipo: 19,
        saldo: 20,
        estatus: 21,
        notas: 22,
        creadoEn: 23,
        idInterno: 24,
        datosRecibe: 8,
        dedicatoria: 7,
      }
    : !hasSubtotal && row.length <= 25
    ? {
        // Old 25-column layout (before SUBTOTAL and COSTO ENVÍO)
      codigoProducto: 2,
      nombreProducto: 3,
        precioUnitario: 4,
        cantidad: 5,
        subtotal: -1,
        costoEnvio: -1,
        total: 6,
        cliente: 7,
        whatsapp: 8,
        fechaEntrega: 9,
        horaEntrega: 10,
        direccion: 11,
        colonia: 12,
        municipio: 13,
        referencia: 14,
        ubicacion: 15,
        datosRecibe: 16,
        dedicatoria: 17,
        formaPago: 18,
        anticipo: 19,
        saldo: 20,
        estatus: 21,
        notas: 22,
        creadoEn: 23,
        idInterno: 24,
      }
    : !hasSubtotal && row.length === 26
    ? {
        // Medium 26-column layout (COSTO ENVÍO added but before SUBTOTAL)
      codigoProducto: 2,
      nombreProducto: 3,
        precioUnitario: 4,
        cantidad: 5,
        subtotal: -1,
        total: 6,
        cliente: 7,
        whatsapp: 8,
        fechaEntrega: 9,
        horaEntrega: 10,
        direccion: 11,
        colonia: 12,
        municipio: 13,
        referencia: 14,
        ubicacion: 15,
        datosRecibe: 16,
        dedicatoria: 17,
        formaPago: 18,
        anticipo: 19,
        costoEnvio: 20,
        saldo: 21,
        estatus: 22,
        notas: 23,
        creadoEn: 24,
        idInterno: 25,
      }
    : isReordered
    ? {
        cliente: 2,
        whatsapp: 3,
        datosRecibe: 4,
        precioUnitario: 16,
        cantidad: 17,
        subtotal: 18,
        costoEnvio: 19,
        anticipo: 20,
        saldo: 21,
        total: 22,
        estatus: 23,
        notas: 24,
        creadoEn: 25,
        idInterno: 26,
        codigoProducto: 5,
        nombreProducto: 6,
        dedicatoria: 7,
        fechaEntrega: 8,
        horaEntrega: 9,
        direccion: 10,
        colonia: 11,
        municipio: 12,
        referencia: 13,
        ubicacion: 14,
        formaPago: 15,
      }
    : {
        // Previous 27-column layout (before reordering headers)
      codigoProducto: 2,
      nombreProducto: 3,
        precioUnitario: 4,
        cantidad: 5,
        subtotal: 6,
        costoEnvio: 7,
        total: 8,
        cliente: 9,
        whatsapp: 10,
        fechaEntrega: 11,
        horaEntrega: 12,
        direccion: 13,
        colonia: 14,
        municipio: 15,
        referencia: 16,
        ubicacion: 17,
        datosRecibe: 18,
        dedicatoria: 19,
        formaPago: 20,
        anticipo: 21,
        saldo: 22,
        estatus: 23,
        notas: 24,
        creadoEn: 25,
        idInterno: 26,
      };
  const numeroPedido = (row[0] || "").trim();
  const codigoProducto = (row[idx.codigoProducto] || "").trim();
  const nombreProducto = (row[idx.nombreProducto] || "").trim();

  const clienteSolicita = (row[idx.cliente] || "").trim();

  if (!numeroPedido && !codigoProducto && !nombreProducto && !clienteSolicita) {
    return null;
  }

  const fechaPedido = parseIsoDate((row[1] || "").trim()) || new Date().toISOString().slice(0, 10);
  const fechaEntrega = parseIsoDate((row[idx.fechaEntrega] || "").trim()) || "";
  const formaPago = (row[idx.formaPago] || "").trim();
  const estatus = (row[idx.estatus] || "").trim();
  const createdAt = (row[idx.creadoEn] || "").trim() || new Date().toISOString();
  const internalId = (row[idx.idInterno] || "").trim() || `legacy-${numeroPedido || rowIndex}-${rowIndex}`;

  const precioUnitario = parseNumber(row[idx.precioUnitario]);
  const cantidad = Math.max(1, Math.trunc(parseNumber(row[idx.cantidad])) || 1);
  const subtotal = idx.subtotal >= 0 ? parseNumber(row[idx.subtotal]) : precioUnitario * cantidad;
  const costoEnvio = idx.costoEnvio >= 0 ? parseNumber(row[idx.costoEnvio]) : 0;
  const total = parseNumber(row[idx.total]) || subtotal + costoEnvio;
  const anticipo = parseNumber(row[idx.anticipo]);
  const saldo = parseNumber(row[idx.saldo]) || Math.max(0, total - anticipo);

  return {
    id: internalId,
    numeroPedido,
    fechaPedido,
    codigoProducto,
    nombreProducto,
    precioUnitario,
    cantidad,
    subtotal,
    dedicatoriaFrase: (row[idx.dedicatoria] || "").trim(),
    datosQuienRecibe: (row[idx.datosRecibe] || "").trim(),
    clienteSolicita,
    whatsappCliente: (row[idx.whatsapp] || "").trim(),
    fechaEntrega: fechaEntrega,
    horaEntrega: (row[idx.horaEntrega] || "").trim(),
    direccionEntrega: (row[idx.direccion] || "").trim(),
    ubicacionEntrega: (row[idx.ubicacion] || "").trim(),
    coloniaEntrega: (row[idx.colonia] || "").trim(),
    municipioEntrega: (row[idx.municipio] || "").trim(),
    referenciaEntrega: (row[idx.referencia] || "").trim(),
    formaPago: isPayment(formaPago) ? formaPago : "Efectivo",
    anticipoPagado: anticipo,
    costoEnvio,
    total,
    saldoPendiente: saldo,
    estatus: isStatus(estatus) ? estatus : "Pendiente",
    notasInternas: (row[idx.notas] || "").trim(),
    imagenProducto: "",
    creadoEn: createdAt,
    syncedAt: createdAt,
  };
}

async function getSheetRows(sheets: sheets_v4.Sheets, spreadsheetId: string, sheetName: string, lastColumn: string) {
  const valuesResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A${DATA_START_ROW}:${lastColumn}`,
  });

  const rows = valuesResponse.data.values || [];
  return rows.map((row) => row.map((cell) => String(cell || "")));
}

function isLegacyRowLayout(row: string[]) {
  const looksLikeDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
  return !looksLikeDate(row[9] || "") && looksLikeDate(row[11] || "");
}

function isCorruptedRow(row: string[]) {
  if (row.length !== TOTAL_COLUMNS) return false;
  // Detect rows corrupted by the pre-fix normalization:
  // notas (index 23) contains an ISO datetime string (should be text notes or empty)
  // and creadoEn (index 24) contains a non-date string (ID hash)
  const notasCell = (row[23] || "").trim();
  const creadoEnCell = (row[24] || "").trim();
  const looksLikeIso = (v: string) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v);
  const looksLikeId = (v: string) => /^\d{13}-[a-z0-9]{6}$/.test(v) || v.startsWith("legacy-");
  // If notas has an ISO timestamp AND creadoEn has an ID-like value, it's corrupted
  return looksLikeIso(notasCell) && (looksLikeId(creadoEnCell) || !looksLikeIso(creadoEnCell));
}

function repairCorruptedRow(row: string[]): string[] {
  // The corruption pattern (26-col row written with wrong indices):
  // col 20 = old SALDO (should be costoEnvio → reset to 0)
  // col 21 = old ESTATUS text parsed as number → was 0, but let's recalculate
  // col 22 = old NOTAS parsed as estatus → defaulted to "Pendiente" (already OK)
  // col 23 = old CREADO EN timestamp (should be notasInternas → clear it)
  // col 24 = old ID string (should be creadoEn → move it to creadoEn if looks like date, else use now)
  // col 25 = generated legacy id (unreliable)
  const fixed = [...row];
  const precioUnitario = parseNumber(fixed[4]);
  const cantidad = Math.max(1, Math.trunc(parseNumber(fixed[5])) || 1);
  const total = parseNumber(fixed[6]) || precioUnitario * cantidad;
  const anticipo = parseNumber(fixed[19]);
  // col 20 was old SALDO → reset costoEnvio to 0
  fixed[20] = "0";
  // col 21: recalculate saldo
  fixed[21] = String(Math.max(0, total - anticipo));
  // col 22: estatus is already "Pendiente" (default), keep as-is
  // col 23: was creadoEn ISO string → move to actual notes (clear it — real notes were never stored)
  const oldCreadoEn = fixed[23]; // ISO timestamp that ended up in notas
  fixed[23] = "";  // clear notas
  // col 24: was old ID → replace with the ISO date we rescued from col 23
  const looksLikeIso = (v: string) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v);
  fixed[24] = looksLikeIso(oldCreadoEn) ? oldCreadoEn : new Date().toISOString();
  return fixed;
}

async function normalizeSheetData(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  sheetName: string,
  lastColumn: string,
) {
  const rawRows = await getSheetRows(sheets, spreadsheetId, sheetName, lastColumn);
  if (!rawRows.length) {
    return { normalized: false, totalRows: 0 };
  }

  const parsedRows = rawRows
    .map((row, index) => fromSheetRow(row, index + DATA_START_ROW))
    .filter((item): item is OrderRecord => item != null);

  const requiresNormalization =
    rawRows.some((row) => isLegacyRowLayout(row)) ||
    rawRows.some((row) => row.some((cell) => String(cell || "").trim().length > 0) && !isReorderedSheetLayout(row)) ||
    rawRows.some((row) => !(row[INTERNAL_ID_COL_INDEX] || "").trim()) ||
    rawRows.some((row) => row.length !== TOTAL_COLUMNS) ||
    rawRows.some((row) => isCorruptedRow(row)) ||
    parsedRows.length !== rawRows.filter((row) => row.some((cell) => String(cell || "").trim().length > 0)).length;

  if (!requiresNormalization) {
    return { normalized: false, totalRows: parsedRows.length };
  }

  // Repair corrupted rows before re-parsing
  const repairedRaws = rawRows.map((row) => isCorruptedRow(row) ? repairCorruptedRow(row) : row);
  const repairedParsed = repairedRaws
    .map((row, index) => fromSheetRow(row, index + DATA_START_ROW))
    .filter((item): item is OrderRecord => item != null);

  const normalizedValues = repairedParsed.map(toSheetRow);

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${sheetName}!A${DATA_START_ROW}:${lastColumn}`,
  });

  if (normalizedValues.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${DATA_START_ROW}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: normalizedValues,
      },
    });
  }

  return { normalized: true, totalRows: normalizedValues.length };
}

async function findSheetRowIndex(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  sheetName: string,
  lastColumn: string,
  orderId: string,
  numeroPedido: string,
) {
  const rows = await getSheetRows(sheets, spreadsheetId, sheetName, lastColumn);

  for (let offset = 0; offset < rows.length; offset += 1) {
    const row = rows[offset] || [];
    const rowInternalId = (row[INTERNAL_ID_COL_INDEX] || "").trim();
    const rowNumeroPedido = (row[0] || "").trim();

    if ((orderId && rowInternalId === orderId) || (!orderId && numeroPedido && rowNumeroPedido === numeroPedido)) {
      return DATA_START_ROW - 1 + offset;
    }
  }

  return -1;
}

export async function GET() {
  try {
    await assertAuthorizedRequest();

    const { sheets, sheetId, sheetName } = await getAuthorizedClient();
    const { sheetInternalId, lastColumn } = await ensureSheetLayout(sheets, sheetId, sheetName, defaultSiteConfig.publicSiteUrl);
    await normalizeSheetData(sheets, sheetId, sheetName, lastColumn);
    await setSheetColumnWidths(sheets, sheetId, sheetInternalId);
    const rows = await getSheetRows(sheets, sheetId, sheetName, lastColumn);

    const orders = rows
      .map((row, index) => fromSheetRow(row, index + DATA_START_ROW))
      .filter((item): item is OrderRecord => item != null)
      .sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime());

    return NextResponse.json({ ok: true, orders });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, message: "No autorizado." }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await assertAuthorizedRequest();

    const body = (await req.json()) as { orders?: OrderRecord[] };
    const orders = Array.isArray(body.orders) ? body.orders : [];

    if (!orders.length) {
      return NextResponse.json({ ok: false, message: "No se recibieron pedidos." }, { status: 400 });
    }

    const { sheets, sheetId, sheetName } = await getAuthorizedClient();
    const { sheetInternalId, lastColumn } = await ensureSheetLayout(sheets, sheetId, sheetName, defaultSiteConfig.publicSiteUrl);
    await normalizeSheetData(sheets, sheetId, sheetName, lastColumn);

    const values = orders.map(toSheetRow);
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${sheetName}!A${DATA_START_ROW}:${lastColumn}`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values },
    });
    await setSheetColumnWidths(sheets, sheetId, sheetInternalId);

    return NextResponse.json({ ok: true, appended: orders.length });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, message: "No autorizado." }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await assertAuthorizedRequest();

    const body = (await req.json()) as { order?: OrderRecord };
    const order = body.order;

    if (!order) {
      return NextResponse.json({ ok: false, message: "No se recibio el pedido para actualizar." }, { status: 400 });
    }

    const orderId = order.id?.trim() || "";
    const numeroPedido = order.numeroPedido?.trim() || "";
    if (!orderId && !numeroPedido) {
      return NextResponse.json({ ok: false, message: "Faltan identificadores del pedido." }, { status: 400 });
    }

    const { sheets, sheetId, sheetName } = await getAuthorizedClient();
    const { sheetInternalId, lastColumn } = await ensureSheetLayout(sheets, sheetId, sheetName, defaultSiteConfig.publicSiteUrl);
    await normalizeSheetData(sheets, sheetId, sheetName, lastColumn);

    const targetRowIndex = await findSheetRowIndex(sheets, sheetId, sheetName, lastColumn, orderId, numeroPedido);
    if (targetRowIndex < 0) {
      return NextResponse.json({ ok: false, message: "No se encontro el pedido en Google Sheets." }, { status: 404 });
    }

    const rowNumber = targetRowIndex + 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${sheetName}!A${rowNumber}:${lastColumn}${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [toSheetRow(order)],
      },
    });

    await setSheetColumnWidths(sheets, sheetId, sheetInternalId);
    return NextResponse.json({ ok: true, updatedRow: rowNumber });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, message: "No autorizado." }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await assertAuthorizedRequest();

    const body = (await req.json()) as { orderId?: string; numeroPedido?: string };
    const orderId = body.orderId?.trim() || "";
    const numeroPedido = body.numeroPedido?.trim() || "";

    if (!orderId && !numeroPedido) {
      return NextResponse.json({ ok: false, message: "Faltan datos para eliminar el pedido." }, { status: 400 });
    }

    const { sheets, sheetId, sheetName } = await getAuthorizedClient();
    const { sheetInternalId, lastColumn } = await ensureSheetLayout(sheets, sheetId, sheetName, defaultSiteConfig.publicSiteUrl);
    await normalizeSheetData(sheets, sheetId, sheetName, lastColumn);

    const targetRowIndex = await findSheetRowIndex(sheets, sheetId, sheetName, lastColumn, orderId, numeroPedido);

    if (targetRowIndex < 0) {
      return NextResponse.json({ ok: false, message: "No se encontro el pedido en Google Sheets." }, { status: 404 });
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetInternalId,
                dimension: "ROWS",
                startIndex: targetRowIndex,
                endIndex: targetRowIndex + 1,
              },
            },
          },
        ],
      },
    });
    await setSheetColumnWidths(sheets, sheetId, sheetInternalId);

    return NextResponse.json({ ok: true, deletedRow: targetRowIndex + 1 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, message: "No autorizado." }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await assertAuthorizedRequest();

    const body = (await req.json()) as { orderId?: string; numeroPedido?: string; estatus?: string };
    const orderId = body.orderId?.trim() || "";
    const numeroPedido = body.numeroPedido?.trim() || "";
    const estatus = body.estatus?.trim() || "";

    if ((!orderId && !numeroPedido) || !estatus) {
      return NextResponse.json({ ok: false, message: "Faltan datos para actualizar el pedido." }, { status: 400 });
    }

    if (!isStatus(estatus)) {
      return NextResponse.json({ ok: false, message: "Estatus no valido." }, { status: 400 });
    }

    const { sheets, sheetId, sheetName } = await getAuthorizedClient();
    const { sheetInternalId, lastColumn } = await ensureSheetLayout(sheets, sheetId, sheetName, defaultSiteConfig.publicSiteUrl);
    await normalizeSheetData(sheets, sheetId, sheetName, lastColumn);
    const targetRowIndex = await findSheetRowIndex(sheets, sheetId, sheetName, lastColumn, orderId, numeroPedido);

    if (targetRowIndex < 0) {
      return NextResponse.json({ ok: false, message: "No se encontro el pedido en Google Sheets." }, { status: 404 });
    }

    const statusColumn = columnToA1(STATUS_COL_INDEX + 1);
    const rowNumber = targetRowIndex + 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${sheetName}!${statusColumn}${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[estatus]],
      },
    });
    await setSheetColumnWidths(sheets, sheetId, sheetInternalId);

    return NextResponse.json({ ok: true, updatedRow: rowNumber, estatus });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, message: "No autorizado." }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}


