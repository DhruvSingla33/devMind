import { BrowserRouter as Router, Route, Routes } from "react-router-dom";


import Header from "./components/Header";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";

import Home from "./routes/Home/home";
import Login from "./components/Signin";
import Signup from "./components/Signup";
import Logout from "./components/Logout";


import Contact from "./components/Contact";
import Admin from './Admin';
import Book from "./routes/Book/book";
import Personalproblem from "./routes/Book/personalproblem";
import SingleProblem from "./routes/Book/singleProblem";
import App1 from './App1';
import App2 from './App2';
import Upload from "./components/Upload";
import Addpost from "./routes/Posts/Addpost";
import Posts from './Posts';
import Detailpost from "./Detailpost";
import CreateBook from "./routes/Book/createBook";
import Codeeditor from "./routes/Book/CodeEditor";
import EditBook from "./routes/Book/editBook";
import Recommendation from "./routes/Recommendation/Recommendation";
import Profile from "./components/profile";
import DQ1 from "./routes/defaultQuestions/DQ1";
import DQ2 from "./routes/defaultQuestions/DQ2";
import DQ3 from "./routes/defaultQuestions/DQ3";
import DQ4 from "./routes/defaultQuestions/DQ4";
import DQ5 from "./routes/defaultQuestions/DQ5";
import Home2 from "./pages/Home";
import Video from "./pages/Video";

function App() {
  return (
    <div data-theme="halloween">
      <Router>
        <Header />
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/signin" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/contact" element={<Contact />} />
            <Route path="/Admin" element={<Admin />} />
            <Route path="/problems" element={<Book />} />
            <Route path="/personalproblems" element={<Personalproblem />} />
            <Route path="/problems/:id" element={<SingleProblem />} />
            <Route path="/coding1" element={<App1 />} />
            <Route path="/coding2" element={<App2 />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/addpost" element={<Addpost />} />
            <Route path="/allpost" element={<Posts />} />
            <Route path="/allpost/details/:id" element={<Detailpost />} />
            <Route path="/addproblem" element={<CreateBook />} />
            <Route path="/code" element={<Codeeditor />} />
            <Route path="/editproblem/:slug" element={<EditBook />} />
            <Route path="/recommendation" element={<Recommendation />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/default-question-1" element={<DQ1 />} />
            <Route path="/default-question-2" element={<DQ2 />} />
            <Route path="/default-question-3" element={<DQ3 />} />
            <Route path="/default-question-4" element={<DQ4 />} />
            <Route path="/default-question-5" element={<DQ5 />} />

            {/* Nested route for /coding3 */}
            <Route path="/coding3">
              <Route index element={<Home2 />} />
              <Route path="video">
                <Route path=":id" element={<Video />} />
              </Route>
            </Route>
          </Route>
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
