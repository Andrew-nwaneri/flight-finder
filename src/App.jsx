import Home from './pages/home';
import Book from './pages/book';
import Favourites from './pages/favourites';
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/navbar';


function App() {
  return(
    <div>
      <NavBar />
      <main>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/favourites' element={<Favourites />} />
          <Route path='/book' element={<Book />} />
        </Routes>
      </main>
    </div>
    
  );
}

export default App;
