
/**
 * Main exports file for formatting utilities
 * @deprecated This file is kept for backward compatibility.
 * Please import directly from the specific utility files.
 */

// Re-export all necessary functions from the specific utility files
export * from './json/jsonParser';
export * from './json/jsonExtractor';
export * from './json/responseFormatter';
export * from './json/codeBlockExtractor';

// Re-export missing functions that are being referenced in components
export { removeJsonComments, formatJsonForCanister, formatProtocolMetadata, isAIOProtocolMessage } from './formatters.js';
export { extractResponseFromRawJson } from './json/responseFormatter';
