import { Router } from "express";

import { couponsRoutes } from "./coupons-route";
import { registersRoutes } from "./registers-route";
import { categoriesRoutes } from "./categories-route";

const routes = Router();
routes.use("/categories", categoriesRoutes);
routes.use("/registers", registersRoutes);
routes.use("/coupons", couponsRoutes);

export { routes };
