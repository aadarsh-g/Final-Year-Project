import AdminLayout from "../components/AdminLayout";

function AdminAnalytics() {
  return (
    <AdminLayout 
      title="Analytics" 
      subtitle="View detailed analytics and reports"
    >
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <svg className="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600 mb-4">This page is under construction</p>
        <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
          Coming Soon
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminAnalytics;

