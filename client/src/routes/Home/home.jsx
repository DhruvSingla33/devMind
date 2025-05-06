import React from 'react'
// import {BsFillMoonStarsFill, BsBrightnessHigh} from 'react-icons/bs';
import {
  AiFillTwitterCircle,
  
  AiFillLinkedin,
  AiFillRedditCircle,
  AiFillGithub,
} from "react-icons/ai";
import { BsTwitterX } from "react-icons/bs";
import img1 from "./971.jpg"
import gg from "./ddf.jpg"
import gg1 from "./dfk.jpg"

function Home() {



  return (
    <div data-theme="dark">

    <main className='px-10 '>
      
      <section className="min-h-screen ">
        {/* <nav className='py-10 mb-12 flex justify-between bg-local hover:bg-fixed'>
          Hello

        </nav> */}
        <div className='relative py-10 mb-12 w-full h-screen flex justify-between bg-local hover:bg-fixed '>
          <img className='w-full h-full object-cover opacity-50 rounded-xl drop-shadow-xl' src={img1} alt="Background Image"/>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center p-10 py-10">
            <h2 className="text-5xl py-2 text-violet-50 font-medium md:text-6xl font-serif animate-pulse"> DevMind 🎯</h2>
            <h3 className="text-2xl py-2 text-green-200 font-mono">Empowering Minds: Learn, Grow.📑</h3>
            <p className="text-md py-5 leading-8  text-red-100 max-w-xl mx-auto md:text-xl">
            Fostering personalized learning journeys by empowering users to create, store, and practice concepts, alongside tailored quizzes for comprehensive knowledge reinforcement 💹
            </p>
            <div className="text-5xl flex justify-center gap-16 py-1 my-1 text-gray-600 dark:text-gray-400">
              <a href='https://twitter.com' target='_blank' className='cursor-pointer hover:text-black'><BsTwitterX /></a>
              <a href='https://linkedin.com' target='_blank' className='cursor-pointer hover:text-sky-700'><AiFillLinkedin/></a>
              <a href='https://github.com' target='_blank' className='cursor-pointer hover:text-black'><AiFillGithub/></a>
            </div>  
          </div>
        </div>

          <div className='bg-gradient-to-r from-indigo-950 to-slate-950 rounded-xl my-10 p-2'>
            <p className="text-md py-5 text-right leading-8  text-cyan-300 max-w-xl mx-auto md:text-xl font-mono">
            We endeavor to assist users in crafting their learning path through personalized concept storage, practice features, and tailored quizzes, fostering continuous growth. 💗
            </p>
          </div>


          <div className='bg-gradient-to-r from-purple-900 to-gray-900 rounded-xl my-10 p-6'>
        <p className="text-lg text-green-400 py-2 leading-7 px-10 md:text-xl font-serif">
            At DevMinds, we're dedicated to revolutionizing learning experiences.<br /><br /> Our platform enables users to personalize their educational journey by creating, storing, and managing concepts and problems. Utilizing our intuitive database, users can track their progress and access similar questions posted by other users, fostering a collaborative learning environment.<br /><br /> Additionally, we offer targeted practice by suggesting relevant questions and concepts to aid in skill mastery.
        </p>
        </div>
        <h1><a href='http://youtube.com'>youtube</a></h1>

        {/* <h1><a href='http://localhost:5000/data' target='_blank'>Click Here</a></h1> */}



        


      </section>


      </main>

    </div>
  )
}

export default Home;