const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const PostSchema = new Schema({

    title: {
        type: String,
        required: true,
    },

    slug: {
        type: String,
     
    },
   

    description: {
        type: String,
     
    },

    thumbnail: {
        type: String,
       
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },

    username: {
        type: String,
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

});


module.exports = mongoose.model('Post', PostSchema);