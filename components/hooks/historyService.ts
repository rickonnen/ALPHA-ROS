import { CitySuggestion } from "../hooks/useCitySearch";

const strStorageKey = "recentCitySearches";

/**
 * dev: Rodrigo Saul Zarate Villarroel      fecha: 16/04/2026
 * funcionalidad: servicio encargado de gestionar el almacenamiento y recuperación del historial de ciudades
 */
export const historyService = {
  /**
   * funcionalidad: recupera el historial de búsquedas guardado en el dispositivo del usuario
   * @return promesa que resuelve en un arreglo de sugerencias de ciudades
   */
  async getHistory(): Promise<CitySuggestion[]> {
    // por ahora usa localstorage
    const strStored = localStorage.getItem(strStorageKey);
    if (!strStored) return [];
    return JSON.parse(strStored).slice(0, 5);
  },
  /**
   * funcionalidad: guarda una nueva ciudad en el historial, evitando elementos duplicados y manteniendo un límite de 5
   * @param objData objeto de tipo CitySuggestion que contiene los datos de la ciudad seleccionada
   * @return promesa que resuelve en el arreglo actualizado del historial
   */
  async save(objData: CitySuggestion): Promise<CitySuggestion[]> {
    // obtiene el historial actual del almacenamiento
    const arrCurrent = await this.getHistory();
    // filtra el arreglo para eliminar la ciudad si ya existía previamente
    const arrFiltered = arrCurrent.filter(
      (objItem) => objItem.strName.toLowerCase() !== objData.strName.toLowerCase()
    );
    // agrega la nueva ciudad al inicio de la lista y recorta a 5 elementos
    const arrUpdated = [objData, ...arrFiltered].slice(0, 5);
    // sobrescribe el almacenamiento local con el nuevo arreglo
    localStorage.setItem(strStorageKey, JSON.stringify(arrUpdated));
    return arrUpdated;
  }
};