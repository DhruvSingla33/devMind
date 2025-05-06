import React from 'react'
import DataProvider from './context/DataProvider';
import Home1 from './components/Home';
const App2 = () => {
  return (
    <div  style={{ marginTop: '100px' }}>
    <DataProvider>    
    <Home1/>
  </DataProvider>
  </div>
  )
}

export default App2;
