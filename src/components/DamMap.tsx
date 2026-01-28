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
  state: string | null;
}

const DAM_COLOR = '#2563eb';

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

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    leafletMap.current = map;
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
        chunkInterval: 100,
        chunkDelay: 0,
        maxClusterRadius: 60,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        disableClusteringAtZoom: 13,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();
          let cls = 'small';
          let dim = 36;
          if (count > 5000) { cls = 'xlarge'; dim = 56; }
          else if (count > 1000) { cls = 'large'; dim = 48; }
          else if (count > 100) { cls = 'medium'; dim = 42; }
          return L.divIcon({
            html: `<div><span>${count >= 1000 ? Math.round(count / 1000) + 'k' : count}</span></div>`,
            className: `dam-cluster dam-cluster-${cls}`,
            iconSize: L.point(dim, dim),
          });
        },
      });

      let allDams: DamPoint[] = [];
      let page = 0;
      const PAGE_SIZE = 1000;

      // Fetch all in parallel batches for speed
      // First get the count
      const { count: totalCount } = await supabase
        .from('dams')
        .select('id', { count: 'exact', head: true })
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      const total = totalCount || 0;
      const totalPages = Math.ceil(total / PAGE_SIZE);
      setDamCount(total);

      // Fetch in parallel batches of 10
      const BATCH_SIZE = 10;
      for (let batch = 0; batch < totalPages; batch += BATCH_SIZE) {
        const promises = [];
        for (let p = batch; p < Math.min(batch + BATCH_SIZE, totalPages); p++) {
          promises.push(
            supabase
              .from('dams')
              .select('id, name, slug, latitude, longitude, state')
              .not('latitude', 'is', null)
              .not('longitude', 'is', null)
              .range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1)
          );
        }
        const results = await Promise.all(promises);
        for (const { data, error: fetchError } of results) {
          if (fetchError) {
            setError('Failed to load dam data');
            setLoading(false);
            return;
          }
          if (data) allDams = allDams.concat(data as DamPoint[]);
        }
      }

      // Add markers
      for (const dam of allDams) {
        if (!dam.latitude || !dam.longitude) continue;
        const marker = L.circleMarker([dam.latitude, dam.longitude], {
          radius: 4,
          fillColor: DAM_COLOR,
          color: '#fff',
          weight: 0.5,
          opacity: 0.9,
          fillOpacity: 0.75,
        });
        marker.bindPopup(
          `<div style="min-width:180px;font-family:system-ui,sans-serif">
            <strong style="font-size:14px">${dam.name}</strong><br/>
            <span style="color:#666;font-size:13px">${dam.state || 'Unknown'}</span><br/>
            <a href="/dam/${dam.slug}" style="color:#2563eb;text-decoration:underline;font-size:13px;margin-top:4px;display:inline-block">View Details &rarr;</a>
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
    <>
      <style>{`
        .dam-cluster {
          background: rgba(37, 99, 235, 0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dam-cluster div {
          background: rgba(37, 99, 235, 0.7);
          border-radius: 50%;
          width: 80%;
          height: 80%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dam-cluster span {
          color: #fff;
          font-weight: 700;
          font-size: 11px;
        }
        .dam-cluster-medium div { background: rgba(37, 99, 235, 0.75); }
        .dam-cluster-medium span { font-size: 12px; }
        .dam-cluster-large div { background: rgba(37, 99, 235, 0.8); }
        .dam-cluster-large span { font-size: 13px; }
        .dam-cluster-xlarge div { background: rgba(37, 99, 235, 0.85); }
        .dam-cluster-xlarge span { font-size: 14px; }
      `}</style>
      <div className="relative w-full h-full">
        <div ref={mapRef} className="w-full h-full" />

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

        {!loading && (
          <div className="absolute bottom-6 left-4 bg-card/95 backdrop-blur border border-border rounded-lg px-4 py-3 z-[1000] shadow-lg">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: DAM_COLOR }} />
              <span className="text-sm font-medium text-foreground">{damCount.toLocaleString()} Dams</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Click a dam for details</p>
          </div>
        )}
      </div>
    </>
  );
}
