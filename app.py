from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__, static_folder='.')
CORS(app)  # Enable CORS for all routes

# Data file paths
DATA_FOLDER = 'data'
SECTORS_FILE = os.path.join(DATA_FOLDER, 'sectors.json')
GROUPS_FILE = os.path.join(DATA_FOLDER, 'groups.json')
BUILDINGS_FILE = os.path.join(DATA_FOLDER, 'buildings.json')
UNITS_FILE = os.path.join(DATA_FOLDER, 'units.json')
NAVIGATION_FILE = os.path.join(DATA_FOLDER, 'navigation.json')

# Ensure data directory exists
if not os.path.exists(DATA_FOLDER):
    os.makedirs(DATA_FOLDER)

# Initialize data files if they don't exist
def initialize_data_file(file_path, default_data=None):
    if default_data is None:
        default_data = []
    
    if not os.path.exists(file_path):
        with open(file_path, 'w') as f:
            json.dump(default_data, f)

# Initialize all data files
for file_path in [SECTORS_FILE, GROUPS_FILE, BUILDINGS_FILE, UNITS_FILE, NAVIGATION_FILE]:
    initialize_data_file(file_path)

# Helper functions to read/write JSON files
def read_json(file_path):
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return []

def write_json(file_path, data):
    try:
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"Error writing to {file_path}: {e}")
        return False

# Serve static files
@app.route('/')
def index():
    return app.send_static_file('index.html')

# API endpoints for sectors
@app.route('/api/sectors', methods=['GET'])
def get_sectors():
    return jsonify(read_json(SECTORS_FILE))

@app.route('/api/sectors', methods=['POST'])
def add_sector():
    data = request.json
    sectors = read_json(SECTORS_FILE)
    
    # Add timestamp
    data['created_at'] = datetime.now().isoformat()
    
    # Generate ID if not provided
    if 'id' not in data:
        data['id'] = f"sector_{len(sectors) + 1}"
    
    sectors.append(data)
    write_json(SECTORS_FILE, sectors)
    return jsonify(data), 201

@app.route('/api/sectors/<sector_id>', methods=['PUT'])
def update_sector(sector_id):
    data = request.json
    sectors = read_json(SECTORS_FILE)
    
    for i, sector in enumerate(sectors):
        if sector.get('id') == sector_id:
            data['updated_at'] = datetime.now().isoformat()
            sectors[i] = {**sector, **data}  # Merge old and new data
            write_json(SECTORS_FILE, sectors)
            return jsonify(sectors[i])
    
    return jsonify({"error": "Sector not found"}), 404

@app.route('/api/sectors/<sector_id>', methods=['DELETE'])
def delete_sector(sector_id):
    sectors = read_json(SECTORS_FILE)
    
    for i, sector in enumerate(sectors):
        if sector.get('id') == sector_id:
            deleted = sectors.pop(i)
            write_json(SECTORS_FILE, sectors)
            return jsonify(deleted)
    
    return jsonify({"error": "Sector not found"}), 404

# API endpoints for groups
@app.route('/api/groups', methods=['GET'])
def get_groups():
    return jsonify(read_json(GROUPS_FILE))

@app.route('/api/groups', methods=['POST'])
def add_group():
    data = request.json
    groups = read_json(GROUPS_FILE)
    
    # Add timestamp
    data['created_at'] = datetime.now().isoformat()
    
    # Generate ID if not provided
    if 'id' not in data:
        data['id'] = f"group_{len(groups) + 1}"
    
    groups.append(data)
    write_json(GROUPS_FILE, groups)
    return jsonify(data), 201

@app.route('/api/groups/<group_id>', methods=['PUT'])
def update_group(group_id):
    data = request.json
    groups = read_json(GROUPS_FILE)
    
    for i, group in enumerate(groups):
        if group.get('id') == group_id:
            data['updated_at'] = datetime.now().isoformat()
            groups[i] = {**group, **data}  # Merge old and new data
            write_json(GROUPS_FILE, groups)
            return jsonify(groups[i])
    
    return jsonify({"error": "Group not found"}), 404

@app.route('/api/groups/<group_id>', methods=['DELETE'])
def delete_group(group_id):
    groups = read_json(GROUPS_FILE)
    
    for i, group in enumerate(groups):
        if group.get('id') == group_id:
            deleted = groups.pop(i)
            write_json(GROUPS_FILE, groups)
            return jsonify(deleted)
    
    return jsonify({"error": "Group not found"}), 404

# API endpoints for buildings
@app.route('/api/buildings', methods=['GET'])
def get_buildings():
    return jsonify(read_json(BUILDINGS_FILE))

@app.route('/api/buildings', methods=['POST'])
def add_building():
    data = request.json
    buildings = read_json(BUILDINGS_FILE)
    
    # Add timestamp
    data['created_at'] = datetime.now().isoformat()
    
    # Generate ID if not provided
    if 'id' not in data:
        data['id'] = f"building_{len(buildings) + 1}"
    
    buildings.append(data)
    write_json(BUILDINGS_FILE, buildings)
    return jsonify(data), 201

@app.route('/api/buildings/<building_id>', methods=['PUT'])
def update_building(building_id):
    data = request.json
    buildings = read_json(BUILDINGS_FILE)
    
    for i, building in enumerate(buildings):
        if building.get('id') == building_id:
            data['updated_at'] = datetime.now().isoformat()
            buildings[i] = {**building, **data}  # Merge old and new data
            write_json(BUILDINGS_FILE, buildings)
            return jsonify(buildings[i])
    
    return jsonify({"error": "Building not found"}), 404

@app.route('/api/buildings/<building_id>', methods=['DELETE'])
def delete_building(building_id):
    buildings = read_json(BUILDINGS_FILE)
    
    for i, building in enumerate(buildings):
        if building.get('id') == building_id:
            deleted = buildings.pop(i)
            write_json(BUILDINGS_FILE, buildings)
            return jsonify(deleted)
    
    return jsonify({"error": "Building not found"}), 404

# API endpoints for units
@app.route('/api/units', methods=['GET'])
def get_units():
    return jsonify(read_json(UNITS_FILE))

@app.route('/api/units', methods=['POST'])
def add_unit():
    data = request.json
    units = read_json(UNITS_FILE)
    
    # Add timestamp
    data['created_at'] = datetime.now().isoformat()
    
    # Generate ID if not provided
    if 'id' not in data:
        data['id'] = f"unit_{len(units) + 1}"
    
    units.append(data)
    write_json(UNITS_FILE, units)
    return jsonify(data), 201

@app.route('/api/units/<unit_id>', methods=['PUT'])
def update_unit(unit_id):
    data = request.json
    units = read_json(UNITS_FILE)
    
    for i, unit in enumerate(units):
        if unit.get('id') == unit_id:
            data['updated_at'] = datetime.now().isoformat()
            units[i] = {**unit, **data}  # Merge old and new data
            write_json(UNITS_FILE, units)
            return jsonify(units[i])
    
    return jsonify({"error": "Unit not found"}), 404

@app.route('/api/units/<unit_id>', methods=['DELETE'])
def delete_unit(unit_id):
    units = read_json(UNITS_FILE)
    
    for i, unit in enumerate(units):
        if unit.get('id') == unit_id:
            deleted = units.pop(i)
            write_json(UNITS_FILE, units)
            return jsonify(deleted)
    
    return jsonify({"error": "Unit not found"}), 404

# API endpoints for navigation points
@app.route('/api/navigation', methods=['GET'])
def get_navigation():
    return jsonify(read_json(NAVIGATION_FILE))

@app.route('/api/navigation', methods=['POST'])
def add_navigation():
    data = request.json
    navigation = read_json(NAVIGATION_FILE)
    
    # Add timestamp
    data['created_at'] = datetime.now().isoformat()
    
    # Generate ID if not provided
    if 'id' not in data:
        data['id'] = f"nav_{len(navigation) + 1}"
    
    navigation.append(data)
    write_json(NAVIGATION_FILE, navigation)
    return jsonify(data), 201

@app.route('/api/navigation/<nav_id>', methods=['DELETE'])
def delete_navigation(nav_id):
    navigation = read_json(NAVIGATION_FILE)
    
    for i, nav in enumerate(navigation):
        if nav.get('id') == nav_id:
            deleted = navigation.pop(i)
            write_json(NAVIGATION_FILE, navigation)
            return jsonify(deleted)
    
    return jsonify({"error": "Navigation point not found"}), 404

# Data backup & export
@app.route('/api/export', methods=['GET'])
def export_data():
    data = {
        'sectors': read_json(SECTORS_FILE),
        'groups': read_json(GROUPS_FILE),
        'buildings': read_json(BUILDINGS_FILE),
        'units': read_json(UNITS_FILE),
        'navigation': read_json(NAVIGATION_FILE)
    }
    return jsonify(data)

# Data import
@app.route('/api/import', methods=['POST'])
def import_data():
    data = request.json
    
    if 'sectors' in data:
        write_json(SECTORS_FILE, data['sectors'])
    
    if 'groups' in data:
        write_json(GROUPS_FILE, data['groups'])
    
    if 'buildings' in data:
        write_json(BUILDINGS_FILE, data['buildings'])
    
    if 'units' in data:
        write_json(UNITS_FILE, data['units'])
    
    if 'navigation' in data:
        write_json(NAVIGATION_FILE, data['navigation'])
    
    return jsonify({"message": "Data imported successfully"})

if __name__ == '__main__':
    app.run(debug=True, port=5000) 