"use client";
import React from "react";
import { motion } from "framer-motion";

import styles from "./SearchBar.module.css";

const Line = () => {
  return (
    <div className={styles.line}>
      <motion.svg
        style={{ width: "100%", height: "100%" }}
        viewBox="0 0 480 32"
      >
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 1,
            ease: "easeInOut",
          }}
          fill="none"
          stroke="white"
          strokeWidth={5}
          d="M 240, 0 L 0, 0"
        />
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 1,
            ease: "easeInOut",
          }}
          fill="none"
          stroke="white"
          strokeWidth={5}
          d="M 240, 0 L 480, 0"
        />
      </motion.svg>
    </div>
  );
};

function SearchBar({ ...delegated }) {
  return (
    <div className={styles.searchBar}>
      <Line />
      <input {...delegated} />
      <Line />
    </div>
  );
}

export default SearchBar;
