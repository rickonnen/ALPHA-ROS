export type Location = {
  id: number;
  direccion: string;
  zona: string;
  lat: number;
  lng: number;
  precio: string; // Campo añadido para los marcadores
}

export const locations: Location[] = [
  {
    id: 1,
    direccion: "Av. América",
    zona: "Zona Central",
    lat: -17.3943,
    lng: -66.1569,
    precio: "$89K",
  },
  {
    id: 2,
    direccion: "Calle 25 de Mayo",
    zona: "Zona Norte",
    lat: -17.3848,
    lng: -66.1365,
    precio: "$212K",
  },
  {
    id: 3,
    direccion: "Av. Heroínas",
    zona: "Zona Centro",
    lat: -17.3938,
    lng: -66.1570,
    precio: "$246K",
  },
  {
    id: 4,
    direccion: "Plaza Principal",
    zona: "Zona Centro",
    lat: -17.3935,
    lng: -66.1571,
    precio: "$150K",
  },
];