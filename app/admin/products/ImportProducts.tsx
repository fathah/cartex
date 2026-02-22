"use client";

import React, { useState } from "react";
import { Modal, Upload, Button, message, Progress, Steps, Tag } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { X, CheckCircle2, CircleDashed, Download } from "lucide-react";
import { importProductBatch } from "@/actions/products-import";

const { Dragger } = Upload;

interface ImportProductsProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type StepState = "waiting" | "process" | "finish" | "error";

export default function ImportProducts({
  isOpen,
  onClose,
  onSuccess,
}: ImportProductsProps) {
  const [currentView, setCurrentView] = useState<"upload" | "processing">(
    "upload",
  );
  const [fileList, setFileList] = useState<any[]>([]);
  const [percent, setPercent] = useState(0);

  // Status Steps: 0: Reading, 1: Mapping, 2: Validating, 3: Importing
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStates, setStepStates] = useState<StepState[]>([
    "waiting",
    "waiting",
    "waiting",
    "waiting",
  ]);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    if (currentView === "processing" && percent < 100 && !errorMessage) {
      if (
        !window.confirm(
          "Import is in progress. Are you sure you want to close?",
        )
      )
        return;
    }
    setFileList([]);
    setCurrentView("upload");
    setCurrentStep(0);
    setPercent(0);
    setStepStates(["waiting", "waiting", "waiting", "waiting"]);
    setErrorMessage("");
    onClose();
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        name: "Sample Product",
        saleprice: 99.99,
        originalprice: 120.0,
        category: "Electronics",
        brand: "Sony",
        stock: 10,
      },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "cartex_product_import_template.xlsx");
  };

  const updateStepState = (index: number, state: StepState) => {
    setStepStates((prev) => {
      const newStates = [...prev];
      newStates[index] = state;
      return newStates;
    });
  };

  const processFile = async (file: File) => {
    setCurrentView("processing");
    setCurrentStep(0);
    updateStepState(0, "process");
    setPercent(5);

    try {
      setErrorMessage("");
      // 1. Reading file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      updateStepState(0, "finish");
      setCurrentStep(1);
      updateStepState(1, "process");
      setPercent(20);

      // 2. Mapping & Validating
      const rawData = XLSX.utils.sheet_to_json<any>(worksheet);

      if (rawData.length === 0) {
        throw new Error("File is empty or invalid format.");
      }

      const rowsToProcess = [];
      const allowedKeys = [
        "name",
        "saleprice",
        "originalprice",
        "category",
        "brand",
        "stock",
      ];

      // Process headers to lowercase and strip spaces to be forgiving
      const normalizeKey = (key: string) =>
        key.toLowerCase().replace(/[^a-z0-9]/g, "");

      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const normalizedRow: any = {};

        Object.keys(row).forEach((k) => {
          const normKey = normalizeKey(k);
          if (allowedKeys.includes(normKey)) {
            normalizedRow[normKey] = row[k];
          }
        });

        if (!normalizedRow.name) {
          throw new Error(`Row ${i + 2}: Missing required field 'Name'`);
        }

        const salePrice = parseFloat(normalizedRow.saleprice);
        if (isNaN(salePrice) || salePrice <= 0) {
          throw new Error(`Row ${i + 2}: Missing or invalid 'SalePrice'`);
        }

        const originalPrice =
          normalizedRow.originalprice !== undefined
            ? parseFloat(normalizedRow.originalprice)
            : salePrice;

        rowsToProcess.push({
          name:
            typeof normalizedRow.name === "string"
              ? normalizedRow.name.trim()
              : String(normalizedRow.name),
          salePrice: salePrice,
          originalPrice: originalPrice,
          stock: parseInt(normalizedRow.stock) || 0,
          category:
            typeof normalizedRow.category === "string"
              ? normalizedRow.category.trim()
              : undefined,
          brand:
            typeof normalizedRow.brand === "string"
              ? normalizedRow.brand.trim()
              : undefined,
        });
      }

      updateStepState(1, "finish");
      updateStepState(2, "finish"); // Validation successful
      setCurrentStep(3);
      updateStepState(3, "process");

      // 3. Importing logic
      const totalRows = rowsToProcess.length;
      let completedRows = 0;

      // We process batches of 10 to avoid blasting the connection pool
      const batchSize = 10;

      for (let i = 0; i < totalRows; i += batchSize) {
        const batch = rowsToProcess.slice(i, i + batchSize);

        const results = await importProductBatch(batch);

        const failed = results.filter((r: any) => !r.success);
        if (failed.length > 0) {
          console.warn("Some products failed to import:", failed);
        }

        completedRows += batch.length;
        const progress = 40 + Math.floor((completedRows / totalRows) * 60);
        setPercent(progress > 100 ? 100 : progress);
      }

      updateStepState(3, "finish");
      setPercent(100);
      message.success(`Successfully imported ${totalRows} products!`);

      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Failed to process file";
      message.error(msg);
      setErrorMessage(msg);

      if (currentStep === 0) updateStepState(0, "error");
      else if (currentStep === 1) updateStepState(1, "error");
      else if (currentStep === 2 || currentStep === 3)
        updateStepState(2, "error");

      setPercent(0);
    }
  };

  const uploadProps = {
    onRemove: (file: any) => {
      setFileList([]);
    },
    beforeUpload: (file: File) => {
      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls");
      const isLt50M = file.size / 1024 / 1024 < 50;

      if (!isExcel) {
        message.error("You can only upload EXCEL files!");
        return Upload.LIST_IGNORE;
      }
      if (!isLt50M) {
        message.error("File must be smaller than 50MB!");
        return Upload.LIST_IGNORE;
      }

      setFileList([file]);
      return false; // Prevent auto upload
    },
    fileList,
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      closeIcon={
        currentView === "processing" && !errorMessage ? false : <X size={20} />
      }
      width={currentView === "upload" ? 480 : 400}
      centered
      className="import-products-modal"
    >
      {currentView === "upload" ? (
        <div className="p-2">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Upload File</h2>

          <div className="mb-6">
            <Dragger
              {...uploadProps}
              accept=".xlsx,.xls"
              className="bg-gray-50 border-2 border-dashed border-gray-200 hover:border-[#003d29] hover:bg-[#003d29]/5 transition-colors rounded-xl overflow-hidden p-8"
            >
              <p className="ant-upload-drag-icon text-gray-400 mb-4">
                <InboxOutlined style={{ fontSize: "48px", color: "#cbd5e1" }} />
              </p>
              <p className="text-gray-900 font-medium text-base mb-1">
                Drag & drop your file or{" "}
                <span className="text-blue-600 underline cursor-pointer">
                  choose a file
                </span>
              </p>
              <p className="text-gray-500 text-sm">
                Supported formats: .xlsx, .xls • Max 50 MB
              </p>
            </Dragger>
          </div>

          <div className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-700">
                Supported Columns
              </span>
              <Button
                type="link"
                size="small"
                onClick={downloadTemplate}
                icon={<Download size={14} />}
                className="text-[#003d29]"
              >
                Download Template
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Tag color="error" className="m-0 border-red-200">
                Name *
              </Tag>
              <Tag color="error" className="m-0 border-red-200">
                SalePrice *
              </Tag>
              <Tag className="m-0">OriginalPrice</Tag>
              <Tag className="m-0">Category</Tag>
              <Tag className="m-0">Brand</Tag>
              <Tag className="m-0">Stock</Tag>
            </div>
            <p className="text-xs text-gray-400 mt-2">* Mandatory fields</p>
          </div>

          <div className="flex justify-between gap-3 pt-4">
            <Button
              size="large"
              className="flex-1 rounded-lg"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              className="flex-1 bg-[#003d29] hover:bg-[#002a1c] border-none rounded-lg"
              disabled={fileList.length === 0}
              onClick={() =>
                fileList.length && processFile(fileList[0] as File)
              }
            >
              Upload
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center py-6 px-4">
          <div className="w-24 h-24 bg-green-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-green-100">
            <div className="bg-[#1CC88A] text-white w-12 h-12 rounded-lg flex items-center justify-center font-bold text-2xl">
              X
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Processing Excel File
          </h2>

          <div className="w-full mb-8 text-center px-4">
            <Progress
              percent={percent}
              strokeColor="#003d29"
              showInfo={false}
              className="mb-2"
              size={["100%", 8]}
            />
            <div className="font-bold text-[#003d29] text-base">
              {percent}% complete
            </div>
            <div className="text-gray-500 text-sm mt-1">
              This may take a few moments
            </div>
          </div>

          <div className="w-full space-y-4 px-2">
            {[
              { title: "Reading file", key: 0 },
              { title: "Mapping fields...", key: 1 },
              { title: "Validating data", key: 2 },
              { title: "Importing records", key: 3 },
            ].map((step, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0"
              >
                {stepStates[idx] === "finish" ? (
                  <CheckCircle2 className="text-[#1CC88A] w-6 h-6 border rounded-full bg-green-50 p-1" />
                ) : stepStates[idx] === "process" ? (
                  <div className="w-6 h-6 rounded-full border border-[#003d29] bg-[#003d29]/10 p-1 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#003d29]"></div>
                  </div>
                ) : stepStates[idx] === "error" ? (
                  <div className="w-6 h-6 rounded-full border border-red-500 bg-red-50 p-1 flex items-center justify-center">
                    <span className="text-red-500 font-bold text-xs">!</span>
                  </div>
                ) : (
                  <CircleDashed className="text-gray-300 w-6 h-6" />
                )}
                <span
                  className={`font-medium ${stepStates[idx] === "waiting" ? "text-gray-400" : "text-gray-700"}`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>

          {errorMessage && (
            <div className="w-full mt-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm font-medium text-center">
              {errorMessage}
            </div>
          )}

          {errorMessage && (
            <Button
              className="mt-6 font-medium text-gray-600"
              onClick={() => {
                setCurrentView("upload");
                setErrorMessage("");
                setFileList([]);
                setCurrentStep(0);
                setStepStates(["waiting", "waiting", "waiting", "waiting"]);
              }}
            >
              Try Again
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
}
