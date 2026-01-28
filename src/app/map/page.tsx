import { Metadata } from 'next';
import { MapClient } from './MapClient';

export const metadata: Metadata = {
  title: 'Dam Map - Interactive Map of All US Dams',
  description: 'Explore an interactive map of over 91,000 dams across the United States. View dam locations color-coded by hazard level.',
};

export default function MapPage() {
  return <MapClient />;
}
