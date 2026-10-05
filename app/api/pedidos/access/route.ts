import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  buildPedidosAccessCookieValue,
  getPedidosAccessConfigError,
  PEDIDOS_ACCESS_COOKIE,
} from "@/lib/pedidosAccess";

export async function POST(req: Request) {
  try {
    const configError = getPedidosAccessConfigError();
    if (configError) {
      return NextResponse.json({ ok: false, message: configError }, { status: 500 });
    }

    const body = (await req.json()) as { password?: string };
    const submittedPassword = body.password?.trim() || "";
    const cookieValue = buildPedidosAccessCookieValue();
    const expectedPassword = process.env.PEDIDOS_ACCESS_PASSWORD?.trim() || "";

    if (!submittedPassword || submittedPassword !== expectedPassword) {
      return NextResponse.json({ ok: false, message: "Contraseña incorrecta." }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set(PEDIDOS_ACCESS_COOKIE, cookieValue, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "No se pudo validar la contraseña." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.set(PEDIDOS_ACCESS_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "No se pudo cerrar la sesion de acceso." }, { status: 500 });
  }
}