import mongoose from "mongoose";

// A memory is pure metadata: the photo/clip itself lives in Google
// Drive, and everything (player, photo view, card art) is derived
// from driveId. `people` (tagged Characters) arrives in Sprint 2.
const memorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    driveId: { type: String, required: true },
    type: { type: String, enum: ["photo", "video"], required: true },
    memoryDate: { type: Date, required: true },
    album: { type: String, trim: true, default: "General", maxlength: 60 },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    thumbUrl: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    people: [{ type: mongoose.Schema.Types.ObjectId, ref: "Character" }],
  },
  { timestamps: true }
);

export default mongoose.model("Memory", memorySchema);
