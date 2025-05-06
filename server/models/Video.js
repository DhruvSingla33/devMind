const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    imgUrl: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    likes: {
      type: [String],
      default: [],
    },
    dislikes: {
      type: [String],
      default: [],
    },
    comments: [
      {
        username: {
          type: String,
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      }
    ]
  },
  { timestamps: true },

 
);

// export default mongoose.model("Video", VideoSchema);
module.exports = mongoose.model("Video", VideoSchema);
