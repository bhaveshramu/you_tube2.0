import express from "express";
import { verifyOTP } from "../controllers/otp.js";

const routes = express.Router();

routes.post("/verify", verifyOTP);

export default routes;