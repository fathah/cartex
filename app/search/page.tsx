import { Suspense } from "react";
import { Spin } from "antd";
import SearchClient from "./search-client";

const Search = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Spin size="large" />
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
};

export default Search;
