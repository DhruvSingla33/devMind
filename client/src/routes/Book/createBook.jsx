import React, { useState } from "react";
import NoImageSelected from "../../assets/lc.png";

function CreateProblem() {
  const isAuthenticated = window.localStorage.getItem("loggedIn") === "true";

  const [title, setTitle] = useState("");
  const [intialcode, setintialcode] = useState("");
  const [snippet, setSnippet] = useState("");
  const [solution, setSolution] = useState("");
  const [sampleInput, setSampleInput] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [image, setImage] = useState(NoImageSelected);
  const [stars, setStars] = useState(0);
  const [categories, setCategories] = useState([]);
  const [testcases, setTestcases] = useState([{ input: "", output: "" }]);
  const [submitted, setSubmitted] = useState(false);

  const createProblem = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("intialcode", intialcode);
    formData.append("snippet", snippet);
    formData.append("solution", solution);
    formData.append("input", sampleInput);
    formData.append("output", sampleOutput);
    formData.append("description", description);
    formData.append("stars", stars);
    formData.append("thumbnail", thumbnail);
    formData.append("category", categories);
    formData.append("testcases", JSON.stringify(testcases));

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const baseUrl = `${API_BASE_URL}/api/problems`;

    try {
      const res = await fetch(baseUrl, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setTitle("");
        setintialcode("");
        setSnippet("");
        setSolution("");
        setSampleInput("");
        setSampleOutput("");
        setDescription("");
        setStars(0);
        setCategories([]);
        setThumbnail(null);
        setImage(NoImageSelected);
        setTestcases([{ input: "", output: "" }]);
        setSubmitted(true);
      } else {
        console.error("Failed to submit");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategoryChange = (e) =>
    setCategories(e.target.value.split(",").map((c) => c.trim()));

  const handleTestcaseChange = (idx, field, value) => {
    const arr = [...testcases];
    arr[idx][field] = value;
    setTestcases(arr);
  };

  const addTestcase = () =>
    setTestcases([...testcases, { input: "", output: "" }]);

  const onImageChange = (e) => {
    if (e.target.files?.[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
      setThumbnail(e.target.files[0]);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 flex justify-center px-4">
      {submitted ? (
        <p className="text-xl text-white mt-20">Problem submitted successfully!</p>
      ) : (
        <form className="w-full max-w-[1200px] p-10" onSubmit={createProblem}>
          <h1 className="text-center text-3xl my-10 text-white font-bold">
            Create Problem
          </h1>

          {/* Thumbnail */}
          <div className="rounded-xl text-center mb-6">
            <span className="text-white text-lg">Upload Thumbnail</span>
            <img
              src={image}
              alt="preview"
              className="mx-auto w-96 m-3 rounded-xl"
            />
            <input onChange={onImageChange} type="file" accept="image/*" />
          </div>

          <div className="space-y-6 text-white">
            <div>
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Initial Code</label>
              <textarea
                rows="10"
                value={intialcode}
                onChange={(e) => setintialcode(e.target.value)}
                className="w-full p-3 border rounded-lg font-mono text-sm resize-y"
                placeholder="Enter the initial code here..."
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">
                Starter Code (Snippet)
              </label>
              <textarea
                rows="10"
                value={snippet}
                onChange={(e) => setSnippet(e.target.value)}
                className="w-full p-3 border rounded-lg font-mono text-sm resize-y"
                placeholder="Enter the starter code snippet..."
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Solution</label>
              <textarea
                rows="10"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                className="w-full p-3 border rounded-lg font-mono text-sm resize-y"
                placeholder="Enter the full solution..."
              />
            </div>

            <div>
              <label>Sample Input</label>
              <input
                type="text"
                value={sampleInput}
                onChange={(e) => setSampleInput(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label>Sample Output</label>
              <input
                type="text"
                value={sampleOutput}
                onChange={(e) => setSampleOutput(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label>Stars</label>
              <input
                type="number"
                value={stars}
                onChange={(e) => setStars(+e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label>Description</label>
              <textarea
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label>Categories (comma-separated)</label>
              <input
                type="text"
                value={categories.join(",")}
                onChange={handleCategoryChange}
                className="input input-bordered w-full"
              />
            </div>

            {/* Testcases */}
            <h3 className="text-2xl mt-6 mb-2 text-white">Testcases</h3>
            {testcases.map((tc, i) => (
              <div
                key={i}
                className="p-4 border border-gray-700 rounded-lg mb-6 bg-gray-800 space-y-4"
              >
                <div>
                  <label className="text-white font-semibold">Input</label>
                  <input
                    type="text"
                    value={tc.input}
                    onChange={(e) =>
                      handleTestcaseChange(i, "input", e.target.value)
                    }
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="text-white font-semibold">Output</label>
                  <input
                    type="text"
                    value={tc.output}
                    onChange={(e) =>
                      handleTestcaseChange(i, "output", e.target.value)
                    }
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addTestcase}
              className="btn btn-secondary mt-2"
            >
              Add More Testcase
            </button>

            <div className="mt-6">
              <button type="submit" className="btn glass w-full">
                Submit Problem
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default CreateProblem;
