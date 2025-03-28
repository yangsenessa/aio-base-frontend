
/**
 * Audio recording functionality - Main exports
 * This file re-exports functions from specialized modules
 */

// Export core recorder state functions
export {
  isVoiceRecordingActive,
  getAudioUrl,
  hasAudioData
} from './recorderState';

// Export recorder setup functions
export {
  setupMediaRecorder
} from './recorderSetup';

// Export recorder operations
export {
  startVoiceRecording,
  stopRecording
} from './recorderOperations';

// Export audio processing functions
export {
  processAudioData
} from './audioProcessor';

// Export cleanup functions
export {
  cleanupAudioResources
} from './cleanup';
