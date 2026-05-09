
const maxAllowedPrice = 999999999;

export function validatePriceFilter(
    currency: unknown,
    minPrice: unknown,
    maxPrice: unknown
) {
    const normalizedMinPrice =
    minPrice === null || minPrice === undefined ? undefined : minPrice;

    const normalizedMaxPrice =
    maxPrice === null || maxPrice === undefined ? undefined : maxPrice;

    if (currency !== "USD" && currency !== "BS") {
        return {
            isValid: false,
            status: 400,
            message: "Invalid currency value",
        };
    }

    if (
        normalizedMinPrice !== undefined &&
        typeof normalizedMinPrice !== "number"
    ) {
        return {
        isValid: false,
        status: 400,
        message: "minPrice must be a number",
        };
    }

    if (
        normalizedMaxPrice !== undefined &&
        typeof normalizedMaxPrice !== "number"
    ) {
        return {
        isValid: false,
        status: 400,
        message: "maxPrice must be a number",
        };
    }

    if (normalizedMinPrice !== undefined && normalizedMinPrice < 0) {
        return {
        isValid: false,
        status: 400,
        message: "minPrice cannot be negative",
        };
    }

    if (normalizedMaxPrice !== undefined && normalizedMaxPrice < 0) {
        return {
        isValid: false,
        status: 400,
        message: "maxPrice cannot be negative",
        };
    }

    if (normalizedMinPrice !== undefined && normalizedMinPrice > maxAllowedPrice) {
        return {
            isValid: false,
            status: 400,
            message: "minPrice exceeds the maximum allowed value",
        };
    }

    if (normalizedMaxPrice !== undefined && normalizedMaxPrice > maxAllowedPrice) {
        return {
            isValid: false,
            status: 400,
            message: "maxPrice exceeds the maximum allowed value",
        };
    }

    if (
        normalizedMinPrice !== undefined &&
        normalizedMaxPrice !== undefined &&
        normalizedMinPrice > normalizedMaxPrice
    ) {
        return {
            isValid: false,
            status: 400,
            message: "minPrice cannot be greater than maxPrice",
        };
    }

    return {
        isValid: true,
        status: 200,
        message: "Price filter data is valid",
        data: {
            currency,
            minPrice: normalizedMinPrice,
            maxPrice: normalizedMaxPrice,
        },
    };
}