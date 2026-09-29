"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, X } from "lucide-react";
import { createClient } from "../../../../lib/client";

type Ride = {
  id: string;
  driver_id: string;
  origin: string;
  destination: string;
  departure_time: string;
  seats: number;
};

type RideRequest = {
  id: string;
  requester_id: string;
  status: string;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  university: string | null;
  major: string | null;
};

export default function ManageRideRequestsPage() {
  const params = useParams();
  const rideId = params.id as string;

  const [ride, setRide] = useState<Ride | null>(null);
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    loadPage();
  }, [rideId]);

  async function loadPage() {
    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: rideData, error: rideError } = await supabase
      .from("carpool_rides")
      .select(`
        id,
        driver_id,
        origin,
        destination,
        departure_time,
        seats
      `)
      .eq("id", rideId)
      .eq("driver_id", user.id)
      .single();

    if (rideError) {
      console.error(rideError.message);
      setRide(null);
      setLoading(false);
      return;
    }

    setRide(rideData as Ride);

    const { data: requestData, error: requestError } = await supabase
      .from("carpool_requests")
      .select(`
        id,
        requester_id,
        status,
        created_at
      `)
      .eq("ride_id", rideId)
      .order("created_at", { ascending: false });

    if (requestError) {
      alert(requestError.message);
      setLoading(false);
      return;
    }

    const loadedRequests = (requestData as RideRequest[]) || [];
    setRequests(loadedRequests);

    const requesterIds = Array.from(
      new Set(loadedRequests.map((request) => request.requester_id))
    );

    if (requesterIds.length > 0) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          university,
          major
        `)
        .in("id", requesterIds);

      if (profileError) {
        console.error(profileError.message);
      } else {
        const profileMap: Record<string, Profile> = {};

        ((profileData as Profile[] | null) || []).forEach((profile) => {
          profileMap[profile.id] = profile;
        });

        setProfiles(profileMap);
      }
    } else {
      setProfiles({});
    }

    setLoading(false);
  }

  async function acceptRequest(requestId: string) {
    if (!ride) return;

    const selectedRequest = requests.find(
      (request) => request.id === requestId
    );

    if (!selectedRequest) {
      alert("Request not found.");
      return;
    }

    setUpdatingId(requestId);

    const supabase = createClient();

    const { error: acceptError } = await supabase.rpc(
      "accept_carpool_request",
      {
        request_id: requestId,
      }
    );

    if (acceptError) {
      setUpdatingId("");
      alert(acceptError.message);
      return;
    }

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: selectedRequest.requester_id,
        title: "Ride request accepted",
        message: `Your request to join the ride from ${ride.origin} to ${ride.destination} was accepted.`,
        type: "carpool_request_accepted",
        is_read: false,
        link: `/carpool/${ride.id}`,
      });

    if (notificationError) {
      console.error(
        "Request accepted, but notification failed:",
        notificationError.message
      );
    }

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: "accepted",
            }
          : request
      )
    );

    setRide((currentRide) =>
      currentRide
        ? {
            ...currentRide,
            seats: Math.max(0, currentRide.seats - 1),
          }
        : currentRide
    );

    setUpdatingId("");
    alert("Ride request accepted.");
  }

  async function rejectRequest(requestId: string) {
    if (!ride) return;

    const selectedRequest = requests.find(
      (request) => request.id === requestId
    );

    if (!selectedRequest) {
      alert("Request not found.");
      return;
    }

    setUpdatingId(requestId);

    const supabase = createClient();

    const { error: rejectError } = await supabase
      .from("carpool_requests")
      .update({
        status: "rejected",
      })
      .eq("id", requestId);

    if (rejectError) {
      setUpdatingId("");
      alert(rejectError.message);
      return;
    }

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: selectedRequest.requester_id,
        title: "Ride request rejected",
        message: `Your request to join the ride from ${ride.origin} to ${ride.destination} was rejected.`,
        type: "carpool_request_rejected",
        is_read: false,
        link: `/carpool/${ride.id}`,
      });

    if (notificationError) {
      console.error(
        "Request rejected, but notification failed:",
        notificationError.message
      );
    }

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: "rejected",
            }
          : request
      )
    );

    setUpdatingId("");
    alert("Ride request rejected.");
  }

  if (loading) {
    return (
      <p className="p-10 text-center text-gray-400">
        Loading ride requests...
      </p>
    );
  }

  if (!ride) {
    return (
      <main className="p-10">
        <h1 className="text-4xl font-black">
          Ride not found or you are not the driver.
        </h1>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-blue-700/30 to-cyan-700/20 p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-300">
          Manage Requests
        </p>

        <h1 className="mt-4 text-5xl font-black">
          {ride.origin} → {ride.destination}
        </h1>

        <p className="mt-4 text-gray-300">
          {new Date(ride.departure_time).toLocaleString()}
        </p>

        <p className="mt-3 font-bold text-blue-200">
          Seats remaining: {ride.seats}
        </p>
      </section>

      {requests.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <h2 className="text-2xl font-bold">
            No ride requests yet
          </h2>

          <p className="mt-2 text-gray-400">
            Student requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {requests.map((request) => {
            const profile = profiles[request.requester_id];
            const isUpdating = updatingId === request.id;

            return (
              <section
                key={request.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-black">
                      {profile?.full_name || "Student"}
                    </h2>

                    <p className="mt-2 text-blue-300">
                      {profile?.university || "University not provided"}
                    </p>

                    <p className="mt-1 text-gray-400">
                      {profile?.major || "Major not provided"}
                    </p>

                    <p className="mt-3 text-sm text-gray-500">
                      Requested on{" "}
                      {new Date(request.created_at).toLocaleString()}
                    </p>

                    <p className="mt-3 font-bold">
                      Status:{" "}
                      <span
                        className={`capitalize ${
                          request.status === "accepted"
                            ? "text-green-400"
                            : request.status === "rejected"
                              ? "text-red-400"
                              : "text-blue-300"
                        }`}
                      >
                        {request.status}
                      </span>
                    </p>
                  </div>

                  {request.status === "pending" && (
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => acceptRequest(request.id)}
                        disabled={isUpdating || ride.seats <= 0}
                        className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Check size={18} />
                        {isUpdating ? "Updating..." : "Accept"}
                      </button>

                      <button
                        onClick={() => rejectRequest(request.id)}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X size={18} />
                        {isUpdating ? "Updating..." : "Reject"}
                      </button>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}