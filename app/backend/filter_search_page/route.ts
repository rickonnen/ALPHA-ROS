import { NextRequest, NextResponse } from "next/server";
import { validatePriceFilter } from "./priceFilterValidator";
import { normalizePriceFilterToUsd } from "./normalizePriceFilter";
import { getPublications } from "./getPublications";
import { filterPublicationsByPrice } from "./filterPublicationsByPrice";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { currency, minPrice, maxPrice } = body;

    const validationResult = validatePriceFilter(currency, minPrice, maxPrice);

    if (!validationResult.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: validationResult.message,
        },
        { status: validationResult.status }
      );
    }

    if (!validationResult.data) {
      return NextResponse.json(
        {
          success: false,
          message: "Validated filter data is missing",
        },
        { status: 500 }
      );
    }

    const validatedFilters = validationResult.data;
    const normalizedFilters = normalizePriceFilterToUsd(validatedFilters);
    const publications = await getPublications();

    const filteredPublications = filterPublicationsByPrice(
        publications,
        normalizedFilters
    );

    return NextResponse.json({
        success: true,
        message: validationResult.message,
        filters: validatedFilters,
        normalizedFilters,
        filteredPublications,
    });
    
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process request",
      },
      { status: 500 }
    );
  }
}