import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../lib/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type RequestBody = {
  message?: string;
  conversationId?: string;
  history?: {
    role: "user" | "assistant";
    content: string;
  }[];
};

type DatabaseError = {
  section: string;
  message: string;
};

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY is missing from .env.local.",
        },
        {
          status: 500,
        }
      );
    }

    const body = (await request.json()) as RequestBody;

const message = body.message?.trim();
const history = body.history ?? [];
const conversationId =
  body.conversationId ??
  crypto.randomUUID();
    if (!message) {
      return NextResponse.json(
        {
          error: "Please enter a message.",
        },
        {
          status: 400,
        }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        {
          error:
            "Your message cannot be longer than 2,000 characters.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(
        "Universe AI authentication error:",
        userError.message
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          error:
            "You must be signed in to use Universe AI.",
        },
        {
          status: 401,
        }
      );
    }
    let activeConversationId = conversationId;

if (conversationId) {
  const { data: existingConversation } = await supabase
    .from("ai_conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existingConversation) {
    activeConversationId = crypto.randomUUID();

    await supabase.from("ai_conversations").insert({
      id: activeConversationId,
      user_id: user.id,
      title: message.slice(0, 60),
    });
  }
} else {
  activeConversationId = crypto.randomUUID();

  await supabase.from("ai_conversations").insert({
    id: activeConversationId,
    user_id: user.id,
    title: message.slice(0, 60),
  });
}
await supabase.from("ai_messages").insert({
  conversation_id: activeConversationId,
  role: "user",
  content: message,
});
    const [
      profileResult,
      communitiesResult,
      housingResult,
      gigsResult,
      marketplaceResult,
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
          bio
        `)
        .eq("id", user.id)
        .maybeSingle(),

      supabase
        .from("communities")
        .select(`
          id,
          name,
          description,
          category,
          created_at
        `)
        .order("created_at", {
          ascending: false,
        })
        .limit(20),

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
        .order("created_at", {
          ascending: false,
        })
        .limit(20),

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
        .order("created_at", {
          ascending: false,
        })
        .limit(20),

      supabase
        .from("marketplace_items")
        .select(`
          id,
          title,
          description,
          category,
          price,
          created_at
        `)
        .order("created_at", {
          ascending: false,
        })
        .limit(20),

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
        .order("created_at", {
          ascending: false,
        })
        .limit(20),
    ]);

    const databaseErrors: DatabaseError[] = [];

    if (profileResult.error) {
      databaseErrors.push({
        section: "profile",
        message: profileResult.error.message,
      });
    }

    if (communitiesResult.error) {
      databaseErrors.push({
        section: "communities",
        message: communitiesResult.error.message,
      });
    }

    if (housingResult.error) {
      databaseErrors.push({
        section: "housing",
        message: housingResult.error.message,
      });
    }

    if (gigsResult.error) {
      databaseErrors.push({
        section: "gigs",
        message: gigsResult.error.message,
      });
    }

    if (marketplaceResult.error) {
      databaseErrors.push({
        section: "marketplace",
        message: marketplaceResult.error.message,
      });
    }

    if (eventsResult.error) {
      databaseErrors.push({
        section: "events",
        message: eventsResult.error.message,
      });
    }

    if (databaseErrors.length > 0) {
      console.warn(
        "Universe AI database warnings:",
        databaseErrors
      );
    }

    const campusData = {
      currentUser: profileResult.data
        ? {
            fullName:
              profileResult.data.full_name,
            university:
              profileResult.data.university,
            major: profileResult.data.major,
            country: profileResult.data.country,
            bio: profileResult.data.bio,
          }
        : null,

      communities: (
        communitiesResult.data || []
      ).map((community) => ({
        name: community.name,
        description: community.description,
        category: community.category,
        route: `/communities/${community.id}`,
      })),

      housing: (housingResult.data || []).map(
        (listing) => ({
          title: listing.title,
          description: listing.description,
          monthlyRent: listing.rent,
          location: listing.location,
          route: `/housing/${listing.id}`,
        })
      ),

      gigs: (gigsResult.data || []).map(
        (gig) => ({
          title: gig.title,
          description: gig.description,
          pay: gig.pay,
          location: gig.location,
          deadline: gig.deadline,
          route: `/gigs/${gig.id}`,
        })
      ),

      marketplace: (
        marketplaceResult.data || []
      ).map((item) => ({
        title: item.title,
        description: item.description,
        category: item.category,
        price: item.price,
        route: `/marketplace/${item.id}`,
      })),

      events: (eventsResult.data || []).map(
        (event) => ({
          title: event.title,
          description: event.description,
          location: event.location,
          eventDate: event.event_date,
          route: `/events/${event.id}`,
        })
      ),
    };

    const response =
      await openai.responses.create({
        model: "gpt-5-mini",

        instructions: `
You are Universe AI, the campus assistant inside Universe Student OS.

You help authenticated students discover information from their real Universe campus database.

You may help with:
- student communities
- housing listings
- student gigs
- marketplace items
- campus events
- student productivity
- general campus life

Important rules:

1. Use the supplied UNIVERSE DATABASE DATA when it is relevant.
2. Never invent listings, prices, dates, communities, events, or gigs.
3. If no matching database result exists, clearly say that no matching result was found in the available Universe data.
4. Keep answers friendly, practical, and concise.
5. When recommending database results, include their internal Universe route.
6. Display routes on their own line so users can copy or open them.
7. Use dollar signs when displaying rent, pay, or marketplace prices.
8. For housing, clearly label the amount as monthly rent when appropriate.
9. Do not reveal private user IDs or internal database details.
10. Do not claim that you searched data that was not supplied.
11. When the request is unclear, ask one useful follow-up question.
12. Prefer the most relevant results and show no more than five items per category.
        `.trim(),

        input: [
  ...history.map((item) => ({
    role: item.role,
    content: item.content,
  })),
  {
    role: "user",
    content: `
USER REQUEST:
${message}

UNIVERSE DATABASE DATA:
${JSON.stringify(campusData, null, 2)}
`.trim(),
  },
],
        max_output_tokens: 900,
        store: false,
      });

    const answer =
      response.output_text?.trim() ||
      "I could not generate a response.";
      await supabase.from("ai_messages").insert({
  conversation_id: activeConversationId,
  role: "assistant",
  content: answer,
});

    return NextResponse.json({
  answer,
  conversationId: activeConversationId,
  databaseWarnings: databaseErrors.map(
        (databaseError) =>
          `${databaseError.section}: ${databaseError.message}`
      ),
    });
  } catch (error) {
    console.error(
      "Universe AI route error:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Universe AI could not respond.";

    return NextResponse.json(
      {
        error: createFriendlyError(
          errorMessage
        ),
      },
      {
        status: 500,
      }
    );
  }
}

function createFriendlyError(
  errorMessage: string
) {
  const normalized =
    errorMessage.toLowerCase();

  if (
    normalized.includes("quota") ||
    normalized.includes("billing")
  ) {
    return (
      "Universe AI has no available OpenAI API credits. " +
      "Check your OpenAI Platform billing and credit balance."
    );
  }

  if (
    normalized.includes("incorrect api key") ||
    normalized.includes("invalid api key") ||
    normalized.includes("authentication")
  ) {
    return (
      "The OpenAI API key is invalid. " +
      "Check OPENAI_API_KEY in .env.local and restart the development server."
    );
  }

  if (
    normalized.includes("rate limit") ||
    normalized.includes("429")
  ) {
    return (
      "Universe AI is receiving too many requests right now. " +
      "Wait briefly and try again."
    );
  }

  return errorMessage;
}