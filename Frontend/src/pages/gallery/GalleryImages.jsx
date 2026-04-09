import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchGalleryImages,
  selectGalleryImages,
  selectGalleryImagesStatus,
} from "../../store/slices/gallerySlice";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

const resolveUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url}`;
};

const PAGE_SIZE = 12;

const GalleryImages = () => {
  const dispatch = useDispatch();
  const images = useSelector(selectGalleryImages);
  const status = useSelector(selectGalleryImagesStatus);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    if (status === "idle") dispatch(fetchGalleryImages());
  }, [status, dispatch]);

  const loading = status === "loading" || status === "idle";
  const totalPages = Math.max(1, Math.ceil(images.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedImages = images.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openLightbox = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = "auto";
  };

  const goToPrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex((idx) => (idx === 0 ? paginatedImages.length - 1 : idx - 1));
    setSelectedImage(paginatedImages[currentIndex === 0 ? paginatedImages.length - 1 : currentIndex - 1]);
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((idx) => (idx === paginatedImages.length - 1 ? 0 : idx + 1));
    setSelectedImage(paginatedImages[currentIndex === paginatedImages.length - 1 ? 0 : currentIndex + 1]);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goToPrevious(e);
      if (e.key === "ArrowRight") goToNext(e);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, currentIndex, paginatedImages]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Compact with Light Background */}
      <div className="bg-blue-100 text-blue-900 py-8 px-4 sm:py-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 tracking-tight">
            Photo Galleries
          </h1>
          <div className="h-1 w-32 bg-green-500"></div>
        </div>
      </div>

      {/* Main Content - Full Width White Background */}
      <div className="w-full bg-blue-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4 font-medium">Loading gallery...</p>
          </div>
        ) : paginatedImages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Images Found</h3>
            <p className="text-gray-600">No photos uploaded yet.</p>
          </div>
        ) : (
          <>
            {/* Image Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {paginatedImages.map((image, index) => (
                <div
                  key={image._id}
                  className="relative rounded-lg overflow-hidden cursor-pointer group bg-gray-200 shadow-md hover:shadow-lg transition-shadow"
                  style={{ aspectRatio: "4/3" }}
                  onMouseEnter={() => setHoveredId(image._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => openLightbox(image, index)}
                >
                  {/* Image */}
                  <img
                    src={resolveUrl(image.url)}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Overlay on Hover - Light Blue */}
                  <div
                    className={`absolute inset-0 bg-blue-400 transition-opacity duration-300 ${
                      hoveredId === image._id ? "bg-opacity-30" : "bg-opacity-0"
                    }`}
                  />

                  {/* Text Content - Shows on Hover - Slides Up */}
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-500 ${
                      hoveredId === image._id ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                  >
                    <h3 className="text-white font-bold text-2xl line-clamp-2 text-center mb-3">
                      {image.title}
                    </h3>
                    {image.description && (
                      <p className="text-gray-100 text-base text-center line-clamp-3">
                        {image.description}
                      </p>
                    )}
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
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-700 font-semibold">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
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
            {/* Image */}
            <img
              src={resolveUrl(selectedImage.url)}
              alt={selectedImage.title}
              className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-2xl"
            />

            {/* Info */}
            <div className="bg-slate-900 bg-opacity-80 backdrop-blur text-white rounded-lg p-6 w-full">
              <h3 className="text-2xl font-semibold mb-2">{selectedImage.title}</h3>
              {selectedImage.description && (
                <p className="text-gray-300 text-base leading-relaxed mb-4">
                  {selectedImage.description}
                </p>
              )}
              <div className="text-gray-400 text-sm">
                Photo {currentIndex + 1} of {paginatedImages.length}
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

export default GalleryImages;
