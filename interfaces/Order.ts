export type OrderStatus =
  | "Pendiente"
  | "En elaboracion"
  | "Listo para entregar"
  | "Entregado"
  | "Cancelado";

export type PaymentMethod =
  | "Efectivo"
  | "Transferencia"
  | "Tarjeta"
  | "Deposito";

export type OrderRecord = {
  id: string;
  numeroPedido: string;
  fechaPedido: string;
  codigoProducto: string;
  nombreProducto: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  costoEnvio: number;
  total: number;
  dedicatoriaFrase: string;
  datosQuienRecibe: string;
  clienteSolicita: string;
  whatsappCliente: string;
  fechaEntrega: string;
  horaEntrega: string;
  direccionEntrega: string;
  ubicacionEntrega: string;
  coloniaEntrega: string;
  municipioEntrega: string;
  referenciaEntrega: string;
  formaPago: PaymentMethod;
  anticipoPagado: number;
  saldoPendiente: number;
  estatus: OrderStatus;
  notasInternas: string;
  imagenProducto: string;
  creadoEn: string;
  syncedAt?: string;
};

export type OrderDraft = Omit<OrderRecord, "id" | "creadoEn" | "subtotal" | "total" | "saldoPendiente">;
