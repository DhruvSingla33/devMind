import React, { useState } from "react";

const Generate_mockup_code = () => {
  const [inputCode, setInputCode] = useState("");
  const [outputCode, setOutputCode] = useState("");

  const generateMockupCode = () => {
    // Your logic for processing and formatting the input code goes here
    // For simplicity, let's just wrap each line in a <pre> tag

    const lines = inputCode.split("\n");
    const formattedCode = lines.map(
      (line, index) => `<pre data-prefix="${index + 1}">${line}</pre>`
    );

    const mockupCode = `
      <div className="mockup-code my-6">
        <p className='py-4 text-lg whitespace-pre-line bg-inherit text-white'>
          ${formattedCode.join("\n")}
        </p>
      </div>
    `;

    setOutputCode(mockupCode);
  };

  return (
    <div>
      <textarea
        rows={10}
        cols={80}
        value={inputCode}
        onChange={(e) => setInputCode(e.target.value)}
      />
      <button onClick={generateMockupCode}>Generate Mockup</button>

      <div>
        <h2>Generated Mockup Code:</h2>
        <div dangerouslySetInnerHTML={{ __html: outputCode }} />
      </div>
    </div>
  );
};

export default Generate_mockup_code;
