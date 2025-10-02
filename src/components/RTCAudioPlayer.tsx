import React, {useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import InCallManager from 'react-native-incall-manager';
import {RTCView} from 'react-native-webrtc';

interface RTCAudioPlayerProps {
  stream: any | null;
  style?: any;
}

const RTCAudioPlayer: React.FC<RTCAudioPlayerProps> = ({stream, style}) => {
  useEffect(() => {
    if (stream) {
      console.log('🔊 Configuring audio stream for optimal playback...');

      // Force speakerphone/loudspeaker route
      try {
        InCallManager.start({media: 'audio'});
        InCallManager.setForceSpeakerphoneOn(true);
        InCallManager.setSpeakerphoneOn(true);
        console.log('🔊 Speakerphone forced ON');
      } catch (e) {
        console.log('⚠️ Failed to enable speakerphone', e);
      }

      // Ensure all audio tracks are properly configured
      stream.getTracks().forEach((track: any) => {
        if (track.kind === 'audio') {
          console.log('🔊 Audio track found:', track.enabled, track.readyState);

          // Ensure the track is enabled
          track.enabled = true;

          // Try to set volume/gain if available
          if (track.setVolume) {
            track.setVolume(1.0);
            console.log('🔊 Audio track volume set to maximum');
          }

          // Try to set gain if available
          if (track.setGain) {
            track.setGain(1.0);
            console.log('🔊 Audio track gain set to maximum');
          }
        }
      });
    }

    return () => {
      // Restore audio route on cleanup
      try {
        InCallManager.setForceSpeakerphoneOn(false);
        InCallManager.setSpeakerphoneOn(false);
        InCallManager.stop();
        console.log('🔇 Speakerphone OFF');
      } catch {}
    };
  }, [stream]);

  if (!stream) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <RTCView
        streamURL={stream.toURL()}
        style={styles.audioPlayer}
        mirror={false}
        objectFit="cover"
        // Additional props to ensure proper audio playback
        zOrder={0}
        renderToHardwareTextureAndroid={true}
        onLayout={() => {
          console.log('🔊 RTCView audio player is ready');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    position: 'absolute',
    top: -1000, // Hide the view off-screen
    left: -1000,
    opacity: 0, // Make it invisible but still functional
  },
  audioPlayer: {
    width: 100,
    height: 100,
  },
});

export default RTCAudioPlayer;
