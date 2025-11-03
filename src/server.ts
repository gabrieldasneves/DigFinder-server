import express from "express";
import cors from "cors";
import { routes } from "./routes";
import { errorHandling } from "./middlewares/error-handling";
import authRoutes from "./routes/auth";
import discoveriesRoutes from "./routes/discoveries";
import categoriesRoutes from "./routes/categories";

const PORT = 3333;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/discoveries", discoveriesRoutes);
app.use("/categories", categoriesRoutes);
app.use(routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
