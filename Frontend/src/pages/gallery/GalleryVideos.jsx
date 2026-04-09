import React, { useState, useEffect } from "react";
import { X, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchGalleryVideos,
  selectGalleryVideos,
  selectGalleryVideosStatus,
} from "../../store/slices/gallerySlice";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const PAGE_SIZE = 12;

const GalleryVideos = () => {
  const dispatch = useDispatch();
  const videos = useSelector(selectGalleryVideos);
  const status = useSelector(selectGalleryVideosStatus);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    if (status === "idle") dispatch(fetchGalleryVideos());
  }, [status, dispatch]);

  const loading = status === "loading" || status === "idle";
  const totalPages = Math.max(1, Math.ceil(videos.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedVideos = videos.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openVideoModal = (video, index) => {
    setSelectedVideo(video);
    setCurrentIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
    document.body.style.overflow = "auto";
  };

  const goToPrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex((idx) => (idx === 0 ? paginatedVideos.length - 1 : idx - 1));
    setSelectedVideo(paginatedVideos[currentIndex === 0 ? paginatedVideos.length - 1 : currentIndex - 1]);
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((idx) => (idx === paginatedVideos.length - 1 ? 0 : idx + 1));
    setSelectedVideo(paginatedVideos[currentIndex === paginatedVideos.length - 1 ? 0 : currentIndex + 1]);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedVideo) return;
      if (e.key === "Escape") closeVideoModal();
      if (e.key === "ArrowLeft") goToPrevious(e);
      if (e.key === "ArrowRight") goToNext(e);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedVideo, currentIndex, paginatedVideos]);

  const getEmbedUrl = (url) => {
    if (url.includes("youtube") || url.includes("youtu.be")) {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
      return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
    }
    if (url.includes("vimeo")) {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1` : url;
    }
    return url;
  };

  const getThumbnailUrl = (thumbnail) => {
    if (!thumbnail) return "https://via.placeholder.com/640x360?text=Video+Thumbnail";
    if (thumbnail.startsWith("http")) return thumbnail;
    return `${API_BASE_URL}${thumbnail}`;
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Hero Section - Dark Background */}
      <div className="bg-blue-100 text-blue-900 py-8 px-4 sm:py-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 tracking-tight">
            Video Gallery
          </h1>
          <div className="h-1 w-32 bg-green-500"></div>
        </div>
      </div>

      {/* Main Content - Full Width Blue-50 Background */}
      <div className="w-full bg-blue-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-teal-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4 font-medium">Loading videos...</p>
          </div>
        ) : paginatedVideos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Videos Found</h3>
            <p className="text-gray-600">No videos uploaded yet.</p>
          </div>
        ) : (
          <>
            {/* Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {paginatedVideos.map((video, index) => (
                <div
                  key={video._id}
                  className="relative rounded-lg overflow-hidden cursor-pointer group bg-gray-900 shadow-md hover:shadow-lg transition-shadow"
                  style={{ aspectRatio: "16/9" }}
                  onClick={() => openVideoModal(video, index)}
                >
                  {/* Thumbnail */}
                  <img
                    src={getThumbnailUrl(video.thumbnail)}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Play Button - Always Visible */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black bg-opacity-60 rounded-full p-4 transition-all duration-300">
                      <Play size={32} className="text-white fill-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-700 font-semibold">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          onClick={closeVideoModal}
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
        >
          {/* Close Button */}
          <button
            onClick={closeVideoModal}
            className="absolute top-6 right-6 text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors z-50"
          >
            <X size={28} />
          </button>

          {/* Navigation */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 p-3 rounded-full transition-colors z-40"
          >
            <ChevronLeft size={32} />
          </button>

          {/* Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-6 max-w-4xl w-full"
          >
            {/* Video Player */}
            <div
              className="w-full rounded-lg overflow-hidden shadow-2xl"
              style={{ aspectRatio: "16/9" }}
            >
              <iframe
                src={getEmbedUrl(selectedVideo.url)}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Info */}
            <div className="bg-slate-900 bg-opacity-80 backdrop-blur text-white rounded-lg p-6 w-full">
              <h3 className="text-2xl font-semibold mb-2">{selectedVideo.title}</h3>
              {selectedVideo.description && (
                <p className="text-gray-300 text-base leading-relaxed mb-4">
                  {selectedVideo.description}
                </p>
              )}
              <div className="text-gray-400 text-sm">
                Video {currentIndex + 1} of {paginatedVideos.length}
              </div>
            </div>
          </div>

          {/* Right Navigation */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 p-3 rounded-full transition-colors z-40"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </div>
  );
};

export default GalleryVideos;
