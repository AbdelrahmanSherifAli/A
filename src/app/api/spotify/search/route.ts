import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

interface SpotifyTrackResult {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  spotifyUrl: string;
  previewUrl: string | null;
  durationMs: number;
}

// Token cache for Spotify Web API client credentials
let cachedSpotifyToken: { token: string; expiresAt: number } | null = null;

async function getSpotifyToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  const now = Date.now();
  if (cachedSpotifyToken && cachedSpotifyToken.expiresAt > now + 60000) {
    return cachedSpotifyToken.token;
  }

  try {
    const creds = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${creds}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn("Spotify token request failed with status:", res.status);
      return null;
    }

    const data = await res.json();
    cachedSpotifyToken = {
      token: data.access_token,
      expiresAt: now + (data.expires_in || 3600) * 1000,
    };
    return data.access_token;
  } catch (err) {
    console.error("Failed to acquire Spotify token:", err);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json({ tracks: [] });
    }

    // 1. Direct Spotify link resolver using Spotify oEmbed
    if (query.includes("spotify.com/") || query.startsWith("spotify:")) {
      try {
        const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(query)}`;
        const oembedRes = await fetch(oembedUrl, { cache: "no-store" });
        if (oembedRes.ok) {
          const odata = await oembedRes.json();
          const parts = (odata.title || "").split(" - ");
          const title = parts[0] || odata.title || "Spotify Track";
          const artist = parts[1] || odata.author_name || "Unknown Artist";

          return NextResponse.json({
            tracks: [
              {
                id: "spotify-direct",
                title,
                artist,
                album: odata.title || "Spotify",
                coverUrl: odata.thumbnail_url || "/assets/song_album_cover.jpg",
                spotifyUrl: query.startsWith("spotify:")
                  ? `https://open.spotify.com/${query.replace("spotify:", "").replace(":", "/")}`
                  : query,
                previewUrl: null,
                durationMs: 0,
              },
            ],
            source: "spotify-oembed",
          });
        }
      } catch (err) {
        console.warn("Spotify oEmbed resolution failed:", err);
      }
    }

    // 2. Official Spotify Web API search (if Client ID & Secret are configured)
    const token = await getSpotifyToken();
    if (token) {
      try {
        const spotifySearchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query
        )}&type=track&limit=10`;
        const spotifyRes = await fetch(spotifySearchUrl, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (spotifyRes.ok) {
          const spotifyData = await spotifyRes.json();
          const tracks: SpotifyTrackResult[] = (spotifyData.tracks?.items || []).map(
            (track: any) => ({
              id: track.id,
              title: track.name,
              artist: track.artists.map((a: any) => a.name).join(", "),
              album: track.album?.name || "Single",
              coverUrl: track.album?.images?.[0]?.url || "/assets/song_album_cover.jpg",
              spotifyUrl: track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`,
              previewUrl: track.preview_url || null,
              durationMs: track.duration_ms || 0,
            })
          );

          return NextResponse.json({ tracks, source: "spotify-api" });
        }
      } catch (err) {
        console.warn("Spotify API search call failed, falling back to open search:", err);
      }
    }

    // 3. Smart open search fallback (iTunes Search API for real album covers + 30s audio previews + Spotify deep link)
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
      query
    )}&media=music&entity=song&limit=10`;
    const itunesRes = await fetch(itunesUrl, { cache: "no-store" });

    if (itunesRes.ok) {
      const itunesData = await itunesRes.json();
      const tracks: SpotifyTrackResult[] = (itunesData.results || []).map((song: any) => ({
        id: String(song.trackId),
        title: song.trackName,
        artist: song.artistName,
        album: song.collectionName || "Single",
        coverUrl: (song.artworkUrl100 || "").replace("100x100bb", "600x600bb") || "/assets/song_album_cover.jpg",
        spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(
          `${song.trackName} ${song.artistName}`
        )}`,
        previewUrl: song.previewUrl || null,
        durationMs: song.trackTimeMillis || 0,
      }));

      return NextResponse.json({ tracks, source: "open-search-fallback" });
    }

    return NextResponse.json({ tracks: [] });
  } catch (error) {
    console.error("Spotify Search GET error:", error);
    return NextResponse.json({ error: "Failed to search tracks" }, { status: 500 });
  }
}
