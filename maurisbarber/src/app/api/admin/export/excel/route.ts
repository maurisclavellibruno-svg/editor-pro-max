import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import ExcelJS from "exceljs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardStats } from "@/lib/stats";
import { parsePeriodFromRequest } from "@/lib/export-period";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { range } = parsePeriodFromRequest(request);
  const [stats, bookings, productSales] = await Promise.all([
    getDashboardStats(range),
    prisma.booking.findMany({
      where: { startAt: { gte: range.start, lt: range.end } },
      include: { customer: true, service: true },
      orderBy: { startAt: "asc" },
    }),
    prisma.productSale.findMany({
      where: { date: { gte: range.start, lt: range.end } },
      include: { product: true, customer: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const workbook = new ExcelJS.Workbook();

  const summarySheet = workbook.addWorksheet("Resumen");
  summarySheet.columns = [
    { header: "Indicador", key: "label", width: 32 },
    { header: "Valor", key: "value", width: 20 },
  ];
  summarySheet.addRows([
    { label: "Ingresos reales", value: stats.realRevenue },
    { label: "Ingresos esperados", value: stats.expectedRevenue },
    { label: "Ingresos por productos", value: stats.productRevenue },
    { label: "Egresos", value: stats.expenses },
    { label: "Ganancia", value: stats.profit },
    { label: "Turnos totales", value: stats.bookingCount },
    { label: "Turnos completados", value: stats.completedCount },
    { label: "Cancelaciones", value: stats.cancelledCount },
    { label: "Ausencias", value: stats.noShowCount },
    { label: "Ticket promedio", value: stats.averageTicket },
    { label: "Clientes nuevos", value: stats.newCustomers },
    { label: "Clientes recurrentes", value: stats.returningCustomers },
    { label: "Ocupación (%)", value: Math.round(stats.occupancyPercent) },
    { label: "Horas trabajadas", value: Math.round(stats.hoursWorked) },
    { label: "Horas disponibles", value: Math.round(stats.hoursAvailable) },
  ]);
  summarySheet.getRow(1).font = { bold: true };

  const bookingsSheet = workbook.addWorksheet("Turnos");
  bookingsSheet.columns = [
    { header: "Fecha", key: "date", width: 20 },
    { header: "Cliente", key: "customer", width: 24 },
    { header: "Servicio", key: "service", width: 20 },
    { header: "Precio", key: "price", width: 12 },
    { header: "Estado", key: "status", width: 14 },
    { header: "Pago", key: "paymentStatus", width: 12 },
    { header: "Método", key: "method", width: 14 },
  ];
  for (const b of bookings) {
    bookingsSheet.addRow({
      date: b.startAt.toLocaleString("es-UY", { dateStyle: "short", timeStyle: "short" }),
      customer: `${b.customer.firstName} ${b.customer.lastName}`,
      service: b.service.name,
      price: Number(b.price),
      status: b.status,
      paymentStatus: b.paymentStatus,
      method: b.paymentMethod ?? "",
    });
  }
  bookingsSheet.getRow(1).font = { bold: true };

  const productsSheet = workbook.addWorksheet("Ventas de productos");
  productsSheet.columns = [
    { header: "Fecha", key: "date", width: 20 },
    { header: "Producto", key: "product", width: 24 },
    { header: "Cantidad", key: "quantity", width: 12 },
    { header: "Precio unitario", key: "unitPrice", width: 16 },
    { header: "Total", key: "total", width: 12 },
    { header: "Cliente", key: "customer", width: 24 },
    { header: "Método", key: "method", width: 14 },
  ];
  for (const s of productSales) {
    productsSheet.addRow({
      date: s.date.toLocaleString("es-UY", { dateStyle: "short", timeStyle: "short" }),
      product: s.product.name,
      quantity: s.quantity,
      unitPrice: Number(s.unitPrice),
      total: Number(s.unitPrice) * s.quantity,
      customer: s.customer ? `${s.customer.firstName} ${s.customer.lastName}` : "",
      method: s.paymentMethod ?? "",
    });
  }
  productsSheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="maurisbarber-estadisticas.xlsx"`,
    },
  });
}
