# MyChess

## Current State
The Notation Viewer page lets users paste PGN text, navigate moves on a chess board, and save games. There is no way to upload a photo.

## Requested Changes (Diff)

### Add
- Photo upload section on the Notation Viewer page: a dropzone/upload button that accepts image files (JPG, PNG, WEBP)
- Uploaded photo is displayed in a resizable panel next to (or above) the PGN textarea so users can read the scoresheet while typing
- "Clear photo" button to remove the uploaded image
- Visual label/hint: "Upload a photo of your scoresheet to transcribe it"

### Modify
- NotationViewerPage: add photo upload state, image preview panel, and wire up the dropzone

### Remove
- Nothing removed

## Implementation Plan
1. Add image upload state (dataURL) in NotationViewerPage
2. Add a dropzone/file input UI below the page heading, before the main grid
3. When an image is uploaded, show it in a scrollable/zoomable panel (simple img tag with overflow scroll + zoom controls)
4. Add a "Clear" button to dismiss the photo
5. Keep existing PGN workflow unchanged; photo is purely a visual aid
