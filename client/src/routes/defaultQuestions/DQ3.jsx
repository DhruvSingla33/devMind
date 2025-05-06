import React, { useState } from 'react'

{/* <div data-theme="synthwave"></div> */}

function DQ3() {
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

            <h1 className='text-red-600 text-4xl'>Codeforces Question 2</h1>
            <h2 className='text-cyan-700 py-2 text-xl'>Link for the problem : <a href='https://codeforces.com/contest/342/problem/A' target='_blank' className='text-white hover:text-fuchsia-600'>Xenia and Divisors</a></h2>
            <br /> <br />
            <button className='btn btn-outline btn-success my-5'><h2 className='py-2 text-xl' onClick={toggleEdi}>Editorial</h2></button>
            {visEdi && (<p className='py-4 text-lg'>
            In this problem you should guess that exists only three valid groups of three<br/>

            1, 2, 4<br/>

            1, 2, 6<br/>

            1, 3, 6<br/>

            (You can see that integers 5 and 7 are bad).<br/>

            So, we will greedy take these groups of three. If some integers will be not used, the answer is -1. In other case, print found answer.<br/>
            </p>)}
            <br />

            <button className='btn btn-outline btn-success' onClick={toggleSol}><h2 className='py-2 text-xl'>Solution</h2></button>
            {visSol && (
                <div className="mockup-code my-6">
                <p className='py-4 text-lg whitespace-pre-line bg-inherit text-white'>
                    <pre data-prefix="1">n = int(input())</pre>
                    <pre data-prefix="2">a = list(map(int, input().split()))</pre>
                    <pre data-prefix="3"># 1 2 4</pre>
                    <pre data-prefix="4"># 1 2 6</pre>
                    <pre data-prefix="5"># 1 3 6</pre>
                    <pre data-prefix="6">a1, a2, a3, a4, a6 = 0, 0, 0, 0, 0</pre>
                    <pre data-prefix="7">for i in range(n):</pre>
                    <pre data-prefix="8">&nbsp;&nbsp;&nbsp;&nbsp;if a[i] == 1: a1 += 1</pre>
                    <pre data-prefix="9">&nbsp;&nbsp;&nbsp;&nbsp;elif a[i] == 2: a2 += 1</pre>
                    <pre data-prefix="10">&nbsp;&nbsp;&nbsp;&nbsp;elif a[i] == 3: a3 += 1</pre>
                    <pre data-prefix="11">&nbsp;&nbsp;&nbsp;&nbsp;elif a[i] == 4: a4 += 1</pre>
                    <pre data-prefix="12">&nbsp;&nbsp;&nbsp;&nbsp;elif a[i] == 6: a6 += 1</pre>
                    <pre data-prefix="13">if a1 != n//3:</pre>
                    <pre data-prefix="14">&nbsp;&nbsp;&nbsp;&nbsp;print(-1)</pre>
                    <pre data-prefix="15">&nbsp;&nbsp;&nbsp;&nbsp;exit()</pre>
                    <pre data-prefix="16">arr = []</pre>
                    <pre data-prefix="17">for _ in range(min(a2,a4)):</pre>
                    <pre data-prefix="18">&nbsp;&nbsp;&nbsp;&nbsp;arr.append([1, 2, 4])</pre>
                    <pre data-prefix="19">for _ in range(min(a6,a2-a4)):</pre>
                    <pre data-prefix="20">&nbsp;&nbsp;&nbsp;&nbsp;arr.append([1,2,6])</pre>
                    <pre data-prefix="21">for _ in range(min(a3,a6-min(a6,a2-a4))):</pre>
                    <pre data-prefix="22">&nbsp;&nbsp;&nbsp;&nbsp;arr.append([1,3,6])</pre>
                    <pre data-prefix="23">ans = []</pre>
                    <pre data-prefix="24">for x in arr:</pre>
                    <pre data-prefix="25">&nbsp;&nbsp;&nbsp;&nbsp;ans.extend(x)</pre>
                    <pre data-prefix="26">if sorted(ans) != sorted(a):</pre>
                    <pre data-prefix="27">&nbsp;&nbsp;&nbsp;&nbsp;print(-1)</pre>
                    <pre data-prefix="28">&nbsp;&nbsp;&nbsp;&nbsp;exit()</pre>
                    <pre data-prefix="29">for ar in arr:</pre>
                    <pre data-prefix="30">&nbsp;&nbsp;&nbsp;&nbsp;print(*ar)</pre>
                </p>
                </div>
            )}

        </main>

    </div>
  )
}

export default DQ3;