import React, { useState } from 'react'

{/* <div data-theme="synthwave"></div> */}

function DQ1() {
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

            <h1 className='text-red-600 text-4xl'>Codeforces Question 1</h1>
            <h2 className='text-cyan-700 py-2 text-xl'>Link for the problem : <a href='https://codeforces.com/contest/1921/problem/A' target='_blank' className='text-white hover:text-fuchsia-600'>Square</a></h2>
            <br /> <br />
            <button className='btn btn-outline btn-success my-5'><h2 className='py-2 text-xl' onClick={toggleEdi}>Editorial</h2></button>
            {visEdi && (<p className='py-4 text-lg'>
            There are many ways to solve this problem, the simplest way is as follows. Let's find the minimum and maximum coordinate x
            among all the corners of the square. The difference of these coordinates will give us the length of the square side d=xmax−xmin
            . After that, we can calculate the area of the square as s=d2
            .
            </p>)}
            <br />

            <button className='btn btn-outline btn-success' onClick={toggleSol}><h2 className='py-2 text-xl'>Solution</h2></button>
            {visSol && (
                <div className="mockup-code my-6">
                    <p data-theme="cyberpunk" className='py-4 text-lg whitespace-pre-line bg-inherit text-white'>
                    <pre data-prefix="1">t = int(input()) <br /></pre>
                    <pre data-prefix="2">for _ in range(t): <br /></pre>
                    <pre data-prefix="3">&nbsp;&nbsp;&nbsp;&nbsp;a = [[int(x) for x in input().split()] for i in range(4)]<br /></pre>
                    <pre data-prefix="4">&nbsp;&nbsp;&nbsp;&nbsp;x = [p[0] for p in a]<br /></pre>
                    <pre data-prefix="5">&nbsp;&nbsp;&nbsp;&nbsp;dx = max(x) - min(x)<br /></pre>
                    <pre data-prefix="6">&nbsp;&nbsp;&nbsp;&nbsp;print(dx * dx)</pre>
                    </p>
                </div>)}

        </main>

    </div>
  )
}

export default DQ1