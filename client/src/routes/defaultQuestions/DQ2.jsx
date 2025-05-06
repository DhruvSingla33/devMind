import React, { useState } from 'react'

{/* <div data-theme="synthwave"></div> */}

function DQ2() {
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

            <h1 className='text-red-600 text-4xl'>Codechef Question 1</h1>
            <h2 className='text-cyan-700 py-2 text-xl'>Link for the problem : <a href='https://www.codechef.com/problems/AVOIDWALK?tab=statement' target='_blank' className='text-white hover:text-fuchsia-600'>Go Away, Goose!</a></h2>
            <br /> <br />
            <button className='btn btn-outline btn-success my-5'><h2 className='py-2 text-xl' onClick={toggleEdi}>Editorial</h2></button>
            {visEdi && (<p className='py-4 text-lg'>
            The problem involves a grid with right/down moves and a minimization objective, indicating the use of dynamic programming. Let f(i, j) represent the minimum time to reach cell (i, j). Upon reaching a cell, certain events occur: <br />
            <br />
            <u>A cost of Aij is incurred.</u><br />
            Birds at (i+1, j) and (i, j+1), if present, will attack.<br />
            Birds at (i-1, j) or (i, j-1), if not attacked earlier, will attack based on the direction of movement.<br />
            To accurately compute transitions, additional information is needed:<br />
            <br /><br />
            <span className='font-semibold'>
            When moving right from (i, j-1) to (i, j), has the bird at (i-1, j) attacked (if it exists)?<br />
            When moving down from (i-1, j), has the bird at (i, j-1) attacked (if it exists)?<br />
            States are augmented to include this information, and f(i, j, k) is defined to be the minimum cost to reach (i, j), where:<br />
            </span>
            <br /><br />
            <span className='font-semibold'>
            k = 0: Neither bird at (i-1, j+1) nor (i+1, j-1) exists or has attacked.<br />
            k = 1: The bird at (i-1, j+1) still exists.<br />
            k = 2: The bird at (i+1, j-1) still exists.<br />
            Transitions are computed as follows:<br />
            </span>
            <br /><br />
            <u>Moving rightwards from (i, j-1) to (i, j)</u>:<br />
            <br /><br />
            States (i, j-1, 0) and (i, j-1, 2) result in no extra cost, contributing to (i, j, 0) or (i, j, 1) based on the existence of a bird at (i-1, j+1).<br />
            State (i, j-1, 1) adds an extra K to the cost and contributes to (i, j, 0) or (i, j, 1).<br /><br />
            <u>Moving downwards:</u><br />
            <br />
            States (i-1, j, 0) and (i-1, j, 1) have no extra cost, contributing to (i, j, 0) or (i, j, 2).<br />
            State (i-1, j, 2) adds an extra K and contributes to (i, j, 0) or (i, j, 2).<br />
            This results in O(NM) states and O(1) transitions from each state, leading to an overall solution complexity of O(NM).<br />
            <br />
            </p>)}
            <br />

            <button className='btn btn-outline btn-success' onClick={toggleSol}><h2 className='py-2 text-xl'>Solution</h2></button>
            {visSol && (
                <div className="mockup-code my-6">
                <p data-theme="cyberpunk" className='p-4 m-4 text-lg whitespace-pre-line bg-inherit text-white'>
                    <pre data-prefix="1">for _ in range(int(input())):<br /></pre>
                    <pre data-prefix="2">&nbsp;&nbsp;&nbsp;&nbsp;n, m, k = map(int, input().split())<br /></pre>
                    <pre data-prefix="3">&nbsp;&nbsp;&nbsp;&nbsp;mat = [list(map(int, input().split())) for _ in range(n)]<br /></pre>
                    <pre data-prefix="4">&nbsp;&nbsp;&nbsp;&nbsp;geese = [[0] * (m+2)]<br /></pre>
                    <pre data-prefix="5">&nbsp;&nbsp;&nbsp;&nbsp;geese += [[0] + list(map(int, input())) + [0] for _ in range(n)]<br /></pre>
                    <pre data-prefix="6">&nbsp;&nbsp;&nbsp;&nbsp;geese += [[0] * (m+2)]<br /></pre>
                    <pre data-prefix="7">&nbsp;&nbsp;&nbsp;&nbsp;dp = [[[10**20] * (2) for _ in range(m+1)] for _ in range(n+1)]<br /></pre>
                    <pre data-prefix="8">&nbsp;&nbsp;&nbsp;&nbsp;dp[1][1][0] = 0<br /></pre>
                    <pre data-prefix="9">&nbsp;&nbsp;&nbsp;&nbsp;dp[1][1][1] = 0<br /></pre>
                    <pre data-prefix="10">&nbsp;&nbsp;&nbsp;&nbsp;for i in range(n):<br /></pre>
                    <pre data-prefix="11">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;for j in range(m):<br /></pre>
                    <pre data-prefix="12">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if i == j == 0: continue<br /></pre>
                    <pre data-prefix="13">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;dp[i+1][j+1][0] = mat[i][j] + min(dp[i+1][j][1], dp[i+1][j][0] + k * (geese[i][j+1])) + k * (geese[i+2][j+1] + geese[i+1][j+2]) &nbsp;<br /></pre>
                    <pre data-prefix="14">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;dp[i+1][j+1][1] = mat[i][j] + min(dp[i][j+1][0], dp[i][j+1][1] + k * (geese[i+1][j])) + k * (geese[i+2][j+1] + geese[i+1][j+2]) &nbsp;<br /></pre>
                    <pre data-prefix="15">&nbsp;&nbsp;&nbsp;&nbsp;print(min(dp[-1][-1][0], dp[-1][-1][1]))<br /></pre>
                </p>
                </div>

                )}

        </main>

    </div>
  )
}

export default DQ2;