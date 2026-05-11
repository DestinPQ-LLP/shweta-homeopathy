import { NextResponse } from 'next/server';
import { fetchAllClinics } from '@/lib/google/places';

// Cache for 1 hour at the edge
export const revalidate = 3600;

export async function GET() {
  try {
    const data = await fetchAllClinics();

    const totalCount =
      (data.zirakpur?.userRatingCount ?? 0) + (data.budhlada?.userRatingCount ?? 0);

    // Weighted average across both clinics
    const ratings: Array<{ rating: number; count: number }> = [];
    if (data.zirakpur?.rating != null && data.zirakpur.userRatingCount) {
      ratings.push({ rating: data.zirakpur.rating, count: data.zirakpur.userRatingCount });
    }
    if (data.budhlada?.rating != null && data.budhlada.userRatingCount) {
      ratings.push({ rating: data.budhlada.rating, count: data.budhlada.userRatingCount });
    }
    const totalWeight = ratings.reduce((s, r) => s + r.count, 0);
    const averageRating = totalWeight
      ? ratings.reduce((s, r) => s + r.rating * r.count, 0) / totalWeight
      : null;

    return NextResponse.json({
      ok: true,
      averageRating,
      totalCount,
      zirakpur: data.zirakpur,
      budhlada: data.budhlada,
      errors: data.errors,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
