import React, { useState } from 'react';
import { Search, MapPin, Filter } from 'lucide-react';

/**
 * Community Search and Filter Component
 * Allows users to search and filter communities
 */
const CommunitySearch = ({ onSearch, loading = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedAreaType, setSelectedAreaType] = useState('');
  const [useGeolocation, setUseGeolocation] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const areaTypes = ['mohalla', 'gao', 'ward', 'colony', 'village'];

  const handleSearch = (e) => {
    e.preventDefault();
    
    const searchParams = {
      search: searchQuery,
      city: selectedCity,
      state: selectedState,
      areaType: selectedAreaType,
    };

    if (useGeolocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onSearch({
            ...searchParams,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Continue without geolocation if user denies
          onSearch(searchParams);
        }
      );
    } else {
      onSearch(searchParams);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setSelectedState('');
    setSelectedAreaType('');
    setUseGeolocation(false);
    onSearch({});
  };

  const hasActiveFilters = searchQuery || selectedCity || selectedState || selectedAreaType || useGeolocation;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <form onSubmit={handleSearch}>
        {/* Main Search Bar */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search communities by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute right-3 top-3 text-gray-400" size={18} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
          >
            <Filter size={18} />
            Filters
          </button>
        </div>

        {/* Filter Section */}
        {showFilters && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* City Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Enter city name"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* State Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  placeholder="Enter state name"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Area Type Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Area Type
                </label>
                <select
                  value={selectedAreaType}
                  onChange={(e) => setSelectedAreaType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  {areaTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Geolocation Toggle */}
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useGeolocation}
                    onChange={(e) => setUseGeolocation(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <MapPin size={14} />
                    Near me
                  </span>
                </label>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-red-500 hover:text-red-700 text-sm font-semibold"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default CommunitySearch;
