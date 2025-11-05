import { Router } from "express";

import { registersRoutes } from "./registers";
import { categoriesRoutes } from "./categories";
import { discoveriesRoutes } from "./discoveries";

const routes = Router();
routes.use("/categories", categoriesRoutes);
routes.use("/registers", registersRoutes);
routes.use("/discoveries", discoveriesRoutes);

export { routes };
