import { Router } from "express";
import { authRouter } from "./auth.routes.js";

const appRouter = Router();

appRouter.get("/", (_, res) => {
    res.status(200).json("Welcome to the API");
});

appRouter.use("/auth", authRouter);

export { appRouter };
