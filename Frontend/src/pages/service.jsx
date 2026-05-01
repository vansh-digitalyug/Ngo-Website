import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchServices, selectServices, selectServicesStatus } from "../store/slices/servicesSlice";
import {
  FaBuilding,
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
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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
    const defaultId = fromUrl ? fromUrl.id : ALL_CAUSES_ID;
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
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(serviceId === ALL_CAUSES_ID ? "/services" : `/services/${serviceId}`);
  };

  const openModal = (program) => {
    setSelectedProgram(program);
    setTimeout(() => setModalOpen(true), 10);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedProgram(null), 300); // Wait for animation
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <p className="text-xl font-bold text-red-600 mb-2">Oops!</p>
          <p className="text-gray-600">{fetchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-teal-200 selection:text-teal-900">
      {/* HERO SECTION */}
      <div className="relative w-full h-80 md:h-[26rem] bg-slate-900 overflow-hidden flex items-center">
        {/* Background Gradients & Patterns */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 via-slate-900 to-black opacity-90"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl"></div>
        
        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full animate-[fadeInUp_0.8s_ease-out]">
          <span className="inline-block py-1 px-3 rounded-full bg-teal-500/20 text-teal-300 text-sm font-semibold tracking-wider mb-4 border border-teal-500/30">
            MAKE AN IMPACT
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight max-w-3xl">
            Discover Services for <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-200">Lasting Change.</span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl font-light leading-relaxed">
            From essential healthcare to economic independence, explore the pathways we are building to uplift marginalized communities.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* SIDEBAR */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Find a Service */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Find a Service</h2>
                <div className="relative mb-8 group">
                  <FaSearch className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 focus:bg-white transition-all text-sm"
                  />
                </div>

                {/* Categories */}
                <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Categories</h3>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleServiceChange(ALL_CAUSES_ID)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeServiceId === ALL_CAUSES_ID
                        ? "bg-teal-50 text-teal-700 font-bold shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                    }`}
                  >
                    All Causes
                  </button>
                  {serviceData.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceChange(service.id)}
                      className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${
                        activeServiceId === service.id
                          ? "bg-teal-50 text-teal-700 font-bold shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                      }`}
                    >
                      <service.icon className={`text-lg transition-transform duration-300 ${activeServiceId === service.id ? "scale-110" : "group-hover:scale-110"}`} />
                      <span className="text-sm">{service.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Help Section */}
              <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg text-center overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                <h3 className="font-bold text-white mb-2 relative z-10">Want to Help?</h3>
                <p className="text-sm text-slate-300 mb-6 relative z-10 font-light">
                  Support our initiatives by volunteering or donating today.
                </p>
                <button className="relative z-10 w-full bg-rose-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-500/30 transition-all duration-300 active:scale-95">
                  Get Involved
                </button>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="lg:col-span-3">
            {/* Section Header */}
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
                  {getCatLabel(activeServiceId)}
                </h2>
                <p className="text-slate-500">
                  Showing {visiblePrograms.length} active {visiblePrograms.length === 1 ? 'program' : 'programs'}
                </p>
              </div>
            </div>

            {/* Programs List */}
            <div className="space-y-8">
              {visiblePrograms.length > 0 ? (
                visiblePrograms.map((program, index) => (
                  <div
                    key={`${program.serviceId}-${program.title}-${index}`}
                    className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-400 cursor-pointer overflow-hidden flex flex-col sm:flex-row"
                    onClick={() => openModal(program)}
                  >
                    {/* Image */}
                    <div className="sm:w-2/5 h-56 sm:h-auto bg-slate-100 overflow-hidden relative">
                      {program.image ? (
                        <img
                          src={program.image}
                          alt={program.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <span className="text-slate-400 text-sm font-medium">No Image</span>
                        </div>
                      )}
                      {activeServiceId === ALL_CAUSES_ID && (
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-teal-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                          {getCatLabel(program.serviceId)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="sm:w-3/5 p-6 md:p-8 flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-teal-700 transition-colors">
                          {program.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
                          {program.description}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-4 flex-wrap items-center mt-auto">
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
                          className="px-6 py-2.5 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-500 shadow-md shadow-rose-600/20 hover:shadow-lg hover:shadow-rose-600/40 transition-all active:scale-95"
                        >
                          {program.cta || "Help Now"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(program);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 text-slate-500 font-semibold text-sm hover:text-teal-600 transition-colors"
                        >
                          Explore Details
                          <FaChevronRight className="text-xs group-hover:translate-x-1.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center shadow-sm">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4">
                    <FaSearch className="text-slate-300 text-2xl" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">No programs found</h3>
                  <p className="text-slate-500 max-w-md mx-auto">
                    We couldn't find any programs matching your search. Try adjusting your keywords or switching categories.
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
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
            modalOpen ? "bg-slate-900/60 backdrop-blur-sm opacity-100" : "bg-transparent opacity-0 pointer-events-none"
          }`}
          onClick={closeModal}
        >
          <div
            className={`bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col transition-all duration-300 transform ${
              modalOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Image */}
            <div className="relative h-56 sm:h-72 bg-slate-100 flex-shrink-0">
              {selectedProgram.image ? (
                <img
                  src={selectedProgram.image}
                  alt={selectedProgram.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-slate-400 font-medium">No Image Available</span>
                </div>
              )}
              
              {/* Gradient Overlay for better close button visibility */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent"></div>
              
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full p-2.5 transition-all active:scale-95"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
              <p className="text-teal-600 text-xs font-bold uppercase tracking-widest mb-2">
                About This Initiative
              </p>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-6">{selectedProgram.title}</h2>
              
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed mb-8">
                {selectedProgram.fullDescription || selectedProgram.description}
              </div>

              {/* Modal Actions */}
              <div className="flex gap-4 flex-col sm:flex-row mt-auto pt-6 border-t border-slate-100">
                <button
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Close Details
                </button>
                <button
                  onClick={() => {
                    closeModal();
                    navigate("/donate", {
                      state: {
                        serviceImage: selectedProgram.image,
                        serviceTitle: selectedProgram.donationTitle,
                      },
                    });
                  }}
                  className="flex-1 px-6 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-500 shadow-md shadow-rose-600/20 hover:shadow-lg transition-all active:scale-95"
                >
                  {selectedProgram.cta || "Help Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adding a small inline style block for the custom-scrollbar to keep everything self-contained */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

export default ServicePage;