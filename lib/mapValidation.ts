export const MIN_ZONE_POINTS = 4
export const MAX_ZONE_POINTS = 10
export const MAX_ZONE_SPAN_METERS = 200_000

export const MAX_POINTS_OF_INTEREST = 5
export const MAX_POINT_OF_INTEREST_NAME_LENGTH = 80
export const MAX_POINT_OF_INTEREST_DESCRIPTION_LENGTH = 300
export const MAX_POINT_OF_INTEREST_DISTANCE_METERS = 5_000
export const MIN_POINT_OF_INTEREST_SEPARATION_METERS = 30

export type LatLngTuple = [number, number]

export function isFiniteCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

export function isValidCoordinatePair(value: unknown): value is LatLngTuple {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    isFiniteCoordinate(value[0]) &&
    isFiniteCoordinate(value[1])
  )
}

export function calculateDistanceMeters(
  originLat: number,
  originLng: number,
  destinationLat: number,
  destinationLng: number,
): number {
  const earthRadius = 6371000
  const toRadians = (value: number) => (value * Math.PI) / 180
  const deltaLat = toRadians(destinationLat - originLat)
  const deltaLng = toRadians(destinationLng - originLng)
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(originLat)) *
      Math.cos(toRadians(destinationLat)) *
      Math.sin(deltaLng / 2) ** 2

  return Math.round(
    earthRadius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))),
  )
}

export function getMaxDistanceBetweenPointsMeters(
  points: LatLngTuple[],
): number {
  let maxDistance = 0

  for (let index = 0; index < points.length; index += 1) {
    const [originLat, originLng] = points[index]

    for (
      let compareIndex = index + 1;
      compareIndex < points.length;
      compareIndex += 1
    ) {
      const [destinationLat, destinationLng] = points[compareIndex]
      const distance = calculateDistanceMeters(
        originLat,
        originLng,
        destinationLat,
        destinationLng,
      )

      if (distance > maxDistance) {
        maxDistance = distance
      }
    }
  }

  return maxDistance
}

export function getZoneSpanError(
  coordinates: LatLngTuple[],
  maxSpanMeters: number = MAX_ZONE_SPAN_METERS,
): string | null {
  if (coordinates.length < MIN_ZONE_POINTS) return null

  const maxDistance = getMaxDistanceBetweenPointsMeters(coordinates)

  if (maxDistance > maxSpanMeters) {
    return "La zona es demasiado grande. Debe mantenerse dentro de un área cercana a una ciudad o departamento."
  }

  return null
}

export type PointOfInterestCandidate = {
  id?: string
  lat: number
  lng: number
}

export function getPointOfInterestConstraintError(params: {
  propertyLat: number
  propertyLng: number
  pointLat: number
  pointLng: number
  existingPoints?: PointOfInterestCandidate[]
  currentPointId?: string
}): string | null {
  const {
    propertyLat,
    propertyLng,
    pointLat,
    pointLng,
    existingPoints = [],
    currentPointId,
  } = params

  const distanceToProperty = calculateDistanceMeters(
    propertyLat,
    propertyLng,
    pointLat,
    pointLng,
  )

  if (distanceToProperty > MAX_POINT_OF_INTEREST_DISTANCE_METERS) {
    return "El punto de interés está demasiado lejos de la propiedad."
  }

  if (
    distanceToProperty < MIN_POINT_OF_INTEREST_SEPARATION_METERS
  ) {
    return "El punto de interés no puede quedar encima del marcador principal de la propiedad."
  }

  const overlappingPoint = existingPoints.find((point) => {
    if (currentPointId && point.id === currentPointId) return false

    const distanceBetweenPoints = calculateDistanceMeters(
      point.lat,
      point.lng,
      pointLat,
      pointLng,
    )

    return distanceBetweenPoints < MIN_POINT_OF_INTEREST_SEPARATION_METERS
  })

  if (overlappingPoint) {
    return "Ese punto de interés se superpone con otro marcador existente."
  }

  return null
}
