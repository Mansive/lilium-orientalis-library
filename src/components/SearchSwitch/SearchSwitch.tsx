"use client";
import { useState } from "react";
import styles from "./SearchSwitch.module.css";

export let useVectorSearch = false;

export function SearchSwitch() {
  const [searchMode, setSearchMode] = useState("Full-Text Search");

  function handleClick() {
    if (searchMode === "Full-Text Search") {
      useVectorSearch = true;
      setSearchMode("Vector Search");
    } else {
      useVectorSearch = false;
      setSearchMode("Full-Text Search");
    }
  }

  return (
    <button
      name="searchSwitch"
      id="searchSwitch"
      type="button"
      onClick={handleClick}
      className={styles.searchSwitch}
    >
      {searchMode}
    </button>
  );
}
