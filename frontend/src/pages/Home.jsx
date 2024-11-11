import React, { useEffect } from "react";
// Services
import mainData from "../services/home.js";

const Home = () => {
  useEffect(() => {
    mainData();
  }, []);

  return (
    <div>
      <h1 className="text-blue-600">Index Page</h1>
    </div>
  );
};

export default Home;