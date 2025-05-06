import React, { useState } from 'react'

{/* <div data-theme="synthwave"></div> */}

function DQ5() {
    const [visEdi, setVisEdi] = useState(false);
    const [visSol, setVisSol] = useState(false);

    const toggleEdi = () => {
        setVisEdi(!visEdi);
        // visEdi = !visEdi;
    }
    const toggleSol = () => {
        setVisSol(!visSol);
    }


  return (
    <div data-theme="synthwave">

        <main className=' p-20'>

            <h1 className='text-red-600 text-4xl'>Codeforces Question 4</h1>
            <h2 className='text-cyan-700 py-2 text-xl'>Link for the problem : <a href='https://codeforces.com/problemset/problem/208/A' target='_blank' className='text-white hover:text-fuchsia-600'>Dubstep</a></h2>
            <br /> <br />
            <button className='btn btn-outline btn-success my-5'><h2 className='py-2 text-xl' onClick={toggleEdi}>Editorial</h2></button>
            {visEdi && (<p className='py-4 text-lg'>
            This problem is technical. First, you should erase all occurrences or word WUB in the beginning and in the end of the string. And then parse the remaining string separating tokens by word WUB. 
            <br/><br/>Empty tokens should be also erased. Given string was rather small, you can realize the algorithm in any way.
            </p>)}
            <br />

            <button className='btn btn-outline btn-success' onClick={toggleSol}><h2 className='py-2 text-xl'>Solution</h2></button>
            {visSol && (
                <div className="mockup-code my-6">
                    <p className='py-4 text-lg whitespace-pre-line bg-inherit text-white'>
                        <pre data-prefix="1">s = input()</pre>
                        <pre data-prefix="2">n = len(s)</pre>
                        <pre data-prefix="3">if n == 1 or n == 2:</pre>
                        <pre data-prefix="4">&nbsp;&nbsp;&nbsp;&nbsp;print(s)</pre>
                        <pre data-prefix="5">&nbsp;&nbsp;&nbsp;&nbsp;exit()</pre>
                        <pre data-prefix="6">rn = []</pre>
                        <pre data-prefix="7">for i in range(n-2):</pre>
                        <pre data-prefix="8">&nbsp;&nbsp;&nbsp;&nbsp;if s[i:i+3] == "WUB":</pre>
                        <pre data-prefix="9">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;rn.append([i, i+3])</pre>
                        <pre data-prefix="10"># print(rn)</pre>
                        <pre data-prefix="11">ans = []</pre>
                        <pre data-prefix="12">if not rn:</pre>
                        <pre data-prefix="13">&nbsp;&nbsp;&nbsp;&nbsp;print(s)</pre>
                        <pre data-prefix="14">&nbsp;&nbsp;&nbsp;&nbsp;exit()</pre>
                        <pre data-prefix="15">if rn[0][0] != 0:</pre>
                        <pre data-prefix="16">&nbsp;&nbsp;&nbsp;&nbsp;ans.append(s[:rn[0][0]])</pre>
                        <pre data-prefix="17">for i in range(1, len(rn)):</pre>
                        <pre data-prefix="18">&nbsp;&nbsp;&nbsp;&nbsp;if rn[i][0] != rn[i-1][1]:</pre>
                        <pre data-prefix="19">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ans.append(s[rn[i-1][1]:rn[i][0]])</pre>
                        <pre data-prefix="20">if n != rn[-1][-1]:</pre>
                        <pre data-prefix="21">&nbsp;&nbsp;&nbsp;&nbsp;ans.append(s[rn[-1][-1]:n])</pre>
                        <pre data-prefix="22">print(" ".join(ans))</pre>
                    </p>
                </div>
            )}

        </main>

    </div>
  )
}

export default DQ5;