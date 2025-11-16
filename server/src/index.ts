import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authMiddleware } from "./middleware/auth-middleware.js";
import tenantRoutes from "./routes/tenant-routes.js";
import managerRoutes from "./routes/manager-routes.js";
import propertyRoutes from "./routes/property-routes.js";
import leaseRoutes from "./routes/lease-routes.js";
import applicationRoutes from "./routes/application-routes.js";
import {
  getManager,
  getManagerProperties,
} from "./controllers/manager-controller.js";
/*Route imports */

/*Config*/
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/*Routes*/
app.use("/properties", propertyRoutes);
app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes);
// Public GET routes for viewing manager profiles (e.g., on property listings)
app.get("/managers/:cognitoId", getManager);
app.get("/managers/:cognitoId/properties", getManagerProperties);
// Protected routes for manager operations (PUT, POST)
app.use("/managers", authMiddleware(["manager"]), managerRoutes);
app.use("/leases", authMiddleware(["manager", "tenant"]), leaseRoutes);
app.use(
  "/applications",
  authMiddleware(["manager", "tenant"]),
  applicationRoutes
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
