/*import { NextRequest, NextResponse } from "next/server";
import { validatePriceFilter } from "../../../features/filter_search_page/priceFilterValidator";
import { normalizePriceFilterToUsd } from "../../../features/filter_search_page/normalizePriceFilter";
import { getPublications } from "../../../features/filter_search_page/getPublications";
import { filterPublicationsByPrice } from "../../../features/filter_search_page/filterPublicationsByPrice";

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
}*/
import { NextRequest, NextResponse } from 'next/server';

import { searchPublicaciones, type SearchFiltersInput } from '../../../features/filter_search_page/services';

export async function POST(request: NextRequest) {
  try {
    const filters = (await request.json()) as SearchFiltersInput;
    const publications = await searchPublicaciones(filters);

    return NextResponse.json({
      success: true,
      publications,
      total: publications.length,
    });
  } catch (error) {
    console.error('[filter_search_page] Error processing search request:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process search request',
      },
      { status: 500 },
    );
  }
}
