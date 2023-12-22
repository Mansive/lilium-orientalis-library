"use client";
import { useState } from "react";

import NetworkShader from "@/components/NetworkShader";
import SearchBar from "@/components/SearchBar";
import SearchResultList from "@/components/SearchResultList";
import Spinner from "@/components/Spinner";

import { Book } from "@/data/book-data";

import styles from "./page.module.css";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Book[] | null>(null);

  // idle | loading | success | error
  const [status, setStatus] = useState("idle");

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setStatus("loading");

    try {
      const response = await fetch("/api/search?query=" + searchTerm);
      if (!response.ok) {
        throw new Error();
      }
      const data = await response.json();
      setSearchResults(data["records"]);
      setStatus("success");
      console.log("success");
    } catch (error) {
      console.log("wtf");
      setStatus("idle");
      //setStatus("error");
    }
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
              maxLength={128}
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
