import { Router } from "express";

import { RegistersController } from "@/controllers/registers-controller";

const router = Router();
const registersController = new RegistersController();

router.get("/", registersController.listAllRegisters);
router.get("/category/:category_id", registersController.index);
router.get("/:id", registersController.show);

export { router };
