import React from "react";

const items = [
  { name: "Home", link: "/" },
  { name: "About", link: "/about" },
  { name: "Contact", link: "/contact" },
];

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-4  shadow-md">
      
      {/* Logo */}
      <h1 className="text-2xl font-bold">CryptoCoinPrediction</h1>

      {/* Menu Links */}
      <div className="flex gap-6">
        {items.map((item) => (
          <a
            key={item.link}
            href={item.link}
            className="text-lg font-medium hover:text-blue-500"
          >
            {item.name}
          </a>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button className="px-4 py-2 border rounded-md hover:bg-gray-100 hover:border-gray-300 hover:text-black">
          Sign Up
        </button>
        <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
          View Graph
        </button>
      </div>

    </nav>
  );
};

export default Navbar;