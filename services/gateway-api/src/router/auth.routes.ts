import { Router } from "express";
import { catchAsync } from "../middlewares/catchAsync.mw.js";
import { getRpcClient } from "../infrastructure/messageBroker.js";

const authRouter = Router();

authRouter.post("/", catchAsync(async (req, res) => {
    res.status(200).json({});
}));

authRouter.post("/login", catchAsync(async (req, res) => {
    const { email, password } = req.body;

    const rpc = getRpcClient();
    const token = await rpc.request<typeof req.body, { token?: string; error?: string }>(
        'auth_action_queue',
        { type: 'login', email, password },
        14000
    );

    if (token?.error) return res.status(401).json(token);
    return res.status(200).json(token);
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
