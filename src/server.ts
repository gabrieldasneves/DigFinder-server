import "dotenv/config";
import express from "express";
import cors from "cors";
import { routes } from "./routes";
import { errorHandling } from "./middlewares/error-handling";
import authRoutes from "./routes/auth";
import { categoriesRoutes } from "./routes/categories";
import { discoveriesRoutes } from "./routes/discoveries";

const PORT = 3333;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/categories", categoriesRoutes);
app.use("/discoveries", discoveriesRoutes);
app.use(routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
