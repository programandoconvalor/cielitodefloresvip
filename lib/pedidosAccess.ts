import { createHash, timingSafeEqual } from "node:crypto";

export const PEDIDOS_ACCESS_COOKIE = "cdf_pedidos_access";
const PEDIDOS_ACCESS_PASSWORD_ENV = "PEDIDOS_ACCESS_PASSWORD";

function createAccessToken(password: string) {
  return createHash("sha256").update(`pedidos:${password}`).digest("hex");
}

export function getPedidosAccessPassword() {
  return process.env[PEDIDOS_ACCESS_PASSWORD_ENV]?.trim() || "";
}

export function getPedidosAccessConfigError() {
  return getPedidosAccessPassword() ? null : `Falta variable de entorno: ${PEDIDOS_ACCESS_PASSWORD_ENV}`;
}

export function buildPedidosAccessCookieValue() {
  const password = getPedidosAccessPassword();
  if (!password) {
    return "";
  }

  return createAccessToken(password);
}

export function isPedidosAccessAuthorized(cookieValue?: string | null) {
  const expected = buildPedidosAccessCookieValue();
  if (!expected || !cookieValue) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(cookieValue);
  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}