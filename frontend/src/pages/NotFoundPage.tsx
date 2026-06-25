import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, AlertTriangle } from "lucide-react";

function NotFoundPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center px-6">

      {/* Glow Effects */}
      <div className="absolute w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl top-[-150px] left-[-150px] animate-pulse" />
      <div className="absolute w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-3xl bottom-[-100px] right-[-100px] animate-pulse" />

      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/30 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0
          }}
          animate={{
            y: [null, -200],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
        />
      ))}

      <div className="relative z-10 text-center max-w-2xl">

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 10
          }}
        >
          <AlertTriangle
            size={80}
            className="mx-auto text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.8)]"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="
            text-[120px]
            md:text-[180px]
            font-black
            leading-none
            bg-gradient-to-r
            from-blue-400
            via-purple-400
            to-pink-400
            bg-clip-text
            text-transparent
            drop-shadow-[0_0_40px_rgba(99,102,241,0.8)]
          "
        >
          404
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold text-white"
        >
          Сторінку не знайдено
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-slate-300 mt-4 text-lg"
        >
          Схоже, ця сторінка зникла у фінансовому всесвіті 🚀
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-10"
        >
          <Link
            to="/"
            className="
              inline-flex
              items-center
              gap-3
              px-8
              py-4
              rounded-2xl
              bg-gradient-to-r
              from-blue-600
              to-purple-600
              text-white
              font-semibold
              shadow-[0_0_30px_rgba(79,70,229,0.5)]
              hover:scale-105
              hover:shadow-[0_0_50px_rgba(79,70,229,0.9)]
              transition-all
              duration-300
            "
          >
            <Home size={22} />
            Повернутися на Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default NotFoundPage;