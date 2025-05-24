import React from 'react';
import { motion } from 'framer-motion';
import { FaCode, FaUsers, FaProjectDiagram } from 'react-icons/fa';
import { BsTwitterX } from "react-icons/bs";
import img1 from "./971.jpg";

function Home() {
  const features = [
    {
      icon: <FaCode />,
      title: 'Algorithm Visualizer',
      desc: 'Understand algorithms with interactive visuals.',
    },
    {
      icon: <FaUsers />,
      title: 'Community Forum',
      desc: 'Collaborate with peers and mentors.',
    },
    {
      icon: <FaProjectDiagram />,
      title: 'Code Compiler',
      desc: 'Write and run HTML/CSS/JS in-browser.',
    },
  ];

  return (
    <div data-theme="dark">
      <main className='px-4 md:px-10'>
        <section className="min-h-screen">
          {/* Hero Section */}
          <div className='relative py-10 mb-12 w-full h-screen flex justify-between bg-local hover:bg-fixed'>
            <img className='w-full h-full object-cover opacity-50 rounded-xl drop-shadow-xl' src={img1} alt="Background" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center p-10 py-10">
              <h2 className="text-5xl py-2 text-violet-50 font-medium md:text-6xl font-serif animate-pulse">
                DevMind 🎯
              </h2>
              <h3 className="text-2xl py-2 text-green-200 font-mono">
                Empowering Minds: Learn, Grow.📑
              </h3>
              <p className="text-md py-5 leading-8 text-red-100 max-w-xl mx-auto md:text-xl">
                A powerful platform to solve problems, visualize algorithms, and grow as a developer.
                Empowering students and mentors through coding, collaboration, and innovation.
              </p>
            </div>
          </div>

      

          {/* Features Section */}
          <div className='my-10 px-4 md:px-10'>
            <h3 className="text-3xl text-cyan-400 font-bold mb-6 text-center">Key Features 🚀</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  className="bg-gradient-to-br from-indigo-800 to-slate-900 p-6 rounded-2xl shadow-lg text-white"
                >
                  <div className="text-3xl mb-4 text-green-300">{f.icon}</div>
                  <h4 className="text-xl font-semibold mb-2">{f.title}</h4>
                  <p className="text-sm text-cyan-200">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-pink-900 to-purple-900 rounded-xl text-center p-10 my-16">
            <h3 className="text-3xl md:text-4xl font-bold text-yellow-200 mb-4 animate-bounce">
              Ready to Empower Your Dev Journey?
            </h3>
            <p className="text-md md:text-xl text-pink-200 mb-6">
              Join DevMinds today and take control of your learning adventure!
            </p>
            {/* <button className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-full shadow-md transition duration-300">
              Get Started
            </button> */}
          </div>

          
         
        </section>
      </main>
    </div>
  );
}

export default Home;
