"use client";

import React, { useState } from "react";
import { Button, Card, message, Typography } from "antd";
import { Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { getProductsForExport } from "@/actions/export";

const { Title, Text } = Typography;

const DataExport = () => {
  const [exportingProd, setExportingProd] = useState(false);

  const handleExportProducts = async () => {
    try {
      setExportingProd(true);
      const data = await getProductsForExport();

      if (!data || data.length === 0) {
        message.info("No products available to export.");
        return;
      }

      // Create a new workbook and add the data worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

      // Generate buffer and trigger download
      XLSX.writeFile(
        workbook,
        `Products_Export_${new Date().toISOString().split("T")[0]}.xlsx`,
      );

      message.success("Products exported successfully!");
    } catch (error) {
      console.error(error);
      message.error("Failed to export products data.");
    } finally {
      setExportingProd(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <Title level={4}>Data Export</Title>
        <Text type="secondary">
          Download your store's data into Excel spreadsheets for analysis,
          accounting, or backup.
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <FileSpreadsheet size={32} />
            </div>
            <Title level={5}>Products</Title>
            <Text type="secondary" className="mb-6 h-12">
              Export all active products with their current pricing, stock,
              categories, and brand mappings.
            </Text>
            <Button
              type="primary"
              icon={<Download size={16} />}
              onClick={handleExportProducts}
              loading={exportingProd}
              className="w-full"
            >
              Export Products
            </Button>
          </div>
        </Card>

        {/* Additional export cards could go here (e.g. Orders, Customers) */}
      </div>
    </div>
  );
};

export default DataExport;
