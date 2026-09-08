import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CustomerMapView from "@/components/CustomerMapView";

export default async function CustomerMapPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const customer = await prisma.customer.findUnique({
    where: { linkCode: code },
    include: {
      staff: { select: { name: true, phone: true } },
      properties: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!customer) notFound();

  return (
    <CustomerMapView
      customerName={customer.name}
      staffName={customer.staff.name}
      staffPhone={customer.staff.phone}
      properties={customer.properties.map((p) => ({
        id: p.id,
        dealType: p.dealType,
        address: p.address,
        lat: p.lat,
        lng: p.lng,
        deposit: p.deposit,
        rent: p.rent,
        price: p.price,
        floor: p.floor,
        area: p.area,
        roomCount: p.roomCount,
        grade1: p.grade1,
        grade2: p.grade2,
        memo: p.memo,
        photoUrl: p.photoUrl,
        naverLink: p.naverLink,
        createdAt: p.createdAt.toISOString(),
      }))}
    />
  );
}
