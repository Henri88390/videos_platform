import { Router } from "express";
import { helloWorld } from "../controllers/videoController";

const videoRouter = Router();

videoRouter.get("/", helloWorld);

export default videoRouter;
