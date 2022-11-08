// import React, { useEffect } from 'react';
import ContextPane from './components/ContextPane';
import Header from './components/Header';
import Map from './components/Map';

function App() {
  return <div>
    <Header />
    <main>
      <ContextPane />
      <Map />
    </main>
  </div>
}

export default App;
