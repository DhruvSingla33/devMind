import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import NoImageSelected from "../../assets/lc.png";
import { useAuth0 } from "@auth0/auth0-react";


function editBook() {
  const navigate = useNavigate();
  const urlSlug = useParams();
  const baseUrl = `http://localhost:8000/api/books/${urlSlug.slug}`;

  const [bookId, setBookId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [stars, setStars] = useState(0);
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [submitted, setSubmitted] = useState("");
  const [image, setImage] = useState("");

  const { user, isAuthenticated } = useAuth0();

  const fetchData = async () => {
    try {
      const response = await fetch(baseUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch data.");
      }

      const data = await response.json();
      setBookId(data._id);
      setTitle(data.title);
      setSlug(data.slug);
      setStars(data.stars);
      setCategories(data.category);
      setDescription(data.description);
      setThumbnail(data.thumbnail);
    } catch (error) {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createBook = async (e) => {
    e.preventDefault();
    console.table([title, slug]);

    const formData = new FormData();
    formData.append("bookId", bookId);
    formData.append("title", title);
    formData.append("slug", slug);
    formData.append("stars", stars);
    formData.append("description", description);
    formData.append("category", categories);
    

    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }
    formData.append("username", user.name);

    try {
      const response = await fetch("http://localhost:8000/api/books", {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        setTitle("");
        setSlug("");
        setSubmitted(true);
      } else {
        console.log("Failed to submit data.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCategoryChange = (e) => {
    setCategories(e.target.value.split(",").map((category) => category.trim()));
  };

  const onImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
      setThumbnail(e.target.files[0]);
    }
  };

  const removeBook = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:8000/api/books/" + bookId,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        navigate("/books");
        console.log("Book removed.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-5 mx-auto">      
      
      {submitted ? (
        <p className="text-xl text-white">Data submitted successfully!</p>
      ) : (
        <form className="p-5 " onSubmit={createBook}>
          <div className="col-1 rounded-xl items-center justify-evenly text-center">
          <h1 className="text-center text-3xl text-white font-bold m-10">Edit Question</h1>
          

          <span className="text-white text-lg">Upload Thumbnail</span><br/>
          
            {image ? (
              <img src={`${image}`} alt="preview image" className="mx-auto w-72 items-center justify-center m-3 rounded-xl text-center "/>
            ) : (
              <img
                src={`http://localhost:8000/uploads/${thumbnail}`}
                alt="preview image" className="mx-auto w-72 items-center justify-center m-3 rounded-xl text-center "
              />
            )}
            <button onClick={removeBook} className="btn btn-error m-5">
                Delete
            </button>
            <input
              onChange={onImageChange}
              type="file"
              accept="image/gif, image/jpeg, image/png"
            />
          </div>
          <div className="col-2 rounded-xl text-white p-2">
            <div>
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-md input input-bordered input-primary w-full"
              />
            </div>

            <div>
              <label>Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="rounded-md input input-bordered input-primary w-full"
              />
            </div>
            
            <div>
              <label>Stars</label>
              <input
                type="text"
                value={stars}
                onChange={(e) => setStars(e.target.value)}
                className="rounded-md input input-bordered input-primary w-full"
              />
            </div>
            <label>Description</label>
            <div className="mockup-code">
              
              <textarea
                rows="4"
                cols="50"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-md input input-bordered input-primary w-full max-h-96"
              />
            </div>

            <div>
              <label>Categories (comma-seperated)</label>
              <input
                type="text"
                value={categories}
                onChange={handleCategoryChange}
                className="rounded-md input input-bordered input-primary w-full"
              />
            </div>

            <div>
              <label>Username</label>
              <input
                type="text"
                value={user.name}
                readOnly={true}
                className="rounded-md input input-bordered input-primary w-full"
              />
            </div>

            <button className="btn glass">Submit</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default editBook;