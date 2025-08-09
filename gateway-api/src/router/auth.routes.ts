import { Router } from "express";
import { catchAsync } from "../middlewares/catchAsync.mw.js";
import { channel } from "../infrastructure/messageBroker.js";

const authRouter = Router();

authRouter.post("/", catchAsync(async (req, res) => {
    res.status(200).json({});
}));

authRouter.post("/login", catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const token = channel.sendToQueue('db_action_queue', Buffer.from(JSON.stringify({ email, password })));
    res.status(200).json(token);
}));

authRouter.get("/:id", catchAsync(async (req, res) => {
    res.status(200).json({});
}));

authRouter.get("/", catchAsync(async (_, res) => {
    res.status(200).json({});
}));

authRouter.get("/verify/:token", catchAsync(async (req, res) => {
    const { token } = req.params;
    res.status(200).send(token);
}));

authRouter.put("/:id", catchAsync(async (req, res) => {
    res.status(200).json({});
}));

authRouter.delete("/:id", catchAsync(async (req, res) => {
    res.status(200).json({});
}));

authRouter.get("/secure/:token", catchAsync(async (req, res) => {
    res.status(200).send("");
}));

authRouter.get("/reset/:token", catchAsync(async (req, res) => {
    res.status(200).send("");
}));

authRouter.get("/forgot-password/:email", catchAsync(async (req, res) => {
    res.status(200).send("");
}));

authRouter.patch("/change-password", catchAsync(async (req, res) => {
    const { password, newPassword } = req.body;
    res.status(200).json({});
}));

export { authRouter };
