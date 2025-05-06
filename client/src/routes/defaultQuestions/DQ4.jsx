import React, { useState } from 'react'

{/* <div data-theme="synthwave"></div> */}

function DQ4() {
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

            <h1 className='text-red-600 text-4xl'>Codeforces Question 3</h1>
            <h2 className='text-cyan-700 py-2 text-xl'>Link for the problem : <a href='https://codeforces.com/contest/1011/problem/B' target='_blank' className='text-white hover:text-fuchsia-600'>Planning The Expedition</a></h2>
            <br /> <br />
            <button className='btn btn-outline btn-success my-5'><h2 className='py-2 text-xl' onClick={toggleEdi}>Editorial</h2></button>
            {visEdi && (<p className='py-4 text-lg'>
            Let "ci" represent the number of food packages equal to "i." Calculate the array "c." <br/><br/>

            For any "d," we can determine the maximum number of people "k" who can participate in the expedition for "d" days. To achieve this, iterate through all elements of the array "c." Let "ci" be the current element. If "ci" is greater than or equal to "d," decrease "ci" by "d" and increase "k" by 1. This means taking "d" daily food packages for one person. <br/>
            <br/>If "ci" is still greater than or equal to "d," repeat the algorithm. For the "i"-th iteration, the number "k" increases by ⌊ci/d⌋. After all iterations, the final "k" will be the required number of people.<br/>
            <br/>
            It is evident that the answer does not exceed "m" (as at least one food package is used every day).<br/><br/>

            Iterate "d" from "m" to "1," checking whether the answer can be equal to "d." To do this, calculate the maximum number of people "k" who can participate in the expedition for "d" days. If "k" is greater than or equal to "n," then the answer is "d." If no answer is obtained in any iteration, the answer is 0.
            <br/><br/>
            Complexity: O(m^2).
            <br/>
            </p>)}
            <br />

            <button className='btn btn-outline btn-success' onClick={toggleSol}><h2 className='py-2 text-xl'>Solution</h2></button>
            {visSol && (
                <div className="mockup-code my-6">
                <p className='py-4 text-lg whitespace-pre-line bg-inherit text-white'>
                    <pre data-prefix="1">from collections import Counter</pre>
                    <pre data-prefix="3">def solve():</pre>
                    <pre data-prefix="4">&nbsp;&nbsp;&nbsp;&nbsp;n, k = map(int, input().split())</pre>
                    <pre data-prefix="5">&nbsp;&nbsp;&nbsp;&nbsp;a = [*map(int, input().split())]</pre>
                    <pre data-prefix="6">&nbsp;&nbsp;&nbsp;&nbsp;c = list(Counter(a).values())</pre>
                    <pre data-prefix="7">&nbsp;&nbsp;&nbsp;&nbsp;# print(c)</pre>
                    <pre data-prefix="8">&nbsp;&nbsp;&nbsp;&nbsp;for i in range(101, 0, -1):</pre>
                    <pre data-prefix="9">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if sum(x//i for x in c) &gt;= n:</pre>
                    <pre data-prefix="10">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;print(i)</pre>
                    <pre data-prefix="11">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return</pre>
                    <pre data-prefix="12">&nbsp;&nbsp;&nbsp;&nbsp;print(0)</pre>
                    <pre data-prefix="14">solve()</pre>
                </p>
                </div>
                )}

        </main>

    </div>
  )
}

export default DQ4;