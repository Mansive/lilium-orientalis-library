"use client";
import { useState } from "react";

import NetworkShader from "@/components/NetworkShader";
import SearchBar from "@/components/SearchBar";
import SearchResultList from "@/components/SearchResultList";

import { Book, BOOKS } from "@/data/book-data";

import styles from "./page.module.css";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Book[] | null>(null);

  // idle | loading | success | error
  const [status, setStatus] = useState("idle");

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus("loading");

    const nextSearchResults = BOOKS.filter(({ title }) =>
      title.includes(searchTerm)
    );
    setSearchResults(nextSearchResults);

    console.log(searchResults);

    setStatus("success");
  }

  const showMain = false;

  return (
    <>
      <NetworkShader />
      {showMain && (
        <main className={styles.mainContent}>
          <div className={styles.mainHeading}>
            <h1>lolibrary</h1>
          </div>
          <form onSubmit={handleSearch}>
            <SearchBar
              placeholder="Enter book title"
              value={searchTerm}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setSearchTerm(event.target.value);
              }}
            />
          </form>
          {status === "success" && (
            <SearchResultList searchResults={searchResults} />
          )}
        </main>
      )}
    </>
  );
}
