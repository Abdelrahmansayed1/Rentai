import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";

const prisma = new PrismaClient();

export const getTenant = async (req: Request, res: Response): Promise<void> => {
  const { cognitoId } = req.params;
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      include: {
        favorites: true,
      },
    });
    if (tenant) {
      res.status(200).json(tenant);
    } else {
      res.status(404).json({ message: "Tenant not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error getting tenant" });
  }
};

export const createTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { cognitoId, name, email, phoneNumber } = req.body;
  try {
    const tenant = await prisma.tenant.create({
      data: { cognitoId, name, email, phoneNumber },
    });
    res.status(201).json(tenant);
  } catch (error) {
    res.status(500).json({ message: "Error creating tenant" });
  }
};

export const updateTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { cognitoId } = req.params;
  const { name, email, phoneNumber } = req.body;
  try {
    const tenant = await prisma.tenant.update({
      where: { cognitoId },
      data: { name, email, phoneNumber },
    });
    res.status(200).json(tenant);
  } catch (error) {
    res.status(500).json({ message: "Error updating tenant" });
  }
};

export const getCurrentResidences = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const properties = await prisma.property.findMany({
      where: { tenants: { some: { cognitoId: cognitoId! } } },
      include: {
        location: true,
      },
    });

    const residencesWithFormattedLocation = await Promise.all(
      properties.map(async (property) => {
        const coordinates: { coordinates: string }[] =
          await prisma.$queryRaw`SELECT ST_AsText(coordinates) AS coordinates FROM Location WHERE id = ${property.locationId}`;

        const geoJson = wktToGeoJSON(coordinates[0]?.coordinates || "");
        const longitude = geoJson.bbox?.[0];
        const latitude = geoJson.bbox?.[1];

        const propertyWithCoordinates = {
          ...property,
          location: {
            ...property.location,
            coordinates: {
              longitude,
              latitude,
            },
          },
        };
        return propertyWithCoordinates;
      })
    );

    res.status(200).json(residencesWithFormattedLocation);
  } catch (error) {
    res.status(500).json({ message: "Error getting tenant properties" });
  }
};

export const addFavoriteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { cognitoId } = req.params;
  const { propertyId } = req.body;
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      include: {
        favorites: true,
      },
    });
    if (tenant) {
      const propertyIdNumber = Number(propertyId);
      const existingFavorite = tenant?.favorites || [];
      if (
        existingFavorite.some((favorite) => favorite.id === propertyIdNumber)
      ) {
        res.status(409).json({ message: "Property already in favorites" });
        return;
      }
    }
    const updatedTenant = await prisma.tenant.update({
      where: { cognitoId },
      data: { favorites: { connect: { id: propertyId } } },
      include: {
        favorites: true,
      },
    });
    res.status(200).json(updatedTenant);
  } catch (error) {
    res.status(500).json({ message: "Error adding favorite property" });
  }
};

export const removeFavoriteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { cognitoId } = req.params;
  const { propertyId } = req.body;
  try {
    const tenant = await prisma.tenant.update({
      where: { cognitoId },
      data: { favorites: { disconnect: { id: propertyId } } },
      include: {
        favorites: true,
      },
    });
    res.status(200).json(tenant);
  } catch (error) {
    res.status(500).json({ message: "Error removing favorite property" });
  }
};
