
// Main speech service exports - aggregate all speech-related functionality

// Re-export all functions from the individual files
export { 
  startVoiceRecording,
  setupMediaRecorder,
  isVoiceRecordingActive,
  getAudioUrl,
  hasAudioData,
  cleanupAudioResources
} from './speech/audioRecording';

export {
  storeAudioForMessage,
  getMessageAudioUrl,
  hasMessageAudio,
  removeAudioForMessage,
  clearAllAudioData
} from './speech/audioStorage';

export {
  isVoiceRecordingSupported,
  requestMicrophonePermission
} from './speech/browserSupport';

export {
  stopVoiceRecording
} from './speech/speechProcessing';
