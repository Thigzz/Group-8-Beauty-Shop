import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import apiClient from "../../api/axios";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, BarChart2, UserCheck, PieChart } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const StatCard = ({ title, value, icon, isCurrency = false }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
    <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
    <div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold mt-1">
        {isCurrency ? `Ksh ${Number(value).toLocaleString()}` : value}
      </p>
    </div>
  </div>
);

const AnalyticsPage = () => {
  const { token } = useSelector((state) => state.auth);

  const [dashboard, setDashboard] = useState(null);
  const [sales, setSales] = useState(null);
  const [products, setProducts] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState("overview");
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const params = { days, limit: 5 };

        const [d, s, p, c] = await Promise.all([
          apiClient.get("/api/analytics/dashboard", { headers, params }),
          apiClient.get("/api/analytics/sales", { headers, params }),
          apiClient.get("/api/analytics/products", { headers, params }),
          apiClient.get("/api/analytics/customers", { headers, params }),
        ]);

        setDashboard(d.data);
        setSales(s.data);
        setProducts(p.data);
        setCustomers(c.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError("Failed to load analytics data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token, days]);

  // Chart Colors
  const primaryColor = "rgba(201, 163, 93, 1)"; // #C9A35D
  const primaryColorTransparent = "rgba(201, 163, 93, 0.5)";
  const secondaryColor = "rgba(75, 192, 192, 1)";
  const secondaryColorTransparent = "rgba(75, 192, 192, 0.5)";
  const pieColors = ['#C9A35D', '#4B5563', '#9CA3AF', '#36A2EB', '#FFCE56', '#FF9F40'];


  // Chart Data
  const salesData = {
    labels: sales?.daily_sales.map((day) => day.date),
    datasets: [
      {
        label: "Revenue",
        data: sales?.daily_sales.map((day) => day.revenue),
        borderColor: primaryColor,
        backgroundColor: primaryColorTransparent,
        yAxisID: 'y',
      },
      {
        label: "Orders",
        data: sales?.daily_sales.map((day) => day.order_count),
        borderColor: secondaryColor,
        backgroundColor: secondaryColorTransparent,
        yAxisID: 'y1',
      },
    ],
  };

  const productData = {
    labels: products?.best_sellers_by_quantity.map((prod) => prod.product_name),
    datasets: [
      {
        label: "Units Sold",
        data: products?.best_sellers_by_quantity.map((prod) => prod.total_quantity),
        backgroundColor: pieColors,
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  const categoryData = {
    labels: products?.category_performance.map((cat) => cat.category_name),
    datasets: [
      {
        label: 'Revenue by Category',
        data: products?.category_performance.map((cat) => cat.revenue),
        backgroundColor: pieColors,
      },
    ],
  };
  
  const renderContent = () => {
    if (loading) return <div className="text-center p-10">Loading Analytics...</div>;
    if (error) return <div className="text-red-500 p-10">{error}</div>;

    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Revenue" value={dashboard.total_sales} icon={<DollarSign className="text-[#C9A35D]" />} isCurrency />
              <StatCard title="Total Orders" value={dashboard.total_orders} icon={<ShoppingCart className="text-teal-500" />} />
              <StatCard title="Active Customers" value={dashboard.active_customers} icon={<Users className="text-blue-500" />} />
              <StatCard title="Top Product" value={dashboard.top_product} icon={<Package className="text-gray-600" />} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Sales Trend</h3>
                    <Line data={salesData} />
                 </div>
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Revenue by Category</h3>
                    <div className="w-full h-80 flex items-center justify-center">
                        <Pie data={categoryData} options={{ maintainAspectRatio: false }} />
                    </div>
                 </div>
            </div>
          </div>
        );
      case "sales":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Sales Trend (Last {days} Days)</h2>
            <p className="text-gray-600 mb-4">Total Revenue in Period: <span className="font-bold">Ksh {Number(sales.period_revenue).toLocaleString()}</span></p>
            <Line data={salesData} />
          </div>
        );
      case "products":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Top 5 Products by Quantity Sold</h2>
              <Bar data={productData} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Revenue by Category</h2>
              <div className="w-full h-96 flex items-center justify-center">
                  <Pie data={categoryData} options={{ maintainAspectRatio: false }}/>
              </div>
            </div>
          </div>
        );
      case "customers":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Customer Analytics (Last {days} Days)</h2>
            <div className="flex space-x-8 mb-6">
                <p>New Customers: <span className="font-bold">{customers.new_customers}</span></p>
                <p>Active Customers: <span className="font-bold">{customers.active_customers}</span></p>
            </div>
            <h3 className="text-lg font-semibold mb-2">Top 5 Customers by Amount Spent</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Orders</th><th className="p-2 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {customers.top_customers.map((cust, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-2">{cust.name}</td><td className="p-2">{cust.email}</td>
                    <td className="p-2">{cust.order_count}</td>
                    <td className="p-2 text-right">Ksh {Number(cust.total_spent).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  const TabButton = ({ name, label, icon }) => (
    <button
      onClick={() => setActiveTab(name)}
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === name
          ? "bg-[#C9A35D] text-white"
          : "text-gray-600 hover:bg-gray-200"
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center space-x-2 bg-white p-1 rounded-lg shadow-sm">
            {[7, 30, 90].map(d => (
                <button 
                    key={d}
                    onClick={() => setDays(d)}
                    className={`px-3 py-1 text-sm rounded ${days === d ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                >
                    Last {d} Days
                </button>
            ))}
        </div>
      </div>

      <div className="flex space-x-2 border-b">
        <TabButton name="overview" label="Overview" icon={<PieChart size={16}/>} />
        <TabButton name="sales" label="Sales" icon={<TrendingUp size={16}/>} />
        <TabButton name="products" label="Products" icon={<BarChart2 size={16}/>} />
        <TabButton name="customers" label="Customers" icon={<UserCheck size={16}/>} />
      </div>

      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default AnalyticsPage;