// src/pages/AdminReportsPage.jsx
import { Download, FileSpreadsheet, FileText, Calendar } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <h1 className="text-2xl font-bold mb-6">Export Reports</h1>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Filter Options</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Range */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-2">Start Date</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Calendar className="w-5 h-5 text-gray-400 mr-2" />
              <input type="date" className="flex-1 outline-none" />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-2">End Date</label>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Calendar className="w-5 h-5 text-gray-400 mr-2" />
              <input type="date" className="flex-1 outline-none" />
            </div>
          </div>

          {/* Report Type */}
          <div className="flex flex-col md:col-span-2">
            <label className="text-sm font-medium text-gray-600 mb-2">Report Type</label>
            <select className="border rounded-lg px-3 py-2 outline-none">
              <option>Sales Report</option>
              <option>Orders Report</option>
              <option>Customers Report</option>
              <option>Inventory Report</option>
            </select>
          </div>
        </form>
      </div>

      {/* Export Buttons */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Export As</h2>
        <div className="flex flex-wrap gap-4">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700 transition">
            <FileText size={18} /> PDF
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition">
            <FileSpreadsheet size={18} /> Excel
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition">
            <Download size={18} /> CSV
          </button>
        </div>
      </div>
    </div>
  );
}
