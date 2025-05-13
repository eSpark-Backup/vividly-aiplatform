import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/log-in");
    }, 1000);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="relative flex flex-col items-center">
        {/* Logo */}
        <motion.div
          className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Vividly AI
        </motion.div>

        {/* Animated circles */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-2 border-purple-500"
              initial={{ opacity: 0.7, scale: 0.5 }}
              animate={{
                opacity: [0.7, 0.2, 0.7],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut",
              }}
              style={{
                width: `${100 - i * 15}%`,
                height: `${100 - i * 15}%`,
              }}
            />
          ))}

          {/* Center pulsing dot */}
          <motion.div
            className="absolute w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/30"
            animate={{
              scale: [1, 1.5, 1],
              boxShadow: [
                "0 0 10px 2px rgba(168, 85, 247, 0.4)",
                "0 0 20px 5px rgba(168, 85, 247, 0.6)",
                "0 0 10px 2px rgba(168, 85, 247, 0.4)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Loading text */}
        <motion.div
          className="mt-8 text-gray-300 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <LoadingDots />
        </motion.div>
      </div>
    </div>
  );
};

// Animated loading dots component
const LoadingDots = () => {
  return (
    <div className="flex items-center space-x-1">
      <span>Loading</span>
      <motion.span
        className="inline-flex"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0 }}
      >
        .
      </motion.span>
      <motion.span
        className="inline-flex"
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 0,
          delay: 0.2,
        }}
      >
        .
      </motion.span>
      <motion.span
        className="inline-flex"
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 0,
          delay: 0.4,
        }}
      >
        .
      </motion.span>
    </div>
  );
};

export default Landing;
