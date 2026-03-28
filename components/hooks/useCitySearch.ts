import { useState, useRef } from "react";
import type { KeyboardEvent } from "react";

const strMapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const strBoliviaBbox = "-69.64,-22.90,-57.45,-9.66";
const strFlagUrl = "https://res.cloudinary.com/dj1mlj3vz/image/upload/v1774580367/flag-for-flag-bolivia-svgrepo-com_xemt7m.svg";

const intMaxCityLength = 30;

export function useCitySearch() {
  const [strCity, setStrCity] = useState("");
  const [arrSuggestions, setArrSuggestions] = useState<any[]>([]);
  const [bolShowSuggestions, setBolShowSuggestions] = useState(false);
  const [bolNoResults, setBolNoResults] = useState(false);
  const [intSelectedIndex, setIntSelectedIndex] = useState(-1);
  const objSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalizeText = (strVal: string) =>
    strVal.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const clearSuggestions = () => {
    setArrSuggestions([]);
    setBolShowSuggestions(false);
    setBolNoResults(false);
    setIntSelectedIndex(-1);
  };

  const fetchSuggestions = async (strQuery: string) => {
    const strCleanQuery = strQuery.trim();

    if (strCleanQuery.length < 2 || !strMapboxToken) {
      clearSuggestions();
      return;
    }

    const strUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      strCleanQuery
    )}.json?bbox=${strBoliviaBbox}&types=region,district,place,locality,neighborhood&limit=20&language=es&autocomplete=true&fuzzyMatch=false&proximity=-66.1568,-17.3936&access_token=${strMapboxToken}`;

    try {
      const objResponse = await fetch(strUrl);
      const objData = await objResponse.json();

      const strNormalizedSearch = normalizeText(strCleanQuery);

      const objTypeDictionary: Record<string, string> = {
        region: "Departamento",
        district: "Provincia",
        place: "Ciudad",
        locality: "Localidad",
        neighborhood: "Barrio",
        poi: "Lugar",
        address: "Dirección"
      };

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
      ) as any[];

      const arrFinalResults = arrUniqueSuggestions.slice(0, 5);

      setArrSuggestions(arrFinalResults);
      setBolShowSuggestions(arrFinalResults.length > 0);
      setBolNoResults(arrFinalResults.length === 0);
      setIntSelectedIndex(-1);
    } catch (objError) {
      console.error("Search Error:", objError);
      setBolNoResults(true);
      setBolShowSuggestions(false);
      setArrSuggestions([]);
      setIntSelectedIndex(-1);
    }
  };

  const handleCityChange = (strVal: string) => {
    const strLimitedValue = strVal.slice(0, intMaxCityLength);
    setStrCity(strLimitedValue);
    setIntSelectedIndex(-1);

    if (objSearchTimeoutRef.current) {
      clearTimeout(objSearchTimeoutRef.current);
    }

    const strCleanValue = strLimitedValue.trim();

    if (strCleanValue.length < 2) {
      clearSuggestions();
      return;
    }

    objSearchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(strCleanValue);
    }, 300);
  };

  const handleSelectSuggestion = (objSuggestion: any) => {
    setStrCity(objSuggestion.strName);
    setBolShowSuggestions(false);
    setBolNoResults(false);
    setIntSelectedIndex(-1);
  };

  const handleKeyDown = (objEvent: KeyboardEvent<HTMLInputElement>) => {
    if (!bolShowSuggestions || arrSuggestions.length === 0) return;

    if (objEvent.key === "ArrowDown") {
      objEvent.preventDefault();
      setIntSelectedIndex((intPrev) =>
        intPrev < arrSuggestions.length - 1 ? intPrev + 1 : 0
      );
    }

    if (objEvent.key === "ArrowUp") {
      objEvent.preventDefault();
      setIntSelectedIndex((intPrev) =>
        intPrev > 0 ? intPrev - 1 : arrSuggestions.length - 1
      );
    }

    if (objEvent.key === "Enter") {
      objEvent.preventDefault();
      if (intSelectedIndex >= 0) {
        handleSelectSuggestion(arrSuggestions[intSelectedIndex]);
      }
    }

    if (objEvent.key === "Escape") {
      setBolShowSuggestions(false);
      setIntSelectedIndex(-1);
    }
  };

  return {
    strCity,
    setStrCity,
    arrSuggestions,
    setArrSuggestions,
    bolShowSuggestions,
    setBolShowSuggestions,
    bolNoResults,
    setBolNoResults,
    intSelectedIndex,
    setIntSelectedIndex,
    intMaxCityLength,
    handleCityChange,
    handleSelectSuggestion,
    handleKeyDown,
  };
}