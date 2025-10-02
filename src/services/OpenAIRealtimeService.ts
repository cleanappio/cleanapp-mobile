// file: openaiRealtime.ts
import {
  RTCPeerConnection,
  mediaDevices,
  MediaStream,
  RTCSessionDescription,
  RTCView,
} from 'react-native-webrtc';
import {Platform, PermissionsAndroid} from 'react-native';

type EphemeralSession = {
  session_id: string;
  client_secret: {value: string; expires_at?: string} | null;
  ice_servers?: Array<{
    urls: string | string[];
    username?: string;
    credential?: string;
  }>;
};

async function requestMicrophonePermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone permission',
        message: 'App needs access to your microphone for voice chat',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}

/**
 * Get ephemeral token from your backend using VoiceAssistantService
 */
async function getEphemeralSessionFromBackend(
  voiceAssistantService: any,
): Promise<EphemeralSession> {
  try {
    const session = await voiceAssistantService.createSession({
      model: 'gpt-4o-realtime-preview',
    });

    return {
      session_id: session.session_id,
      client_secret: session.client_secret,
      ice_servers: session.ice_servers,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to get ephemeral session: ${errorMessage}`);
  }
}

/**
 * Establish WebRTC connection to OpenAI Realtime using ephemeral token.
 */
export async function startOpenAIRealtime(voiceAssistantService: any): Promise<{
  pc: RTCPeerConnection;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}> {
  // 1) request mic permission
  const perm = await requestMicrophonePermission();
  if (!perm) throw new Error('microphone permission denied');

  // 2) get ephemeral session from our backend
  const sess = await getEphemeralSessionFromBackend(voiceAssistantService);
  const ephemeralKey = sess.client_secret?.value;
  if (!ephemeralKey) throw new Error('no ephemeral key returned');

  // 3) capture mic
  const localStream = await mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });

  // 4) RTCPeerConnection config
  const pc = new RTCPeerConnection({
    iceServers:
      sess.ice_servers && sess.ice_servers.length
        ? sess.ice_servers
        : [{urls: 'stun:stun.l.google.com:19302'}],
  });

  // Add local audio track(s)
  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });

  // 5) Optional: create a data channel to receive model events (partial transcripts etc)
  const dataChannel = pc.createDataChannel('oai-events');
  (dataChannel as any).onmessage = (ev: any) => {
    try {
      const msg = JSON.parse(ev.data);
      console.log('OpenAI data event:', msg);

      // Track audio events specifically
      if (msg.type === 'output_audio_buffer.started') {
        console.log('🔊 Audio playback started!');
      } else if (msg.type === 'output_audio_buffer.stopped') {
        console.log('🔇 Audio playback stopped!');
      } else if (msg.type === 'response.audio.done') {
        console.log('✅ Audio response completed!');
      }

      // show partial transcript or status in your UI
    } catch (e) {
      console.log('data message', ev.data);
    }
  };

  // 6) handle remote track (model TTS audio)
  let remoteStream: MediaStream | null = null;
  (pc as any).ontrack = (event: any) => {
    // event.streams[0] contains the remote audio stream
    remoteStream = event.streams[0];
    console.log('🎵 Received remote audio stream from OpenAI:', remoteStream);
    if (remoteStream) {
      console.log('🎵 Remote stream tracks:', remoteStream.getTracks());
    }

    // For React Native WebRTC, we need to handle the audio stream properly
    // The audio should auto-play, but let's ensure it's configured correctly
    if (remoteStream) {
      remoteStream.getTracks().forEach((track: any) => {
        console.log(
          '🎵 Remote track:',
          track.kind,
          track.enabled,
          track.readyState,
        );
        if (track.kind === 'audio') {
          // Ensure the audio track is enabled and ready
          track.enabled = true;
          console.log('🎵 Audio track enabled for playback');

          // Try to maximize audio volume/gain
          if (track.setVolume) {
            track.setVolume(1.0);
            console.log('🎵 Audio track volume set to maximum');
          }

          if (track.setGain) {
            track.setGain(1.0);
            console.log('🎵 Audio track gain set to maximum');
          }

          // Force the track to be active
          if (track.start) {
            track.start();
            console.log('🎵 Audio track started');
          }
        }
      });
    }

    // Store the remote stream for potential use in components
    // In a real app, you might want to pass this back to the hook
    console.log('🎵 Remote audio stream is ready for playback');
  };

  // ICE logging (very useful for debugging)
  (pc as any).onicecandidate = (event: any) => {
    if (event.candidate) {
      console.log('Local ICE candidate:', event.candidate.candidate);
      // For direct OpenAI flow you usually don't send candidates to server; SDPs contain candidates (Trickle ICE optional)
    }
  };

  // Connection state change handler
  (pc as any).onconnectionstatechange = () => {
    console.log('PC connection state:', pc.connectionState);
  };

  // 7) create offer
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  // 8) POST offer.sdp to OpenAI Realtime endpoint using ephemeral key
  // NOTE: confirm the exact endpoint and query param in OpenAI docs: either POST to
  // "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview" or "/v1/realtime" — check your OpenAI docs version.
  const OPENAI_RTC_ENDPOINT =
    'https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview';

  const resp = await fetch(OPENAI_RTC_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ephemeralKey}`,
      'Content-Type': 'application/sdp', // OpenAI expects raw SDP body
    },
    body: offer.sdp, // send SDP offer text as body
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error('OpenAI SDP exchange failed:', resp.status, text);
    throw new Error('OpenAI SDP exchange failed: ' + resp.status);
  }

  const answerSdp = await resp.text(); // response may be raw SDP; adjust if API returns JSON
  console.log('📡 Received SDP answer from OpenAI');
  await pc.setRemoteDescription({type: 'answer', sdp: answerSdp});
  console.log('✅ SDP exchange completed successfully');

  // connection established; audio will flow once ICE completes
  return {pc, localStream, remoteStream};
}
