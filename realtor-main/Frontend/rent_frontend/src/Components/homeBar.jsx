import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
    return (
<div className="flex items-center justify-between bg-blue-500 p-2">
  <h1 className='font-bold text-sm sm:text-xl text-white flex items-center'>
    <span className='text-white'>Rent_Easy</span>
  </h1>
  <nav className="flex text-sm m-2">
    <Link to="/login" className="text-sm text-white hover:text-black">
      Already have an account?
    </Link>
  </nav>
</div>

    );
 }
 export default Navbar;