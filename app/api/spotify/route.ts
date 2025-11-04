/**
 * API route handler for performing Spotify album searches.
 * 
 * This endpoint takes a `query` parameter from the URL, requests an access token
 * from Spotify using the Client Credentials flow, and searches for albums
 * matching that query using the Spotify Web API.
 */

import { NextResponse } from "next/server";
import SpotifyWebApi from "spotify-web-api-node";

/**
 * Initialize the Spotify Web API client using credentials stored in environment variables.
 * These credentials are provided by Spotify when you register your app.
 */
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID!,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
});

/**
 * Handles GET requests to the /api/spotify route.
 * Example: /api/spotify?query=radiohead
 */
export async function GET(request: Request) {
  // Parse query string from the request URL
  const { searchParams } = new URL(request.url);

  // Extract the 'query' parameter or set it to an empty string if not provided
  const searchQuery  = searchParams.get("query") || "";
  try {
    const tokenData = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(tokenData.body.access_token);
    
    /**
     * Spotify API to search for albums that match the user's query.
     * This returns metadata like album name, artist, release date, and artwork URLs.
     */
    const albumSearchResponse = await spotifyApi.searchAlbums(searchQuery);

    // Return the raw JSON body of Spotify’s search results to the frontend
    return NextResponse.json(albumSearchResponse.body);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
