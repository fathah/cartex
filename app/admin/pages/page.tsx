"use client";

import React, { useEffect, useState } from "react";
import { Tabs, Card } from "antd";
import { getPages } from "@/actions/app_pages";
import PageList from "./page-list";
import SectionsList from "./_components/sections-list";
import { FileText, LayoutDashboard } from "lucide-react";

const PagesIndex = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPages = async () => {
      const data = await getPages();
      setPages(data);
      setLoading(false);
    };
    fetchPages();
  }, []);

  return (
    <div className="p-0 sm:p-6">
      <Card className="shadow-sm border-gray-200">
        <Tabs
          defaultActiveKey="pages"
          className="admin-tabs"
          items={[
            {
              key: "pages",
              label: (
                <div className="flex items-center gap-2 px-2">
                  <FileText size={18} />
                  <span>Standard Pages</span>
                </div>
              ),
              children: <PageList data={pages} />,
            },
            {
              key: "sections",
              label: (
                <div className="flex items-center gap-2 px-2">
                  <LayoutDashboard size={18} />
                  <span>Global Sections</span>
                </div>
              ),
              children: <SectionsList />,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default PagesIndex;
