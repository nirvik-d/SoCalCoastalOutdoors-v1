# SoCal Coastal Explorer: Landmarks & Outdoors

Explore the beach towns and cities of Southern California using interactive mapping and location intelligence.

This project uses Esri's ArcGIS Maps SDK for JavaScript (v4.32), Calcite Design System, and Esri’s Places API to visualize public access to beach areas and discover nearby outdoor landmarks.

## Features

- **Select a beach town or city** using a Calcite dropdown panel
- **Zoom to the city boundary polygon** with accurate feature layer data
- **Click anywhere inside the polygon** to find landmarks and outdoor POIs within 500 meters (using Esri’s Places service)
- **Filter out duplicate polygons** for better performance and visual clarity
- **Unit tested with Vitest**, including map logic and component behavior
- **CI/CD** setup with GitHub Actions

## Tech Stack

- [ArcGIS Maps SDK for JavaScript (v4.32)](https://developers.arcgis.com/javascript/)
- [Calcite Components](https://developers.arcgis.com/calcite-design-system/)
- [Esri Places Service](https://developers.arcgis.com/rest/places/)
- React + TypeScript
- Vitest (unit testing)
- GitHub Actions (CI)

## Getting Started

```bash
# Install dependencies
npm install

# Run the app
npm run dev

# Run tests
npm run test
```

![image](https://github.com/user-attachments/assets/ee8fbbb7-9895-44a2-a73a-6b418aedc0b1)

![image](https://github.com/user-attachments/assets/21fc23a8-4d2d-4b47-9210-6cccc84d719c)

