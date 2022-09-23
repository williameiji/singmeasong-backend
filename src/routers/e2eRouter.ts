import { Router } from "express";
import * as e2eController from "../controllers/e2eController.js";

const e2eRouter = Router();

e2eRouter.post("/e2e/cleardb", e2eController.truncate);
e2eRouter.post("/e2e/createtop", e2eController.createTopRecommendations);

export default e2eRouter;
