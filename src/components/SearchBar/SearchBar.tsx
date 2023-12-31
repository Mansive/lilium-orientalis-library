"use client";
import { motion } from "framer-motion";
import { useState } from "react";

import styles from "./SearchBar.module.css";

interface LineInterface {
  progress: number;
  lineLength: number;
  strokeWidth: number;
}

const Line = ({ progress, lineLength, strokeWidth }: LineInterface) => {
  return (
    <div className={styles.line}>
      <motion.svg
        style={{ width: "100%", height: "100%" }}
        viewBox={`0 0 ${lineLength} 128`}
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
          strokeWidth={strokeWidth}
          d={`M ${lineLength / 2}, 0 L 0, 0`}
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
          strokeWidth={strokeWidth}
          d={`M ${lineLength / 2}, 0 L ${lineLength}, 0`}
        />
      </motion.svg>
    </div>
  );
};

function SearchBar({ ...delegated }) {
  const [focused, setFocused] = useState(false);
  const { placeholder, value, maxLength } = delegated;
  const progress =
    focused || value.length > 0
      ? value.length / maxLength + 0.01
      : placeholder.length / maxLength;

  return (
    <div className={styles.searchBar}>
      <Line progress={progress} lineLength={8192} strokeWidth={14} />
      <input
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...delegated}
      />
      <Line progress={progress} lineLength={8192} strokeWidth={14} />
    </div>
  );
}

export default SearchBar;
