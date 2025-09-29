import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Calendar } from "lucide-react";
import { useSelector } from "react-redux";
import apiClient from "../api/axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AdminReportsPage() {
  const { token } = useSelector((state) => state.auth);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    reportType: "orders", // default type
  });

  // 🔽 Helper to trigger download
  const handleExport = async (format) => {
    try {
      const endpoint =
        filters.reportType === "products"
          ? "/reports/products"
          : "/reports/orders";

      const res = await apiClient.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params: { format },
        responseType: "blob", // important for file downloads
      });

      // Create a downloadable blob link
      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `report.${format === "excel" ? "xlsx" : format}`;
      link.click();
    } catch (err) {
      console.error("❌ Export failed", err);
      alert("Failed to export report");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <h1 className="text-2xl font-bold mb-6">Export Reports</h1>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Filter Options</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-2">Start Date</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Calendar className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="flex-1 outline-none"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-2">End Date</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Calendar className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="flex-1 outline-none"
              />
            </div>
          </div>

          {/* Report Type */}
          <div className="flex flex-col md:col-span-2">
            <label className="text-sm font-medium text-gray-600 mb-2">Report Type</label>
            <select
              value={filters.reportType}
              onChange={(e) => setFilters({ ...filters, reportType: e.target.value })}
              className="border rounded-lg px-3 py-2 outline-none"
            >
              <option value="orders">Orders Report</option>
              <option value="products">Products Report</option>
            </select>
          </div>
        </form>
      </div>

      {/* Export Buttons */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Export As</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700 transition"
          >
            <FileText size={18} /> PDF
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
          >
            <FileSpreadsheet size={18} /> Excel
          </button>
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            <Download size={18} /> CSV
          </button>
        </div>
      </div>
    </div>
  );
}
