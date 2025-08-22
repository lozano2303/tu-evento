import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import MainLayout from "./components/loyout/MainLayout.jsx";


import LadingPage from "./components/views/lading-page.jsx";
import Login from "./components/views/login.jsx";


const App = () => {
  return (
    
      <Routes>
  
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <MainLayout>
              <LadingPage />
            </MainLayout>
          }
        />
      </Routes>
  
  );
};

export default App;