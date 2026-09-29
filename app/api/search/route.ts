import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../lib/server";

type SearchError = {
  section: string;
  message: string;
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const query =
      request.nextUrl.searchParams.get("q")?.trim() || "";

    const emptyResponse = {
      profiles: [],
      communities: [],
      marketplace: [],
      housing: [],
      gigs: [],
      events: [],
      errors: [],
    };

    if (!query) {
      return NextResponse.json(emptyResponse);
    }

    /*
     * Remove characters that can interfere with
     * PostgREST .or() filter syntax.
     */
    const cleanQuery = query
      .replace(/[%_,()]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanQuery) {
      return NextResponse.json(emptyResponse);
    }

    const pattern = `%${cleanQuery}%`;

    const [
      profilesResult,
      communitiesResult,
      marketplaceResult,
      housingResult,
      gigsResult,
      eventsResult,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          university,
          major,
          country,
          avatar_url
        `)
        .or(
          [
            `full_name.ilike.${pattern}`,
            `university.ilike.${pattern}`,
            `major.ilike.${pattern}`,
            `country.ilike.${pattern}`,
          ].join(",")
        )
        .limit(6),

      supabase
        .from("communities")
        .select(`
          id,
          name,
          description,
          category,
          created_at
        `)
        .or(
          [
            `name.ilike.${pattern}`,
            `description.ilike.${pattern}`,
            `category.ilike.${pattern}`,
          ].join(",")
        )
        .limit(6),

      supabase
        .from("marketplace_items")
        .select(`
          id,
          title,
          description,
          category,
          price,
          image_url,
          created_at
        `)
        .or(
          [
            `title.ilike.${pattern}`,
            `description.ilike.${pattern}`,
            `category.ilike.${pattern}`,
          ].join(",")
        )
        .limit(6),

      /*
       * Correct housing table:
       * public.housing_listings
       *
       * Your database uses "rent", not "price".
       */
      supabase
        .from("housing_listings")
        .select(`
          id,
          title,
          description,
          rent,
          location,
          created_at
        `)
        .or(
          [
            `title.ilike.${pattern}`,
            `description.ilike.${pattern}`,
            `location.ilike.${pattern}`,
          ].join(",")
        )
        .limit(6),

      /*
       * Correct gigs table:
       * public.student_gigs
       *
       * Your database uses "pay", not "budget".
       */
      supabase
        .from("student_gigs")
        .select(`
          id,
          title,
          description,
          pay,
          location,
          deadline,
          created_at
        `)
        .or(
          [
            `title.ilike.${pattern}`,
            `description.ilike.${pattern}`,
            `location.ilike.${pattern}`,
          ].join(",")
        )
        .limit(6),

      supabase
        .from("events")
        .select(`
          id,
          title,
          description,
          location,
          event_date,
          created_at
        `)
        .or(
          [
            `title.ilike.${pattern}`,
            `description.ilike.${pattern}`,
            `location.ilike.${pattern}`,
          ].join(",")
        )
        .limit(6),
    ]);

    const errors: SearchError[] = [];

    if (profilesResult.error) {
      errors.push({
        section: "profiles",
        message: profilesResult.error.message,
      });
    }

    if (communitiesResult.error) {
      errors.push({
        section: "communities",
        message: communitiesResult.error.message,
      });
    }

    if (marketplaceResult.error) {
      errors.push({
        section: "marketplace",
        message: marketplaceResult.error.message,
      });
    }

    if (housingResult.error) {
      errors.push({
        section: "housing",
        message: housingResult.error.message,
      });
    }

    if (gigsResult.error) {
      errors.push({
        section: "gigs",
        message: gigsResult.error.message,
      });
    }

    if (eventsResult.error) {
      errors.push({
        section: "events",
        message: eventsResult.error.message,
      });
    }

    /*
     * Normalize housing results so the Search page can
     * continue using a common "price" property.
     */
    const housing = (housingResult.data || []).map(
      (listing) => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        location: listing.location,
        price: listing.rent,
        image_url: null,
        created_at: listing.created_at,
      })
    );

    /*
     * Normalize gig results so the Search page can
     * continue using a common "budget" property.
     */
    const gigs = (gigsResult.data || []).map((gig) => ({
      id: gig.id,
      title: gig.title,
      description: gig.description,
      category: null,
      budget: gig.pay,
      location: gig.location,
      deadline: gig.deadline,
      created_at: gig.created_at,
    }));

    return NextResponse.json({
      profiles: profilesResult.data || [],
      communities: communitiesResult.data || [],
      marketplace: marketplaceResult.data || [],
      housing,
      gigs,
      events: eventsResult.data || [],
      errors: errors.map(
        (error) =>
          `${error.section}: ${error.message}`
      ),
    });
  } catch (error) {
    console.error("Universal search route error:", error);

    return NextResponse.json(
      {
        profiles: [],
        communities: [],
        marketplace: [],
        housing: [],
        gigs: [],
        events: [],
        errors: [],
        error:
          error instanceof Error
            ? error.message
            : "Search could not be completed.",
      },
      {
        status: 500,
      }
    );
  }
}