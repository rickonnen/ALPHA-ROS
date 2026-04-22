import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";

const strMapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
const strBoliviaBbox = "-69.64,-22.90,-57.45,-9.66";
const strFlagUrl = "/banderaBolivia.svg";

const intMaxCityLength = 30;

export function useSearchHistory() {
  const [arrHistory, setArrHistory] = useState<any[]>([]);
  const strStorageKey = "recentCitySearches";

  useEffect(() => {
    try {
      const strStored = localStorage.getItem(strStorageKey);
      if (strStored) {
        const arrParsed = JSON.parse(strStored);
        if (Array.isArray(arrParsed)) setArrHistory(arrParsed);
      }
    } catch (objError) {
      console.error("Error al cargar historial:", objError);
    }
  }, []);

  const saveToHistory = (objData: any) => {
    if (!objData || !objData.strName || !objData.strName.trim()) return;

    setArrHistory((arrPrev) => {
      const arrFiltered = arrPrev.filter(
        (objItem) => objItem.strName.toLowerCase() !== objData.strName.toLowerCase()
      );
      const arrUpdated = [objData, ...arrFiltered].slice(0, 5);
      
      try {
        localStorage.setItem(strStorageKey, JSON.stringify(arrUpdated));
      } catch (objError) {
        console.error("Error al guardar historial:", objError);
      }
      
      return arrUpdated;
    });
  };

  return { arrHistory, saveToHistory };
}

export function useCitySearch() {
  const [strCity, setStrCity] = useState("");
  const [arrSuggestions, setArrSuggestions] = useState<any[]>([]);
  const [bolShowSuggestions, setBolShowSuggestions] = useState(false);
  const [bolNoResults, setBolNoResults] = useState(false);
  const [intSelectedIndex, setIntSelectedIndex] = useState(-1);
  const objSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estados integrados para el historial
  const [bolShowHistory, setBolShowHistory] = useState(false);
  const { arrHistory, saveToHistory } = useSearchHistory();

  const normalizeText = (strVal: string) =>
    strVal.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  // Función para abrir el historial al hacer clic en el input vacío
  const handleInputFocus = () => {
    if (strCity.trim().length < 2) {
      if (arrHistory.length > 0) {
        setBolShowHistory(true);
        setBolShowSuggestions(false);
      }
    } else if (arrSuggestions.length > 0) {
      setBolShowSuggestions(true);
    }
  };

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
      if (arrHistory.length > 0) setBolShowHistory(true);
      return;
    }

    setBolShowHistory(false);

    objSearchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(strCleanValue);
    }, 300);
  };

  const handleSelectSuggestion = (objSuggestion: any) => {
    setStrCity(objSuggestion.strName);
    setBolShowSuggestions(false);
    setBolNoResults(false);
    setIntSelectedIndex(-1);
    saveToHistory(objSuggestion);
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
    arrHistory,
    bolShowHistory,
    setBolShowHistory,
    handleInputFocus,
    handleCityChange,
    handleSelectSuggestion,
    handleKeyDown,
  };
}