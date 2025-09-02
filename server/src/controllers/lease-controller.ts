import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";

const prisma = new PrismaClient();

export const getLeases = async (req: Request, res: Response): Promise<void> => {
  try {
    const leases = await prisma.lease.findMany({
      include: {
        property: true,
        tenant: true,
      },
    });
    res.status(200).json(leases);
  } catch (error) {
    res.status(500).json({ message: "Error getting leases" });
  }
};

export const getLeasePayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const leasePayments = await prisma.payment.findMany({
      where: { leaseId: Number(id) },
    });
    res.status(200).json(leasePayments);
  } catch (error) {
    res.status(500).json({ message: "Error getting lease payments" });
  }
};
