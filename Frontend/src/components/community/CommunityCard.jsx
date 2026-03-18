import { useState, useEffect } from 'react';
import { Heart, MapPin, Users, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDownloadUrl } from '../../services/uploadService';

/**
 * Reusable Community Card Component
 * Displays community information in card format
 */
const CommunityCard = ({ community, onJoin, isLoading = false }) => {
  const [coverImageUrl, setCoverImageUrl] = useState(null);

  useEffect(() => {
    const key = community.coverImageKey;
    if (!key) return;
    // Already a full URL (e.g. http/https direct link)
    if (key.startsWith('http')) { setCoverImageUrl(key); return; }
    getDownloadUrl(key).then(url => setCoverImageUrl(typeof url === 'string' ? url : url?.Url)).catch(() => {});
  }, [community.coverImageKey]);
  const getVerificationBadge = (status) => {
    if (status === 'verified') {
      return (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <CheckCircle size={12} />
          Verified
        </div>
      );
    }
    if (status === 'pending') {
      return (
        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
          Pending
        </div>
      );
    }
    return null;
  };

  const getAreaTypeDisplay = (areaType) => {
    const typeMap = {
      mohalla: '🏘️ Mohalla',
      gao: '🌾 Village',
      ward: '📍 Ward',
      colony: '🏢 Colony',
      village: '🌿 Village',
    };
    return typeMap[areaType] || areaType;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Cover Image */}
      <div className="relative bg-gradient-to-br from-blue-400 to-blue-600 h-48">
        {coverImageUrl && (
          <img
            src={coverImageUrl}
            alt={community.name}
            className="w-full h-full object-cover"
          />
        )}
        {getVerificationBadge(community.verificationStatus)}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Area Type */}
        <div className="mb-2">
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
            {community.name}
          </h3>
          <p className="text-sm text-gray-500">
            {getAreaTypeDisplay(community.areaType)}
          </p>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {community.description}
        </p>

        {/* Location */}
        <div className="flex items-start gap-2 mb-3 text-sm text-gray-600">
          <MapPin size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">{community.address}</p>
            <p className="text-xs">{community.city}, {community.state} {community.pincode}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Users size={16} className="text-blue-500" />
            <span>{community.population || 0} residents</span>
          </div>
          <div className="text-sm text-gray-600">
            {community.activitiesCount || 0} activities
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/community/${community._id}`}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-center text-sm font-semibold transition-colors duration-200"
          >
            View Details
          </Link>
          {onJoin && (
            <button
              onClick={() => onJoin(community._id)}
              disabled={isLoading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-semibold transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Heart size={16} />
              Join
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;
