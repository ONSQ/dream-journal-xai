import { Router, type IRouter } from "express";
import healthRouter from "./health";
import classifyRouter from "./classify";
import entriesRouter from "./entries";

const router: IRouter = Router();

router.use(healthRouter);
router.use(classifyRouter);
router.use(entriesRouter);

export default router;
