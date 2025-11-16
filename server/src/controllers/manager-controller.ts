import type { Request, Response } from "express";
import { wktToGeoJSON } from "@terraformer/wkt";
import { prisma } from "../lib/prisma.js";

export const getManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { cognitoId } = req.params;
  if (!cognitoId) {
    res.status(400).json({ message: "cognitoId is required" });
    return;
  }
  try {
    const manager = await prisma.manager.findUnique({
      where: { cognitoId },
    });
    if (manager) {
      res.status(200).json(manager);
    } else {
      res.status(404).json({ message: "Manager not found" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error getting manager",
      error: process.env.NODE_ENV === "development" ? String(error) : undefined,
    });
  }
};

export const createManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { cognitoId, name, email, phoneNumber } = req.body;
  try {
    const manager = await prisma.manager.create({
      data: { cognitoId, name, email, phoneNumber },
    });
    res.status(201).json(manager);
  } catch (error) {
    res.status(500).json({
      message: "Error creating manager",
      error: process.env.NODE_ENV === "development" ? String(error) : undefined,
    });
  }
};

export const updateManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { cognitoId } = req.params;
  if (!cognitoId) {
    res.status(400).json({ message: "cognitoId is required" });
    return;
  }
  const { name, email, phoneNumber } = req.body;
  try {
    const manager = await prisma.manager.update({
      where: { cognitoId },
      data: { name, email, phoneNumber },
    });
    res.status(200).json(manager);
  } catch (error) {
    res.status(500).json({
      message: "Error updating manager",
      error: process.env.NODE_ENV === "development" ? String(error) : undefined,
    });
  }
};

export const getManagerProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const properties = await prisma.property.findMany({
      where: { managerCognitoId: cognitoId! },
      include: {
        location: true,
      },
    });

    const propertiesWithFormattedLocation = await Promise.all(
      properties.map(async (property) => {
        const coordinates: { coordinates: string }[] =
          await prisma.$queryRaw`SELECT ST_AsText(coordinates) AS coordinates FROM "Location" WHERE id = ${property.locationId}`;

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

    res.status(200).json(propertiesWithFormattedLocation);
  } catch (error) {
    res.status(500).json({
      message: "Error getting manager properties",
      error: process.env.NODE_ENV === "development" ? String(error) : undefined,
    });
  }
};
