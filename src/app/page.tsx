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

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus("loading");

    setTimeout(() => {
      const nextSearchResults = BOOKS.filter(({ title }) =>
        title.includes(searchTerm)
      );
      setSearchResults(nextSearchResults);
      setStatus("success");
    }, 2000);
  }

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
              maxLength={32}
            />
          </form>
        </div>
        <div className={styles.spinner}>
          <Spinner color="white" size="100" isLoading={status === "loading"} />
        </div>
        {status === "success" && (
          <SearchResultList searchResults={searchResults} />
        )}
      </main>
    </>
  );
}
