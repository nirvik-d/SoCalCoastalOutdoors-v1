# SoCal Coastal Explorer

This sample demonstrates how to create an interactive mapping application that explores beach towns and cities of Southern California using the ArcGIS Maps SDK for JavaScript and Calcite Design System.

## Use Case

This application allows users to:
- Select a city from a dropdown menu
- View city boundaries on an interactive map
- Click within city boundaries to discover nearby points of interest
- View detailed information about discovered places

## Prerequisites

- Node.js v18 or higher
- npm
- Basic knowledge of React and TypeScript

## Instructions

### Create a New Project

1. Create a new Vite project with React and TypeScript:

   ```bash
   npm create vite@latest SoCalCoastal-Outdoors -- --template react-ts
   cd SoCalCoastal-Outdoors
   npm install
   ```

2. Install required dependencies:

   ```bash
   npm install @arcgis/core @esri/calcite-components @arcgis/map-components
   ```

### Set Up the Map Component

1. Create `src/components/RenderMap.tsx`:

```tsx
import { useEffect } from "react";
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-zoom";
import "@arcgis/map-components/components/arcgis-search";

interface RenderMapProps {
  mapType?: any;
  mapCenter?: any;
  mapZoom?: any;
  mapRef?: any;
  mapViewRef?: any;
  isDrawingComplete: (complete: boolean) => void;
}

export function RenderMap({
  mapType,
  mapCenter,
  mapZoom,
  mapRef,
  mapViewRef,
  isDrawingComplete,
}: RenderMapProps) {
  useEffect(() => {
    mapViewRef.current = mapRef.current.view;
    isDrawingComplete(true);
  });

  return (
    <arcgis-map
      basemap={mapType}
      center={mapCenter}
      zoom={mapZoom}
      ref={mapRef}
    >
      <arcgis-zoom position="top-right"></arcgis-zoom>
    </arcgis-map>
  );
}
```

### Set Up the Application

1. Create `src/components/CitySelector.tsx`:

```tsx
// Import necessary React hooks and Calcite components
import { useState } from 'react';
import { CalciteSelect, CalciteSelectItem } from '@esri/calcite-components';

// Define interface for component props
interface CitySelectorProps {
  cities: string[]; // Array of city names
  onCitySelect: (city: string) => void; // Callback when city is selected
}

// CitySelector component that allows users to select a city
export const CitySelector = ({ cities, onCitySelect }: CitySelectorProps) => {
  // State to track currently selected city
  const [selectedCity, setSelectedCity] = useState('');

  // Handler for when a city is selected from the dropdown
  const handleCityChange = (event: any) => {
    const selected = event.target.value;
    setSelectedCity(selected);
    // Notify parent component of city selection
    onCitySelect(selected);
  };

  // Render the city selector UI
  return (
    <div className="city-selector-container">
      <h2>Select a City</h2>
      {/* Calcite Select component with placeholder and city options */}
      <CalciteSelect
        value={selectedCity}
        onChange={handleCityChange}
        class="city-selector"
        placeholder="Choose a city..."
      >
        {cities.map((city) => (
          <CalciteSelectItem key={city} value={city}>
            {city}
          </CalciteSelectItem>
        ))}
      </CalciteSelect>
    </div>
  );
};
```

2. Create `src/components/PlacesList.tsx`:

```tsx
// Import useState hook
import { useState } from 'react';

// Interface for a Place object representing a point of interest
interface Place {
  name: string; // Name of the place
  category: string; // Type of place (e.g., restaurant, park)
  rating?: number; // Optional rating (0-5)
  address?: string; // Optional address
}

// Interface for PlacesList component props
interface PlacesListProps {
  places: Place[]; // Array of places to display
  loading: boolean; // Loading state
  error?: string; // Optional error message
}

// Component that displays a list of places with loading and error states
export const PlacesList = ({ places, loading, error }: PlacesListProps) => {
  // Render the places list with loading and error states
  return (
    <div className="places-list">
      {/* Show loading indicator while fetching places */}
      {loading && <div className="loading">Searching for places...</div>}
      
      {/* Display error message if something went wrong */}
      {error && <div className="error">{error}</div>}
      
      {/* Render list of places */}
      {places.map((place, index) => (
        <div key={index} className="place-item">
          <h3>{place.name}</h3> {/* Place name */}
          <p>{place.category}</p> {/* Place category */}
          {place.rating && <p>Rating: {place.rating}</p>} {/* Optional rating */}
          {place.address && <p>Address: {place.address}</p>} {/* Optional address */}
        </div>
      ))}
    </div>
  );
};
```

3. Create `src/services/placesService.ts`:

```typescript
// Interface for a Place object representing a point of interest
interface Place {
  name: string; // Name of the place
  category: string; // Type of place (e.g., restaurant, park)
  location: {
    latitude: number; // Geographic coordinates
    longitude: number; // Geographic coordinates
  };
  rating?: number; // Optional rating (0-5)
  address?: string; // Optional address
}

// Interface for the response from the Places API
export interface PlacesResponse {
  results: Place[]; // Array of places
  total: number; // Total number of results
}

// Service class for interacting with the Esri Places API
export class PlacesService {
  private readonly apiKey: string; // API key for authentication

  constructor() {
    // Get API key from environment variables
    this.apiKey = import.meta.env.VITE_ARCGIS_API_KEY;
  }

  // Method to fetch nearby places based on coordinates
  async getNearbyPlaces(
    latitude: number, // Latitude coordinate
    longitude: number, // Longitude coordinate
    radius: number = 1000, // Search radius in meters
    category?: string // Optional category filter
  ): Promise<PlacesResponse> {
    try {
      // Construct the API request URL
      const response = await fetch(
        `https://places.api.arcgis.com/places/v1/search?` +
        new URLSearchParams({
          lat: latitude.toString(),
          lon: longitude.toString(),
          radius: radius.toString(),
          apiKey: this.apiKey,
          category: category || ''
        })
      );

      // Check for successful response
      if (!response.ok) {
        throw new Error('Failed to fetch places data');
      }

      // Parse and return the response
      const data = await response.json();
      return data as PlacesResponse;
    } catch (error) {
      // Log and rethrow any errors
      console.error('Error fetching places:', error);
      throw error;
    }
  }

  // Method to fetch detailed information about a specific place
  async getPlaceDetails(placeId: string): Promise<Place> {
    try {
      // Construct the API request URL
      const response = await fetch(
        `https://places.api.arcgis.com/places/v1/details?` +
        new URLSearchParams({
          placeId,
          apiKey: this.apiKey
        })
      );

      // Check for successful response
      if (!response.ok) {
        throw new Error('Failed to fetch place details');
      }

      // Parse and return the response
      const data = await response.json();
      return data as Place;
    } catch (error) {
      // Log and rethrow any errors
      console.error('Error fetching place details:', error);
      throw error;
    }
  }
}
```

4. Create `src/context/PlacesContext.tsx`:

```tsx
// Import necessary React hooks and context utilities
import { createContext, useContext, useState, useEffect } from 'react';
// Import the PlacesService for API interactions
import { PlacesService } from '../services/placesService';

// Interface defining the shape of the context
interface PlacesContextType {
  places: Place[]; // Array of places
  loading: boolean; // Loading state
  error: string | null; // Error message
  searchPlaces: (latitude: number, longitude: number) => Promise<void>; // Search function
  getPlaceDetails: (placeId: string) => Promise<Place>; // Get details function
}

// Create the context with undefined as initial value
const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

// Provider component that manages places state
export const PlacesProvider = ({ children }: { children: React.ReactNode }) => {
  // State variables for managing places data
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const placesService = new PlacesService();

  // Function to search for places near given coordinates
  const searchPlaces = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      setError(null);
      // Call the service to get nearby places
      const response = await placesService.getNearbyPlaces(latitude, longitude);
      // Update state with new places
      setPlaces(response.results);
    } catch (err) {
      // Handle any errors
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      // Always reset loading state
      setLoading(false);
    }
  };

  // Function to get detailed information about a place
  const getPlaceDetails = async (placeId: string) => {
    try {
      // Call the service to get place details
      return await placesService.getPlaceDetails(placeId);
    } catch (err) {
      // Throw the error with proper type
      throw err instanceof Error ? err : new Error('Failed to fetch place details');
    }
  };

  // Provide the context value to child components
  return (
    <PlacesContext.Provider
      value={{
        places,
        loading,
        error,
        searchPlaces,
        getPlaceDetails
      }}
    >
      {children}
    </PlacesContext.Provider>
  );
};

// Custom hook for accessing the places context
export const usePlaces = () => {
  const context = useContext(PlacesContext);
  // Throw error if used outside of Provider
  if (context === undefined) {
    throw new Error('usePlaces must be used within a PlacesProvider');
  }
  return context;
};
```

5. Update `src/App.tsx`:

```tsx
// Import necessary React hooks and ArcGIS components
import { useState, useEffect } from 'react';
import { FeatureLayer } from '@arcgis/core';
// Import custom components and services
import { RenderMap } from './components/RenderMap';
import { CitySelector } from './components/CitySelector';
import { PlacesProvider, usePlaces } from './context/PlacesContext';
import { PlacesList } from './components/PlacesList';
import './App.css';

// URL to your city boundary feature layer
const CITY_BOUNDARY_LAYER_URL = 'your-city-boundary-layer-url';

// Main content component that handles the UI
function AppContent() {
  // State for tracking selected city
  const [selectedCity, setSelectedCity] = useState('');
  // Get places context for managing place data
  const { places, loading, error, searchPlaces } = usePlaces();
  // Create a feature layer for city boundaries
  const cityBoundaryLayer = new FeatureLayer({
    url: CITY_BOUNDARY_LAYER_URL,
    title: 'City Boundaries'
  });

  // Handler for map clicks to search for places
  const handleMapClick = async (event: any) => {
    if (!selectedCity) return;

    try {
      // Search for places near the clicked location
      await searchPlaces(event.mapPoint.latitude, event.mapPoint.longitude);
    } catch (err) {
      // Log any errors
      console.error('Error searching places:', err);
    }
  };

  // Render the main application UI
  return (
    <div className="app-container">
      <div className="sidebar">
        <h1>SoCal Coastal Explorer</h1>
        {/* City selector component */}
        <CitySelector
          cities={[
            'Los Angeles',
            'San Diego',
            'Santa Barbara',
            'San Luis Obispo'
          ]}
          onCitySelect={(city) => {
            setSelectedCity(city);
            // Update map center based on selected city
            const cityCenters = {
              'Los Angeles': [-118.24, 34.05],
              'San Diego': [-117.16, 32.71],
              'Santa Barbara': [-119.70, 34.42],
              'San Luis Obispo': [-120.66, 35.28]
            };
            // Update map center when city changes
            mapRef.current.view.center = cityCenters[city];
          }}
        />
        {/* Places list component */}
        <PlacesList places={places} loading={loading} error={error} />
      </div>
      <div className="map-container">
        {/* Map component with city boundary layer */}
        <RenderMap
          cityBoundaryLayer={cityBoundaryLayer}
          onMapClick={handleMapClick}
        />
      </div>
    </div>
  );
}

// Root component that provides places context
function App() {
  return (
    <PlacesProvider>
      <AppContent />
    </PlacesProvider>
  );
}

export default App;
```

### Add Styles

1. Create `src/App.css`:

```css
:root {
  --primary-color: #0079c1;
  --secondary-color: #004973;
  --background-color: #f5f5f5;
  --border-color: #ddd;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: var(--text-color);
}

.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 300px;
  padding: 20px;
  background-color: var(--background-color);
  border-right: 1px solid var(--border-color);
}

.map-container {
  flex: 1;
  position: relative;
}

.city-selector {
  width: 100%;
  padding: 8px;
  margin-bottom: 20px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.places-list {
  margin-top: 20px;
  overflow-y: auto;
}

h1 {
  margin-top: 0;
  color: var(--secondary-color);
  font-size: 1.5em;
  margin-bottom: 20px;
}
```

### Run the Application

1. Start the development server:

```bash
npm run dev
```

The application will start at `http://localhost:5173`

## Key Features

- Interactive map with city boundaries
- City selection dropdown
- Place discovery through map clicks
- Responsive design
- Modern UI with Calcite components

## Code Structure

- `src/components/RenderMap.tsx` - Map component using ArcGIS Map Components
- `src/App.tsx` - Main application component
- `src/App.css` - Application styles

## Additional Resources

- [ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/)
- [Calcite Components](https://developers.arcgis.com/calcite-design-system/): Landmarks & Outdoors

Explore the beach towns and cities of Southern California using interactive mapping and location intelligence.

This project uses Esri's ArcGIS Maps SDK for JavaScript (v4.32), Calcite Design System, and Esri’s Places API to visualize public access to beach areas and discover nearby outdoor landmarks.

## Features

- **Select a beach town or city** using a Calcite dropdown panel
- **Zoom to the city boundary polygon** with accurate feature layer data
- **Click anywhere inside the polygon** to find landmarks and outdoor POIs (using Esri’s Places service)
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

