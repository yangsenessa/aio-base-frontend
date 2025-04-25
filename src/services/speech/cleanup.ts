
/**
 * @deprecated Use useVoiceRecorder hook instead
 */
export const cleanupAudioResources = (): void => {
  console.warn('Using deprecated cleanupAudioResources - use useVoiceRecorder hook instead');
  // Nothing to clean up as react-media-recorder handles this internally
};
