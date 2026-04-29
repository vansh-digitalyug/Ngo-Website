import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchServices, selectServices, selectServicesStatus } from "../store/slices/servicesSlice";
import {
  FaBuilding,
  FaChevronDown,
  FaFemale,
  FaHandHoldingHeart,
  FaHeartbeat,
  FaSearch,
  FaShieldAlt,
  FaTimes,
  FaChevronRight,
} from "react-icons/fa";
import { FaChildren } from "react-icons/fa6";
import { MdElderly } from "react-icons/md";

// Map backend category names → frontend id + icon
const CATEGORY_META = {
  "Women Empowerment": { id: "women-empowerment", icon: FaFemale },
  "Orphan": { id: "orphan", icon: FaChildren },
  "Elderly": { id: "elder", icon: MdElderly },
  "Community Safety": { id: "community-safety", icon: FaShieldAlt },
  "Social Welfare": { id: "social-welfare", icon: FaHandHoldingHeart },
  "Medical Support": { id: "medical-support", icon: FaHeartbeat },
  "Infrastructure": { id: "infrastructure-development", icon: FaBuilding },
};

function metaFor(name) {
  if (CATEGORY_META[name]) return CATEGORY_META[name];
  return { id: name.toLowerCase().replace(/\s+/g, "-"), icon: FaHandHoldingHeart };
}

const ALL_CAUSES_ID = "all-causes";

function ServicePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { category } = useParams();

  // Redux state
  const rawCategories = useSelector(selectServices);
  const servicesStatus = useSelector(selectServicesStatus);

  const [activeServiceId, setActiveServiceId] = useState(ALL_CAUSES_ID);
  const [query, setQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);

  const loading = servicesStatus === "idle" || servicesStatus === "loading";
  const fetchError = servicesStatus === "failed" ? "Failed to load services. Please try again." : null;

  // Trigger Redux fetch on idle
  useEffect(() => {
    if (servicesStatus === "idle") dispatch(fetchServices());
  }, [servicesStatus, dispatch]);

  // Map raw backend categories → enriched serviceData with icons
  const serviceData = useMemo(() => {
    const raw = Array.isArray(rawCategories) ? rawCategories : [];
    return raw.map((cat) => {
      const meta = metaFor(cat.name);
      return {
        id: meta.id,
        label: cat.name,
        icon: meta.icon,
        programs: (cat.programs || []).map((p) => ({
          title: p.title,
          description: p.description,
          fullDescription: p.fullDescription || p.description,
          image: p.imagekeys || "",
          images: p.galleryImageKeys?.length ? p.galleryImageKeys : undefined,
          cta: p.cta || "Help Now",
          href: p.href || null,
          donationTitle: p.donationTitle || p.title,
        })),
      };
    });
  }, [rawCategories]);

  // Set initial active category once data loads
  useEffect(() => {
    if (serviceData.length === 0) return;
    const fromUrl = category ? serviceData.find((s) => s.id === category) : null;
    const defaultId = fromUrl ? fromUrl.id : serviceData[0].id;
    setActiveServiceId(defaultId);
  }, [serviceData, category]);

  const getCatLabel = (serviceId) => {
    if (serviceId === ALL_CAUSES_ID) return "All Causes";
    const svc = serviceData.find((s) => s.id === serviceId);
    return svc ? svc.label : serviceId;
  };

  const selectedService = useMemo(
    () => serviceData.find((s) => s.id === activeServiceId) || null,
    [activeServiceId, serviceData]
  );

  const allPrograms = useMemo(
    () =>
      serviceData.flatMap((s) =>
        s.programs.map((p) => ({ ...p, serviceId: s.id }))
      ),
    [serviceData]
  );

  const sourcePrograms = useMemo(() => {
    if (activeServiceId === ALL_CAUSES_ID) return allPrograms;
    if (!selectedService) return [];
    return selectedService.programs.map((p) => ({ ...p, serviceId: selectedService.id }));
  }, [activeServiceId, allPrograms, selectedService]);

  const visiblePrograms = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sourcePrograms;
    return sourcePrograms.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [query, sourcePrograms]);

  const handleServiceChange = (serviceId) => {
    setActiveServiceId(serviceId);
    navigate(serviceId === ALL_CAUSES_ID ? "/services" : `/services/${serviceId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading services…</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-red-600">{fetchError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO SECTION */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 overflow-hidden">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black opacity-40"></div>

        {/* Hero content */}
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 max-w-2xl">
            Discover Our Comprehensive Services for Lasting Change.
          </h1>
          <p className="text-gray-100 text-sm sm:text-base md:text-lg max-w-2xl">
            From essential healthcare to economic independence, explore the pathways we are building to uplift marginalized communities.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SIDEBAR */}
          <aside className="lg:col-span-1">
            {/* Find a Service */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Find a Service</h2>
              <div className="relative mb-6">
                <FaSearch className="absolute left-3 top-3.5 text-teal-700 text-sm" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              {/* Categories */}
              <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleServiceChange(ALL_CAUSES_ID)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeServiceId === ALL_CAUSES_ID
                      ? "bg-red-100 text-red-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  All Causes
                </button>
                {serviceData.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceChange(service.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      activeServiceId === service.id
                        ? "bg-red-100 text-red-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <service.icon className="text-lg" />
                    <span className="text-sm">{service.label}</span>
                  </button>
                ))}
              </div>

              {/* Help Section */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-2">Want to Help?</h3>
                <p className="text-xs text-gray-600 mb-4">
                  Support our initiatives by volunteering or donating to help us serve better.
                </p>
                <button className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors">
                  Get Involved
                </button>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="lg:col-span-3">
            {/* Section Header */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                All Service Categories
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  Showing services under <strong>{getCatLabel(activeServiceId)}</strong>
                </span>
              </div>
            </div>

            {/* Programs List */}
            <div className="space-y-6">
              {visiblePrograms.length > 0 ? (
                visiblePrograms.map((program, index) => (
                  <div
                    key={`${program.serviceId}-${program.title}-${index}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedProgram(program)}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
                      {/* Image */}
                      <div className="sm:col-span-1 h-48 sm:h-auto bg-gray-200 overflow-hidden">
                        {program.image ? (
                          <img
                            src={program.image}
                            alt={program.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">Image unavailable</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="sm:col-span-2 p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{program.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{program.description}</p>

                        {/* Category badge */}
                        {activeServiceId === ALL_CAUSES_ID && (
                          <div className="mb-4">
                            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                              {getCatLabel(program.serviceId)}
                            </span>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-3 flex-wrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProgram(program);
                            }}
                            className="inline-flex items-center gap-1 px-4 py-2 text-gray-700 font-semibold hover:text-teal-700 transition-colors group"
                          >
                            Explore Details
                            <FaChevronRight className="text-sm group-hover:translate-x-1 transition-transform" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("/donate", {
                                state: {
                                  serviceImage: program.image,
                                  serviceTitle: program.donationTitle,
                                },
                              });
                            }}
                            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                          >
                            {program.cta || "Help Now"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg p-12 text-center">
                  <p className="text-gray-600 mb-2">No programs found</p>
                  <p className="text-sm text-gray-500">
                    Try another search term or switch to a different category.
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* MODAL - Program Details */}
      {selectedProgram && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProgram(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Image */}
            <div className="relative h-48 bg-gray-200 overflow-hidden">
              {selectedProgram.image ? (
                <img
                  src={selectedProgram.image}
                  alt={selectedProgram.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">Image unavailable</span>
                </div>
              )}
              <button
                onClick={() => setSelectedProgram(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
              >
                <FaTimes className="text-gray-800" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedProgram.title}</h2>
              <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-4">
                About This Program
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {selectedProgram.fullDescription || selectedProgram.description}
              </p>

              {/* Modal Actions */}
              <div className="flex gap-3 flex-col sm:flex-row">
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Learn More
                </button>
                <button
                  onClick={() => {
                    setSelectedProgram(null);
                    navigate("/donate", {
                      state: {
                        serviceImage: selectedProgram.image,
                        serviceTitle: selectedProgram.donationTitle,
                      },
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  {selectedProgram.cta || "Help Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServicePage;
