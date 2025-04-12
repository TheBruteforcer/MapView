# Real Estate Map Application

This application provides an interactive map interface for managing real estate properties, organized by sectors, groups, buildings, and units.

## Features

- Interactive map visualization with Leaflet.js
- Hierarchical organization: Sectors > Groups > Buildings > Floors > Sections > Units
- Building-centric grid view to display units organized by floor and section
- Quick navigation menu to jump to specific locations
- Search and filter units by multiple criteria including floor and section
- Data persistence with Flask API backend
- Export and import functionality

## Installation

### Prerequisites

- Python 3.7 or newer
- pip (Python package manager)

### Setup

1. Clone this repository
```bash
git clone <repository-url>
cd real-estate-map
```

2. Install Python dependencies
```bash
pip install -r requirements.txt
```

3. Start the Flask API server
```bash
python3 app.py
```

4. In a separate terminal, serve the frontend files
```bash
# For Python 3
python -m http.server 8000
```

5. Open your browser and navigate to http://localhost:8000

## Usage

### Map Navigation

- **Pan**: Click and drag the map
- **Zoom**: Use mouse wheel or the zoom controls
- **Add Items**: Double-click anywhere on the map to add sectors, groups, buildings, or units
- **Quick Navigation**: Use the navigation menu (toggle with the button in the top right)

### Building & Unit Management

- **Add Buildings**: Double-click on the map and select "Building"
- **Specify Floors and Sections**: When creating a building, specify the number of floors and sections
- **Grid View**: Click on any building to see a grid view of units organized by floor and section
- **Add Units**: Click on any empty cell in the grid to add a unit to that specific floor and section
- **View/Edit Units**: Click on any occupied cell to view or edit the unit details

### Data Management

- **Export Data**: Click the "Export Data" button to download all data as JSON
- **Import Data**: Click the "Import Data" button to upload previously exported data

### Search and Filter

- Use the search panel to filter units by:
  - Sector
  - Group
  - Building
  - Floor
  - Section
  - Price range
  - Area range

## API Documentation

The backend provides a RESTful API with the following endpoints:

- `/api/sectors` - Manage sectors
- `/api/groups` - Manage groups
- `/api/buildings` - Manage buildings
- `/api/units` - Manage units
- `/api/navigation` - Manage navigation points
- `/api/export` - Export all data
- `/api/import` - Import data

## License

[MIT License](LICENSE) 