// app/api/spotify/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session || !session.provider_token) {
      throw new Error('User is not authenticated with Spotify')
    }

    const token = session.provider_token;

    // CORRECTED URL for recently played tracks
    const historyResponse = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=20', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!historyResponse.ok) {
        const errorBody = await historyResponse.text();
        console.error("Spotify History API Error:", errorBody);
        throw new Error('Failed to fetch Spotify history');
    }
    const historyData = await historyResponse.json();

    if (!historyData.items || historyData.items.length === 0) {
      return NextResponse.json({ mood: 'N/A - Play some music!' });
    }

    const trackIds = historyData.items.map((item: any) => item.track.id).join(',');
    // CORRECTED URL for audio features
    const featuresResponse = await fetch(`https://api.spotify.com/v1/audio-features?ids=${trackIds}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!featuresResponse.ok) throw new Error('Failed to fetch audio features');
    const featuresData = await featuresResponse.json();
    
    let totalValence = 0;
    let featureCount = 0;
    featuresData.audio_features.forEach((feature: any) => {
      if (feature) {
        totalValence += feature.valence;
        featureCount++;
      }
    });
    
    if (featureCount === 0) {
       return NextResponse.json({ mood: 'N/A - Analysis failed' });
    }
      
    const avgValence = totalValence / featureCount;

    let mood = 'Neutral';
    if (avgValence > 0.6) mood = 'Upbeat';
    else if (avgValence < 0.4) mood = 'Chill';
    
    return NextResponse.json({ mood });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}