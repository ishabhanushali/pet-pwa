import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "./prisma";

export async function getCurrentCustomer() {
  const cookieStore = await cookies();

  const sessionCookie =
    cookieStore.get("customerSession");

  if (!sessionCookie?.value) {
    return null;
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(sessionCookie.value)
    .digest("hex");

  const session =
    await prisma.customerSession.findUnique({
      where: {
        tokenHash,
      },

      include: {
        customer: true,
      },
    });

  if (!session) {
    return null;
  }

  // Session expired
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.customerSession.delete({
      where: {
        id: session.id,
      },
    });

    return null;
  }

  return session.customer;
}