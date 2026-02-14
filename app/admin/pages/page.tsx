import React from "react";
import { getPages } from "@/app/actions/app_pages";
import PageList from "./page-list";

const PagesIndex = async () => {
  const pages = await getPages();

  return <PageList data={pages} />;
};

export default PagesIndex;
