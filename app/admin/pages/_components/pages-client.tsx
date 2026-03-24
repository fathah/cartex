"use client";

import React from "react";
import { Tabs, Card } from "antd";
import { Page } from "@prisma/client";
import { FileText, LayoutDashboard } from "lucide-react";
import PageList from "../page-list";
import SectionsList from "./sections-list";

interface PagesClientProps {
  initialPages: Page[];
  initialConfigs: Record<string, any>;
}

const PagesClient: React.FC<PagesClientProps> = ({
  initialPages,
  initialConfigs,
}) => {
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
              children: <PageList data={initialPages} />,
            },
            {
              key: "sections",
              label: (
                <div className="flex items-center gap-2 px-2">
                  <LayoutDashboard size={18} />
                  <span>Global Sections</span>
                </div>
              ),
              children: <SectionsList initialConfigs={initialConfigs} />,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default PagesClient;
