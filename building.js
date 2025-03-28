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
