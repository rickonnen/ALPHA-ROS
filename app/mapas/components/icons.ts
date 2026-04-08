// app/mapas/components/icons.ts
"use client"
import L from "leaflet"

export const createPriceIcon = (precio: string, isHovered: boolean) => {
  return L.divIcon({
    className: "custom-price-marker",
    html: `
      <div style="display:flex; flex-direction:column; align-items:center;">
        <div style="
          background: ${isHovered ? '#0f172a' : 'white'};
          color: ${isHovered ? 'white' : '#0f172a'};
          font-weight: 700;
          font-size: 14px;
          font-family: sans-serif;
          padding: 5px 10px;
          border-radius: 20px;
          border: 2px solid ${isHovered ? '#0f172a' : '#e2e8f0'};
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          white-space: nowrap;
          position: relative;
        ">
          ${precio}
          <div style="
            position: absolute;
            bottom: -7px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 7px solid ${isHovered ? '#0f172a' : 'white'};
          "></div>
        </div>
        <div style="
          margin-top: 7px;
          width: 8px;
          height: 8px;
          background: ${isHovered ? '#0f172a' : '#94a3b8'};
          border-radius: 50%;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        "></div>
      </div>`,
    iconSize: [75, 62],
    iconAnchor: [37, 62],
    popupAnchor: [0, -62],
  });
};

export const createClusterIcon = (cluster: any) => {
  return L.divIcon({
    html: `<div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: #0f172a;
      color: white;
      font-weight: 700;
      font-size: 14px;
      font-family: sans-serif;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${cluster.getChildCount()}</div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(44, 44, true),
  });
};