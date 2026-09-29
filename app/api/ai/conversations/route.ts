import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(
        "Conversation list authentication error:",
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

    const { data, error } = await supabase
      .from("ai_conversations")
      .select(`
        id,
        title,
        created_at,
        updated_at
      `)
      .eq("user_id", user.id)
      .order("updated_at", {
        ascending: false,
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
      "Load conversations error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not load conversations.",
      },
      {
        status: 500,
      }
    );
  }
}