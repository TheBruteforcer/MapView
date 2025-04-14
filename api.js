// API client for real estate map application
const API_BASE_URL = 'https://unlimited1demos.pythonanywhere.com/api';
const USE_MOCK_API = false; // Set to false when real API is available

// Mock data for development
const mockSectors = [
    { id: '1', name: "Sector A", position: { lat: 100, lng: 200 } },
    { id: '2', name: "Sector B", position: { lat: 300, lng: 400 } }
];

const mockGroups = [
    { id: '1', name: "Sector A - Group 1", sectorName: "Sector A", position: { lat: 110, lng: 210 } },
    { id: '2', name: "Sector B - Group 1", sectorName: "Sector B", position: { lat: 310, lng: 410 } }
];

const mockBuildings = [
    { 
        id: '1',
        name: "Sector A - Group 1 - Building 1", 
        groupName: "Sector A - Group 1",
        position: { lat: 115, lng: 215 },
        floors: 3,
        sections: ["A", "B", "C"]
    },
    {
        id: '2',
        name: "Sector B - Group 1 - Building 1",
        groupName: "Sector B - Group 1",
        position: { lat: 315, lng: 415 },
        floors: 2,
        sections: ["A", "B"]
    }
];

const mockUnits = [
    {
        id: '1',
        name: "Unit 101",
        buildingName: "Sector A - Group 1 - Building 1",
        floor: 1,
        section: "A",
        type: "Apartment",
        area: 100,
        price: 150000,
        availability: "available",
        position: { lat: 120, lng: 220 }
    },
    {
        id: '2',
        name: "Unit 102",
        buildingName: "Sector A - Group 1 - Building 1",
        floor: 1,
        section: "B",
        type: "Apartment",
        area: 120,
        price: 180000,
        availability: "not-available",
        position: { lat: 125, lng: 225 }
    }
];

const mockNavigation = [
    { id: '1', name: 'Sector A', position: { latlng: [100, 200] }, label: 'Sector A', isSector: true },
    { id: '2', name: 'Sector B', position: { latlng: [300, 400] }, label: 'Sector B', isSector: true }
];

// Mock API implementation
const mockApi = {
    sectors: {
        getAll: () => Promise.resolve([...mockSectors]),
        create: (data) => {
            const newSector = { id: Date.now().toString(), ...data };
            mockSectors.push(newSector);
            return Promise.resolve(newSector);
        },
        update: (id, data) => {
            const index = mockSectors.findIndex(s => s.id === id);
            if (index !== -1) {
                mockSectors[index] = { ...mockSectors[index], ...data };
                return Promise.resolve(mockSectors[index]);
            }
            return Promise.reject(new Error('Sector not found'));
        },
        delete: (id) => {
            const index = mockSectors.findIndex(s => s.id === id);
            if (index !== -1) {
                const deleted = mockSectors.splice(index, 1)[0];
                return Promise.resolve(deleted);
            }
            return Promise.reject(new Error('Sector not found'));
        }
    },
    
    groups: {
        getAll: () => Promise.resolve([...mockGroups]),
        create: (data) => {
            const newGroup = { id: Date.now().toString(), ...data };
            mockGroups.push(newGroup);
            return Promise.resolve(newGroup);
        },
        update: (id, data) => {
            const index = mockGroups.findIndex(g => g.id === id);
            if (index !== -1) {
                mockGroups[index] = { ...mockGroups[index], ...data };
                return Promise.resolve(mockGroups[index]);
            }
            return Promise.reject(new Error('Group not found'));
        },
        delete: (id) => {
            const index = mockGroups.findIndex(g => g.id === id);
            if (index !== -1) {
                const deleted = mockGroups.splice(index, 1)[0];
                return Promise.resolve(deleted);
            }
            return Promise.reject(new Error('Group not found'));
        }
    },
    
    buildings: {
        getAll: () => Promise.resolve([...mockBuildings]),
        create: (data) => {
            const newBuilding = { id: Date.now().toString(), ...data };
            mockBuildings.push(newBuilding);
            return Promise.resolve(newBuilding);
        },
        update: (id, data) => {
            const index = mockBuildings.findIndex(b => b.id === id);
            if (index !== -1) {
                mockBuildings[index] = { ...mockBuildings[index], ...data };
                return Promise.resolve(mockBuildings[index]);
            }
            return Promise.reject(new Error('Building not found'));
        },
        delete: (id) => {
            const index = mockBuildings.findIndex(b => b.id === id);
            if (index !== -1) {
                const deleted = mockBuildings.splice(index, 1)[0];
                return Promise.resolve(deleted);
            }
            return Promise.reject(new Error('Building not found'));
        }
    },
    
    units: {
        getAll: () => Promise.resolve([...mockUnits]),
        create: (data) => {
            const newUnit = { id: Date.now().toString(), ...data };
            mockUnits.push(newUnit);
            return Promise.resolve(newUnit);
        },
        update: (id, data) => {
            const index = mockUnits.findIndex(u => u.id === id);
            if (index !== -1) {
                mockUnits[index] = { ...mockUnits[index], ...data };
                return Promise.resolve(mockUnits[index]);
            }
            return Promise.reject(new Error('Unit not found'));
        },
        delete: (id) => {
            const index = mockUnits.findIndex(u => u.id === id);
            if (index !== -1) {
                const deleted = mockUnits.splice(index, 1)[0];
                return Promise.resolve(deleted);
            }
            return Promise.reject(new Error('Unit not found'));
        }
    },
    
    navigation: {
        getAll: () => Promise.resolve([...mockNavigation]),
        create: (data) => {
            const newNav = { id: Date.now().toString(), ...data };
            mockNavigation.push(newNav);
            return Promise.resolve(newNav);
        },
        delete: (id) => {
            const index = mockNavigation.findIndex(n => n.id === id);
            if (index !== -1) {
                const deleted = mockNavigation.splice(index, 1)[0];
                return Promise.resolve(deleted);
            }
            return Promise.reject(new Error('Navigation point not found'));
        }
    },
    
    export: () => {
        return Promise.resolve({
            sectors: mockSectors,
            groups: mockGroups,
            buildings: mockBuildings,
            units: mockUnits,
            navigation: mockNavigation
        });
    },
    
    import: (data) => {
        // Reset mock data
        mockSectors.length = 0;
        mockGroups.length = 0;
        mockBuildings.length = 0;
        mockUnits.length = 0;
        mockNavigation.length = 0;
        
        // Import new data
        if (data.sectors) mockSectors.push(...data.sectors);
        if (data.groups) mockGroups.push(...data.groups);
        if (data.buildings) mockBuildings.push(...data.buildings);
        if (data.units) mockUnits.push(...data.units);
        if (data.navigation) mockNavigation.push(...data.navigation);
        
        return Promise.resolve({ success: true });
    }
};

// API error handling
function handleResponse(response) {
    if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);
        
        // Try to get error details if possible
        return response.text().then(text => {
            try {
                // Try to parse as JSON
                const data = JSON.parse(text);
                throw new Error(data.error || `API request failed: ${response.status}`);
            } catch (e) {
                // If not JSON, show the HTML or text response for debugging
                console.error('Response was not JSON:', text.substring(0, 150) + '...');
                throw new Error(`API request failed: ${response.status}. Check console for details.`);
            }
        });
    }
    return response.json();
}

// Choose which API to use
const api = USE_MOCK_API ? mockApi : {
    // Real API implementation (if USE_MOCK_API is false)
    // ... existing real API implementation ...
    
    // Sectors API
    sectors: {
        getAll: () => {
            return fetch(`${API_BASE_URL}/sectors`)
                .then(handleResponse);
        },
        
        create: (sectorData) => {
            return fetch(`${API_BASE_URL}/sectors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sectorData)
            }).then(handleResponse);
        },
        
        update: (sectorId, sectorData) => {
            return fetch(`${API_BASE_URL}/sectors/${sectorId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sectorData)
            }).then(handleResponse);
        },
        
        delete: (sectorId) => {
            return fetch(`${API_BASE_URL}/sectors/${sectorId}`, {
                method: 'DELETE'
            }).then(handleResponse);
        }
    },
    
    // Groups API
    groups: {
        getAll: () => {
            return fetch(`${API_BASE_URL}/groups`)
                .then(handleResponse);
        },
        
        create: (groupData) => {
            return fetch(`${API_BASE_URL}/groups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(groupData)
            }).then(handleResponse);
        },
        
        update: (groupId, groupData) => {
            return fetch(`${API_BASE_URL}/groups/${groupId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(groupData)
            }).then(handleResponse);
        },
        
        delete: (groupId) => {
            return fetch(`${API_BASE_URL}/groups/${groupId}`, {
                method: 'DELETE'
            }).then(handleResponse);
        }
    },
    
    // Buildings API
    buildings: {
        getAll: () => {
            return fetch(`${API_BASE_URL}/buildings`)
                .then(handleResponse);
        },
        
        create: (buildingData) => {
            return fetch(`${API_BASE_URL}/buildings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(buildingData)
            }).then(handleResponse);
        },
        
        update: (buildingId, buildingData) => {
            return fetch(`${API_BASE_URL}/buildings/${buildingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(buildingData)
            }).then(handleResponse);
        },
        
        delete: (buildingId) => {
            return fetch(`${API_BASE_URL}/buildings/${buildingId}`, {
                method: 'DELETE'
            }).then(handleResponse);
        }
    },
    
    // Units API
    units: {
        getAll: () => {
            return fetch(`${API_BASE_URL}/units`)
                .then(handleResponse);
        },
        
        create: (unitData) => {
            return fetch(`${API_BASE_URL}/units`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(unitData)
            }).then(handleResponse);
        },
        
        update: (unitId, unitData) => {
            return fetch(`${API_BASE_URL}/units/${unitId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(unitData)
            }).then(handleResponse);
        },
        
        delete: (unitId) => {
            return fetch(`${API_BASE_URL}/units/${unitId}`, {
                method: 'DELETE'
            }).then(handleResponse);
        }
    },
    
    // Navigation API
    navigation: {
        getAll: () => {
            return fetch(`${API_BASE_URL}/navigation`)
                .then(handleResponse);
        },
        
        create: (navData) => {
            return fetch(`${API_BASE_URL}/navigation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(navData)
            }).then(handleResponse);
        },
        
        delete: (navId) => {
            return fetch(`${API_BASE_URL}/navigation/${navId}`, {
                method: 'DELETE'
            }).then(handleResponse);
        }
    },
    
    // Data export/import API
    export: () => {
        return fetch(`${API_BASE_URL}/export`)
            .then(handleResponse);
    },
    
    import: (data) => {
        return fetch(`${API_BASE_URL}/import`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(handleResponse);
    }
}; 
