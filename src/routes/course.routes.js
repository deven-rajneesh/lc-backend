
import { Router } from "express";

import {
    getCourseVideos
} from "../controllers/course.controller.js";

const router = Router();

router.get("/:courseId/videos", getCourseVideos);

export default router;
