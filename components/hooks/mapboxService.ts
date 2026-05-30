export interface CitySuggestion {
  strId: string;
  strName: string;
  strFullName: string;
  strIcon: string;
  strTypePlace: string;
}

const strMapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const strBoliviaBbox = "-69.64,-22.90,-57.45,-9.66";
const strFlagUrl = "/banderaBolivia.svg";
const intMaxCityLength = 30;

const objTypeDictionary: Record<string, string> = {
  region: "Departamento",
  district: "Provincia",
  place: "Ciudad",
  locality: "Localidad",
  neighborhood: "Barrio",
  poi: "Lugar",
  address: "Dirección"
};

const normalizeText = (strVal: string) =>
  strVal.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

// optimización: extracción del servicio de mapbox puro
export async function fetchMapboxCities(strQuery: string): Promise<CitySuggestion[]> {
  if (!strMapboxToken) throw new Error("token de mapbox no configurado");

  const strUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    strQuery
  )}.json?bbox=${strBoliviaBbox}&types=region,district,place,locality,neighborhood&limit=20&language=es&autocomplete=true&fuzzyMatch=false&proximity=-66.1568,-17.3936&access_token=${strMapboxToken}`;

  const objResponse = await fetch(strUrl);
  if (!objResponse.ok) throw new Error("error en la api de mapbox");
  
  const objData = await objResponse.json();
  const strNormalizedSearch = normalizeText(strQuery);

  const arrBoliviaResults = (objData.features || []).filter((objFeature: any) => {
    const bolIsBolivia = (objFeature.place_name || "").toLowerCase().includes("bolivia");
    const bolIsExactMatch =
      normalizeText(objFeature.text || "").includes(strNormalizedSearch) ||
      normalizeText(objFeature.place_name || "").includes(strNormalizedSearch);

    return bolIsBolivia && bolIsExactMatch;
  });

  const arrUniqueSuggestions = Array.from(
    new Map(
      arrBoliviaResults.map((objFeature: any) => {
        const strRawType = objFeature.place_type && objFeature.place_type.length > 0 ? objFeature.place_type[0] : "place";
        const strPlaceType = objTypeDictionary[strRawType] || "Ubicación";

        return [
          normalizeText(objFeature.text || ""),
          {
            strId: objFeature.id,
            strName: (objFeature.text || "").replace(
              /Departamento de |Provincia de |Provincia /gi,
              ""
            ),
            strFullName: objFeature.place_name,
            strIcon: strFlagUrl,
            strTypePlace: strPlaceType,
          },
        ];
      })
    ).values()
  ) as CitySuggestion[];

  return arrUniqueSuggestions.slice(0, 5);
}

export { intMaxCityLength };