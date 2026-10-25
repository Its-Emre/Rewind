import Memory from "../models/Memory.js";
import Comment from "../models/Comment.js";
import { parseDriveId, driveThumbUrl, drivePreviewUrl } from "../utils/drive.js";

const shape = (memory, userId, commentCount = 0) => {
  const m = memory.toObject ? memory.toObject() : memory;
  return {
    ...m,
    likeCount: m.likes?.length ?? 0,
    likedByMe: (m.likes ?? []).some((id) => String(id) === String(userId)),
    commentCount,
  };
};

// GET /api/memories — the whole family catalog (small by design).
export const getMemories = async (req, res) => {
  try {
    const memories = await Memory.find()
      .sort({ memoryDate: -1, createdAt: -1 })
      .populate("addedBy", "name");
    const counts = await Comment.aggregate([
      { $group: { _id: "$memory", n: { $sum: 1 } } },
    ]);
    const countById = new Map(counts.map((c) => [String(c._id), c.n]));
    res.json({
      memories: memories.map((m) => shape(m, req.user._id, countById.get(String(m._id)) ?? 0)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// GET /api/memories/:id — one memory, with who liked it + playback URLs.
export const getMemory = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id)
      .populate("addedBy", "name")
      .populate("likes", "name");
    if (!memory) return res.status(404).json({ message: "Memory not found" });
    const commentCount = await Comment.countDocuments({ memory: memory._id });
    res.json({
      memory: {
        ...shape(memory, req.user._id, commentCount),
        likedBy: (memory.likes ?? []).map((u) =>
          u && u.name ? { _id: u._id, name: u.name } : { _id: u, name: "Someone" }
        ),
        previewUrl: memory.type === "video" ? drivePreviewUrl(memory.driveId) : null,
        imageUrl: memory.type === "photo" ? driveThumbUrl(memory.driveId, 1600) : null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// POST /api/memories — add by Drive link.
export const createMemory = async (req, res) => {
  try {
    const { title, driveLink, type, memoryDate, album } = req.body;
    const driveId = parseDriveId(driveLink);
    if (!title || !driveId || !type || !memoryDate) {
      return res.status(400).json({
        message: driveId
          ? "Title, type and the memory's date are required"
          : "That doesn't look like a Google Drive link. Copy the full link from Drive (Share → Copy link).",
      });
    }
    if (!["photo", "video"].includes(type)) {
      return res.status(400).json({ message: "Type must be photo or video" });
    }
    const memory = await Memory.create({
      title,
      driveId,
      type,
      memoryDate,
      album: album?.trim() || "General",
      addedBy: req.user._id,
      thumbUrl: driveThumbUrl(driveId, 1000),
    });
    await memory.populate("addedBy", "name");
    res.status(201).json({ memory: shape(memory, req.user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// DELETE /api/memories/:id — only whoever added it (admin rule: Sprint 2).
export const deleteMemory = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) return res.status(404).json({ message: "Memory not found" });
    if (String(memory.addedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Only the person who added this memory can delete it" });
    }
    await Comment.deleteMany({ memory: memory._id });
    await memory.deleteOne();
    res.json({ message: "Memory deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// POST /api/memories/:id/like — toggle.
export const toggleLike = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) return res.status(404).json({ message: "Memory not found" });
    const uid = String(req.user._id);
    const has = memory.likes.some((id) => String(id) === uid);
    memory.likes = has
      ? memory.likes.filter((id) => String(id) !== uid)
      : [...memory.likes, req.user._id];
    await memory.save();
    res.json({ liked: !has, likeCount: memory.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// GET /api/memories/:id/comments — conversation order (oldest first).
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ memory: req.params.id })
      .sort({ createdAt: 1 })
      .populate("user", "name");
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// POST /api/memories/:id/comments
export const addComment = async (req, res) => {
  try {
    const text = String(req.body.text || "").trim();
    if (!text) return res.status(400).json({ message: "Comment can't be empty" });
    const memory = await Memory.findById(req.params.id);
    if (!memory) return res.status(404).json({ message: "Memory not found" });
    const comment = await Comment.create({
      memory: memory._id,
      user: req.user._id,
      text,
    });
    await comment.populate("user", "name");
    res.status(201).json({ comment });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// DELETE /api/memories/:id/comments/:commentId — author only.
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment || String(comment.memory) !== String(req.params.id)) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (String(comment.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }
    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};
