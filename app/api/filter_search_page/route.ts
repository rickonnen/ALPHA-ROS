import { NextRequest, NextResponse } from 'next/server';

import {
  searchPublicaciones,
  type SearchFiltersInput,
} from '../../../features/filter_search_page/services';

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
