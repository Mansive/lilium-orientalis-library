"use client";
import { useState } from "react";

import NetworkShader from "@/components/NetworkShader";
import SearchBar from "@/components/SearchBar";
import SearchResultList from "@/components/SearchResultList";
import Spinner from "@/components/Spinner";

import { Book, BOOKS } from "@/data/book-data";

import styles from "./page.module.css";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Book[] | null>(null);

  // idle | loading | success | error
  const [status, setStatus] = useState("idle");

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setStatus("loading");

    setTimeout(() => {
      const nextSearchResults = BOOKS.filter(({ title }) =>
        title.includes(searchTerm)
      );
      setSearchResults(nextSearchResults);
      setStatus("success");
    }, 1500);
  };

  return (
    <>
      <NetworkShader />
      <main className={styles.wrapper}>
        <div className={styles.heading}>
          <h1>lolibrary</h1>
        </div>
        <div className={styles.searchBar}>
          <form onSubmit={handleSearch}>
            <SearchBar
              placeholder="Enter book title"
              value={searchTerm}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setSearchTerm(event.target.value);
              }}
              maxLength={64}
            />
          </form>
        </div>
        {(status === "idle" || status === "loading") && (
          <div className={styles.spinner}>
            <Spinner
              color="white"
              size="100"
              isLoading={status === "loading"}
            />
          </div>
        )}
        {status === "success" && (
          <div className={styles.searchResultsList}>
            <SearchResultList searchResults={searchResults} />
          </div>
        )}
      </main>
    </>
  );
}
