# Anime Character Face Animator

This tool allows you to upload an anime/cartoon character face image and manipulate its expressions and lip-sync capabilities.

## Features

- Upload anime/cartoon character face images
- Change facial expressions:
  - Happy
  - Sad
  - Angry
  - Surprised
  - Neutral
- Basic lip-sync animation for text input

## Setup

1. Install the required dependencies:

   ```bash
   npm install
   ```

2. Download the required face-api.js models:
   ```bash
   ./setup.sh
   ```

## Usage

1. Upload an anime or cartoon character face image using the drag-and-drop interface or by clicking the upload area.
2. Once the image is uploaded, you can:
   - Click on different expression buttons to change the character's expression
   - Enter text in the input field and click "Speak" to animate the character's mouth in a lip-sync motion

## Technical Details

The tool uses:

- face-api.js for face detection and landmark recognition
- Canvas API for face manipulation and animation
- React Dropzone for image upload handling

## Limitations

- Works best with front-facing character faces
- Facial expression changes are basic manipulations of mouth and eye areas
- Lip-sync animation is simplified and may not perfectly match speech patterns
- Some anime/cartoon art styles may not be detected properly by the face detection model

## Future Improvements

- More sophisticated facial expression manipulations
- Better lip-sync animation with phoneme matching
- Support for multiple face styles
- Real-time voice input for lip-sync
- Expression transition animations
