import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-6xl font-bold text-red-500">404</h1>
      <p className="text-xl text-gray-500 mt-4">Oops! Page not found.</p>
      <Link to="/" className="mt-6 px-6 py-2 bg-[#7C35F1] text-white rounded-lg shadow-lg hover:bg-[#5a24b5] transition">
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
