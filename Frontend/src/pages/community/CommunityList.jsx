import { useEffect, useState, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useCommunity } from '../../hooks/useCommunity';
import CommunityCard from '../../components/community/CommunityCard';
import CommunitySearch from '../../components/community/CommunitySearch';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../../components/community/CommunityUI';
import { MapPin, LayoutGrid, Plus } from 'lucide-react';

const CommunityMap = lazy(() => import('../../components/community/CommunityMap'));

/**
 * Community List Page
 * Displays list of communities with search and filters
 * Public page - accessible to all users
 */
const CommunityList = () => {
  const { communities, loading, error, searchCommunities, fetchCommunities, setError } = useCommunity();
  const [viewMode, setViewMode] = useState('grid'); // grid or map
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch all communities on component mount
  useEffect(() => {
    fetchCommunities({ page: currentPage, limit: 12 });
  }, [currentPage]);

  // Handle search
  const handleSearch = async (searchParams) => {
    try {
      const response = await searchCommunities({
        ...searchParams,
        page: 1,
        limit: 12,
      });
      setCurrentPage(1);
      const pagination = response?.data?.pagination ?? response?.pagination;
      if (pagination) {
        setTotalPages(Math.ceil(pagination.total / pagination.limit));
      }
    } catch (err) {
      setError(err.message || 'Search failed');
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (error && communities.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage
          message={error}
          onRetry={() => fetchCommunities()}
          onDismiss={() => setError(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Discover Communities</h1>
            <p className="text-blue-100 text-lg">
              Join local communities and make a difference in your neighborhood
            </p>
          </div>
          <Link
            to="/community/register"
            className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-semibold px-5 py-2.5 rounded-xl shadow transition-colors text-sm"
          >
            <Plus size={18} /> Register Community
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <CommunitySearch
          onSearch={handleSearch}
          loading={loading && communities.length === 0}
        />

        {/* View Mode Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Communities ({communities.length})
          </h2>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <LayoutGrid size={16} /> Grid
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                viewMode === 'map'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <MapPin size={16} /> Map
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && communities.length > 0 && (
          <ErrorMessage
            message={error}
            onRetry={() => fetchCommunities()}
            onDismiss={() => setError(null)}
          />
        )}

        {/* Loading State */}
        {loading && communities.length === 0 ? (
          <LoadingSpinner message="Loading communities..." />
        ) : communities.length === 0 ? (
          <EmptyState
            message="No communities found. Be the first to create one!"
            action={() => (window.location.href = '/community/register')}
            actionLabel="Register Community"
          />
        ) : viewMode === 'grid' ? (
          <>
            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {communities.map((community) => (
                <CommunityCard
                  key={community._id}
                  community={community}
                  isLoading={loading}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mb-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <Suspense fallback={
            <div className="flex items-center justify-center h-96 bg-white rounded-2xl shadow-lg">
              <div className="text-center text-gray-500">
                <MapPin size={40} className="mx-auto mb-3 text-blue-400 animate-bounce" />
                <p className="font-medium">Loading map…</p>
              </div>
            </div>
          }>
            <CommunityMap communities={communities} />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default CommunityList;
