// Define the map image URL with error handling
var mapImageUrl = 'map.jpg';

// Add unique ID generator
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Initialize data structures
// These variables should only be declared once
var units = [];
var markers = [];
var groups = [];
var buildings = [];
var sectors = [];
var unitMarkers = new Map();
var groupSummaryMarkers = new Map();
var currentIndicator;
var CLUSTER_ZOOM_THRESHOLD = 3;

// Navigation positions dictionary
var navigationPoints = {
    'Main Entrance': { latlng: [0,0], label: 'Re-center map' },
    // Add more positions as needed
};

// Initialize the map first
const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: 0,
    maxZoom: 6,
    zoom: 2
});

// Log that map object was created
console.log("Map object created:", map);

try {
    // Define bounds and add image overlay
    const bounds = [[0, 0], [500, 800]];
    console.log("Adding image overlay with bounds:", bounds);
    L.imageOverlay(mapImageUrl, bounds).addTo(map);
    
    // Fit map to bounds
    console.log("Fitting map to bounds");
    map.fitBounds(bounds);
    console.log("Map initialization complete");
} catch (error) {
    console.error("Error during map initialization:", error);
}

// Function to load all data from API
function loadAllData() {
    showLoadingSpinner();
    
    // Load sectors
    api.sectors.getAll()
        .then(data => {
            sectors = data;
            return api.groups.getAll();
        })
        .then(data => {
            groups = data;
            return api.buildings.getAll();
        })
        .then(data => {
            buildings = data;
            return api.units.getAll();
        })
        .then(data => {
            units = data;
            return api.navigation.getAll();
        })
        .then(data => {
            // Process navigation points
            navigationPoints = {'Main Entrance': { latlng: [0,0], label: 'Re-center map' }};
            data.forEach(navPoint => {
                navigationPoints[navPoint.name] = {
                    latlng: navPoint.position.latlng,
                    label: navPoint.label,
                    isSector: navPoint.isSector
                };
            });
            
            // Initialize UI
            initializeMarkersFromData();
            renderNavigationMenu();
            if (window.updateSearchFilters) {
                window.updateSearchFilters();
            }
            if (window.renderUnitCards) {
                window.renderUnitCards();
            }
            
            hideLoadingSpinner();
        })
        .catch(error => {
            console.error("Error loading data:", error);
            showNotification('Error loading data from server', 'error');
            hideLoadingSpinner();
        });
}

// Initialize markers from loaded data
function initializeMarkersFromData() {
    // Clear existing markers
    unitMarkers.forEach(marker => map.removeLayer(marker));
    unitMarkers.clear();
    
    // Create unit markers
    units.forEach(unit => {
        const lat = unit.position.lat;
        const lng = unit.position.lng;
        
        const marker = L.marker([lat, lng], {
            icon: L.divIcon({
                html: `
                    <div class="unit-marker ${unit.availability}">
                        <span class="unit-label">${unit.name}</span>
                    </div>`,
                className: 'custom-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                popupAnchor: [0, -15]
            }),
        }).addTo(map);
        
        // Store marker reference
        unitMarkers.set(unit.name, marker);
        
        // Set initial visibility based on current zoom
        if (map.getZoom() <= CLUSTER_ZOOM_THRESHOLD) {
            marker.setOpacity(0);
        }
        
        // Update popup content
        marker.bindPopup(`
            <div class="unit-popup">
                <h3>${unit.name}</h3>
                <div class="popup-details">
                    <p><i class="fas fa-building"></i> ${unit.buildingName}</p>
                    <p><i class="fas fa-home"></i> ${unit.type}</p>
                    <p><i class="fas fa-ruler-combined"></i> ${unit.area} m²</p>
                    <p><i class="fas fa-tag"></i> $${Number(unit.price).toLocaleString()}</p>
                    <p><i class="fas fa-check-circle"></i> Status: <span class="status-${unit.availability}">${unit.availability.charAt(0).toUpperCase() + unit.availability.slice(1)}</span></p>
                </div>
                <button onclick="showUnitDetails('${unit.name}', ${lat}, ${lng})" class="details-btn">
                    View Details
                </button>
            </div>
        `);
    });
    
    // Update visibility
    updateMarkerVisibility();
}

// Show loading spinner
function showLoadingSpinner() {
    // Create loading overlay if it doesn't exist
    if (!document.getElementById('loadingOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading data...</p>
        `;
        document.body.appendChild(overlay);
    } else {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }
}

// Hide loading spinner
function hideLoadingSpinner() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Search Frame Component
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded, initializing app");
    
    // Set up navigation toggle
    setupNavigationToggle();
    
    // Initialize navigation menu in collapsed state
    const navMenu = document.getElementById('navigationMenu');
    if (navMenu) {
        navMenu.classList.add('collapsed'); // Start collapsed
        console.log("Navigation menu initialized in collapsed state");
    }
    
    // Load data from API
    loadAllData();
    
    // Setup export/import functionality
    setupDataManagement();
    
    // Ensure map is properly initialized
    try {
        // Verify we have access to Leaflet
        if (!window.L) {
            console.error("Leaflet library not loaded!");
            return;
        }
        
        console.log("Map should be available now");
        
        // Test if map.jpg can be loaded
        const img = new Image();
        img.onload = function() {
            console.log("Map image loaded successfully");
        };
        img.onerror = function() {
            console.error("Failed to load map image");
            showNotification("Failed to load map image", "error");
        };
        img.src = mapImageUrl;
        
        // Initialize search if it exists
        if (typeof initializeSearch === 'function') {
            initializeSearch();
        }
        
        // Setup marker visibility
        setTimeout(() => {
            updateMarkerVisibility();
        }, 1000);
    } catch (error) {
        console.error("Error during initialization:", error);
    }
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Splash Screen Handler
document.addEventListener('DOMContentLoaded', function() {
    const splashScreen = document.getElementById('splashScreen');
    
    // Hide splash screen after 4 seconds
    if (splashScreen) {
    setTimeout(() => {
        splashScreen.style.display = 'none';
    }, 4000);
    }
});

// Add navigation positions dictionary
// This is a duplicate and should be deleted
// const navigationPoints = {
//     'Main Entrance': { latlng: [0,0], label: 'Re-center map' },
//     // Add more positions as needed
// };

// Add to Navigation function
window.addToNavigation = function(name, lat, lng, isSector = false) {
    // Create navigation data
    const navData = {
        name: name,
        position: {
            latlng: [lat, lng]
        },
        label: name,
        isSector: isSector
    };
    
    // Show loading notification
    showNotification('Adding to navigation...', 'success');
    
    // Send to API
    api.navigation.create(navData)
        .then(createdNav => {
            // Add the point to navigation points locally
            navigationPoints[name] = {
                latlng: [lat, lng],
                label: name,
                isSector: isSector
            };
            
            // Update the navigation menu
            renderNavigationMenu();
            map.closePopup();
            showNotification('Added to quick navigation', 'success');
        })
        .catch(error => {
            console.error("Error adding to navigation:", error);
            showNotification('Error adding to navigation', 'error');
        });
};

// Update the navigation points rendering function
function renderNavigationMenu() {
    const navigationMenu = document.getElementById('navigationMenu');
    if (!navigationMenu) return;

    navigationMenu.innerHTML = `
        <div class="search-container">
            <input 
                type="text" 
                id="navSearch" 
                placeholder="Search locations..." 
                class="search-input"
            >
            <i class="fas fa-search search-icon"></i>
        </div>
        <div class="nav-buttons">
            ${Object.entries(navigationPoints).map(([name, point]) => `
                <button onclick="navigateTo('${name}')" class="nav-button ${point.isSector ? 'sector' : ''}">
                    <i class="fas fa-${point.isSector ? 'draw-polygon' : 'map-marker-alt'}"></i> 
                    ${name}
                </button>
            `).join('')}
        </div>
    `;

    // Add search functionality
    const searchInput = document.getElementById('navSearch');
    if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const buttons = document.querySelectorAll('.nav-button');
        
        buttons.forEach(button => {
            const text = button.textContent.toLowerCase();
                button.style.display = text.includes(searchTerm) ? 'flex' : 'none';
        });
    });
    }
}

// Function to show the add navigation form
window.showAddNavigationForm = function() {
    navigationMenu.innerHTML = `
        <div class="nav-form">
            <h4>Add Navigation Point</h4>
            <input type="text" id="navPointName" placeholder="Point Name" required>
            <p class="nav-instruction">Click on the map to set position</p>
            <div class="nav-form-buttons">
                <button onclick="cancelNavigation()" class="cancel-button">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;
    
    // Reset map zoom to make selection easier
    map.setZoom(1);
    
    // Add one-time click listener to the map
    map.once('click', function(e) {
        const pointName = document.getElementById('navPointName').value;
        if (pointName.trim() !== '') {
            navigationPoints[pointName] = {
                latlng: [e.latlng.lat, e.latlng.lng],
                label: pointName
            };
            
            // Show success message
            navigationMenu.innerHTML += `
                <div class="success-message">
                    Position set successfully!
                </div>
            `;
            
            // Return to normal navigation menu after short delay
            setTimeout(() => {
                renderNavigationMenu();
            }, 1500);
        }
    });
}

// Function to cancel navigation point addition
window.cancelNavigation = function() {
    renderNavigationMenu();
}

// Initialize the navigation menu
renderNavigationMenu();

// Modify double-click handler to include sectors
map.on('dblclick', function(e) {
    e.originalEvent.preventDefault();
    
    const selectionPopup = L.popup({
        className: 'selection-popup'
    })
    .setLatLng(e.latlng)
    .setContent(`
        <div class="selection-form">
            <h4>What would you like to add?</h4>
            <div class="selection-buttons">
                <button onclick="showSectorForm(${e.latlng.lat}, ${e.latlng.lng})" class="select-btn">
                    <i class="fas fa-draw-polygon"></i> Sector
                </button>
                <button onclick="showGroupForm(${e.latlng.lat}, ${e.latlng.lng})" class="select-btn">
                    <i class="fas fa-layer-group"></i> Group
                </button>
                <button onclick="showBuildingForm(${e.latlng.lat}, ${e.latlng.lng})" class="select-btn">
                    <i class="fas fa-building"></i> Building
                </button>
                <button onclick="showUnitForm(${e.latlng.lat}, ${e.latlng.lng})" class="select-btn">
                    <i class="fas fa-home"></i> Unit
                </button>
            </div>
        </div>
    `)
    .openOn(map);
});

// Sector Form
window.showSectorForm = function(lat, lng) {
    map.closePopup();
    const popup = L.popup({
        className: 'sector-creation-popup'
    })
    .setLatLng([lat, lng])
    .setContent(`
        <div class="popup-form">
            <h4>Add New Sector</h4>
            <div class="popup-form-group">
                <input type="text" id="sectorName" placeholder="Sector Name" required>
            </div>
            <div class="popup-form-buttons">
                <button onclick="createSector(${lat}, ${lng})" class="create-btn">
                    <i class="fas fa-plus"></i> Create
                </button>
                <button onclick="closePopup()" class="cancel-btn">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `)
    .openOn(map);
};

// Group Form
window.showGroupForm = function(lat, lng) {
    map.closePopup();
    
    // Check if there are any sectors first
    if (sectors.length === 0) {
        showNotification('Please create a sector first', 'error');
        return;
    }

    // Create the popup for group creation
    const popup = L.popup({
        className: 'group-creation-popup'
    })
    .setLatLng([lat, lng])
    .setContent(`
        <div class="popup-form">
            <h4>Add New Group</h4>
            <div class="popup-form-group">
                <select id="groupSector" required>
                    <option value="">Select Sector</option>
                    ${sectors.map(sector => 
                        `<option value="${sector.name}">${sector.name}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="popup-form-group">
                <input type="text" id="groupName" placeholder="Group Name" required>
            </div>
            <div class="popup-form-buttons">
                <button onclick="createGroup(${lat}, ${lng})" class="create-btn">
                    <i class="fas fa-plus"></i> Create
                </button>
                <button onclick="closePopup()" class="cancel-btn">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `)
    .openOn(map);
};

// Building Form
window.showBuildingForm = function(lat, lng) {
    map.closePopup();
    
    // Only show groups that exist
    if (groups.length === 0) {
        showNotification('Please create a group first', 'error');
        return;
    }
    
    const groupOptions = groups.map(group => 
        `<option value="${group.name}">${group.name}</option>`
    ).join('');

    const popup = L.popup({
        className: 'building-creation-popup'
    })
    .setLatLng([lat, lng])
    .setContent(`
        <div class="popup-form">
            <h4>Add New Building</h4>
            <div class="popup-form-group">
                <select id="buildingGroup" required>
                    <option value="">Select Group</option>
                    ${groupOptions}
                </select>
            </div>
            <div class="popup-form-group">
                <input type="text" id="buildingName" placeholder="Building Name" required>
            </div>
            <div class="popup-form-buttons">
                <button onclick="createBuilding(${lat}, ${lng})" class="create-btn">
                    <i class="fas fa-plus"></i> Create
                </button>
                <button onclick="closePopup()" class="cancel-btn">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `)
    .openOn(map);
};

// Unit Form
window.showUnitForm = function(lat, lng) {
    map.closePopup();
    
    // Get all buildings
    if (buildings.length === 0) {
        showNotification('Please create a building first', 'error');
        return;
    }
    
    const buildingOptions = buildings.map(building => 
        `<option value="${building.name}">${building.name}</option>`
    ).join('');

    const popup = L.popup({
        className: 'unit-creation-popup'
    })
    .setLatLng([lat, lng])
    .setContent(`
        <div class="popup-form">
            <h4>Add New Unit</h4>
            <div class="popup-form-group">
                <select id="unitBuilding" required>
                    <option value="">Select Building</option>
                    ${buildingOptions}
                </select>
            </div>
            <div class="popup-form-group">
                <input type="text" id="popupUnitName" placeholder="Unit Name" required>
            </div>
            <div class="popup-form-group">
                <input type="number" id="popupUnitPrice" placeholder="Unit Price" required>
            </div>
            <div class="popup-form-group">
                <input type="number" id="popupUnitArea" placeholder="Unit Area (m²)" required>
            </div>
            <div class="popup-form-group">
                <input type="text" id="popupUnitType" placeholder="Unit Type" required>
            </div>
            <div class="popup-form-group availability-toggle">
                <label for="popupUnitAvailability">Availability:</label>
                <select id="popupUnitAvailability">
                    <option value="available">Available</option>
                    <option value="not-available">Not Available</option>
                </select>
            </div>
            <div class="popup-form-buttons">
                <button onclick="createUnit(${lat}, ${lng})" class="create-btn">
                    <i class="fas fa-plus"></i> Create
                </button>
                <button onclick="closePopup()" class="cancel-btn">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `)
    .openOn(map);
};

// Create Group
window.createGroup = function(lat, lng) {
    const sectorName = document.getElementById('groupSector').value;
    const groupName = document.getElementById('groupName').value;
    
    if (!sectorName || !groupName) {
        showNotification('Please fill all fields', 'error');
        return;
    }

    // Create full name with sector prefix
    const fullName = `${sectorName} - ${groupName}`;

    // Prepare data for API
    const groupData = {
        name: fullName,
        sectorName,
        position: { lat, lng }
    };

    // Show loading indication
    showNotification('Creating group...', 'success');
    
    // Send to API
    api.groups.create(groupData)
        .then(createdGroup => {
            // Add to local array
            groups.push(createdGroup);

            // Close the creation popup
            map.closePopup();

            // Show navigation suggestion popup
            const addToNavPopup = L.popup({
                className: 'nav-question-popup'
            })
            .setLatLng([lat, lng])
            .setContent(`
                <div class="popup-form">
                    <h4>Add to Quick Navigation?</h4>
                    <div class="popup-form-buttons">
                        <button onclick="addToNavigation('${fullName}', ${lat}, ${lng})" class="create-btn">
                            <i class="fas fa-check"></i> Yes
                        </button>
                        <button onclick="closePopup()" class="cancel-btn">
                            <i class="fas fa-times"></i> No
                        </button>
                    </div>
                </div>
            `)
            .openOn(map);

            showNotification('Group created successfully', 'success');
            
            // Update search filters if the function exists
            if (window.updateSearchFilters) {
                window.updateSearchFilters();
            }
        })
        .catch(error => {
            console.error("Error creating group:", error);
            showNotification('Error creating group', 'error');
        });
};

// Create Building
window.createBuilding = function(lat, lng) {
    const groupName = document.getElementById('buildingGroup').value;
    const buildingName = document.getElementById('buildingName').value;
    
    if (!groupName || !buildingName) {
        showNotification('Please fill all fields', 'error');
        return;
    }

    const fullName = `${groupName} - ${buildingName}`;
    
    // Prepare data for API
    const buildingData = {
        name: fullName,
        groupName,
        position: { lat, lng }
    };

    // Show loading indication
    showNotification('Creating building...', 'success');
    
    // Send to API
    api.buildings.create(buildingData)
        .then(createdBuilding => {
            // Add to local array
            buildings.push(createdBuilding);

            showNotification('Building created successfully', 'success');
            map.closePopup();
            
            // Update search filters if the function exists
            if (window.updateSearchFilters) {
                window.updateSearchFilters();
            }
        })
        .catch(error => {
            console.error("Error creating building:", error);
            showNotification('Error creating building', 'error');
        });
};

// Improved marker visibility management system
function updateMarkerVisibility() {
    const currentZoom = map.getZoom();
    
    // Clear any in-progress transitions
    if (window._visibilityTimeout) {
        clearTimeout(window._visibilityTimeout);
    }
    
    if (currentZoom <= CLUSTER_ZOOM_THRESHOLD) {
        removeGroupSummaries(); // Remove any existing summaries first
        processLowZoom();
    } else {
        removeGroupSummaries();
        processHighZoom();
    }
}

function processLowZoom() {
    // Step 1: Hide all unit markers by iterating over our unitMarkers Map
    for (const [name, marker] of unitMarkers.entries()) {
        marker.setOpacity(0);
    }
    
    // Step 2: Create group summary markers
    setTimeout(() => {
        createGroupSummaries();
    }, 50);
}

function processHighZoom() {
    // Step 1: Remove all group summary markers
    removeGroupSummaries();
    
    // Step 2: Show individual unit markers
    window._visibilityTimeout = setTimeout(() => {
        for (const [name, marker] of unitMarkers.entries()) {
            const unit = units.find(u => u.name === name);
            if (unit && unit.availability === 'available') {
                marker.setOpacity(1);
            } else if (unit) {
                marker.setOpacity(0.7); // Semi-transparent for non-available units
            }
        }
    }, 50);
}

function removeGroupSummaries() {
    // Remove all group summary markers
    for (const [groupName, marker] of groupSummaryMarkers.entries()) {
        map.removeLayer(marker);
    }
    groupSummaryMarkers.clear();
}

function createGroupSummaries() {
    // Create stats object to track counts
    const groupStats = {};
    
    // Initialize counts for all groups
    groups.forEach(group => {
        groupStats[group.name] = {
            available: 0,
            notAvailable: 0,
            position: group.position
        };
    });
    
    // Count units by availability for each group
    units.forEach(unit => {
        // Find which group this unit belongs to
        const building = buildings.find(b => b.name === unit.buildingName);
        if (building && building.groupName) {
            const groupName = building.groupName;
            
            // Make sure the group exists in our stats
            if (groupStats[groupName]) {
                // Increment the appropriate counter
                if (unit.availability === 'available') {
                    groupStats[groupName].available++;
                } else if (unit.availability === 'not-available') {
                    groupStats[groupName].notAvailable++;
                }
            }
        }
    });
    
    // Create a marker for each group that has units
    Object.entries(groupStats).forEach(([groupName, stats]) => {
        // Only create a marker if the group has any units and a valid position
        const totalUnits = stats.available + stats.notAvailable;
        if (totalUnits > 0 && stats.position) {
            // Create the marker
            const marker = L.marker([stats.position.lat, stats.position.lng], {
                icon: L.divIcon({
                    html: `
                        <div class="group-summary-marker">
                            <div class="group-summary-header">${groupName.split(' - ')[1] || groupName}</div>
                            <div class="group-summary-counts">
                                <span class="available-count">${stats.available} ✓</span>
                                <span class="not-available-count">${stats.notAvailable} ✗</span>
                            </div>
                        </div>
                    `,
                    className: 'group-summary-icon',
                    iconSize: [100, 50],
                    iconAnchor: [50, 25]
                })
            }).addTo(map);
            
            // Store the marker in our Map
            groupSummaryMarkers.set(groupName, marker);
            
            // Add click handler to zoom in
            marker.on('click', () => {
                map.flyTo([stats.position.lat, stats.position.lng], CLUSTER_ZOOM_THRESHOLD + 1, {
                    animate: true,
                    duration: 1
                });
            });
        }
    });
}

// Create Unit
window.createUnit = function(lat, lng) {
    const buildingName = document.getElementById('unitBuilding').value;
    const name = document.getElementById('popupUnitName').value;
    const price = document.getElementById('popupUnitPrice').value;
    const area = document.getElementById('popupUnitArea').value;
    const type = document.getElementById('popupUnitType').value;
    const availability = document.getElementById('popupUnitAvailability').value;

    if (!buildingName || !name || !price || !area || !type) {
        showNotification('Please fill all fields', 'error');
        return;
    }

    // Prepare unit data for API
    const unitData = {
        name,
        buildingName,
        type,
        area,
        price,
        availability,
        position: { lat, lng }
    };

    // Show loading indication
    showNotification('Creating unit...', 'success');
    
    // Send to API
    api.units.create(unitData)
        .then(createdUnit => {
            // Add to local array
            units.push(createdUnit);
            
            // Create marker
            const marker = L.marker([lat, lng], {
                icon: L.divIcon({
                    html: `
                        <div class="unit-marker ${availability}">
                            <span class="unit-label">${name}</span>
                        </div>`,
                    className: 'custom-marker',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15],
                    popupAnchor: [0, -15]
                }),
            }).addTo(map);

            // Store marker in our Map for easier management
            unitMarkers.set(name, marker);

            // Set initial visibility based on current zoom
            if (map.getZoom() <= CLUSTER_ZOOM_THRESHOLD) {
                marker.setOpacity(0); // Hide if we're at low zoom
            }

            // Update popup content
            marker.bindPopup(`
                <div class="unit-popup">
                    <h3>${name}</h3>
                    <div class="popup-details">
                        <p><i class="fas fa-building"></i> ${buildingName}</p>
                        <p><i class="fas fa-home"></i> ${type}</p>
                        <p><i class="fas fa-ruler-combined"></i> ${area} m²</p>
                        <p><i class="fas fa-tag"></i> $${Number(price).toLocaleString()}</p>
                        <p><i class="fas fa-check-circle"></i> Status: <span class="status-${availability}">${availability.charAt(0).toUpperCase() + availability.slice(1)}</span></p>
                    </div>
                    <button onclick="showUnitDetails('${name}', ${lat}, ${lng})" class="details-btn">
                        View Details
                    </button>
                </div>
            `);

            showNotification('Unit created successfully', 'success');
            map.closePopup();
            
            // Update visibility
            updateMarkerVisibility();
            if (window.updateSearchFilters) {
                window.updateSearchFilters();
            }
            
            // Update UI
            renderUnitList();
            if (window.renderUnitCards) {
                window.renderUnitCards();
            }
        })
        .catch(error => {
            console.error("Error creating unit:", error);
            showNotification('Error creating unit', 'error');
        });
};

// We need to initialize this properly
document.addEventListener('DOMContentLoaded', function() {
    // Set a timer to ensure map is initialized
    setTimeout(() => {
        // Initialize marker visibility
        updateMarkerVisibility();

        // Set up proper zoom event handler with debounce
        map.off('zoomend'); // Remove any existing handlers
const debouncedUpdate = debounce(updateMarkerVisibility, 200);
map.on('zoomend', debouncedUpdate);
    }, 1000);
});

function renderUnitList() {
    unitList.innerHTML = '';
    units.forEach((unit, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${unit.name}</strong> - ${unit.type}, $${unit.price} 
            <button onclick="removeUnit(${index})">Remove</button>`;
        unitList.appendChild(li);
    });
}

window.removeUnit = function(index) {
    const unit = units[index];
    if (!unit) return;
    
    // Remove from units array
    units.splice(index, 1);

    // Find and remove the associated marker
    const marker = unitMarkers.get(unit.name);
    if (marker) {
        map.removeLayer(marker);
        unitMarkers.delete(unit.name);
    }

    // Update UI
    renderUnitList();
    
    // Update visibility and search results
    updateMarkerVisibility();
    if (window.renderUnitCards) {
        window.renderUnitCards();
    }
    
    showNotification('Unit removed successfully', 'success');
};

// Navigation function
window.navigateTo = function(pointName) {
    const point = navigationPoints[pointName];
    if (!point) return;

        // Remove previous indicator if exists
        if (currentIndicator) {
            map.removeLayer(currentIndicator);
        }
        
    // Find if it's a group
        const isGroup = groups.some(group => group.name === pointName);
        
    // Set appropriate zoom level
    const zoomLevel = isGroup ? 5 : 3;
        
        // Create indicator circle
        currentIndicator = L.circle(point.latlng, {
        color: isGroup ? '#3498db' : '#e74c3c',
        fillColor: isGroup ? '#3498db' : '#e74c3c',
            fillOpacity: 0.2,
        radius: isGroup ? 40 : 20
        }).addTo(map);
        
    // Center map with animation
        map.flyTo(point.latlng, zoomLevel, {
            animate: true,
            duration: 1
        });

        // Add pulsing effect
        setTimeout(() => {
            currentIndicator.setStyle({
                fillOpacity: 0.1,
            radius: isGroup ? 60 : 30
            });
        }, 500);

    showNotification(`Navigating to ${isGroup ? 'Group' : 'Location'}: ${pointName}`, 'success');
};

// إضافة نظام إشعارات
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        ${message}
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }, 100);
}

window.showUnitDetails = function(unitName, lat, lng) {
    const unit = units.find(u => u.name === unitName && 
                               u.position.lat === lat && 
                               u.position.lng === lng);
    if (!unit) return;

    const modal = document.createElement('div');
    modal.className = 'unit-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${unit.name}</h2>
                <button onclick="this.closest('.unit-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="unit-info">
                    <p><i class="fas fa-building"></i> Building: ${unit.buildingName}</p>
                    <p><i class="fas fa-home"></i> Type: ${unit.type}</p>
                    <p><i class="fas fa-ruler-combined"></i> Area: ${unit.area} m²</p>
                    <p><i class="fas fa-tag"></i> Price: $${Number(unit.price).toLocaleString()}</p>
                    <p><i class="fas fa-check-circle"></i> Status: <span class="status-${unit.availability}">${unit.availability.charAt(0).toUpperCase() + unit.availability.slice(1)}</span></p>
                </div>
                <div class="unit-actions">
                    <button onclick="editUnit('${unit.name}', ${unit.position.lat}, ${unit.position.lng})" class="edit-btn">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deleteUnit('${unit.name}', ${unit.position.lat}, ${unit.position.lng})" class="delete-btn">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

// Edit Unit Function
window.editUnit = function(unitName, lat, lng) {
    const unit = units.find(u => u.name === unitName && 
                               u.position.lat === lat && 
                               u.position.lng === lng);
    if (!unit) return;

    // Close existing modal
    document.querySelector('.unit-modal')?.remove();

    const popup = L.popup({
        className: 'unit-edit-popup'
    })
    .setLatLng(unit.position)
    .setContent(`
        <div class="popup-form">
            <h4>Edit Unit</h4>
            <div class="popup-form-group">
                <select id="editUnitBuilding" required>
                    ${buildings.map(building => `
                        <option value="${building.name}" ${building.name === unit.buildingName ? 'selected' : ''}>
                            ${building.name}
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="popup-form-group">
                <input type="text" id="editUnitName" value="${unit.name}" placeholder="Unit Name" required>
            </div>
            <div class="popup-form-group">
                <input type="number" id="editUnitPrice" value="${unit.price}" placeholder="Unit Price" required>
            </div>
            <div class="popup-form-group">
                <input type="number" id="editUnitArea" value="${unit.area}" placeholder="Unit Area (m²)" required>
            </div>
            <div class="popup-form-group">
                <input type="text" id="editUnitType" value="${unit.type}" placeholder="Unit Type" required>
            </div>
            <div class="popup-form-group availability-toggle">
                <label for="editUnitAvailability">Availability:</label>
                <select id="editUnitAvailability">
                    <option value="available" ${unit.availability === 'available' ? 'selected' : ''}>Available</option>
                    <option value="not-available" ${unit.availability === 'not-available' ? 'selected' : ''}>Not Available</option>
                </select>
            </div>
            <div class="popup-form-buttons">
                <button onclick="saveUnitEdit('${unitName}', ${lat}, ${lng})" class="create-btn">
                    <i class="fas fa-save"></i> Save
                </button>
                <button onclick="closePopup()" class="cancel-btn">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `)
    .openOn(map);
};

// Utility function to close popups
window.closePopup = function() {
    map.closePopup();
};

// Remove the sector marker styles
const existingStyle = document.querySelector('style');
if (existingStyle) {
    existingStyle.remove();
}

const existingHighlightStyle = document.querySelector('style:last-of-type');
if (existingHighlightStyle) {
    existingHighlightStyle.remove();
}

// Sector creation function
window.createSector = function(lat, lng) {
    const name = document.getElementById('sectorName').value;
    
    if (!name) {
        showNotification('Please enter sector name', 'error');
        return;
    }

    // Prepare data for API
    const sectorData = {
        name,
        position: { lat, lng }
    };

    // Show loading indication
    showNotification('Creating sector...', 'success');
    
    // Send to API
    api.sectors.create(sectorData)
        .then(createdSector => {
            // Add to local array
            sectors.push(createdSector);
            
            // Ask to add to navigation
            const addToNavPopup = L.popup({
                className: 'nav-question-popup'
            })
            .setLatLng([lat, lng])
            .setContent(`
                <div class="popup-form">
                    <h4>Add to Quick Navigation?</h4>
                    <div class="popup-form-buttons">
                        <button onclick="addToNavigation('${name}', ${lat}, ${lng}, true)" class="create-btn">
                            <i class="fas fa-check"></i> Yes
                        </button>
                        <button onclick="closePopup()" class="cancel-btn">
                            <i class="fas fa-times"></i> No
                        </button>
                    </div>
                </div>
            `)
            .openOn(map);

            showNotification('Sector created successfully', 'success');
            
            // Update search filters if the function exists
            if (window.updateSearchFilters) {
                window.updateSearchFilters();
            }
        })
        .catch(error => {
            console.error("Error creating sector:", error);
            showNotification('Error creating sector', 'error');
        });
};

// This combined function will handle toggling the navigation menu
function setupNavigationToggle() {
    const navMenu = document.getElementById('navigationMenu');
    const toggleNavBtn = document.getElementById('toggleNavMenu');
    
    if (toggleNavBtn && navMenu) {
        // Remove any existing event listeners by cloning the element
        const newToggleBtn = toggleNavBtn.cloneNode(true);
        toggleNavBtn.parentNode.replaceChild(newToggleBtn, toggleNavBtn);
        
        // Add the event listener to the new button
        newToggleBtn.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Toggle button clicked - new handler");
            navMenu.classList.toggle('collapsed');
            
            // Add a visual feedback for the toggle
            if (navMenu.classList.contains('collapsed')) {
                showNotification("Navigation menu hidden", "success");
            } else {
                showNotification("Navigation menu visible", "success");
            }
        });
        console.log("Navigation toggle set up successfully");
    } else {
        console.error("Navigation elements not found:", { toggleNavBtn, navMenu });
    }
}

// Initialize Search Functionality
window.initializeSearch = function() {
    console.log("Initializing search functionality");
    
    // Set up event listeners for search filters
    document.getElementById('sectorFilter').addEventListener('change', function() {
        updateGroupFilter();
        window.renderUnitCards();
    });
    
    document.getElementById('groupFilter').addEventListener('change', function() {
        updateBuildingFilter();
        window.renderUnitCards();
    });
    
    document.getElementById('buildingFilter').addEventListener('change', function() {
        window.renderUnitCards();
    });
    
    document.getElementById('minPrice').addEventListener('input', debounce(window.renderUnitCards, 300));
    document.getElementById('maxPrice').addEventListener('input', debounce(window.renderUnitCards, 300));
    document.getElementById('minArea').addEventListener('input', debounce(window.renderUnitCards, 300));
    document.getElementById('maxArea').addEventListener('input', debounce(window.renderUnitCards, 300));
    
    // Clear filters button
    document.getElementById('clearFilters').addEventListener('click', function() {
        clearAllFilters();
        window.renderUnitCards();
    });
    
    // Initial setup
    window.updateSearchFilters();
    window.renderUnitCards();
    console.log("Search initialization complete");
};

// Update Filters
window.updateSearchFilters = function() {
    console.log("Updating search filters");
    
    // Get filter elements
    const sectorFilter = document.getElementById('sectorFilter');
    
    // Clear previous options except the first one
    while (sectorFilter.options.length > 1) {
        sectorFilter.remove(1);
    }
    
    // Get unique sectors
    const uniqueSectors = [...new Set(sectors.map(sector => sector.name))];
    
    // Add sectors to filter
    uniqueSectors.forEach(sectorName => {
        const option = document.createElement('option');
        option.value = sectorName;
        option.textContent = sectorName;
        sectorFilter.appendChild(option);
    });
    
    // Update dependent filters
    updateGroupFilter();
    updateBuildingFilter();
    console.log("Filters updated successfully");
};

// Update Group Filter based on selected Sector
function updateGroupFilter() {
    console.log("Updating group filter");
    const sectorFilter = document.getElementById('sectorFilter');
    const groupFilter = document.getElementById('groupFilter');
    const selectedSector = sectorFilter.value;
    
    // Clear previous options except the first one
    while (groupFilter.options.length > 1) {
        groupFilter.remove(1);
    }
    
    // Enable/disable based on sector selection
    if (selectedSector) {
        groupFilter.disabled = false;
        
        // Filter groups by selected sector
        const filteredGroups = groups.filter(group => 
            group.sectorName === selectedSector
        );
        
        // Add filtered groups to the dropdown
        filteredGroups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.name;
            option.textContent = group.name.split(' - ')[1] || group.name; // Show only the group part
            groupFilter.appendChild(option);
        });
    } else {
        groupFilter.disabled = true;
    }
}

// Update Building Filter based on selected Group
function updateBuildingFilter() {
    console.log("Updating building filter");
    const groupFilter = document.getElementById('groupFilter');
    const buildingFilter = document.getElementById('buildingFilter');
    const selectedGroup = groupFilter.value;
    
    // Clear previous options except the first one
    while (buildingFilter.options.length > 1) {
        buildingFilter.remove(1);
    }
    
    // Enable/disable based on group selection
    if (selectedGroup && !groupFilter.disabled) {
        buildingFilter.disabled = false;
        
        // Filter buildings by selected group
        const filteredBuildings = buildings.filter(building => 
            building.groupName === selectedGroup
        );
        
        // Add filtered buildings to the dropdown
        filteredBuildings.forEach(building => {
            const option = document.createElement('option');
            option.value = building.name;
            option.textContent = building.name.split(' - ')[1] || building.name; // Show only the building part
            buildingFilter.appendChild(option);
        });
    } else {
        buildingFilter.disabled = true;
    }
}

// Clear all filters
function clearAllFilters() {
    console.log("Clearing all filters");
    document.getElementById('sectorFilter').value = '';
    document.getElementById('groupFilter').value = '';
    document.getElementById('buildingFilter').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('minArea').value = '';
    document.getElementById('maxArea').value = '';
    
    // Disable dependent filters
    document.getElementById('groupFilter').disabled = true;
    document.getElementById('buildingFilter').disabled = true;
}

// Render unit cards based on filters
window.renderUnitCards = function() {
    console.log("Rendering unit cards");
    const unitGrid = document.getElementById('unitGrid');
    const noUnitsMessage = document.getElementById('noUnitsMessage');
    
    // Get filter values
    const selectedSector = document.getElementById('sectorFilter').value;
    const selectedGroup = document.getElementById('groupFilter').value;
    const selectedBuilding = document.getElementById('buildingFilter').value;
    const minPrice = document.getElementById('minPrice').value ? parseFloat(document.getElementById('minPrice').value) : 0;
    const maxPrice = document.getElementById('maxPrice').value ? parseFloat(document.getElementById('maxPrice').value) : Infinity;
    const minArea = document.getElementById('minArea').value ? parseFloat(document.getElementById('minArea').value) : 0;
    const maxArea = document.getElementById('maxArea').value ? parseFloat(document.getElementById('maxArea').value) : Infinity;
    
    // Filter units based on criteria
    let filteredUnits = [...units];
    
    // Apply building filter if selected
    if (selectedBuilding) {
        filteredUnits = filteredUnits.filter(unit => unit.buildingName === selectedBuilding);
    } 
    // Apply group filter if selected (and building not selected)
    else if (selectedGroup) {
        // Get buildings in the selected group
        const groupBuildings = buildings.filter(building => building.groupName === selectedGroup)
            .map(building => building.name);
        
        // Filter units that belong to these buildings
        filteredUnits = filteredUnits.filter(unit => groupBuildings.includes(unit.buildingName));
    }
    // Apply sector filter if selected (and neither building nor group selected)
    else if (selectedSector) {
        // Get groups in the selected sector
        const sectorGroups = groups.filter(group => group.sectorName === selectedSector)
            .map(group => group.name);
        
        // Get buildings in these groups
        const sectorBuildings = buildings.filter(building => sectorGroups.includes(building.groupName))
            .map(building => building.name);
        
        // Filter units that belong to these buildings
        filteredUnits = filteredUnits.filter(unit => sectorBuildings.includes(unit.buildingName));
    }
    
    // Apply price filter
    filteredUnits = filteredUnits.filter(unit => {
        const price = parseFloat(unit.price);
        return price >= minPrice && price <= maxPrice;
    });
    
    // Apply area filter
    filteredUnits = filteredUnits.filter(unit => {
        const area = parseFloat(unit.area);
        return area >= minArea && area <= maxArea;
    });
    
    // Clear the grid
    unitGrid.innerHTML = '';
    
    // Show message if no units match
    if (filteredUnits.length === 0) {
        noUnitsMessage.style.display = 'flex';
    } else {
        noUnitsMessage.style.display = 'none';
        
        // Create and append unit cards
        filteredUnits.forEach(unit => {
            const unitCard = document.createElement('div');
            unitCard.className = `unit-card ${unit.availability}`;
            unitCard.innerHTML = `
                <div class="unit-card-header">
                    <h3>${unit.name}</h3>
                    <span class="unit-type">${unit.type}</span>
                </div>
                <div class="unit-card-body">
                    <p><i class="fas fa-building"></i> ${unit.buildingName}</p>
                    <p><i class="fas fa-ruler-combined"></i> ${unit.area} m²</p>
                    <p><i class="fas fa-tag"></i> $${Number(unit.price).toLocaleString()}</p>
                    <p><i class="fas fa-check-circle"></i> Status: <span class="status-${unit.availability}">${unit.availability.charAt(0).toUpperCase() + unit.availability.slice(1)}</span></p>
                </div>
                <div class="unit-card-footer">
                    <button onclick="showUnitDetails('${unit.name}', ${unit.position.lat}, ${unit.position.lng})" class="view-details-btn">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                    <button onclick="navigateToUnit('${unit.name}', ${unit.position.lat}, ${unit.position.lng})" class="navigate-btn">
                        <i class="fas fa-map-marker-alt"></i> Locate
                    </button>
                </div>
            `;
            unitGrid.appendChild(unitCard);
        });
    }
    console.log(`Rendered ${filteredUnits.length} unit cards`);
};

// Navigate to a specific unit
window.navigateToUnit = function(unitName, lat, lng) {
    // Center map on unit with animation
    map.flyTo([lat, lng], 5, {
        animate: true,
        duration: 1
    });
    
    // Remove previous indicator if exists
    if (currentIndicator) {
        map.removeLayer(currentIndicator);
    }
    
    // Create indicator circle
    currentIndicator = L.circle([lat, lng], {
        color: '#e74c3c',
        fillColor: '#e74c3c',
        fillOpacity: 0.2,
        radius: 15
    }).addTo(map);
    
    // Open the popup
    setTimeout(() => {
        const marker = unitMarkers.get(unitName);
        if (marker) {
            marker.openPopup();
        }
    }, 1000);
    
    showNotification(`Navigating to Unit: ${unitName}`, 'success');
};

// Save Unit Edit Function
window.saveUnitEdit = function(unitName, lat, lng) {
    // Get values from edit form
    const newBuildingName = document.getElementById('editUnitBuilding').value;
    const newName = document.getElementById('editUnitName').value;
    const newPrice = document.getElementById('editUnitPrice').value;
    const newArea = document.getElementById('editUnitArea').value;
    const newType = document.getElementById('editUnitType').value;
    const newAvailability = document.getElementById('editUnitAvailability').value;
    
    // Validate form
    if (!newBuildingName || !newName || !newPrice || !newArea || !newType) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    // Find unit index and ID
    const unitIndex = units.findIndex(u => u.name === unitName && 
                                      u.position.lat === lat && 
                                      u.position.lng === lng);
    
    if (unitIndex === -1) {
        showNotification('Unit not found', 'error');
        return;
    }
    
    const unitId = units[unitIndex].id;
    const originalUnit = units[unitIndex];
    
    // Check if name has changed and if new name already exists (except for this unit)
    if (newName !== originalUnit.name) {
        const nameExists = units.some(u => u.name === newName && (u.position.lat !== lat || u.position.lng !== lng));
        if (nameExists) {
            showNotification('Unit name already exists', 'error');
            return;
        }
    }
    
    // Prepare updated data for API
    const updatedData = {
        name: newName,
        buildingName: newBuildingName,
        type: newType,
        area: newArea,
        price: newPrice,
        availability: newAvailability,
        position: { lat, lng }
    };

    // Show loading notification
    showNotification('Updating unit...', 'success');
    
    // Send update to API
    api.units.update(unitId, updatedData)
        .then(updatedUnit => {
            // Remove the old marker if name has changed
            if (originalUnit.name !== newName) {
                const oldMarker = unitMarkers.get(originalUnit.name);
                if (oldMarker) {
                    map.removeLayer(oldMarker);
                    unitMarkers.delete(originalUnit.name);
                }
            }
            
            // Update the unit in the array
            units[unitIndex] = updatedUnit;
            
            // Create or update marker
            const markerHTML = `
                <div class="unit-marker ${newAvailability}">
                    <span class="unit-label">${newName}</span>
                </div>`;
            
            const markerIcon = L.divIcon({
                html: markerHTML,
                className: 'custom-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                popupAnchor: [0, -15]
            });
            
            // Check if we need to create a new marker or update existing one
            let marker;
            if (originalUnit.name !== newName) {
                // Create new marker
                marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
                unitMarkers.set(newName, marker);
            } else {
                // Update existing marker
                marker = unitMarkers.get(newName);
                if (marker) {
                    marker.setIcon(markerIcon);
                }
            }
            
            // Update marker popup
            if (marker) {
                marker.bindPopup(`
                    <div class="unit-popup">
                        <h3>${newName}</h3>
                        <div class="popup-details">
                            <p><i class="fas fa-building"></i> ${newBuildingName}</p>
                            <p><i class="fas fa-home"></i> ${newType}</p>
                            <p><i class="fas fa-ruler-combined"></i> ${newArea} m²</p>
                            <p><i class="fas fa-tag"></i> $${Number(newPrice).toLocaleString()}</p>
                            <p><i class="fas fa-check-circle"></i> Status: <span class="status-${newAvailability}">${newAvailability.charAt(0).toUpperCase() + newAvailability.slice(1)}</span></p>
                        </div>
                        <button onclick="showUnitDetails('${newName}', ${lat}, ${lng})" class="details-btn">
                            View Details
                        </button>
                    </div>
                `);
            }
            
            // Close popup and show notification
            map.closePopup();
            showNotification('Unit updated successfully', 'success');
            
            // Update visibility and search results
            updateMarkerVisibility();
            
            // Update unit list display
            renderUnitList();
            
            // Update search results if available
            if (window.renderUnitCards) {
                window.renderUnitCards();
            }
        })
        .catch(error => {
            console.error("Error updating unit:", error);
            showNotification('Error updating unit', 'error');
        });
};

// Delete Unit Function
window.deleteUnit = function(unitName, lat, lng) {
    // Find unit index and ID
    const unitIndex = units.findIndex(u => u.name === unitName && 
                                     u.position.lat === lat && 
                                     u.position.lng === lng);
    
    if (unitIndex === -1) {
        showNotification('Unit not found', 'error');
        return;
    }
    
    const unitId = units[unitIndex].id;
    
    // Confirm deletion
    const confirmDelete = confirm(`Are you sure you want to delete unit "${unitName}"?`);
    if (!confirmDelete) return;
    
    // Show loading indication
    showNotification('Deleting unit...', 'success');
    
    // Delete from API
    api.units.delete(unitId)
        .then(deletedUnit => {
            // Remove marker
            const marker = unitMarkers.get(unitName);
            if (marker) {
                map.removeLayer(marker);
                unitMarkers.delete(unitName);
            }
            
            // Remove unit from array
            units.splice(unitIndex, 1);
            
            // Close any open modals
            document.querySelector('.unit-modal')?.remove();
            
            // Show notification
            showNotification('Unit deleted successfully', 'success');
            
            // Update visibility and search results
            updateMarkerVisibility();
            
            // Update unit list display
            renderUnitList();
            
            // Update search results if available
            if (window.renderUnitCards) {
                window.renderUnitCards();
            }
        })
        .catch(error => {
            console.error("Error deleting unit:", error);
            showNotification('Error deleting unit', 'error');
        });
};

// Setup data export and import functionality
function setupDataManagement() {
    const exportBtn = document.getElementById('exportData');
    const importBtn = document.getElementById('importData');
    const importFile = document.getElementById('importFile');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            // Show loading notification
            showNotification('Preparing data export...', 'success');
            
            // Get all data from API
            api.export()
                .then(data => {
                    // Create downloadable file
                    const dataStr = JSON.stringify(data, null, 2);
                    const dataBlob = new Blob([dataStr], {type: 'application/json'});
                    const url = URL.createObjectURL(dataBlob);
                    
                    // Create download link
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `real_estate_map_${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    showNotification('Data exported successfully', 'success');
                })
                .catch(error => {
                    console.error("Error exporting data:", error);
                    showNotification('Error exporting data', 'error');
                });
        });
    }
    
    if (importBtn && importFile) {
        importBtn.addEventListener('click', function() {
            importFile.click();
        });
        
        importFile.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            // Confirm import
            const confirmImport = confirm("Importing data will replace all existing data. Continue?");
            if (!confirmImport) {
                importFile.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Show loading notification
                    showNotification('Importing data...', 'success');
                    showLoadingSpinner();
                    
                    // Send to API
                    api.import(data)
                        .then(response => {
                            // Reload all data
                            loadAllData();
                            showNotification('Data imported successfully', 'success');
                        })
                        .catch(error => {
                            console.error("Error importing data:", error);
                            showNotification('Error importing data', 'error');
                            hideLoadingSpinner();
                        });
                } catch (error) {
                    console.error("Error parsing import file:", error);
                    showNotification('Invalid import file format', 'error');
                }
                
                // Clear file input
                importFile.value = '';
            };
            
            reader.readAsText(file);
        });
    }
}
