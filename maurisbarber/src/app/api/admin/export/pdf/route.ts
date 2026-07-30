import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import PDFDocument from "pdfkit";
import { authOptions } from "@/lib/auth";
import { getDashboardStats } from "@/lib/stats";
import { parsePeriodFromRequest } from "@/lib/export-period";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { period, range } = parsePeriodFromRequest(request);
  const stats = await getDashboardStats(range);

  const buffer = await renderPdf(period, stats);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="maurisbarber-estadisticas.pdf"`,
    },
  });
}

async function renderPdf(
  period: string,
  stats: Awaited<ReturnType<typeof getDashboardStats>>,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text("MaurisBarber — Reporte de estadísticas", { align: "left" });
    doc
      .fontSize(10)
      .fillColor("#666")
      .text(
        `Período: ${period} · ${stats.range.start.toLocaleDateString("es-UY")} – ${new Date(
          stats.range.end.getTime() - 86_400_000,
        ).toLocaleDateString("es-UY")}`,
      );
    doc.moveDown(1.5);

    const rows: [string, string][] = [
      ["Ingresos reales", `$${stats.realRevenue.toFixed(0)}`],
      ["Ingresos esperados", `$${stats.expectedRevenue.toFixed(0)}`],
      ["Egresos", `$${stats.expenses.toFixed(0)}`],
      ["Ganancia", `$${stats.profit.toFixed(0)}`],
      ["Turnos completados", `${stats.completedCount}`],
      ["Cancelaciones", `${stats.cancelledCount}`],
      ["Ausencias", `${stats.noShowCount}`],
      ["Ticket promedio", `$${stats.averageTicket.toFixed(0)}`],
      ["Clientes nuevos", `${stats.newCustomers}`],
      ["Clientes recurrentes", `${stats.returningCustomers}`],
      ["Ocupación", `${Math.round(stats.occupancyPercent)}%`],
    ];

    doc.fontSize(12).fillColor("#000");
    for (const [label, value] of rows) {
      doc.text(`${label}: `, { continued: true }).fillColor("#16a34a").text(value).fillColor("#000");
    }

    doc.moveDown(1.5).fontSize(14).text("Ingresos por servicio");
    doc.moveDown(0.5).fontSize(11);
    for (const s of stats.revenueByService) {
      doc.text(`${s.serviceName}: ${s.count} turnos · $${s.revenue.toFixed(0)}`);
    }

    doc.moveDown(1.5).fontSize(14).text("Ranking de clientes");
    doc.moveDown(0.5).fontSize(11);
    for (const c of stats.topCustomers) {
      doc.text(`${c.name}: $${c.totalSpent.toFixed(0)}`);
    }

    doc.end();
  });
}
