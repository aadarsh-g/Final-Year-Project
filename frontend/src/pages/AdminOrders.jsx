import AdminLayout from "../components/AdminLayout";

function AdminOrders() {
  return (
    <AdminLayout 
      title="Orders Management" 
      subtitle="View and manage all customer orders"
    >
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Orders Management</h2>
        <p className="text-gray-600 mb-4">This page is under construction</p>
        <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
          Coming Soon
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminOrders;

