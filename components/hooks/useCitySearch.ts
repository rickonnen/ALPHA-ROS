import { useState, useRef, useEffect, useCallback } from "react";
import type { KeyboardEvent } from "react";
import { fetchMapboxCities, intMaxCityLength, type CitySuggestion } from "./mapboxService";
import { historyService } from "./historyService";

export function useCitySearch() {
  const [strCity, setStrCity] = useState("");
  const [arrSuggestions, setArrSuggestions] = useState<CitySuggestion[]>([]);
  const [bolShowSuggestions, setBolShowSuggestions] = useState(false);
  const [bolNoResults, setBolNoResults] = useState(false);
  const [intSelectedIndex, setIntSelectedIndex] = useState(-1);
  const objSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [bolShowHistory, setBolShowHistory] = useState(false);
  const [arrHistory, setArrHistory] = useState<CitySuggestion[]>([]);

  // cargar historial inicial
  useEffect(() => {
    let bolIsMounted = true;
    historyService.getHistory().then((arrData) => {
      if (bolIsMounted) setArrHistory(arrData);
    });
    return () => {
      bolIsMounted = false;
      if (objSearchTimeoutRef.current) clearTimeout(objSearchTimeoutRef.current);
    };
  }, []);

  // limpia las sugerencias
  const clearSuggestions = useCallback(() => {
    setArrSuggestions([]);
    setBolShowSuggestions(false);
    setBolNoResults(false);
    setIntSelectedIndex(-1);
  }, []);

  // maneja el foco del input para mostrar historial o sugerencias previas
  const handleInputFocus = useCallback(() => {
    if (strCity.trim().length < 2) {
      if (arrHistory.length > 0) {
        setBolShowHistory(true);
        setBolShowSuggestions(false);
        setIntSelectedIndex(-1);
      }
    } else if (arrSuggestions.length > 0) {
      setBolShowSuggestions(true);
      setIntSelectedIndex(-1);
    }
  }, [strCity, arrHistory.length, arrSuggestions.length]);

  // delega la carga de sugerencias del servicio
  const fetchSuggestions = useCallback(async (strQuery: string) => {
    const strCleanQuery = strQuery.trim();
    if (strCleanQuery.length < 2) {
      clearSuggestions();
      return;
    }
    try {
      const arrFinalResults = await fetchMapboxCities(strCleanQuery);
      setArrSuggestions(arrFinalResults);
      setBolShowSuggestions(arrFinalResults.length > 0);
      setBolNoResults(arrFinalResults.length === 0);
      setIntSelectedIndex(-1);
    } catch (objError) {
      console.error("search error:", objError);
      setBolNoResults(true);
      setBolShowSuggestions(false);
      setArrSuggestions([]);
      setIntSelectedIndex(-1);
    }
  }, [clearSuggestions]);

  // maneja el cambio de texto en el input y aplica debounce a la búsqueda
  const handleCityChange = useCallback((strVal: string) => {
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
  }, [arrHistory.length, clearSuggestions, fetchSuggestions]);

  // maneja la selección de una sugerencia o elemento del historial
  const handleSelectSuggestion = useCallback(async (objSuggestion: CitySuggestion) => {
    setStrCity(objSuggestion.strName);
    setBolShowSuggestions(false);
    setBolShowHistory(false);
    setBolNoResults(false);
    setIntSelectedIndex(-1);
    // delegamos el guardado al servicio y actualizamos el estado local
    const arrUpdated = await historyService.save(objSuggestion);
    if (arrUpdated.length > 0) {
      setArrHistory(arrUpdated);
    }
  }, []);

  // maneja la navegación por teclado
  const handleKeyDown = useCallback((objEvent: KeyboardEvent<HTMLInputElement>) => {
    const bolIsSuggestionsActive = bolShowSuggestions && arrSuggestions.length > 0;
    const bolIsHistoryActive = bolShowHistory && arrHistory.length > 0 && !bolShowSuggestions && strCity.trim().length < 2;
    if (!bolIsSuggestionsActive && !bolIsHistoryActive) return;
    const arrCurrentList = bolIsSuggestionsActive ? arrSuggestions : arrHistory.slice(0, 5);
    if (objEvent.key === "ArrowDown") {
      objEvent.preventDefault();
      setIntSelectedIndex((intPrev) => intPrev < arrCurrentList.length - 1 ? intPrev + 1 : 0);
    } else if (objEvent.key === "ArrowUp") {
      objEvent.preventDefault();
      setIntSelectedIndex((intPrev) => intPrev > 0 ? intPrev - 1 : arrCurrentList.length - 1);
    } else if (objEvent.key === "Escape") {
      setBolShowSuggestions(false);
      setBolShowHistory(false);
      setIntSelectedIndex(-1);
    }
  }, [bolShowSuggestions, arrSuggestions, bolShowHistory, arrHistory, strCity]);

  return {
    strCity, setStrCity,
    arrSuggestions, setArrSuggestions,
    bolShowSuggestions, setBolShowSuggestions,
    bolNoResults, setBolNoResults,
    intSelectedIndex, setIntSelectedIndex,
    intMaxCityLength,
    arrHistory,
    bolShowHistory, setBolShowHistory,
    handleInputFocus, handleCityChange,
    handleSelectSuggestion, handleKeyDown,
  };
}