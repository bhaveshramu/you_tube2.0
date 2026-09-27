import express from "express";
import { downloadVideo,getDownloads, } from "../controllers/download.js";

const routes = express.Router();

// Download video
routes.post("/download", downloadVideo);
routes.get("/:userid", getDownloads);

export default routes;