'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

interface DamPoint {
  id: number;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  hazard_potential: string | null;
  state: string | null;
}

const HAZARD_COLORS: Record<string, string> = {
  High: '#ef4444',
  Significant: '#f59e0b',
  Low: '#22c55e',
  Undetermined: '#94a3b8',
};

export function DamMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [damCount, setDamCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: [39.8, -98.5],
      zoom: 5,
      minZoom: 3,
      maxZoom: 18,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    leafletMap.current = map;

    // Load dams
    loadDams(map);

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  async function loadDams(map: L.Map) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const markers = (L as any).markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();
          let size = 'small';
          let dim = 30;
          if (count > 1000) { size = 'large'; dim = 50; }
          else if (count > 100) { size = 'medium'; dim = 40; }
          return L.divIcon({
            html: `<div><span>${count.toLocaleString()}</span></div>`,
            className: `marker-cluster marker-cluster-${size}`,
            iconSize: L.point(dim, dim),
          });
        },
      });

      let allDams: DamPoint[] = [];
      let page = 0;
      const PAGE_SIZE = 1000;

      while (true) {
        const { data, error: fetchError } = await supabase
          .from('dams')
          .select('id, name, slug, latitude, longitude, hazard_potential, state')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null)
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

        if (fetchError) {
          setError('Failed to load dam data');
          setLoading(false);
          return;
        }

        if (!data || data.length === 0) break;
        allDams = allDams.concat(data as DamPoint[]);
        setDamCount(allDams.length);
        page++;
      }

      // Add markers
      for (const dam of allDams) {
        if (!dam.latitude || !dam.longitude) continue;
        const color = HAZARD_COLORS[dam.hazard_potential || 'Undetermined'] || HAZARD_COLORS.Undetermined;
        const marker = L.circleMarker([dam.latitude, dam.longitude], {
          radius: 5,
          fillColor: color,
          color: '#fff',
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.8,
        });
        marker.bindPopup(
          `<div style="min-width:180px">
            <strong style="font-size:14px">${dam.name}</strong><br/>
            <span style="color:#666">${dam.state || 'Unknown'}</span><br/>
            <span style="color:${color};font-weight:600">${dam.hazard_potential || 'Undetermined'} Hazard</span><br/>
            <a href="/dam/${dam.slug}" style="color:#0ea5e9;text-decoration:underline;font-size:13px">View Details →</a>
          </div>`
        );
        markers.addLayer(marker);
      }

      map.addLayer(markers);
      setLoading(false);
    } catch {
      setError('Failed to load dam data');
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-[1000]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-accent border-t-transparent mb-4" />
          <p className="text-foreground font-medium">Loading {damCount.toLocaleString()} dams...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-[1000]">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      )}

      {/* Legend */}
      {!loading && (
        <div className="absolute bottom-6 left-4 bg-card/95 backdrop-blur border border-border rounded-lg p-3 z-[1000] shadow-lg">
          <p className="text-xs font-semibold text-foreground mb-2">Hazard Level</p>
          <div className="space-y-1">
            {Object.entries(HAZARD_COLORS).map(([label, color]) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-foreground-secondary">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">{damCount.toLocaleString()} dams</p>
        </div>
      )}
    </div>
  );
}
