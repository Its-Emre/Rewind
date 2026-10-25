import { Router } from "express";
import {
  getMemories,
  getMemory,
  createMemory,
  deleteMemory,
  toggleLike,
  getComments,
  addComment,
  deleteComment,
} from "../controllers/memoryController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.route("/").get(getMemories).post(createMemory);
router.route("/:id").get(getMemory).delete(deleteMemory);
router.post("/:id/like", toggleLike);
router.route("/:id/comments").get(getComments).post(addComment);
router.delete("/:id/comments/:commentId", deleteComment);

export default router;
