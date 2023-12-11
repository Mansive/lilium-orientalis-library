"use client";
import React from "react";
import { motion } from "framer-motion";

import styles from "./SearchBar.module.css";

interface LineInterface {
  progress: number;
  maxLength: number;
}

const Line = ({ progress, maxLength }: LineInterface) => {
  return (
    <div className={styles.line}>
      <motion.svg
        style={{ width: "100%", height: "100%" }}
        viewBox={`0 0 ${maxLength} 32`}
      >
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress }}
          transition={{
            duration: 1,
            ease: "easeInOut",
          }}
          fill="none"
          stroke="white"
          strokeWidth={5}
          d={`M ${maxLength / 2}, 0 L 0, 0`}
        />
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress }}
          transition={{
            duration: 1,
            ease: "easeInOut",
          }}
          fill="none"
          stroke="white"
          strokeWidth={5}
          d={`M ${maxLength / 2}, 0 L ${maxLength}, 0`}
        />
      </motion.svg>
    </div>
  );
};

function SearchBar({ ...delegated }) {
  const { placeholder, value, maxLength } = delegated;
  const progress = (value.length === 0 ? placeholder.length : value.length) / maxLength;

  return (
    <div className={styles.searchBar}>
      <Line progress={progress} maxLength={600} />
      <input {...delegated} />
      <Line progress={progress} maxLength={600} />
    </div>
  );
}

export default SearchBar;
