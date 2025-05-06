import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import Fuse from 'fuse.js';


const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const baseUrl = "http://localhost:8000/api/books";
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  

  const curr = user ? user.name : "";
  const newData = data.filter((item) => item.username === curr);
  const fuse = new Fuse(newData, { keys: ['title'], includeScore: true });
//   console.log(curr);

  
  useEffect(() => {
    if (searchTerm !== '') {
        const results = fuse.search(searchTerm);
        setSearchResults(results.map((result) => result.item));
      } 

    const fetchData = async () => {
        try {
            const response = await fetch(baseUrl);
            if(!response.ok) {
                throw new Error("Error fetching book data for profile section");
            }
            const jsonData = await response.json();
            setData(jsonData);
        } catch (error) {
            console.log(error);
            // isLoading(false);
        }
    }

    fetchData();
  }, [searchTerm])


  
  // Show the profile information only if the user is authenticated and not loading
  return !isLoading && isAuthenticated && (
    <div className=" text-center py-16 overflow-auto">
    <h1 className="text-white text-xl font-serif text-center my-10">Local Search Engine</h1>

    <div className="text-left p-10 max-h-96 overflow-hidden">
        <form>
        <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
        <div class="relative">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
            </svg>
            </div>
            <input type="search" id="default-search"
            class="block w-full p-4 my-3 ps-10 text-sm max-h-14 text-gray-900 
            border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 
            focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 
            dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 
            dark:focus:border-blue-500 h-14" placeholder="Search Problem.."
            onChange={(e) => setSearchTerm(e.target.value)} required />

            <button type="submit" class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
        </div>
        </form>


        {searchTerm !== '' && (
        <div className="max-h-32 overflow-hidden">
            <ul >
            {searchResults.map((item) => (
                <li key={item._id} className="p-2 rounded-xl m-1 ">
                <Link to={`../problems/${item.slug}`}>
                    <h4>{item.title}</h4>
                </Link>
                </li>
            ))}
            </ul>
        </div>
        )}
    </div>
    <h1 className="text-5xl py-7 font-serif">Personal Details</h1>
      {/* <img src={user.picture} alt={user.name} className="items-center justify-center m-auto py-12 w-2/12 rounded-full" /> */}
      <h2 className="font-serif text-2xl py-4">{user.name}</h2>
      <p className="font-serif text-lg py-4">{user.email}</p>
       
        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}

        {/* <div className="border-stone-50"></div> */}
        <br />

        

        <hr />
        <br /><br />
        {/* <h1 className="py-10 text-white text-4xl">Favourite Questions</h1> */}
        <br />
        {/* <h1 className="text-yellow-200 text-lg">5 star rated Books</h1><br /><br />
        <div className="p-4">
        <ul className="books">
            {newData.map((book) => {
                if(book.stars === 5) {
                    return (
                        
                        <li key={book._id}>
                        
                        <Link to={`/problems/${book.slug}`}>
                            <img src={`http://localhost:8000/uploads/${book.thumbnail}`} />
                            <h3 className="text-md text-white">{book.title}</h3>
                        </Link>
                    </li>
                    
                    )
                }
            })}
        </ul>

        <h1 className="text-yellow-200 text-lg">4 star rated Books</h1><br /><br />
        <ul className="books overflow-hidden">
            {newData.map((book) => {
                if(book.stars === 4) {
                    return (
                        
                        <li key={book._id}>
                        
                        <Link to={`/problems/${book.slug}`}>
                            <img src={`http://localhost:8000/uploads/${book.thumbnail}`} />
                            <h3 className="text-md text-white">{book.title}</h3>
                        </Link>
                    </li>
                    
                    )
                }
            })}
        </ul>
        </div> */}


    </div>
  );
};

export default Profile;