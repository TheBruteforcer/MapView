// Search Frame Component
document.getElementById('toggleNavMenu').addEventListener('click', function() {
    const navMenu = document.getElementById('navigationMenu');
    navMenu.classList.toggle('collapsed');
});
document.addEventListener('DOMContentLoaded', function() {
    // Create search frame container
    const searchFrameContainer = document.createElement('div');
    searchFrameContainer.id = 'searchFrameContainer';
    searchFrameContainer.className = 'search-frame-container';
    
    // Add search frame HTML
    searchFrameContainer.innerHTML = `
        <div class="search-frame">
            <div class="search-filters">
                <div class="filter-group">
                    <label for="sectorFilter">Sector:</label>
                    <select id="sectorFilter">
                        <option value="">All Sectors</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="groupFilter">Group:</label>
                    <select id="groupFilter" disabled>
                        <option value="">All Groups</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="buildingFilter">Building:</label>
                    <select id="buildingFilter" disabled>
                        <option value="">All Buildings</option>
                    </select>
                </div>
                <div class="filter-group range-filter">
                    <label>Price Range:</label>
                    <div class="range-inputs">
                        <input type="number" id="minPrice" placeholder="Min Price" min="0">
                        <span>to</span>
                        <input type="number" id="maxPrice" placeholder="Max Price" min="0">
                    </div>
                </div>
                <div class="filter-group range-filter">
                    <label>Area Range (m²):</label>
                    <div class="range-inputs">
                        <input type="number" id="minArea" placeholder="Min Area" min="0">
                        <span>to</span>
                        <input type="number" id="maxArea" placeholder="Max Area" min="0">
                    </div>
                </div>
                <button id="clearFilters" class="clear-filters-btn">
                    <i class="fas fa-times"></i> Clear Filters
                </button>
            </div>
            <div class="unit-grid-container">
                <div id="unitGrid" class="unit-grid"></div>
                <div id="noUnitsMessage" class="no-units-message" style="display: none;">
                    <i class="fas fa-search"></i>
                    <p>No units match your search criteria</p>
                </div>
            </div>
        </div>
    `;
    
    // Insert search frame after the map
    const mapElement = document.getElementById('map');
    mapElement.parentNode.insertBefore(searchFrameContainer, mapElement.nextSibling);
    
    // Initialize search functionality
    initializeSearch();
});

function initializeSearch() {
    // Get filter elements
    const sectorFilter = document.getElementById('sectorFilter');
    const groupFilter = document.getElementById('groupFilter');
    const buildingFilter = document.getElementById('buildingFilter');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const unitGrid = document.getElementById('unitGrid');
    const noUnitsMessage = document.getElementById('noUnitsMessage');
    
    // Initialize: disable group and building filters until sector is selected
    groupFilter.disabled = true;
    buildingFilter.disabled = true;
    
    // Populate sector filter
    function populateSectorFilter() {
        sectorFilter.innerHTML = '<option value="">All Sectors</option>';
        
        // Get unique sectors from the sectors array
        sectors.forEach(sector => {
            const option = document.createElement('option');
            option.value = sector.name;
            option.textContent = sector.name;
            sectorFilter.appendChild(option);
        });
    }
    
    // Populate group filter based on selected sector
    function populateGroupFilter(selectedSector) {
        groupFilter.innerHTML = '<option value="">All Groups</option>';
        
        if (!selectedSector) {
            // If no sector selected, disable groups filter
            groupFilter.disabled = true;
            return;
        }
        
            // Filter groups by selected sector
            const filteredGroups = groups.filter(group => group.sectorName === selectedSector);
        
        if (filteredGroups.length === 0) {
            groupFilter.disabled = true;
            return;
        }
            
            filteredGroups.forEach(group => {
                const option = document.createElement('option');
                option.value = group.name;
                option.textContent = group.name.replace(`${group.sectorName} - `, ''); // Remove sector prefix for display
                option.setAttribute('data-full-name', group.name);
                groupFilter.appendChild(option);
            });
        
        // Enable group filter if options are available
        groupFilter.disabled = false;
    }
    
    // Populate building filter based on selected group
    function populateBuildingFilter(selectedGroup) {
        buildingFilter.innerHTML = '<option value="">All Buildings</option>';
        
        if (!selectedGroup) {
            // If no group selected, disable buildings filter
            buildingFilter.disabled = true;
            return;
        }
        
            // Filter buildings by selected group
            const filteredBuildings = buildings.filter(building => building.groupName === selectedGroup);
        
        if (filteredBuildings.length === 0) {
            buildingFilter.disabled = true;
            return;
        }
            
            filteredBuildings.forEach(building => {
                const option = document.createElement('option');
                option.value = building.name;
                option.textContent = building.name.replace(`${building.groupName} - `, ''); // Remove group prefix for display
                option.setAttribute('data-full-name', building.name);
                buildingFilter.appendChild(option);
            });
        
        // Enable building filter if options are available
        buildingFilter.disabled = false;
    }
    
    // Render unit cards based on filters
    function renderUnitCards() {
        const selectedSector = sectorFilter.value;
        const selectedGroup = groupFilter.value;
        const selectedBuilding = buildingFilter.value;
        const minPrice = Number(document.getElementById('minPrice').value) || 0;
        const maxPrice = Number(document.getElementById('maxPrice').value) || Infinity;
        const minArea = Number(document.getElementById('minArea').value) || 0;
        const maxArea = Number(document.getElementById('maxArea').value) || Infinity;
        
        // Filter units based on selections
        let filteredUnits = [...units]; // Create a copy of units array
        
        // Apply hierarchy filters
        if (selectedBuilding) {
            filteredUnits = filteredUnits.filter(unit => unit.buildingName === selectedBuilding);
        } else if (selectedGroup) {
            filteredUnits = filteredUnits.filter(unit => {
                const building = buildings.find(b => b.name === unit.buildingName);
                return building && building.groupName === selectedGroup;
            });
        } else if (selectedSector) {
            filteredUnits = filteredUnits.filter(unit => {
                const building = buildings.find(b => b.name === unit.buildingName);
                if (!building) return false;
                
                const group = groups.find(g => g.name === building.groupName);
                return group && group.sectorName === selectedSector;
            });
        }
        
        // Apply range filters
        filteredUnits = filteredUnits.filter(unit => {
            const price = parseFloat(unit.price);
            const area = parseFloat(unit.area);
            
            const priceInRange = (!minPrice || price >= minPrice) && 
                                (!maxPrice || price <= maxPrice);
            const areaInRange = (!minArea || area >= minArea) && 
                               (!maxArea || area <= maxArea);
            
            return priceInRange && areaInRange;
        });
        
        // Clear unit grid
        unitGrid.innerHTML = '';
        
        // Show message if no units found
        if (filteredUnits.length === 0) {
            noUnitsMessage.style.display = 'flex';
        } else {
            noUnitsMessage.style.display = 'none';
            
            // Render unit cards
            filteredUnits.forEach(unit => {
                const card = document.createElement('div');
                card.className = `unit-card ${unit.availability}`;
                
                const statusLabel = unit.availability === 'available' ? 'Available' : 'Not Available';
                
                card.innerHTML = `
                    <div class="unit-card-header">
                        <h3>${unit.name}</h3>
                        <span class="unit-type">${unit.type}</span>
                    </div>
                    <div class="unit-card-body">
                        <p><i class="fas fa-ruler-combined"></i> ${unit.area} m²</p>
                        <p><i class="fas fa-tag"></i> $${Number(unit.price).toLocaleString()}</p>
                        <p><i class="fas fa-building"></i> ${unit.buildingName.split(' - ').pop()}</p>
                        <p><i class="fas fa-check-circle"></i> <span class="status-${unit.availability}">${statusLabel}</span></p>
                    </div>
                    <div class="unit-card-footer">
                        <button onclick="showUnitDetails('${unit.name}', ${unit.position.lat}, ${unit.position.lng})" class="view-details-btn">
                            <i class="fas fa-info-circle"></i> Details
                        </button>
                        <button onclick="navigateToUnit('${unit.name}')" class="navigate-btn">
                            <i class="fas fa-map-marker-alt"></i> Locate
                        </button>
                    </div>
                `;
                
                unitGrid.appendChild(card);
            });
        }
        
        // After rendering cards, add comparison buttons
        updateCompareButtons();
    }
    
    // Navigate to unit on map
    window.navigateToUnit = function(unitName) {
        const unit = units.find(u => u.name === unitName);
        if (unit) {
            // Remove previous indicator if exists
            if (currentIndicator) {
                map.removeLayer(currentIndicator);
            }
            
            // Create indicator circle
            currentIndicator = L.circle([unit.position.lat, unit.position.lng], {
                color: '#e74c3c',
                fillColor: '#e74c3c',
                fillOpacity: 0.2,
                radius: 20
            }).addTo(map);
            
            // Center the map with animation
            map.flyTo([unit.position.lat, unit.position.lng], 5, {
                animate: true,
                duration: 1
            });
            
            // Add pulsing effect
            setTimeout(() => {
                currentIndicator.setStyle({
                    fillOpacity: 0.1,
                    radius: 30
                });
            }, 500);
            
            showNotification(`Navigating to Unit: ${unit.name}`, 'success');
        }
    };
    
    // Clear all filters
    function clearFilters() {
        sectorFilter.value = '';
        groupFilter.innerHTML = '<option value="">All Groups</option>';
        buildingFilter.innerHTML = '<option value="">All Buildings</option>';
        document.getElementById('minPrice').value = '';
        document.getElementById('maxPrice').value = '';
        document.getElementById('minArea').value = '';
        document.getElementById('maxArea').value = '';
        
        // Disable dependent filters
        groupFilter.disabled = true;
        buildingFilter.disabled = true;
        
        renderUnitCards();
    }
    
    // Event listeners
    sectorFilter.addEventListener('change', function() {
        // Reset group and building filters when sector changes
        populateGroupFilter(this.value);
        buildingFilter.innerHTML = '<option value="">All Buildings</option>';
        buildingFilter.disabled = true;
        renderUnitCards();
    });
    
    groupFilter.addEventListener('change', function() {
        populateBuildingFilter(this.value);
        renderUnitCards();
    });
    
    buildingFilter.addEventListener('change', function() {
        renderUnitCards();
    });
    
    clearFiltersBtn.addEventListener('click', clearFilters);
    
    // Add these event listeners in the initializeSearch function
    document.getElementById('minPrice').addEventListener('input', renderUnitCards);
    document.getElementById('maxPrice').addEventListener('input', renderUnitCards);
    document.getElementById('minArea').addEventListener('input', renderUnitCards);
    document.getElementById('maxArea').addEventListener('input', renderUnitCards);
    
    // Initialize filters and render units
    populateSectorFilter();
    renderUnitCards();
    
    // Update filters when data changes
    window.updateSearchFilters = function() {
        populateSectorFilter();
        populateGroupFilter(sectorFilter.value);
        populateBuildingFilter(groupFilter.value);
        renderUnitCards();
    };
    
    // Add this function call to createSector, createGroup, createBuilding, and createUnit functions
    const originalCreateSector = window.createSector;
    window.createSector = function(lat, lng) {
        originalCreateSector(lat, lng);
        updateSearchFilters();
    };
    
    const originalCreateGroup = window.createGroup;
    window.createGroup = function(lat, lng) {
        originalCreateGroup(lat, lng);
        updateSearchFilters();
    };
    
    const originalCreateBuilding = window.createBuilding;
    window.createBuilding = function(lat, lng) {
        originalCreateBuilding(lat, lng);
        updateSearchFilters();
    };
    
    const originalCreateUnit = window.createUnit;
    window.createUnit = function(lat, lng) {
        originalCreateUnit(lat, lng);
        updateSearchFilters();
    };
    
    const originalSaveUnitEdit = window.saveUnitEdit;
    window.saveUnitEdit = function(unitName, lat, lng) {
        const unit = units.find(u => u.name === unitName && 
                                   u.position.lat === lat && 
                                   u.position.lng === lng);
        if (!unit) return;

        const newData = {
            name: document.getElementById('editUnitName').value,
            buildingName: document.getElementById('editUnitBuilding').value,
            price: document.getElementById('editUnitPrice').value,
            area: document.getElementById('editUnitArea').value,
            type: document.getElementById('editUnitType').value,
            availability: document.getElementById('editUnitAvailability').value,
            position: unit.position
        };

        if (!newData.name || !newData.buildingName || !newData.price || !newData.area || !newData.type) {
            showNotification('Please fill all fields', 'error');
            return;
        }

        // Update unit data
        const oldAvailability = unit.availability;
        Object.assign(unit, newData);

        // Find and update the marker
        for (let id in map._layers) {
            const layer = map._layers[id];
            if (layer._latlng && 
                layer._latlng.lat === unit.position.lat && 
                layer._latlng.lng === unit.position.lng) {
                
                // Update marker icon
                layer.setIcon(L.divIcon({
                    html: `
                        <div class="unit-marker ${unit.availability}">
                            <span class="unit-label">${unit.name}</span>
                        </div>`,
                    className: 'custom-marker',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15],
                    popupAnchor: [0, -15]
                }));
                
                // Update popup content
                layer.setPopupContent(`
                    <div class="unit-popup">
                        <h3>${unit.name}</h3>
                        <div class="popup-details">
                            <p><i class="fas fa-building"></i> ${unit.buildingName}</p>
                            <p><i class="fas fa-home"></i> ${unit.type}</p>
                            <p><i class="fas fa-ruler-combined"></i> ${unit.area} m²</p>
                            <p><i class="fas fa-tag"></i> $${Number(unit.price).toLocaleString()}</p>
                            <p><i class="fas fa-check-circle"></i> Status: <span class="status-${unit.availability}">${unit.availability.charAt(0).toUpperCase() + unit.availability.slice(1)}</span></p>
                        </div>
                        <button onclick="showUnitDetails('${unit.name}', ${unit.position.lat}, ${unit.position.lng})" class="details-btn">
                            View Details
                        </button>
                    </div>
                `);
                
                // Handle visibility based on zoom level and availability change
                if (map.getZoom() <= CLUSTER_ZOOM_THRESHOLD) {
                    if (unit.availability === 'available') {
                        layer.setOpacity(0);
                    } else {
                        layer.setOpacity(0.5);
                    }
                }
                
                break;
            }
        }

        // Update the search results if availability changed
        if (oldAvailability !== unit.availability) {
            if (window.renderUnitCards) {
                window.renderUnitCards();
            }
        }

        // Update group summaries if needed
        updateMarkerVisibility();

        map.closePopup();
        showNotification('Unit updated successfully', 'success');
    };
    
    const originalDeleteUnit = window.deleteUnit;
    window.deleteUnit = function(unitName) {
        originalDeleteUnit(unitName);
        updateSearchFilters();
    };
}

// Splash Screen Handler
document.addEventListener('DOMContentLoaded', function() {
    const splashScreen = document.getElementById('splashScreen');
    
    // Hide splash screen after 4 seconds
    setTimeout(() => {
        splashScreen.style.display = 'none';
    }, 4000);
});

const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: 0,
    maxZoom: 6,
    zoom: -1
});

const bounds = [[0, 0], [500, 800]]; // Adjust to the image dimensions
L.imageOverlay('map.jpg', bounds).addTo(map);
map.fitBounds(bounds);

const unitForm = document.getElementById('unitForm');
const unitList = document.getElementById('unitList');

let units = [];
let markers = [];
let currentIndicator;

// Add navigation positions dictionary
const navigationPoints = {
    'Main Entrance': { latlng: [0,0], label: 'Re-center map' },
    // Add more positions as needed
};

// Add to Navigation function
window.addToNavigation = function(name, lat, lng, isSector = false) {
    navigationPoints[name] = {
        latlng: [lat, lng],
        label: name,
        isSector: isSector
    };
    
    renderNavigationMenu();
    map.closePopup();
    showNotification('Added to quick navigation', 'success');
};

// Update the navigation points rendering function
function renderNavigationMenu() {
    const navigationMenu = document.getElementById('navigationMenu');
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
            ${Object.keys(navigationPoints).map(point => `
                <button onclick="navigateTo('${point}')" class="nav-button">
                    <i class="fas fa-map-marker-alt"></i> ${point}
                </button>
            `).join('')}
        </div>
    `;

    // Add search functionality
    const searchInput = document.getElementById('navSearch');
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const buttons = document.querySelectorAll('.nav-button');
        
        buttons.forEach(button => {
            const text = button.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                button.style.display = 'flex';
            } else {
                button.style.display = 'none';
            }
        });
    });
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

// Add groups and buildings storage
let groups = [];
let buildings = [];

// Add sectors storage
let sectors = [];

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

    // Get all sectors that contain this point
    const availableSectors = sectors.filter(sector => {
        const distance = map.distance(
            [lat, lng],
            [sector.position.lat, sector.position.lng]
        );
        return true; // Since we removed radius check, all sectors are valid
    });

    if (availableSectors.length === 0) {
        showNotification('This location is not within any sector', 'error');
        return;
    }

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
                    ${availableSectors.map(sector => 
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
    const groupOptions = groups.map(group => 
        `<option value="${group.name}">${group.name}</option>`
    ).join('');
    
    if (!groupOptions) {
        showNotification('Please create a group first', 'error');
        return;
    }

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
            <div class="popup-form-group">
                <input type="number" id="buildingFloors" placeholder="Number of Floors" required>
            </div>
            <div class="popup-form-group">
                <input type="number" id="buildingSections" placeholder="Number of Sections" required>
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

// Unit Form (Modified)
window.showUnitForm = function(lat, lng) {
    map.closePopup();
    
    // Get all buildings
    const buildingOptions = buildings.map(building => 
        `<option value="${building.name}">${building.name}</option>`
    ).join('');
    
    if (!buildingOptions) {
        showNotification('Please create a building first', 'error');
        return;
    }

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

    // Add group with sector reference and full name
    groups.push({
        name: fullName,
        sectorName,
        position: { lat, lng }
    });

    // Ask to add to navigation
    const addToNavPopup = L.popup({
        className: 'nav-question-popup'
    })
    .setLatLng([lat, lng])
    .setContent(`
        <div class="popup-form">
            <h4>Add to Quick Navigation?</h4>
            <div class="popup-form-buttons">
                <button onclick="addToNavigation('${fullName}', ${lat}, ${lng}, false, '${sectorName}')" class="create-btn">
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
};

// Create Building
window.createBuilding = function(lat, lng) {
    const groupName = document.getElementById('buildingGroup').value;
    const buildingName = document.getElementById('buildingName').value;
    const numFloors = parseInt(document.getElementById('buildingFloors').value);
    const numSections = parseInt(document.getElementById('buildingSections').value);
    
    if (!groupName || !buildingName || !numFloors || !numSections) {
        showNotification('Please fill all fields', 'error');
        return;
    }

    const fullName = `${groupName} - ${buildingName}`;
    
    const building = {
        name: fullName,
        groupName,
        position: { lat, lng },
        floors: numFloors,
        sections: numSections,
        units: []
    };
    
    buildings.push(building);

    // Create a point object exactly at the clicked location
    const point = map.latLngToLayerPoint([lat, lng]);
    
    // Create a div element for the marker
    const markerDiv = document.createElement('div');
    markerDiv.className = 'building-marker-container';
    markerDiv.innerHTML = `
        <div class="building-marker">
            <i class="fas fa-building"></i>
        </div>
        <div class="building-label">${buildingName}</div>
    `;
    
    // Create custom popup div
    const popupDiv = document.createElement('div');
    popupDiv.className = 'custom-building-popup';
    popupDiv.innerHTML = `
        <div class="custom-popup-content">
            <div class="popup-header">
                <h3>${buildingName}</h3>
                <button class="close-popup-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="popup-details">
                <p><i class="fas fa-building"></i> Group: ${groupName}</p>
                <p><i class="fas fa-layers"></i> Floors: ${numFloors}</p>
                <p><i class="fas fa-th"></i> Sections per Floor: ${numSections}</p>
            </div>
        </div>
    `;
    popupDiv.style.display = 'none';
    
    // Position marker and popup
    markerDiv.style.position = 'absolute';
    markerDiv.style.left = point.x + 'px';
    markerDiv.style.top = point.y + 'px';
    markerDiv.style.zIndex = 1000;
    markerDiv.style.pointerEvents = 'auto'; // Make sure it's clickable
    markerDiv.style.cursor = 'pointer';
    
    // Add the marker to the map's pane
    map.getPanes().markerPane.appendChild(markerDiv);
    document.body.appendChild(popupDiv); // Add popup to body
    
    // Store references for later updates
    building.markerElement = markerDiv;
    building.popupElement = popupDiv;
    building.point = point;
    
    // Add click handler to show/hide custom popup
    markerDiv.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent map click events
        
        // Position popup above marker
        const markerRect = markerDiv.getBoundingClientRect();
        popupDiv.style.position = 'absolute';
        popupDiv.style.left = markerRect.left + 'px';
        popupDiv.style.top = (markerRect.top - popupDiv.offsetHeight - 10) + 'px';
        popupDiv.style.display = 'block';
    });
    
    // Add close button functionality
    popupDiv.querySelector('.close-popup-btn').addEventListener('click', function() {
        popupDiv.style.display = 'none';
    });
    
    // Close popup when clicking elsewhere
    document.addEventListener('click', function(e) {
        if (!popupDiv.contains(e.target) && !markerDiv.contains(e.target)) {
            popupDiv.style.display = 'none';
        }
    });

    // Update marker position on map move/zoom
    map.on('moveend', function() {
        const newPoint = map.latLngToLayerPoint([lat, lng]);
        markerDiv.style.left = newPoint.x + 'px';
        markerDiv.style.top = newPoint.y + 'px';
        
        // Hide popup when map moves
        popupDiv.style.display = 'none';
    });

    showNotification('Building created successfully', 'success');
    map.closePopup();
};

// Add these variables at the top level with other declarations
let unitMarkers = {};
let groupSummaryMarkers = {};
const CLUSTER_ZOOM_THRESHOLD = 3;

// Main visibility control function
function updateMarkerVisibility() {
    const currentZoom = map.getZoom();
    
    // Clear any in-progress transitions
    if (window._visibilityTimeout) {
        clearTimeout(window._visibilityTimeout);
    }
    
    if (currentZoom <= CLUSTER_ZOOM_THRESHOLD) {
        // At low zoom, hide all markers and show summaries
        hideAllUnitMarkers();
        window._visibilityTimeout = setTimeout(showGroupSummaries, 100);
    } else {
        // At high zoom, hide summaries and show all markers
        hideGroupSummaries();
        window._visibilityTimeout = setTimeout(showAllUnitMarkers, 100);
    }
}

// Hide all unit markers regardless of type
function hideAllUnitMarkers() {
    for (let id in map._layers) {
        const layer = map._layers[id];
        if (layer._icon) {
            const unitMarkerEl = layer._icon.querySelector('.unit-marker');
            if (unitMarkerEl) {
                layer.setOpacity(0);
            }
        }
    }
}

// Show all unit markers with appropriate opacity based on availability
function showAllUnitMarkers() {
    for (let id in map._layers) {
        const layer = map._layers[id];
        if (layer._icon) {
            const unitMarkerEl = layer._icon.querySelector('.unit-marker');
            if (unitMarkerEl) {
                if (unitMarkerEl.classList.contains('available')) {
                    layer.setOpacity(1); // Full opacity for available
                } else if (unitMarkerEl.classList.contains('not-available')) {
                    layer.setOpacity(0.5); // Semi-transparent for unavailable
                } else {
                    layer.setOpacity(1); // Default fallback
                }
            }
        }
    }
}

// Remove all group summary markers
function hideGroupSummaries() {
    for (let id in map._layers) {
        const layer = map._layers[id];
        if (layer._icon && layer._icon.classList.contains('group-summary-icon')) {
            map.removeLayer(layer);
        }
    }
}

// Create and display summary markers for each group
function showGroupSummaries() {
    // Remove any existing summary markers first
    hideGroupSummaries();
    
    // Create stats object to track counts by group
    const groupStats = {};
    
    // Initialize counts for all groups
    groups.forEach(group => {
        groupStats[group.name] = {
            available: 0,
            notAvailable: 0,
            position: group.position
        };
    });
    
    // Count units by group and availability
    units.forEach(unit => {
        const building = buildings.find(b => b.name === unit.buildingName);
        if (building && building.groupName) {
            const groupName = building.groupName;
            if (groupStats[groupName]) {
                if (unit.availability === 'available') {
                    groupStats[groupName].available++;
                } else if (unit.availability === 'not-available') {
                    groupStats[groupName].notAvailable++;
                }
            }
        }
    });
    
    // Create marker for each group that has units
    Object.entries(groupStats).forEach(([groupName, stats]) => {
        const totalUnits = stats.available + stats.notAvailable;
        if (totalUnits > 0 && stats.position) {
            // Create the summary marker
            const marker = L.marker([stats.position.lat, stats.position.lng], {
                icon: L.divIcon({
                    html: `
                        <div class="group-summary-marker">
                            <div class="group-summary-header">${groupName.split(' - ')[1]}</div>
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
            
            // Add click handler to zoom in to this group
            marker.on('click', () => {
                map.flyTo([stats.position.lat, stats.position.lng], CLUSTER_ZOOM_THRESHOLD + 1, {
                    animate: true,
                    duration: 1
                });
            });
        }
    });
}

// Modified createUnit function to handle marker visibility
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

    // Create marker with appropriate icon
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

    // Set initial visibility based on current zoom
    if (map.getZoom() <= CLUSTER_ZOOM_THRESHOLD) {
        marker.setOpacity(0); // Hide if we're at low zoom
    } else {
        // Set opacity based on availability
        marker.setOpacity(availability === 'available' ? 1 : 0.5);
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

    // Store unit data
    units.push({
        name,
        buildingName,
        type,
        area,
        price,
        availability,
        position: { lat, lng }
    });

    showNotification('Unit created successfully', 'success');
    map.closePopup();
    
    // Update visibility to ensure consistent state
    updateMarkerVisibility();
    if (window.updateSearchFilters) {
        window.updateSearchFilters();
    }
};

// Updated saveUnitEdit to properly handle visibility changes
window.saveUnitEdit = function(unitName, lat, lng) {
    const unit = units.find(u => u.name === unitName && 
                            u.position.lat === lat && 
                            u.position.lng === lng);
    if (!unit) return;

    // Get new values from form
    const newData = {
        name: document.getElementById('editUnitName').value,
        buildingName: document.getElementById('editUnitBuilding').value,
        price: document.getElementById('editUnitPrice').value,
        area: document.getElementById('editUnitArea').value,
        type: document.getElementById('editUnitType').value,
        availability: document.getElementById('editUnitAvailability').value,
        position: unit.position
    };

    if (!newData.name || !newData.buildingName || !newData.price || !newData.area || !newData.type) {
        showNotification('Please fill all fields', 'error');
        return;
    }

    // Store old values for comparison
    const oldAvailability = unit.availability;
    
    // Update unit data
    Object.assign(unit, newData);

    // Find and update the marker
    for (let id in map._layers) {
        const layer = map._layers[id];
        if (layer._latlng && 
            layer._latlng.lat === unit.position.lat && 
            layer._latlng.lng === unit.position.lng) {
                
            // Update marker icon
            layer.setIcon(L.divIcon({
                html: `
                    <div class="unit-marker ${unit.availability}">
                        <span class="unit-label">${unit.name}</span>
                    </div>`,
                className: 'custom-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                popupAnchor: [0, -15]
            }));
            
            // Update popup content
            layer.setPopupContent(`
                <div class="unit-popup">
                    <h3>${unit.name}</h3>
                    <div class="popup-details">
                        <p><i class="fas fa-building"></i> ${unit.buildingName}</p>
                        <p><i class="fas fa-home"></i> ${unit.type}</p>
                        <p><i class="fas fa-ruler-combined"></i> ${unit.area} m²</p>
                        <p><i class="fas fa-tag"></i> $${Number(unit.price).toLocaleString()}</p>
                        <p><i class="fas fa-check-circle"></i> Status: <span class="status-${unit.availability}">${unit.availability.charAt(0).toUpperCase() + unit.availability.slice(1)}</span></p>
                    </div>
                    <button onclick="showUnitDetails('${unit.name}', ${unit.position.lat}, ${unit.position.lng})" class="details-btn">
                        View Details
                    </button>
                </div>
            `);
            
            // Update visibility based on current zoom and availability
            if (map.getZoom() <= CLUSTER_ZOOM_THRESHOLD) {
                layer.setOpacity(0); // Hide at low zoom
            } else {
                // Show with appropriate opacity based on availability
                layer.setOpacity(unit.availability === 'available' ? 1 : 0.5);
            }
            
            break;
        }
    }

    // Update the search results if needed
    if (oldAvailability !== unit.availability) {
        if (window.renderUnitCards) {
            window.renderUnitCards();
        }
    }

    // Update group summaries
    updateMarkerVisibility();

    map.closePopup();
    showNotification('Unit updated successfully', 'success');
};

// Add a debounce function for the zoom handler
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Set up the zoom handler with debouncing
const debouncedUpdate = debounce(updateMarkerVisibility, 200);
map.off('zoomend'); // Remove any existing handlers
map.on('zoomend', debouncedUpdate);

// CSS for the group summary markers
const markerStyles = `
.group-summary-marker {
    background: white;
    border-radius: 8px;
    padding: 6px 10px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
    border: 2px solid #3498db;
    min-width: 90px;
    text-align: center;
    cursor: pointer;
    transition: transform 0.2s ease;
    pointer-events: auto;
}

.group-summary-marker:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.group-summary-header {
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 5px;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.group-summary-counts {
    display: flex;
    justify-content: center;
    gap: 12px;
    font-size: 0.8rem;
}

.available-count {
    color: #2ecc71;
    font-weight: bold;
}

.not-available-count {
    color: #e74c3c;
    font-weight: bold;
}

.group-summary-icon {
    pointer-events: auto !important;
    opacity: 1 !important;
}

.custom-marker {
    transition: opacity 0.3s ease !important;
}
`;

// Add the styles to the document
const styleElement = document.createElement('style');
styleElement.textContent = markerStyles;
document.head.appendChild(styleElement);

// Initialize visibility on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateMarkerVisibility, 1500);
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

window.removeUnit = function (index) {
    const { position } = units[index];
    units.splice(index, 1);

    // Find and remove the associated marker
    const markerIndex = markers.findIndex(m => m.marker.getLatLng().equals(position));
    if (markerIndex !== -1) {
        map.removeLayer(markers[markerIndex].marker);
        markers.splice(markerIndex, 1);
    }

    renderUnitList();
};

// Navigation function
window.navigateTo = function(pointName) {
    const point = navigationPoints[pointName];
    if (point) {
        // Remove previous indicator if exists
        if (currentIndicator) {
            map.removeLayer(currentIndicator);
        }
        
        // Find if it's a group
        const isGroup = groups.some(group => group.name === pointName);
        
        // Set zoom level based on type
        let zoomLevel = isGroup ? 6 : 3; // Default zoom or group zoom
        
        // Create indicator circle
        currentIndicator = L.circle(point.latlng, {
            color: isGroup ? '#3498db' : '#e74c3c',
            fillColor: isGroup ? '#3498db' : '#e74c3c',
            fillOpacity: 0.2,
            radius: isGroup ? 40 : 20
        }).addTo(map);
        
        // Center the map with animation
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

        // Show notification
        const type = isGroup ? 'Group' : 'Location';
        showNotification(`Navigating to ${type}: ${pointName}`, 'success');
    }
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

// Delete Unit Function
window.deleteUnit = function(unitName, lat, lng) {
    const unitIndex = units.findIndex(u => u.name === unitName && 
                               u.position.lat === lat && 
                               u.position.lng === lng);
    if (unitIndex === -1) return;

    const unit = units[unitIndex];
    
    // Remove unit from array
    units.splice(unitIndex, 1);

    // Remove marker from map
    for (let id in map._layers) {
        const layer = map._layers[id];
        if (layer._latlng && 
            layer._latlng.lat === unit.position.lat && 
            layer._latlng.lng === unit.position.lng) {
            map.removeLayer(layer);
            break;
        }
    }

    // Close modal
    document.querySelector('.unit-modal')?.remove();
    
    // Update the unit grid
    renderUnitCards();
    
    showNotification('Unit deleted successfully', 'success');

    // Remove from unitMarkers
    unitMarkers.delete(unitName);
    
    // Update group summaries
    updateMarkerVisibility();
};

// Close popup helper
window.closePopup = function() {
    map.closePopup();
};

// Create Sector
window.createSector = function(lat, lng) {
    const name = document.getElementById('sectorName').value;
    
    if (!name) {
        showNotification('Please enter sector name', 'error');
        return;
    }

    // Add sector without marker
    sectors.push({
        name,
        position: { lat, lng }
    });

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

// Property Comparison System - Core Module
const comparisonSystem = {
    selectedUnits: [],
    maxUnits: 4, // Maximum units to compare simultaneously
    
    // Add a unit to comparison
    addUnit: function(unitId) {
        const unit = units.find(u => u.name === unitId);
        if (!unit) return false;
        
        // Check if already in comparison
        if (this.selectedUnits.some(u => u.name === unitId)) {
            showNotification('This unit is already in your comparison', 'info');
            return false;
        }
        
        // Check max limit
        if (this.selectedUnits.length >= this.maxUnits) {
            showNotification(`You can compare up to ${this.maxUnits} units at once`, 'error');
            return false;
        }
        
        this.selectedUnits.push(unit);
        this.updateComparisonUI();
        
        showNotification(`Added ${unit.name} to comparison`, 'success');
        return true;
    },
    
    // Remove a unit from comparison
    removeUnit: function(unitId) {
        const initialCount = this.selectedUnits.length;
        this.selectedUnits = this.selectedUnits.filter(u => u.name !== unitId);
        
        if (initialCount !== this.selectedUnits.length) {
            this.updateComparisonUI();
            showNotification(`Removed from comparison`, 'success');
            return true;
        }
        return false;
    },
    
    // Clear all units from comparison
    clearAll: function() {
        this.selectedUnits = [];
        this.updateComparisonUI();
        showNotification('Comparison cleared', 'success');
    },
    
    // Check if a unit is in comparison
    isComparing: function(unitId) {
        return this.selectedUnits.some(u => u.name === unitId);
    },
    
    // Update UI elements with current comparison state
    updateComparisonUI: function() {
        // Update the comparison indicator
        const indicator = document.getElementById('comparisonIndicator');
        if (indicator) {
            indicator.textContent = this.selectedUnits.length;
            
            // Show/hide the indicator based on whether units are selected
            if (this.selectedUnits.length > 0) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        }
        
        // Update compare buttons on all unit cards
        updateCompareButtons();
    },
    
    // Show the comparison modal with selected units
    showComparison: function() {
        if (this.selectedUnits.length === 0) {
            showNotification('Add units to compare first', 'error');
            return;
        }
        
        createComparisonModal(this.selectedUnits);
    }
};

// Add comparison indicator to the page
function initializeComparisonSystem() {
    // Create comparison button in fixed position
    const comparisonButton = document.createElement('div');
    comparisonButton.id = 'comparisonButton';
    comparisonButton.className = 'comparison-button';
    comparisonButton.innerHTML = `
        <div class="comparison-icon">
            <i class="fas fa-balance-scale"></i>
            <span id="comparisonIndicator" class="comparison-indicator">0</span>
        </div>
        <span class="comparison-label">Compare</span>
    `;
    document.body.appendChild(comparisonButton);
    
    // Add click handler to show comparison modal
    comparisonButton.addEventListener('click', function() {
        comparisonSystem.showComparison();
    });
    
    // Add compare buttons to all unit cards
    updateCompareButtons();
}

// Update compare buttons on all unit cards
function updateCompareButtons() {
    // Find all unit cards in grid and add/update comparison buttons
    document.querySelectorAll('.unit-card').forEach(card => {
        const unitId = card.getAttribute('data-unit-id');
        
        // Remove existing compare button if any
        const existingBtn = card.querySelector('.compare-btn');
        if (existingBtn) existingBtn.remove();
        
        // Add the comparison button to card
        const compareBtn = document.createElement('button');
        compareBtn.classList.add('compare-btn');
        
        if (comparisonSystem.isComparing(unitId)) {
            compareBtn.innerHTML = `<i class="fas fa-minus-circle"></i> Remove`;
            compareBtn.classList.add('removing');
            compareBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                comparisonSystem.removeUnit(unitId);
            });
        } else {
            compareBtn.innerHTML = `<i class="fas fa-plus-circle"></i> Compare`;
            compareBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                comparisonSystem.addUnit(unitId);
            });
        }
        
        // Add to card
        const cardFooter = card.querySelector('.unit-card-footer');
        cardFooter.appendChild(compareBtn);
    });
}

// Create comparison modal with detailed comparison view
function createComparisonModal(unitsToCompare) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.comparison-modal');
    if (existingModal) existingModal.remove();
    
    // Create the modal
    const modal = document.createElement('div');
    modal.className = 'comparison-modal';
    
    // Get all property keys for comparison
    const allProperties = [
        { key: 'name', label: 'Unit Name', icon: 'fa-tag' },
        { key: 'type', label: 'Unit Type', icon: 'fa-home' },
        { key: 'area', label: 'Area (m²)', icon: 'fa-ruler-combined', numeric: true },
        { key: 'price', label: 'Price ($)', icon: 'fa-dollar-sign', numeric: true, format: true },
        { key: 'availability', label: 'Status', icon: 'fa-check-circle' },
        { key: 'buildingName', label: 'Building', icon: 'fa-building' }
    ];
    
    // Generate the table for comparison
    const tableHTML = `
        <div class="comparison-content">
            <div class="comparison-header">
                <h2>Property Comparison</h2>
                <div class="comparison-actions">
                    <button id="printComparison" class="comparison-print-btn">
                        <i class="fas fa-print"></i> Print
                    </button>
                    <button id="exportComparisonPDF" class="comparison-export-btn">
                        <i class="fas fa-file-pdf"></i> Export PDF
                    </button>
                    <button id="closeComparison" class="comparison-close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <div class="comparison-table-container">
                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th class="property-header">Property</th>
                            ${unitsToCompare.map(unit => `
                                <th class="unit-header">
                                    <div class="unit-col-header">
                                        <h3>${unit.name}</h3>
                                        <button class="remove-from-comparison" data-unit="${unit.name}">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${allProperties.map(prop => `
                            <tr class="comparison-row ${prop.numeric ? 'numeric-row' : ''}">
                                <td class="property-name">
                                    <i class="fas ${prop.icon}"></i> ${prop.label}
                                </td>
                                ${unitsToCompare.map(unit => {
                                    let value = unit[prop.key];
                                    
                                    // Format based on property type
                                    if (prop.format && prop.key === 'price') {
                                        value = '$' + Number(value).toLocaleString();
                                    }
                                    
                                    if (prop.key === 'availability') {
                                        return `<td class="property-value status-${value}">${value.charAt(0).toUpperCase() + value.slice(1)}</td>`;
                                    }
                                    
                                    return `<td class="property-value">${value}</td>`;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="comparison-footer">
                <h3>Differential Analysis</h3>
                <div class="differential-analysis">
                    ${generateDifferentialAnalysis(unitsToCompare)}
                </div>
            </div>
        </div>
    `;
    
    modal.innerHTML = tableHTML;
    document.body.appendChild(modal);
    
    // Add event listeners
    
    // Close button
    document.getElementById('closeComparison').addEventListener('click', function() {
        modal.remove();
    });
    
    // Remove individual unit buttons
    document.querySelectorAll('.remove-from-comparison').forEach(btn => {
        btn.addEventListener('click', function() {
            const unitId = this.getAttribute('data-unit');
            comparisonSystem.removeUnit(unitId);
            
            // If no units left, close the modal
            if (comparisonSystem.selectedUnits.length === 0) {
                modal.remove();
            } else {
                createComparisonModal(comparisonSystem.selectedUnits);
            }
        });
    });
    
    // Print functionality
    document.getElementById('printComparison').addEventListener('click', function() {
        printComparison(unitsToCompare);
    });
    
    // Export PDF
    document.getElementById('exportComparisonPDF').addEventListener('click', function() {
        exportComparisonToPDF(unitsToCompare);
    });
    
    // Add click-outside functionality
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Apply highlight to best values
    highlightBestValues();
}

// Generate differential analysis comparing properties
function generateDifferentialAnalysis(unitsToCompare) {
    if (unitsToCompare.length < 2) {
        return '<p>Add at least two units to see comparison analysis</p>';
    }
    
    // Calculate price per sq meter
    const pricePerSqMeter = unitsToCompare.map(unit => {
        const price = parseFloat(unit.price);
        const area = parseFloat(unit.area);
        return {
            name: unit.name,
            value: price / area,
            priceDiff: 0,
            areaDiff: 0
        };
    });
    
    // Calculate differences between the first unit and others
    const baseUnit = unitsToCompare[0];
    const basePrice = parseFloat(baseUnit.price);
    const baseArea = parseFloat(baseUnit.area);
    
    for (let i = 1; i < unitsToCompare.length; i++) {
        const currentPrice = parseFloat(unitsToCompare[i].price);
        const currentArea = parseFloat(unitsToCompare[i].area);
        
        pricePerSqMeter[i].priceDiff = ((currentPrice - basePrice) / basePrice) * 100;
        pricePerSqMeter[i].areaDiff = ((currentArea - baseArea) / baseArea) * 100;
    }
    
    return `
        <div class="diff-analysis-grid">
            <div class="diff-analysis-item">
                <h4>Price per m²</h4>
                <div class="diff-chart">
                    ${pricePerSqMeter.map(item => `
                        <div class="diff-bar-container">
                            <div class="diff-bar-label">${item.name}</div>
                            <div class="diff-bar" style="width: ${Math.min(100, item.value / 50 * 100)}%">
                                $${item.value.toFixed(2)}/m²
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="diff-analysis-item">
                <h4>Relative to ${baseUnit.name}</h4>
                <table class="diff-table">
                    <thead>
                        <tr>
                            <th>Unit</th>
                            <th>Price Diff</th>
                            <th>Area Diff</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pricePerSqMeter.slice(1).map(item => {
                            const priceDiffClass = item.priceDiff > 0 ? 'higher' : 'lower';
                            const areaDiffClass = item.areaDiff > 0 ? 'higher' : 'lower';
                            const valueDiff = (pricePerSqMeter[0].value - item.value) / pricePerSqMeter[0].value * 100;
                            const valueClass = valueDiff > 0 ? 'better' : 'worse';
                            
                            return `
                                <tr>
                                    <td>${item.name}</td>
                                    <td class="${priceDiffClass}">
                                        ${item.priceDiff > 0 ? '+' : ''}${item.priceDiff.toFixed(1)}%
                                    </td>
                                    <td class="${areaDiffClass}">
                                        ${item.areaDiff > 0 ? '+' : ''}${item.areaDiff.toFixed(1)}%
                                    </td>
                                    <td class="${valueClass}">
                                        ${Math.abs(valueDiff).toFixed(1)}% ${valueDiff > 0 ? 'better' : 'worse'}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="comparison-recommendation">
            <h4>Recommendation</h4>
            <div class="recommendation-content">
                ${generateRecommendation(unitsToCompare, pricePerSqMeter)}
            </div>
        </div>
    `;
}

// Generate intelligent recommendation based on comparison data
function generateRecommendation(units, priceData) {
    // Find the best value (lowest price per m²)
    const bestValue = [...priceData].sort((a, b) => a.value - b.value)[0];
    
    // Find most spacious
    const mostSpacious = [...units].sort((a, b) => parseFloat(b.area) - parseFloat(a.area))[0];
    
    // Find most affordable
    const mostAffordable = [...units].sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[0];
    
    // Find availability
    const availableUnits = units.filter(unit => unit.availability === 'available');
    
    let recommendation = '';
    
    // Generate recommendation based on value, space, price and availability
    if (availableUnits.length === 0) {
        recommendation = `<p>None of the compared units are currently available. Consider exploring other options or contact management for waitlist information.</p>`;
    } else {
        recommendation = `<p>Based on your comparison:</p><ul>`;
        
        // Best value recommendation
        recommendation += `<li><strong>${bestValue.name}</strong> offers the best value at $${bestValue.value.toFixed(2)}/m²</li>`;
        
        // Most spacious
        if (mostSpacious.availability === 'available') {
            recommendation += `<li><strong>${mostSpacious.name}</strong> provides the most space at ${mostSpacious.area} m²</li>`;
        }
        
        // Most affordable
        if (mostAffordable.availability === 'available') {
            recommendation += `<li><strong>${mostAffordable.name}</strong> is the most affordable option at $${Number(mostAffordable.price).toLocaleString()}</li>`;
        }
        
        recommendation += `</ul>`;
        
        // Final suggestion based on best value
        const bestUnit = units.find(u => u.name === bestValue.name);
        if (bestUnit.availability === 'available') {
            recommendation += `<p class="recommendation-highlight"><i class="fas fa-star"></i> <strong>${bestValue.name}</strong> appears to be the best overall choice considering price, area, and value.</p>`;
        } else {
            const bestAvailable = availableUnits.sort((a, b) => {
                const aValue = parseFloat(a.price) / parseFloat(a.area);
                const bValue = parseFloat(b.price) / parseFloat(b.area);
                return aValue - bValue;
            })[0];
            
            recommendation += `<p class="recommendation-highlight"><i class="fas fa-star"></i> <strong>${bestAvailable.name}</strong> appears to be the best available option.</p>`;
        }
    }
    
    return recommendation;
}

// Highlight best values in the comparison table
function highlightBestValues() {
    // Find all numeric rows
    const numericRows = document.querySelectorAll('.numeric-row');
    
    numericRows.forEach(row => {
        const values = [];
        const cells = row.querySelectorAll('.property-value');
        
        // Extract numeric values
        cells.forEach(cell => {
            const value = parseFloat(cell.textContent.replace(/[^\d.-]/g, ''));
            values.push({ cell, value });
        });
        
        // Determine if higher or lower is better (for price, lower is better)
        const isPriceRow = row.textContent.includes('Price');
        const isHigherBetter = !isPriceRow; // For area, higher is better
        
        // Find best value
        let bestValue;
        if (isHigherBetter) {
            bestValue = Math.max(...values.map(v => v.value));
        } else {
            bestValue = Math.min(...values.map(v => v.value));
        }
        
        // Highlight best value
        values.forEach(item => {
            if (item.value === bestValue) {
                item.cell.classList.add('best-value');
            }
        });
    });
}

// Print comparison function
function printComparison(units) {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <html>
        <head>
            <title>Property Comparison - ${units.map(u => u.name).join(' vs ')}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; color: #2c3e50; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f8f9fa; }
                .status-available { color: #2ecc71; font-weight: bold; }
                .status-not-available { color: #e74c3c; font-weight: bold; }
                .best-value { background-color: #e8f7f0; font-weight: bold; }
                .property-name { font-weight: bold; }
                .recommendation { margin-top: 30px; padding: 15px; background: #f8f9fa; border-left: 4px solid #3498db; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #7f8c8d; }
            </style>
        </head>
        <body>
            <h1>Property Comparison</h1>
            
            <table>
                <thead>
                    <tr>
                        <th>Property</th>
                        ${units.map(unit => `<th>${unit.name}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="property-name">Type</td>
                        ${units.map(unit => `<td>${unit.type}</td>`).join('')}
                    </tr>
                    <tr>
                        <td class="property-name">Area (m²)</td>
                        ${units.map(unit => `<td>${unit.area}</td>`).join('')}
                    </tr>
                    <tr>
                        <td class="property-name">Price ($)</td>
                        ${units.map(unit => `<td>$${Number(unit.price).toLocaleString()}</td>`).join('')}
                    </tr>
                    <tr>
                        <td class="property-name">Price per m²</td>
                        ${units.map(unit => {
                            const pricePerSqM = parseFloat(unit.price) / parseFloat(unit.area);
                            return `<td>$${pricePerSqM.toFixed(2)}</td>`;
                        }).join('')}
                    </tr>
                    <tr>
                        <td class="property-name">Status</td>
                        ${units.map(unit => `<td class="status-${unit.availability}">${unit.availability.charAt(0).toUpperCase() + unit.availability.slice(1)}</td>`).join('')}
                    </tr>
                    <tr>
                        <td class="property-name">Building</td>
                        ${units.map(unit => `<td>${unit.buildingName.split(' - ').pop()}</td>`).join('')}
                    </tr>
                </tbody>
            </table>
            
            <div class="recommendation">
                ${generatePrintRecommendation(units)}
            </div>
            
            <div class="footer">
                <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                <p>Real Estate Map Application</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load before printing
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// Export to PDF function (using window.print with custom styles)
function exportComparisonToPDF(units) {
    // For simplicity, using the same print function but with PDF filename
    printComparison(units);
}

// Generate simplified recommendation for print view
function generatePrintRecommendation(units) {
    // Calculate price per m² for all units
    const unitsWithValue = units.map(unit => {
        const price = parseFloat(unit.price);
        const area = parseFloat(unit.area);
        return {
            ...unit,
            pricePerSqm: price / area
        };
    });
    
    // Sort by value (price per m²)
    unitsWithValue.sort((a, b) => a.pricePerSqm - b.pricePerSqm);
    
    // Generate recommendation text
    let recommendation = '<h3>Recommendation</h3>';
    
    const bestValue = unitsWithValue[0];
    const available = unitsWithValue.filter(u => u.availability === 'available');
    
    if (available.length === 0) {
        recommendation += `<p>None of the compared units are currently available.</p>`;
    } else {
        const bestAvailable = available.sort((a, b) => a.pricePerSqm - b.pricePerSqm)[0];
        
        recommendation += `<p>Based on the comparison:</p>`;
        recommendation += `<ul>`;
        recommendation += `<li><strong>${bestValue.name}</strong> offers the best value at $${bestValue.pricePerSqm.toFixed(2)}/m²</li>`;
        
        if (bestValue.availability !== 'available') {
            recommendation += `<li><strong>${bestAvailable.name}</strong> is the best available option at $${bestAvailable.pricePerSqm.toFixed(2)}/m²</li>`;
        }
        
        recommendation += `</ul>`;
    }
    
    return recommendation;
}

// Modify the unit card rendering to include data-unit-id attribute
document.querySelectorAll('.unit-card').forEach(card => {
    const unitName = card.querySelector('h3').textContent;
    card.setAttribute('data-unit-id', unitName);
});

// Initialize the comparison system on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeComparisonSystem();
});

function updatePopupContent(unit) {
    // Get the popup element
    const popup = unit.marker.getPopup();

    // Update the popup content
    popup.setContent(`
        <h3>${unit.name}</h3>
        <p><i class="fas fa-building"></i> Building: ${unit.buildingName}</p>
        <p><i class="fas fa-home"></i> Type: ${unit.type}</p>
        <p><i class="fas fa-ruler-combined"></i> Area: ${unit.area} m²</p>
        <p><i class="fas fa-tag"></i> Price: $${Number(unit.price).toLocaleString()}</p>
        <p><i class="fas fa-check-circle"></i> Status: <span class="status-${unit.availability}">${unit.availability.charAt(0).toUpperCase() + unit.availability.slice(1)}</span></p>
        <p><i class="fas fa-calculator"></i> Price per m²: $${(parseFloat(unit.price) / parseFloat(unit.area)).toFixed(2)}</p>
    `);
}
