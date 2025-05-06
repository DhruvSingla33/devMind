import React, { useEffect, useState } from 'react'

function Recommendation() {
    const [data, setData] = useState([]);
    const baseUrl = "http://localhost:8000/api/books";

    useEffect(() => {

        const fetchData = async () => {
            try {
                const response = await fetch(baseUrl);
                if(!response.ok) {
                    throw new Error("Error fetching data for rec system");
                }
                const jsonData = await response.json();
                setData(jsonData);
            } catch (error) {
                console.log(error);
            }
        }
        fetchData();


    }, [])



  return (
    <main>
        <div className='py-10 mx-auto text-center justify-center items-center'>

        <h1 className='text-2xl my-2 whitespace-pre-line text-white py-10 font-serif '>Recommendation System</h1> <br />
        <div className='carousel w-full max-h-[500px] relative'>

            <div id="item1" className='carousel-item w-full relative p-4'>
                <img className='w-full h-full rounded-xl contrast-150' src='https://wallpapercave.com/wp/wp13364331.png' />
                <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center p-10 py-10'>
                <h2 className="text-5xl py-2 text-violet-50 font-medium md:text-6xl font-serif animate-pulse"> Recommendation 💹</h2>
                  <h3 className="text-2xl py-2 text-white font-mono">Made using ML algorithms 🤖</h3>
                </div>
            </div>

        </div>

        

        </div>
        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </main>
  )
}

export default Recommendation