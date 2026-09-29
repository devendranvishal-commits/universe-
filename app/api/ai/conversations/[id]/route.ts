import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../lib/server";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Conversation ID is required.",
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
        "Conversation authentication error:",
        userError.message
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          error: "You must be signed in.",
        },
        {
          status: 401,
        }
      );
    }

    const {
      data: conversation,
      error: conversationError,
    } = await supabase
      .from("ai_conversations")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (conversationError) {
      return NextResponse.json(
        {
          error: conversationError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!conversation) {
      return NextResponse.json(
        {
          error: "Conversation not found.",
        },
        {
          status: 404,
        }
      );
    }

    const { data, error } = await supabase
      .from("ai_messages")
      .select(`
        id,
        role,
        content,
        created_at
      `)
      .eq("conversation_id", id)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error(
      "Load conversation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load conversation.",
      },
      {
        status: 500,
      }
    );
  }
}