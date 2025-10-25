# Jarvis-like Android AI Assistant

An Android assistant inspired by Jarvis from Iron Man. Built with Jetpack Compose, Hilt, DataStore, OkHttp, and a foreground service for always-on behavior.

## Features
- Compose UI: conversation screen with mic button, settings screen
- STT: Android `SpeechRecognizer` with partial/final transcripts
- TTS: `TextToSpeech` replies
- LLM: OpenAI Chat Completions via OkHttp
- Foreground service for persistent notification
- Tool framework with an example `open_app` tool

## Setup
1. Open the project in Android Studio Ladybug+.
2. Ensure JDK 17 and Android Gradle Plugin 8.6+.
3. Run the app on a device (mic permission required).

### OpenAI API Key
- In the app, navigate to Settings and paste your API key.
- The key is stored in `DataStore` preferences.

## Notes
- This is a starter foundation. Extend tools and the assistant orchestration to add capabilities like smart home control, reminders, and on-device wake word.
