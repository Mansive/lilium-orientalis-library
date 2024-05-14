"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import NetworkShader from "@/components/NetworkShader";
import SearchBar from "@/components/SearchBar";
import SearchResultList from "@/components/SearchResultList";
import Spinner from "@/components/Spinner";

import { SearchSwitch, useVectorSearch } from "@/components/SearchSwitch";

import { Book } from "@/data/book-data";
import styles from "./page.module.css";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Book[] | null>(null);
  const searchParams = useSearchParams();
  // idle | loading | success | error
  const [status, setStatus] = useState("idle");

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setStatus("loading");

    try {
      const params = new URLSearchParams(searchParams);
      useVectorSearch === false
        ? params.set("mode", "normal")
        : params.set("mode", "vector");
      params.set("query", searchTerm);

      const response = await fetch("/api/search?" + params, {
        method: "GET",
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
      if (!response.ok) {
        throw new Error();
      }
      const data = await response.json();
      data["records"].length === 0 ? setStatus("idle") : setStatus("success");
      setSearchResults(data["records"]);
    } catch (error) {
      setStatus("error");
      console.log(error);
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
              maxLength={80}
            />
          </form>
        </div>
        {/* <div className={styles.searchSwitch}>
          <SearchSwitch />
        </div> */}
        {(status === "idle" || status === "loading") && (
          <div className={styles.spinner}>
            <Spinner
              color="white"
              size="100"
              isLoading={status === "loading"}
            />
          </div>
        )}
        {status === "error" && (
          <div className={styles.spinner}>
            <Spinner color="red" size="100" isLoading={false} />
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
