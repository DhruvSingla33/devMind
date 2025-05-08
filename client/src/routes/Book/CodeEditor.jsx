import { useRef, useState } from "react";
import { Box, HStack } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import axios from 'axios';
import { Link, useParams } from "react-router-dom";

const CodeEditor = (props) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const input=props.data1;
  const output=props.data2;
 const { id}= useParams(); 
  const intialcode =props.data3;
  console.log("hello");
  console.log(intialcode);

  const editorRef = useRef();
  const [value, setValue] = useState(props.data3 || "");

  const [testCaseResults, setTestCaseResults] = useState([]);

  const checkCode = () => {
    console.log(value);
    
    axios
      .post(`${API_BASE_URL}/python`, { value,input,output, id})
      .then(({ data }) => {
        console.log(data.testCaseResults);
        setTestCaseResults(data.testCaseResults);
        console.log(data.testCaseResults);
      })
      .catch((err) => console.log(err));
  };

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

 

  return (
    <Box>
      <HStack spacing={4}>
        <Box w="100%">
          <div >
          <div className="flex space-x-2">
          {testCaseResults.map((res, i) => (
            <div key={i}>
            {res ? `✅ Test case ${i + 1} passed` : `❌ Test case ${i + 1} failed`}
            </div>
              ))}

          </div>
          <Editor
            options={{
              minimap: {
                enabled: false,
              },
            }}
            height="75vh"
            weidth="100px"
            theme="vs-dark"
            language="python"
            onMount={onMount}
            value={value}
            onChange={(value) => setValue(value)}
          />
           <div
            onClick={() => checkCode()}
            className="border-2 p-2 bg-green-600"
          >
            Submit Code
          </div>
          {/* <h1> {value}</h1> */}
           </div>
        </Box>
       
      </HStack>
    </Box>
  );
};
export default CodeEditor;
