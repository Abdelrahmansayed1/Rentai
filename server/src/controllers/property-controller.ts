import type { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import axios from "axios";
import type { Location } from "@prisma/client";

const prisma = new PrismaClient();
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

export const getProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      priceMin,
      priceMax,
      beds,
      baths,
      propertyType,
      favoritesIds,
      squareFeetMin,
      squareFeetMax,
      amenities,
      availableFrom,
      latitude,
      longitude,
    } = req.query;

    let whereClause: Prisma.Sql[] = [];

    if (favoritesIds) {
      const favoritesIdsArray = (favoritesIds as string).split(",").map(Number);
      whereClause.push(
        Prisma.sql`p."id" IN (${Prisma.join(favoritesIdsArray, ", ")})`
      );
    }
    if (priceMin) {
      whereClause.push(Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`);
    }
    if (priceMax) {
      whereClause.push(Prisma.sql`p."pricePerMonth" <= ${Number(priceMax)}`);
    }
    if (beds && beds !== "any") {
      whereClause.push(Prisma.sql`p."beds" >= ${Number(beds)}`);
    }
    if (baths && baths !== "any") {
      whereClause.push(Prisma.sql`p."baths" >= ${Number(baths)}`);
    }
    if (propertyType && propertyType !== "any") {
      whereClause.push(
        Prisma.sql`p."propertyType" = ${propertyType}::"PropertyType"`
      );
    }
    if (squareFeetMin && squareFeetMin !== "any") {
      whereClause.push(Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin)}`);
    }
    if (squareFeetMax && squareFeetMax !== "any") {
      whereClause.push(Prisma.sql`p."squareFeet" <= ${Number(squareFeetMax)}`);
    }
    if (amenities && amenities !== "any") {
      const amenitiesArray = (amenities as string).split(",");
      whereClause.push(Prisma.sql`p."amenities" @> ${amenitiesArray}`);
    }
    if (availableFrom) {
      const availableFromDate =
        typeof availableFrom === "string" ? new Date(availableFrom) : null;
      if (availableFromDate) {
        if (!isNaN(availableFromDate.getTime())) {
          whereClause.push(
            Prisma.sql`EXISTS (SELECT 1 FROM "Lease" WHERE "Lease"."propertyId" = p."id" AND "Lease"."startDate" >= ${availableFromDate.toISOString()})`
          );
        }
      }
    }
    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);
      const radius = 1000;
      const degreeRadius = radius / 111.32;

      whereClause.push(
        Prisma.sql`ST_DWithin(l."coordinates"::geometry, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326), ${degreeRadius})`
      );
    }

    const completeQuery = Prisma.sql`
        SELECT p.*, json_build_object(
            'id', l."id",
            'address', l."address",
            'city', l."city",
            'state', l."state",
            'country', l."country",
            'postalCode', l."postalCode",
            'coordinates', json_build_object(
                'longitude', ST_X(l."coordinates"::geometry),
                'latitude', ST_Y(l."coordinates"::geometry)
            )
        ) AS location
        FROM "Property" p
        JOIN "Location" l ON p."locationId" = l."id"
        ${
          whereClause.length > 0
            ? Prisma.sql`WHERE ${Prisma.join(whereClause, " AND ")}`
            : Prisma.empty
        }
        `;

    const properties = await prisma.$queryRaw(completeQuery);
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: "Error getting properties" });
    console.error(error);
  }
};

export const getProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
      include: {
        location: true,
      },
    });

    if (property) {
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
      res.status(200).json(propertyWithCoordinates);
    }
  } catch (error) {
    res.status(500).json({ message: "Error getting property" });
    console.error(error);
  }
};

export const createProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const {
      address,
      city,
      state,
      country,
      postalCode,
      managerCognitoId,
      ...property
    } = req.body;

    const photoUrls = await Promise.all(
      files.map(async (file) => {
        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `properties/${Date.now()}/${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };
        const uploadResult = await new Upload({
          client: s3Client,
          params: uploadParams,
        }).done();
        return uploadResult.Location;
      })
    );

    const geocodinURL = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
      {
        street: address,
        city,
        state,
        country,
        postalcode: postalCode,
        format: "json",
        limit: "1",
      }
    ).toString()}`;
    const geoCodingResponse = await axios.get(geocodinURL, {
      headers: {
        "User-Agent": "Rentai (abdelrahmansayedu@gmail.com)",
      },
    });
    const [longitude, latitude] =
      geoCodingResponse.data[0].lon & geoCodingResponse.data[0].lat
        ? [
            parseFloat(geoCodingResponse.data[0].lon),
            parseFloat(geoCodingResponse.data[0].lat),
          ]
        : [0, 0];

    const [location] = await prisma.$queryRaw<Location[]>`
      INSERT INTO "Location" ("address", "city", "state", "country", "postalCode", "coordinates")
      VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
      RETURNING id, address, city, state, country, postalCode, ST_AsText(coordinates) AS coordinates
    `;

    const newProperty = await prisma.property.create({
      data: {
        ...property,
        photoUrls,
        longitude,
        latitude,
        managerCognitoId,
        locationId: location?.id,
        amenities:
          typeof property.amenities === "string"
            ? property.amenities.split(",")
            : [],
        highlights:
          typeof property.highlights === "string"
            ? property.highlights.split(",")
            : [],
        isPetsAllowed: property.isPetsAllowed === "true",
        isParkingIncluded: property.isParkingIncluded === "true",
        pricePerMonth: parseFloat(property.pricePerMonth),
        securityDeposit: parseFloat(property.securityDeposit),
        applicationFee: parseFloat(property.applicationFee),
        beds: parseInt(property.beds),
        baths: parseFloat(property.baths),
        squareFeet: parseInt(property.squareFeet),
      },
      include: {
        location: true,
        manager: true,
      },
    });

    res.status(201).json(newProperty);
  } catch (error) {
    res.status(500).json({ message: "Error creating property" });
    console.error(error);
  }
};
