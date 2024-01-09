"use client";
import { motion } from "framer-motion";
import { useState } from "react";

import styles from "./SearchBar.module.css";

interface LineInterface {
  progress: number;
  lineLength: number;
  strokeWidth: number;
}

// http://www.rikai.com/library/kanjitables/kanji_codes.unicode.shtml
const re =
  /[\p{Script=Han}\p{Script=Katakana}\p{Script=Hiragana}！-～\u3000-\u303f]/gu;

const Line = ({ progress, lineLength, strokeWidth }: LineInterface) => {
  const duration = 0.8;
  return (
    <div className={styles.line}>
      <motion.svg
        style={{ width: "100%", height: "100%", y: -5 }}
        viewBox={`0 0 ${lineLength} 1`}
      >
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress }}
          transition={{
            duration: duration,
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
            duration: duration,
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
  const jpCharTotal = [...value.matchAll(re)].length;

  // value.length - jpChar.current.length + jpChar.current.length * 2.15
  // x-y+(y*2.15) = x+(y*1.15)
  const progress =
    focused || value.length > 0
      ? (value.length + jpCharTotal * 1.15) / maxLength + 0.01
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
