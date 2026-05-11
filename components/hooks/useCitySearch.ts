import { useState, useRef, useEffect, useCallback } from "react";
import type { KeyboardEvent } from "react";
import { fetchMapboxCities, intMaxCityLength, type CitySuggestion } from "./mapboxService";
import { historyService } from "./historyService";

export interface UseCitySearchProps {
  objUser?: any | null;
  bolIsAuthLoading?: boolean;
}

export function useCitySearch({ objUser = null, bolIsAuthLoading = false }: UseCitySearchProps = {}) {
  const [strCity, setStrCity] = useState("");
  const [arrSuggestions, setArrSuggestions] = useState<CitySuggestion[]>([]);
  const [bolShowSuggestions, setBolShowSuggestions] = useState(false);
  const [bolNoResults, setBolNoResults] = useState(false);
  const [intSelectedIndex, setIntSelectedIndex] = useState(-1);
  const objSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const objActiveQueryRef = useRef<string>("");

  const [bolShowHistory, setBolShowHistory] = useState(false);
  const [arrHistory, setArrHistory] = useState<CitySuggestion[]>([]);
  
  const [bolShowFullHistoryPanel, setBolShowFullHistoryPanel] = useState(false);
  const bolIsAuthenticated = !!objUser?.id;

  useEffect(() => {
    let bolIsMounted = true;
    if (bolIsAuthLoading) return;

    historyService.getHistory(bolIsAuthenticated).then((arrData) => {
      if (bolIsMounted) setArrHistory(arrData);
    });
    
    return () => {
      bolIsMounted = false;
      if (objSearchTimeoutRef.current) clearTimeout(objSearchTimeoutRef.current);
    };
  }, [objUser, bolIsAuthLoading]);

  const clearSuggestions = useCallback(() => {
    objActiveQueryRef.current = "";
    setArrSuggestions([]);
    setBolShowSuggestions(false);
    setBolNoResults(false);
    setIntSelectedIndex(-1);
  }, []);

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

  const fetchSuggestions = useCallback(async (strQuery: string) => {
    const strCleanQuery = strQuery.trim();
    if (strCleanQuery.length < 2) {
      clearSuggestions();
      return;
    }

    objActiveQueryRef.current = strCleanQuery;

    try {
      const arrFinalResults = await fetchMapboxCities(strCleanQuery);
      if (objActiveQueryRef.current !== strCleanQuery) return;

      setArrSuggestions(arrFinalResults);
      setBolShowSuggestions(arrFinalResults.length > 0);
      setBolNoResults(arrFinalResults.length === 0);
      setIntSelectedIndex(-1);
    } catch (objError) {
      if (objActiveQueryRef.current !== strCleanQuery) return;

      console.error("search error:", objError);
      setBolNoResults(true);
      setBolShowSuggestions(false);
      setArrSuggestions([]);
      setIntSelectedIndex(-1);
    }
  }, [clearSuggestions]);

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

  const handleFillFromHistory = useCallback(async (objItem: CitySuggestion) => {
    objActiveQueryRef.current = "";
    
    // Extraemos solo el texto para el input (Soluciona el [object Object])
    setStrCity(objItem.strName); 
    
    setBolShowHistory(false);
    setBolShowSuggestions(false);
    setBolShowFullHistoryPanel(false);
    setBolNoResults(false);
    setIntSelectedIndex(-1);
    
    if (objSearchTimeoutRef.current) {
      clearTimeout(objSearchTimeoutRef.current);
    }

    // Hacemos el Upsert en la BD para actualizar la fecha
    if (!bolIsAuthLoading) {
      const arrUpdated = await historyService.save(objItem, bolIsAuthenticated);
      if (arrUpdated.length > 0) {
        setArrHistory(arrUpdated);
      }
    }
  }, [bolIsAuthenticated, bolIsAuthLoading]);

  const handleSelectSuggestion = useCallback(async (objSuggestion: CitySuggestion) => {
    if (bolIsAuthLoading) return;

    objActiveQueryRef.current = "";
    setStrCity(objSuggestion.strName);
    setBolShowSuggestions(false);
    setBolShowHistory(false);
    setBolNoResults(false);
    setIntSelectedIndex(-1);

    const arrUpdated = await historyService.save(objSuggestion, bolIsAuthenticated);
    if (arrUpdated.length > 0) {
      setArrHistory(arrUpdated);
    }
  }, [bolIsAuthenticated, bolIsAuthLoading]);

  const handleDeleteHistoryItem = useCallback(async (strId: string) => {
    const arrUpdated = await historyService.deleteHistoryItem(strId, bolIsAuthenticated);
    setArrHistory(arrUpdated);
    if (arrUpdated.length === 0) {
      setBolShowHistory(false);
      setBolShowFullHistoryPanel(false);
    }
  }, [bolIsAuthenticated]);

  const handleKeyDown = useCallback((objEvent: KeyboardEvent<HTMLInputElement>) => {
    const bolIsSuggestionsActive = bolShowSuggestions && arrSuggestions.length > 0;
    const bolIsHistoryActive = bolShowHistory && arrHistory.length > 0 && !bolShowSuggestions && strCity.trim().length < 2;
    const bolIsFullPanelActive = bolShowFullHistoryPanel && arrHistory.length > 0;

    if (!bolIsSuggestionsActive && !bolIsHistoryActive && !bolIsFullPanelActive) return;

    let arrCurrentList: CitySuggestion[] = [];
    if (bolIsSuggestionsActive) arrCurrentList = arrSuggestions;
    else if (bolIsHistoryActive) arrCurrentList = arrHistory.slice(0, 5);
    else if (bolIsFullPanelActive) arrCurrentList = arrHistory;

    if (objEvent.key === "ArrowDown") {
      objEvent.preventDefault();
      setIntSelectedIndex((intPrev) => intPrev < arrCurrentList.length - 1 ? intPrev + 1 : 0);
    } else if (objEvent.key === "ArrowUp") {
      objEvent.preventDefault();
      setIntSelectedIndex((intPrev) => intPrev > 0 ? intPrev - 1 : arrCurrentList.length - 1);
    } else if (objEvent.key === "Enter") {
       objEvent.preventDefault();
       if (intSelectedIndex >= 0 && arrCurrentList[intSelectedIndex]) {
          handleFillFromHistory(arrCurrentList[intSelectedIndex]);
       }
    } else if (objEvent.key === "Escape") {
      setBolShowSuggestions(false);
      setBolShowHistory(false);
      setBolShowFullHistoryPanel(false);
      setIntSelectedIndex(-1);
    }
  }, [bolShowSuggestions, arrSuggestions, bolShowHistory, arrHistory, strCity, bolShowFullHistoryPanel, intSelectedIndex, handleFillFromHistory]);

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
    handleFillFromHistory,
    handleSelectSuggestion, handleKeyDown,
    bolIsAuthenticated,
    bolShowFullHistoryPanel, setBolShowFullHistoryPanel,
    handleDeleteHistoryItem
  };
}