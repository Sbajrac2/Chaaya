import { Router, type IRouter } from "express";
import healthRouter from "./health";
import checkinsRouter from "./checkins";
import weatherRouter from "./weather";
import pulseRouter from "./pulse";
import insightsRouter from "./insights";

const router: IRouter = Router();

router.use(healthRouter);
router.use(checkinsRouter);
router.use(weatherRouter);
router.use(pulseRouter);
router.use(insightsRouter);

export default router;
