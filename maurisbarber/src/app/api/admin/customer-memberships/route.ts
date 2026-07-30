import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");
  if (!phone) return NextResponse.json({ memberships: [] });

  const customer = await prisma.customer.findUnique({ where: { phone } });
  if (!customer) return NextResponse.json({ memberships: [] });

  const memberships = await prisma.customerMembership.findMany({
    where: { customerId: customer.id, remainingCredits: { gt: 0 }, expiresAt: { gt: new Date() } },
    include: { plan: true },
  });

  return NextResponse.json({
    memberships: memberships.map((m) => ({
      id: m.id,
      planName: m.plan.name,
      remainingCredits: m.remainingCredits,
    })),
  });
}
