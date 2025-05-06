import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import NoImageSelected from "../../assets/lc.png";
import Fuse from 'fuse.js';
import { grayscale } from "react-syntax-highlighter/dist/esm/styles/hljs";


{/* <h2 className="font-serif text-2xl py-4">{user.name}</h2>
<p className="font-serif text-lg py-4">{user.email}</p> */}

function Book() {
  
  const baseUrl = "http://localhost:8000/api/books";
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const { user, isAuthenticated } = useAuth0();
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

  const curr = user ? user.name : "";


  
  const newData = data.filter(item => item.username === curr);
  return (
    
    <div>
      <main className='p-10'>

        <section className="min-h-screen ">
          <div> 



          <br /><br />
            <div className="carousel w-full h-96 my-7 relative">
              <div id="item1" className='carousel-item w-full relative '>
                <img className='w-full h-full object-cover opacity-70 rounded-xl drop-shadow-xl' src="https://wallpapercave.com/wp/wp4664584.jpg" alt="Background Image" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center p-10 py-10">
                  <h2 className="text-5xl py-2 text-violet-50 font-medium md:text-6xl font-serif animate-pulse"> Top Questions ❓</h2>
                  <h3 className="text-2xl py-2 text-pink-200 font-mono">A collection of the best Questions, Topic wise 📑</h3>
                </div>
              </div>


              <div id="item2" className='carousel-item w-full relative'>
                <img className='w-full h-full object-cover opacity-70 rounded-xl drop-shadow-xl' src="https://wallpapercave.com/wp/wp12630136.jpg" alt="Background Image" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center p-10 py-10">
                  <h2 className="text-5xl py-2 text-violet-50 font-medium md:text-6xl font-serif animate-pulse"> Recommender System 💹</h2>
                  <h3 className="text-2xl py-2 text-white font-mono">Consisting of a highly flexible search engine 📑</h3>
                  <p className="text-md py-5 leading-8  text-red-50 max-w-xl mx-auto md:text-xl">
                    Stop wasting time finding the right material 🧐, because here, you have it all<br></br>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-center w-full py-3 gap-2">
              <a href="#item1" className="btn btn-xs">1</a>
              <a href="#item2" className="btn btn-xs">2</a>
            </div>

          </div>
          <br />

         


          <br /><br />


        
          <div className="bg-gradient-to-r from-gray-700 via-slate-800 to-gray-700 rounded-xl p-4 m-4">
            <span className="text-lg  text-slate-100 text-center justify-center items-center">This is the Esteemed collection of coding examples and problems, over the entire internet, topic wise, handpicked for your faster and easier preparation</span>
          </div>
         
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <ul className="books">
                <li className="p-5">
                  <Link to='../default-question-1'>
                  <svg className="max-w-52" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="code-forces"><path fill="#F44336" d="M24 19.5V12a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 18 12v7.5a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5z"></path><path fill="#2196F3" d="M13.5 21a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 13.5 3h-3C9.673 3 9 3.672 9 4.5v15c0 .828.673 1.5 1.5 1.5h3z"></path><path fill="#FFC107" d="M0 19.5c0 .828.673 1.5 1.5 1.5h3A1.5 1.5 0 0 0 6 19.5V9a1.5 1.5 0 0 0-1.5-1.5h-3C.673 7.5 0 8.172 0 9v10.5z"></path></svg>
                    <h3 className="text-md text-white">CF 1921 A</h3>
                  </Link>
                </li>
                <li className="p-5">
                <Link to='../default-question-2'>
                  <svg className="max-w-52" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="code-forces"><path fill="#F44336" d="M24 19.5V12a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 18 12v7.5a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5z"></path><path fill="#2196F3" d="M13.5 21a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 13.5 3h-3C9.673 3 9 3.672 9 4.5v15c0 .828.673 1.5 1.5 1.5h3z"></path><path fill="#FFC107" d="M0 19.5c0 .828.673 1.5 1.5 1.5h3A1.5 1.5 0 0 0 6 19.5V9a1.5 1.5 0 0 0-1.5-1.5h-3C.673 7.5 0 8.172 0 9v10.5z"></path></svg>
                    <h3 className="text-md text-white">CC 117</h3>
                  </Link>
                </li>
                <li className="p-5">
                <Link to='../default-question-3'>
                  <svg className="max-w-52" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="code-forces"><path fill="#F44336" d="M24 19.5V12a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 18 12v7.5a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5z"></path><path fill="#2196F3" d="M13.5 21a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 13.5 3h-3C9.673 3 9 3.672 9 4.5v15c0 .828.673 1.5 1.5 1.5h3z"></path><path fill="#FFC107" d="M0 19.5c0 .828.673 1.5 1.5 1.5h3A1.5 1.5 0 0 0 6 19.5V9a1.5 1.5 0 0 0-1.5-1.5h-3C.673 7.5 0 8.172 0 9v10.5z"></path></svg>
                    <h3 className="text-md text-white">CF 342 A</h3>
                  </Link>
                </li>
                <li className="p-5">
                <Link to='../default-question-4'>
                  <svg className="max-w-52" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="code-forces"><path fill="#F44336" d="M24 19.5V12a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 18 12v7.5a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5z"></path><path fill="#2196F3" d="M13.5 21a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 13.5 3h-3C9.673 3 9 3.672 9 4.5v15c0 .828.673 1.5 1.5 1.5h3z"></path><path fill="#FFC107" d="M0 19.5c0 .828.673 1.5 1.5 1.5h3A1.5 1.5 0 0 0 6 19.5V9a1.5 1.5 0 0 0-1.5-1.5h-3C.673 7.5 0 8.172 0 9v10.5z"></path></svg>
                    <h3 className="text-md text-white">CF 1011 B</h3>
                  </Link>
                </li>
                <li className="p-5">
                  <Link to='../default-question-5'>
                  <svg className="max-w-52" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="code-forces"><path fill="#F44336" d="M24 19.5V12a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 18 12v7.5a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5z"></path><path fill="#2196F3" d="M13.5 21a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 13.5 3h-3C9.673 3 9 3.672 9 4.5v15c0 .828.673 1.5 1.5 1.5h3z"></path><path fill="#FFC107" d="M0 19.5c0 .828.673 1.5 1.5 1.5h3A1.5 1.5 0 0 0 6 19.5V9a1.5 1.5 0 0 0-1.5-1.5h-3C.673 7.5 0 8.172 0 9v10.5z"></path></svg>
                    <h3 className="text-md text-white">CF 208 A</h3>
                  </Link>
                </li>
                
                


             
            </ul>
          )}
          <br />
          <hr />
          <h1 className="text-white text-xl text-center my-10">Global Search Engine</h1>


          <form>
            <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
            <div class="relative">
              <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input type="search" id="default-search"
                class="block w-full p-4 my-3 ps-10 text-sm text-gray-900 
                border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 
                focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 
                dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 
                dark:focus:border-blue-500 h-14" placeholder="Search Problem.."
                onChange={(e) => setSearchTerm(e.target.value)} required />

              <button type="submit" class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
            </div>
          </form>


          {searchTerm !== '' && searchResults.length !== 0 && (
  <div  className=" overflow-hidden">
    <ul style={{ listStyleType: 'none' , margin:'40Px'}}>
      {searchResults.map((item) => (
        <li key={item._id} className="p-2 rounded-xl m-1" style={{ display: 'inline-block', border: '1px solid black',height:'200px',width:'160px', borderRadius: '8px', padding: '10px', backgroundColor: '#DFD0B8' ,margin:'30px'}}>

          <Link to={`../problems/${item.slug}`} style={{ textDecoration: 'none', color: 'black' }}>
          <img
              src={`http://localhost:8000/uploads/${item.thumbnail}`}
              alt={item.title}
              style={{ width: '130px', height: '120px', objectFit: 'cover',marginBottom:'10px' }}
            />
            <h4>{item.title}</h4>
            
          </Link>
        </li>
      ))}
      
    
    </ul>
  </div>
)}
{searchTerm !== '' && searchResults.length === 0 && (
  <div  className=" overflow-hidden">
  <h1> sorry</h1>
  <h1> try this</h1>
    <ul style={{ listStyleType: 'none' , margin:'40Px'}}>
      
      
    <li className="p-5">
                <Link to='../default-question-4'>
                  <svg className="max-w-52" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="code-forces"><path fill="#F44336" d="M24 19.5V12a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 18 12v7.5a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5z"></path><path fill="#2196F3" d="M13.5 21a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 13.5 3h-3C9.673 3 9 3.672 9 4.5v15c0 .828.673 1.5 1.5 1.5h3z"></path><path fill="#FFC107" d="M0 19.5c0 .828.673 1.5 1.5 1.5h3A1.5 1.5 0 0 0 6 19.5V9a1.5 1.5 0 0 0-1.5-1.5h-3C.673 7.5 0 8.172 0 9v10.5z"></path></svg>
                    <h3 className="text-md text-white">CF 1011 B</h3>
                  </Link>
                </li>    
    </ul>
  </div>
)}

                  <br /><br />

                  <hr />
        </section>




      </main>


      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}




    </div>
  )
}

export default Book