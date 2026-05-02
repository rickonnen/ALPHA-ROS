import { CitySuggestion } from "./mapboxService";

const strStorageKey = "recentCitySearches";

/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 16/04/2026
 * funcionalidad: servicio encargado de gestionar el almacenamiento y recuperación del historial de ciudades
 */
export const historyService = {
  async getHistory(blnIsAuthenticated: boolean = false): Promise<CitySuggestion[]> {
    if (blnIsAuthenticated) {
      try {
        const objResponse = await fetch('/api/home/searchHistory');
        if (objResponse.ok) return await objResponse.json();
      } catch (error) {
        console.error("Error obteniendo historial de la BD:", error);
      }
      return []; 
    }

    const strStored = localStorage.getItem(strStorageKey);
    if (!strStored) return [];
    return JSON.parse(strStored).slice(0, 5);
  },

  async save(objData: CitySuggestion, blnIsAuthenticated: boolean = false): Promise<CitySuggestion[]> {
    if (blnIsAuthenticated) {
      try {
        const objResponse = await fetch('/api/home/searchHistory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(objData)
        });
        if (objResponse.ok) return await objResponse.json();
      } catch (error) {
        console.error("Error guardando historial en la BD:", error);
      }
      return [objData]; 
    }

    const arrCurrent = await this.getHistory(false);
    const arrFiltered = arrCurrent.filter((objItem) => objItem.strId !== objData.strId);
    const arrUpdated = [objData, ...arrFiltered].slice(0, 5); // Límite de 5 solo para anónimos
    localStorage.setItem(strStorageKey, JSON.stringify(arrUpdated));
    return arrUpdated;
  },

  // NUEVO: Método para borrar un registro específico
  async deleteHistoryItem(strId: string, blnIsAuthenticated: boolean = false): Promise<CitySuggestion[]> {
    if (blnIsAuthenticated) {
      try {
        const objResponse = await fetch(`/api/home/searchHistory?strId=${strId}`, { method: 'DELETE' });
        if (objResponse.ok) return await objResponse.json();
      } catch (error) {
        console.error("Error eliminando historial en la BD:", error);
      }
      return await this.getHistory(true); 
    }

    const arrCurrent = await this.getHistory(false);
    const arrFiltered = arrCurrent.filter((objItem) => objItem.strId !== strId);
    localStorage.setItem(strStorageKey, JSON.stringify(arrFiltered));
    return arrFiltered;
  }
};