import React from 'react';
import Nav from './Nav';      
import Footer from './Footer';  


const MainLayout = ({ children }) => {
  return (
   
    
    <div>
      {/* Componente de navegación global */}
      <header>
        <Nav />
      </header>

     
      <main >
        {children} 
      </main>
      
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default MainLayout;