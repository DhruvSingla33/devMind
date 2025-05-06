import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import NoImageSelected from "../../assets/lc.png";
import Fuse from 'fuse.js';
import { grayscale } from "react-syntax-highlighter/dist/esm/styles/hljs";


{/* <h2 className="font-serif text-2xl py-4">{user.name}</h2>
<p className="font-serif text-lg py-4">{user.email}</p> */}

function Book() {
  
  const baseUrl = "http://localhost:8000/api/problems";
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // const { user, isAuthenticated } = useAuth0();
  const isAuthenticated = window.localStorage.getItem("loggedIn") === "true";
  // const uss = user.name;
  // problem is because of this

  const fuse = new Fuse(data, { keys: ['title'], includeScore: true });


  useEffect(() => {

    // const filteredResults = data.filter((item) =>
    //   item.title.toLowerCase().includes(searchTerm.toLowerCase())
    // );

    if (searchTerm !== '') {
      const results = fuse.search(searchTerm);
      setSearchResults(results.map((result) => result.item));
    } 
    // setSearchResults(filteredResults);


    const fetchData = async () => {
      try {

        let url = baseUrl;
        if (selectedCategory) {
          url += `?category=${selectedCategory}`
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch data.");
        }

        const jsonData = await response.json();
        setData(jsonData);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setError("Error fetching data. Please try again later.");
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedCategory, searchTerm]);

  // const curr = user ? user.name : "";


  
  // const newData = data.filter(item => item.username === curr);
  return (
    
    <div>
      <main className='p-10'>

        <section className="min-h-screen ">
          <div> 



        
           

          </div>
          <br />

          <div className="dropdown dropdown-hover">
            {/* <div tabIndex={0} role="button" className="btn  btn-accent m-1 text-gray-100">Category</div> */}
            <select tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-gray-900 rounded-box w-52" onChange={(e) => setSelectedCategory(e.target.value)}>
              {/* <select > */}
              <option value="">All (click once more)</option>
              <option value="linked-list">Linked-List</option>
              <option value="hash">Hash</option>
              <option value="bfs">BFS</option>
              <option value="dfs">DFS</option>
              <option value="dp">DP</option>
              <option value="binary-search">Binary Search</option>
              <option value="sliding-window">Sliding Window</option>
              {/* </select> */}
            </select>
          </div>


          <br /><br />


          {
            isAuthenticated && <Link to="/addproblem" className="text-2xl"> <button className="btn btn-accent w-2/12">+Add Problem</button></Link>
          }

          {/* <br /><br /> */}
        
        <div style={{ margin: '0 auto', padding: '20px' }}>
    
   
          
    <ul style={{ listStyleType: 'none' }}>
      {data.map((item) => (
        <li key={item._id} className="p-5" style={{ display: 'flex', border: '1px solid black', width: '100%',margin:'20px',background:'#322C2B' }}>
  <Link to={`/problems/${item._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%' }}>
    {/* Image */}
    <img
      src={`http://localhost:8000/uploads/${item.thumbnail}`}
      alt={item.title}
      style={{ width: '100px', height: '100px', objectFit: 'cover', marginRight: '10px' }}
    />
    {/* Text container */}
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Title */}
      <h3 className="text-md text-white" style={{ fontWeight: 'bold'}}>Title: {item.title}</h3>
      {/* Description */}
      <h3 className="text-md text-white"  >{item.description}</h3>
    </div>
  </Link>
</li>

      ))}
    </ul>
  </div>
          


       


          
        </section>




      </main>


      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}




    </div>
  )
}

export default Book
{/* <div style={{ margin: '0 auto', padding: '20px' }}>
    
   
          
    <ul style={{ listStyleType: 'none' }}>
      {newData.map((item) => (
        <li key={item._id} className="p-5" style={{ display: 'inline-block' }}>
          <Link to={`/problems/${item.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <img
              src={`http://localhost:8000/uploads/${item.thumbnail}`}
              alt={item.title}
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
            <h3 className="text-md text-white" style={{ marginTop: '10px' }}>
              {item.title}
            </h3>
          </Link>
        </li>
      ))}
    </ul>
  </div> */}
