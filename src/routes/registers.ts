import { Router } from "express";

import { RegistersController } from "@/controllers/registers-controller";

const registersRoutes = Router();
const registersController = new RegistersController();

registersRoutes.get("/", registersController.listAllRegisters);
registersRoutes.get("/category/:category_id", registersController.index);
registersRoutes.get("/:id", registersController.show);

export { registersRoutes };
