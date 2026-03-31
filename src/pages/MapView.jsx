import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MapSection from '../components/MapSection';
import PageWrapper from '../components/PageWrapper';

function MapView() {
    const [filters, setFilters] = useState({
        garbage: true,
        streetlight: true,
        pothole: true
    });

    const handleFilterChange = (e) => {
        const { id, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            [id]: checked
        }));
    };

    return (
        <PageWrapper className="container-fluid px-3 px-md-4 py-3">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-4">
                    <h1 className="display-5 fw-bold mb-2" style={{ color: 'var(--primary-color)' }}>
                        <i className="bi bi-map me-3"></i>Interactive Map
                    </h1>
                    <p className="text-muted">View reported issues across your neighborhood</p>
                </div>

                <div className="row g-3">
                    {/* Map Section */}
                    <div className="col-12 col-lg-9">
                        <div style={{ height: 'calc(100vh - 250px)', minHeight: '550px' }}>
                            <MapSection activeFilters={filters} height="100%" />
                        </div>
                    </div>

                    {/* Legend and Filters */}
                    <div className="col-12 col-lg-3">
                        <div className="card border-0 shadow-sm rounded-3 mb-3" style={{ background: 'var(--bg-card)' }}>
                            <div className="card-body p-4">
                                <h5 className="fw-semibold mb-3">
                                    <i className="bi bi-funnel me-2 text-primary"></i>Filters
                                </h5>
                                <div className="d-flex flex-column gap-3">
                                    <div className="form-check custom-checkbox">
                                        <input 
                                            className="form-check-input shadow-none" 
                                            type="checkbox" 
                                            id="garbage" 
                                            checked={filters.garbage}
                                            onChange={handleFilterChange}
                                        />
                                        <label className="form-check-label fw-medium" htmlFor="garbage" style={{ cursor: 'pointer' }}>
                                            <i className="bi bi-trash text-danger me-2"></i>Garbage
                                        </label>
                                    </div>
                                    <div className="form-check custom-checkbox">
                                        <input 
                                            className="form-check-input shadow-none" 
                                            type="checkbox" 
                                            id="streetlight" 
                                            checked={filters.streetlight}
                                            onChange={handleFilterChange}
                                        />
                                        <label className="form-check-label fw-medium" htmlFor="streetlight" style={{ cursor: 'pointer' }}>
                                            <i className="bi bi-lightbulb text-warning me-2"></i>Street Lights
                                        </label>
                                    </div>
                                    <div className="form-check custom-checkbox">
                                        <input 
                                            className="form-check-input shadow-none" 
                                            type="checkbox" 
                                            id="pothole" 
                                            checked={filters.pothole}
                                            onChange={handleFilterChange}
                                        />
                                        <label className="form-check-label fw-medium" htmlFor="pothole" style={{ cursor: 'pointer' }}>
                                            <i className="bi bi-exclamation-triangle text-info me-2"></i>Potholes
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm rounded-3" style={{ background: 'var(--bg-card)' }}>
                            <div className="card-body p-4">
                                <h5 className="fw-semibold mb-3">
                                    <i className="bi bi-info-circle me-2 text-primary"></i>Map Legend
                                </h5>
                                <div className="d-flex flex-column gap-3 small">
                                    <div className="d-flex align-items-center">
                                        <span className="badge bg-danger rounded-circle p-2" style={{ width: '14px', height: '14px' }}></span>
                                        <span className="ms-2 fw-medium">Critical Issues</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="badge bg-warning rounded-circle p-2" style={{ width: '14px', height: '14px' }}></span>
                                        <span className="ms-2 fw-medium">Pending Issues</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="badge bg-success rounded-circle p-2" style={{ width: '14px', height: '14px' }}></span>
                                        <span className="ms-2 fw-medium">Resolved Issues</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </PageWrapper>
    );
}

export default MapView;