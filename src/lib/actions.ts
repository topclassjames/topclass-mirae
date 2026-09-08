"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

const genCode = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyz",
  8
);

async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") {
    throw new Error("관리자만 사용할 수 있습니다.");
  }
  return session;
}

// ---------- Auth ----------

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/");

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: callbackUrl,
    });
  } catch (err) {
    if (err && typeof err === "object" && "type" in err) {
      redirect(
        `/login?error=1&callbackUrl=${encodeURIComponent(callbackUrl)}`
      );
    }
    throw err;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

// ---------- Staff (직원관리) ----------

export async function createStaff(formData: FormData) {
  await requireAdmin();

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const role = formData.get("role") === "ADMIN" ? "ADMIN" : "STAFF";

  if (!username || !password || !name) {
    throw new Error("아이디, 비밀번호, 이름은 필수입니다.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.staff.create({
    data: { username, passwordHash, name, phone, role },
  });

  revalidatePath("/staff");
}

export async function updateStaff(id: string, formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const role = formData.get("role") === "ADMIN" ? "ADMIN" : "STAFF";
  const password = String(formData.get("password") ?? "");

  await prisma.staff.update({
    where: { id },
    data: {
      name,
      phone,
      role,
      ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
    },
  });

  revalidatePath("/staff");
}

export async function deleteStaff(id: string) {
  const session = await requireAdmin();
  if (session.user.id === id) {
    throw new Error("본인 계정은 삭제할 수 없습니다.");
  }
  await prisma.staff.delete({ where: { id } });
  revalidatePath("/staff");
}

// ---------- Customers (내 고객) ----------

export async function createCustomer(formData: FormData) {
  const session = await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const memo = String(formData.get("memo") ?? "").trim() || null;

  if (!name) throw new Error("고객 이름은 필수입니다.");

  let linkCode = genCode();
  // extremely unlikely collision, but guard anyway
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.customer.findUnique({ where: { linkCode } });
    if (!exists) break;
    linkCode = genCode();
  }

  await prisma.customer.create({
    data: {
      name,
      phone,
      memo,
      linkCode,
      staffId: session.user.id,
    },
  });

  revalidatePath("/customers");
}

export async function deleteCustomer(id: string) {
  const session = await requireSession();
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) return;
  if (customer.staffId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("권한이 없습니다.");
  }
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
}

async function assertCustomerAccess(customerId: string) {
  const session = await requireSession();
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  if (!customer) throw new Error("고객을 찾을 수 없습니다.");
  if (customer.staffId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("권한이 없습니다.");
  }
  return customer;
}

// ---------- Properties (매물) ----------

export async function createProperty(customerId: string, formData: FormData) {
  await assertCustomerAccess(customerId);

  const dealType = String(formData.get("dealType") ?? "MONTHLY") as
    | "SALE"
    | "JEONSE"
    | "MONTHLY";
  const address = String(formData.get("address") ?? "").trim();
  if (!address) throw new Error("주소는 필수입니다.");

  await prisma.property.create({
    data: {
      customerId,
      dealType,
      address,
      deposit: String(formData.get("deposit") ?? "").trim() || null,
      rent: String(formData.get("rent") ?? "").trim() || null,
      price: String(formData.get("price") ?? "").trim() || null,
      floor: String(formData.get("floor") ?? "").trim() || null,
      area: String(formData.get("area") ?? "").trim() || null,
      roomCount: String(formData.get("roomCount") ?? "").trim() || null,
      grade1: String(formData.get("grade1") ?? "").trim() || null,
      grade2: String(formData.get("grade2") ?? "").trim() || null,
      memo: String(formData.get("memo") ?? "").trim() || null,
      photoUrl: String(formData.get("photoUrl") ?? "").trim() || null,
      naverLink: String(formData.get("naverLink") ?? "").trim() || null,
      lat: formData.get("lat") ? Number(formData.get("lat")) : null,
      lng: formData.get("lng") ? Number(formData.get("lng")) : null,
    },
  });

  revalidatePath(`/customers/${customerId}`);
}

const TRACKED_FIELDS: { key: string; label: string }[] = [
  { key: "address", label: "주소" },
  { key: "deposit", label: "보증금" },
  { key: "rent", label: "월세" },
  { key: "price", label: "매매가" },
  { key: "floor", label: "층수" },
  { key: "area", label: "면적" },
  { key: "roomCount", label: "방수" },
  { key: "grade1", label: "등급1" },
  { key: "grade2", label: "등급2" },
  { key: "memo", label: "비고" },
  { key: "naverLink", label: "네이버부동산 링크" },
];

export async function updateProperty(id: string, formData: FormData) {
  const existing = await prisma.property.findUnique({ where: { id } });
  if (!existing) throw new Error("매물을 찾을 수 없습니다.");
  await assertCustomerAccess(existing.customerId);

  const dealType = String(
    formData.get("dealType") ?? existing.dealType
  ) as "SALE" | "JEONSE" | "MONTHLY";

  const next: Record<string, string | null> = {};
  for (const { key } of TRACKED_FIELDS) {
    const raw = formData.get(key);
    next[key] = raw !== null ? String(raw).trim() || null : null;
  }

  const logs: { field: string; oldValue: string | null; newValue: string | null }[] =
    [];
  for (const { key, label } of TRACKED_FIELDS) {
    const oldValue = (existing as unknown as Record<string, string | null>)[key] ?? null;
    const newValue = next[key];
    if (oldValue !== newValue) {
      logs.push({ field: label, oldValue, newValue });
    }
  }

  await prisma.property.update({
    where: { id },
    data: { dealType, ...next },
  });

  if (logs.length > 0) {
    await prisma.activityLog.createMany({
      data: logs.map((l) => ({ propertyId: id, ...l })),
    });
  }

  revalidatePath(`/customers/${existing.customerId}`);
}

export async function deleteProperty(id: string) {
  const existing = await prisma.property.findUnique({ where: { id } });
  if (!existing) return;
  await assertCustomerAccess(existing.customerId);
  await prisma.property.delete({ where: { id } });
  revalidatePath(`/customers/${existing.customerId}`);
}

// ---------- Profile (내정보) ----------

export async function updateProfile(formData: FormData) {
  const session = await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!name) throw new Error("이름은 필수입니다.");
  if (password && password !== passwordConfirm) {
    throw new Error("비밀번호 확인이 일치하지 않습니다.");
  }

  await prisma.staff.update({
    where: { id: session.user.id },
    data: {
      name,
      phone,
      ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
    },
  });

  revalidatePath("/profile");
}
