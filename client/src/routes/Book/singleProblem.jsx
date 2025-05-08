import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import { useAuth0 } from "@auth0/auth0-react";
import Codeeditor from "./CodeEditor";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
const customMaterialDark = {
  ...materialDark,
  'span.token': {
    color: '#fff', // Set the text color to white
  },
};




function singleProblem () {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const [data, setData] = useState([]);
    const [outputCode, setOutputCode] = useState([]);
    const { user, isAuthenticated, isLoading } = useAuth0();
    const curr = user ? user.name : "";
    const j=data.username;
    console.log(data.username);
    const areEqual = j===curr;

    const [visibleCode, setIsVisibleCode] = useState(false);
    const [visibleEditorial, setVisibleEditorial] = useState(false);

    const toggleVisibility = () => {
      setIsVisibleCode(!visibleCode);
    }

    const toggleVisibilityEditorial = () => {
      setVisibleEditorial(!visibleEditorial);
    }

    const generateMockupCode = (inputCode) => {
      const lines = inputCode.split("\n");
      const formattedCode = lines.map(
        (line, index) => <pre key={index + 1} data-prefix={index + 1}>{line}</pre>
      );
  
      return (
        <>
        <br />
        <button className="btn btn-outline btn-info p-4 m-4 font-bold" onClick={toggleVisibility}>
          {visibleCode ? "Hide Content" : "Show content"}
        </button>
        {visibleCode && 
        (<div className="mockup-code my-6">
          
          <p className='py-4 text-lg whitespace-pre-line bg-inherit text-white'>
          
            {formattedCode}
          </p>
        </div>)}
        </>
      );
    };


  


    const { id}= useParams(); // ye path mai konse parameters hai. konse path mai?
    const baseUrl = `${API_BASE_URL}/api/problems/${id}`;


    useEffect(() => {
        const fetchData = async () => {
            try {

                const response = await fetch(baseUrl);
                if(!response.ok) {
                    throw new Error("Error fetching book");
                }

                const jsonData = await response.json();
                setData(jsonData);
                console.log(data);
                console.log(data.intialcode);
                console.log("hdjdjjdjd");
                
            } catch (error) {
                console.log(error);
            }
        }
        fetchData();
    }, [])

    function StarRating({ num }) {
        const stars = [];
        for(let i = 0; i < num; ++i) {
            stars.push(<span key={i}>⭐</span>)
        }
        return <div>Rating: {stars}</div>
    }


    return (
      <main className="py-10 px-6  mx-auto text-white font-sans " >
  <div className="flex flex-col lg:flex-row gap-10 mt-16">
    
    {/* Left Column - 50% width */}
    <div className="w-full lg:w-1/2 space-y-6">
      <div className="bg-slate-900 p-6 rounded-xl shadow-md">
        <h1 className="text-4xl font-bold text-amber-300">{data?.title}</h1>
        <p className="text-slate-200 mt-4 whitespace-pre-line">{data?.description}</p>

        <div className="mt-6 space-y-3">
          <div>
            <h2 className="text-lg text-slate-400">Testcase Input</h2>
            <p className="text-slate-100">{data?.input}</p>
          </div>
          <div>
            <h2 className="text-lg text-slate-400">Expected Output</h2>
            <p className="text-slate-100">{data?.output}</p>
          </div>
          <div className="text-slate-100">
            <StarRating num={data?.stars} />
          </div>
        </div>
      </div>

      {/* Testcases */}
      {data?.testcases?.length > 0 && (
        <div className="bg-slate-900 p-6 rounded-xl shadow-md">
          <h2 className="text-xl text-slate-400 mb-4">All Test Cases</h2>
          <div className="space-y-3">
            {data.testcases.map((testcase, index) => (
              <div key={index} className="bg-slate-800 p-4 rounded-md">
                <p className="text-amber-300 font-semibold">Testcase {index + 1}</p>
                <p><span className="text-emerald-300">Input:</span> {testcase.input}</p>
                <p><span className="text-pink-300">Output:</span> {testcase.output}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category */}
      <div className="bg-slate-900 p-6 rounded-xl shadow-md">
        <h2 className="text-lg text-slate-400 mb-2">Category</h2>
        <ul className="list-disc list-inside text-amber-300 space-y-1">
          {data?.category?.map((item, index) => (
            <li key={index}>{item.charAt(0).toUpperCase() + item.substr(1)}</li>
          ))}
        </ul>
      </div>

      {/* Editorial */}
      <div className="bg-slate-900 p-6 rounded-xl shadow-md">
        <button
          className="btn btn-outline btn-info font-bold transition duration-200 hover:scale-105"
          onClick={toggleVisibilityEditorial}
        >
          {visibleEditorial ? "Hide Editorial" : "Show Editorial"}
        </button>
        <div className="mt-4 text-orange-400">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={customMaterialDark}
                    language={match[1]}
                    PreTag="div"
                    children={String(children).replace(/\n$/, '')}
                    {...props}
                  />
                ) : generateMockupCode(children);
              },
              strong: ({ node, ...props }) => <strong style={{ fontWeight: 'bold' }} {...props} />,
            }}
          >
            {visibleEditorial && data?.solution}
          </ReactMarkdown>
        </div>
      </div>
    </div>

    {/* Right Column - 50% width */}
    <div className="w-full lg:w-1/2 space-y-6">
      {/* <div className="bg-slate-900 p-6 rounded-xl shadow-md">
        <h2 className="text-xl text-white mb-2 font-semibold">Author</h2>
        <p className="text-slate-300">{data.username}</p>
        {isAuthenticated && areEqual && (
          <Link to={`/editproblem/${data.slug}`} className="inline-block mt-4 text-info hover:underline text-lg">
            ✏️ Edit This Problem
          </Link>
        )}
      </div> */}

      {data.intialcode && (
        <div className="bg-slate-900 p-4 rounded-xl shadow-md">
          <Codeeditor
            data1={data.input}
            data2={data.output}
            data3={data.intialcode}
          />
        </div>
      )}
    </div>
  </div>
</main>

    
      );

}

export default singleProblem;