require("dotenv").config();
const cors= require("cors");
const express = require("express");
const connectDB = require("./connectDB");
const Problem = require("./models/Problem");
const Post = require("./models/Posts");
const Video = require("./models/Video");
const User = require("./models/User");
const multer = require("multer");
const fs = require("fs");
let {PythonShell} = require('python-shell')
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 8000;
const path = require('path');

const bcrypt = require("bcryptjs");

const scriptPath = path.join(__dirname, 'test.py');
connectDB();
app.use(cors());

app.use(express.urlencoded({ extended: true } ));
app.use(express.json());

app.use("/uploads", express.static("uploads"));

const jwt = require("jsonwebtoken");


const JWT_SECRET = process.env.JWT_SECRET;


// user routes 

app.post("/register", async (req, res) => {
  const { Firstname, Lastname, Email, Password, UserType } = req.body;
   console.log(req.body);
  try {
  
    const oldUser = await User.findOne({ Email });
    if (oldUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const username = Email.split('@')[0];
    const encryptedPassword = await bcrypt.hash(Password, 10);
    const newUser = new User({
      Firstname,
      Lastname,
      Email,
      Password: encryptedPassword,
      UserType,
      UserName: username,
    });
    console.log(newUser);
    await newUser.save();

    return res.status(201).json({
      status: "ok",
      message: "User registered successfully",
      username,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/login-user", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ Email:email });
  if (!user) {
    return res.json({ error: "User Not found" });
  }
  if (await bcrypt.compare(password, user.Password)) {
    const token = jwt.sign({ email: user.Email }, JWT_SECRET, {
      expiresIn: "15m",
    });

    if (res.status(201)) {
      return res.json({ status: "ok", data: token });
    } else {
      return res.json({ error: "error" });
    }
  }
  res.json({ status: "error", error: "InvAlid Password" });
});
app.post("/api/posts/:id/comments", async (req, res) => {
  // console.log("aati");
  // console.log(req);
  const { username, text } = req.body;

  try {
    const post = await Post.findById(req.params.id);


    if (!post) {
      return res.status(404).json({ message: "Book not found" });
    }

    const newComment = {
      username,
      text,
      date: new Date(),
    };

    post.comments.push(newComment);
    console.log(post);
    await post.save();

    res.status(201).json({ message: "Comment added", post });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/api/videos/:id/comments", async (req, res) => {
  // console.log("aati");
  // console.log(req);
  const { username, text } = req.body;

  try {
    const video= await Video.findById(req.params.id);


    if (!video) {
      return res.status(404).json({ message: "Book not found" });
    }

    const newComment = {
      username,
      text,
      date: new Date(),
    };

    video.comments.push(newComment);
   
    await video.save();

    res.status(201).json({ message: "Comment added", video });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/userData", async (req, res) => {
  const { token } = req.body;
  console.log("hii");

  try {
  
    const user = jwt.verify(token, JWT_SECRET, (err, res) => {
      if (err) {
        return "token expired";
      }
      return res;
    });
    console.log(user);
    if (user == "token expired") {
      return res.send({ status: "error", data: "token expired" });
    }

    const useremail = user.email;
    User.findOne({ Email: useremail })
      .then((data) => {
        res.send({ status: "ok", data: data });
      })
      .catch((error) => {
        res.send({ status: "error", data: error });
      });
  } catch (error) { 
    console.log("hii");
  }
});

app.post("/python", async (req, res) => {
  const pre = "import sys;\n\n";
  const code = req.body.value;
  const input = req.body.input;
  const outpu = req.body.output;
  const id =req.body.id;
  const codeDetails = await Problem.findById(id);
  console.log(codeDetails);
  const testCaseResults = [];
  console.log(req.body);
  fs.writeFileSync("test.py", pre+code+"\n"+codeDetails.snippet);
  
  for (const testcase of codeDetails.testcases) {
    const input = testcase.input;
    const inputArray =input.split(' ').map(Number);
    let output = testcase.output;
    console.log(output)
    console.log(inputArray);
    const options = {
      mode: "text",
      pythonOptions: ["-u"],
      args: [...inputArray],
    };

    const pythonResults = await PythonShell.run("test.py", options);
   
    testCaseResults.push(pythonResults == output);
  }
 

   
   
console.log(testCaseResults );
res.json({ testCaseResults });



});
app.get('/api/videos', async (req, res) => {
  try {

    const videos = await Video.find();
    
 
    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Error fetching videos', error });
  }
});
app.get('/api/videos/find/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    console.log(video);
    res.status(200).json(video);
  } catch (err) {
    next(err);
  }
});
app.get('/api/posts/find/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    console.log("hello");
    console.log(post);
    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
});
app.get('/api/posts', async (req, res, next) => {
  try {
    const posts = await Post.find(); // Fetch all posts from the database
    console.log(posts);
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
});
// Comment schema and model
const commentSchema = new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now },
});
const Comment = mongoose.model("Comment", commentSchema);

// Route to get all comments
app.get("/api/comments", async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// Route to post a new comment
app.post("/api/comments", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Comment text is required" });

  try {
    const newComment = new Comment({ text });
    await newComment.save();
    res.json(newComment);
  } catch (error) {
    res.status(500).json({ error: "Failed to save comment" });
  }
});


app.get("/api/problems/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Problem.findOne({ _id: id});
    console.log("hello");
    if(!data) {
      throw new Error("Error while fetching data for a book");
    }

    res.status(201).json(data);

  } catch (error) {
    res.status(500).json({error: "An error occured while fetching books"});
  }
});



// add book now

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
})

const upload = multer({ storage: storage })


// Set up a POST route to upload video data
app.post('/api/videos', upload.fields([{ name: 'img' }, { name: 'video' }]), async (req, res) => {
  try {
    const { userName, title, desc } = req.body;
    const imgUrl = req.files['img'] ? req.files['img'][0].path : ''; // Assuming you store the file path
    const videoUrl = req.files['video'] ? req.files['video'][0].path : ''; // Assuming you store the file path

    // Create a new video document
    const newVideo = new Video({
      userName,
      title,
      desc,
      imgUrl,
      videoUrl,
      likes: [],
      dislikes: [],
    });
    console.log(newVideo);
    // Save the video to the database
    await newVideo.save();

    // Respond with success message
    res.status(201).json({ message: 'Video uploaded successfully', video: newVideo });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ message: 'Error uploading video', error });
  }
});



app.get("/api/problems", async (req, res) => {
  try {
    const category = req.query.category;
    const filter = {}
    if(category) {
      filter.category = category;
    }
    const data = await Problem.find(filter);
    res.json(data);
  } catch (error) {
    res.status(500).json({error: "An error occured while fetching books"});
  }
})
app.post("/api/posts", upload.single("thumbnail")  ,async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file);

    const newPost = new Post({
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description,
      thumbnail: req.file.filename,
      username: req.body.username,
    })
    console.log(newPost );
    await Post.create(newPost);
    res.json("Data Submitted");
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching books." });
    console.log(error);
  }
});

app.post("/api/problems", upload.single("thumbnail"), async (req, res) => {
  try {
    const {
      title,
      snippet,
      solution,
      input,
      output,
      description,
      stars,
      category,
    } = req.body;

    // 1) Handle "function" since it's a reserved word
    //    req.body.function arrives as a string; alias it to fnName
    const intialcode = req.body.intialcode;

    // 2) Parse testcases safely
    let parsedTestcases = req.body.testcases;
    if (typeof parsedTestcases === "string") {
      parsedTestcases = JSON.parse(parsedTestcases);
    }
    console.dir(parsedTestcases, { depth: null });

    // 3) Normalize category into an array of strings
    let parsedCategory = category;
    if (typeof category === "string") {
      try {
        // maybe it was JSON‐stringified?
        parsedCategory = JSON.parse(category);
      } catch {
        // fallback to comma‐split
        parsedCategory = category.split(",").map((c) => c.trim());
      }
    }

    const newProblem = new Problem({
      title,
      snippet,
      solution,
      input,
      output,
      description,
      stars: Number(stars) || 0,
      category: Array.isArray(parsedCategory) ? parsedCategory : [parsedCategory],
      thumbnail: req.file?.filename || "",
      testcases: parsedTestcases,
      intialcode       // quoted to avoid syntax issues
    });

    console.log("Saving problem:", JSON.stringify(newProblem.toObject(), null, 2));
    await newProblem.save();

    res.json({ message: "Problem submitted successfully!" });
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({ error: "Failed to submit problem" });
  }
});



app.put("/api/books", upload.single("thumbnail"), async (req, res) => {
  try {

    const bookId = req.body.bookId;

    const updateBook = {
      title: req.body.title,
      slug: req.body.slug,
      stars: req.body.stars,
      description: req.body.description,
      category: req.body.category,
      username: req.body.username,
    }

    if (req.file) {
      updateBook.thumbnail = req.file.filename;
    }

    await Book.findByIdAndUpdate(bookId, updateBook)
    res.json("Data Submitted");
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching books." });
  }
});


app.delete("/api/books/:id", async(req,res) => {
  const bookId = req.params.id;

  try {
    await Book.deleteOne({_id: bookId});
    res.json("How dare you!" + req.body.bookId);
  } catch (error) {
    res.json(error);
  }
});





// TRIAL


app.get("/", (req, res) => {
    res.json("This is the home page.");
});

app.get("*", (req, res) => {
    res.sendStatus("404");
});

app.listen(PORT, () => {
    console.log(`Sever running at Port: ${PORT}`)
});