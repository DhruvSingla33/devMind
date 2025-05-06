const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const ProblemSchema = new Schema({
    title:       { type: String,  required: true, trim: true },
    intialcode:{ type: String,  required: true, trim: true },
    snippet:     { type: String,  required: true },
    solution:    { type: String,  required: true },
    input:       { type: String,  required: true },
    output:      { type: String,  required: true },
    description: { type: String,  required: true },
    thumbnail:   { type: String},
    stars:       { type: Number,  default: 0, min: 0 },
    category:    { type: [String], default: [] },
    createdAt:   { type: Date,    default: Date.now },
    testcases: {
      type: [
        {
          input:  { type: String, required: true },
          output: { type: String, required: true },
        }
      ],
      required: true,
    },
  });
  


module.exports = mongoose.model('Problem', ProblemSchema);