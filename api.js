// API client for real estate map application
const API_BASE_URL = 'http://localhost:5000/api';

// API error handling
function handleResponse(response) {
    if (!response.ok) {
        return response.json().then(data => {
            throw new Error(data.error || 'API request failed');
        });
    }
    return response.json();
}

// General API functions
const api = {
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