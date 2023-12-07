"use client";
import React from "react";

import Card from "@/components/Card";

import { Book } from "@/data/book-data";

import styles from "./SearchResultList.module.css";

interface SearchResultListInterface {
  searchResults: Book[] | null;
}

function SearchResultList({ searchResults }: SearchResultListInterface) {
  if (searchResults?.length === 0) {
    return <p>No results</p>;
  }

  return (
    <div className={styles.searchResultList}>
      {searchResults?.map((book) => (
        <Card
          key={book.id}
          id={book.id}
          title={book.title}
          sources={book.sources}
          size={book.size}
          extension={book.extension}
        />
      ))}
    </div>
  );
}

export default SearchResultList;
