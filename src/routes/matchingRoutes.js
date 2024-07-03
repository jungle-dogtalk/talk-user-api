import express from "express";
import { getUserMatch } from "../controllers/Cmatching.js";

const router = express.Router();

router.get("/:userId", getUserMatch);

export default router;
