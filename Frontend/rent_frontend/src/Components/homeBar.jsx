import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
    return (
        <div className="flex flex-1 justify-end bg-blue-500">
        <nav className="flex text-sm m-2">
          <Link to="/login" className="text-sm text-white hover:text-black">
            Already have an account?
          </Link>
        </nav>
      </div>
    );
 }
 export default Navbar;