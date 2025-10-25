package com.jarvis.assistant.storage

import kotlinx.coroutines.flow.first

suspend fun SettingsRepository.openAiApiKeyFirst(): String? = openAiApiKey.first()
