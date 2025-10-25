package com.jarvis.assistant.storage

import android.content.Context
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "jarvis_settings")

class SettingsRepository(private val context: Context) {

    private object Keys {
        val OPENAI_API_KEY: Preferences.Key<String> = stringPreferencesKey("openai_api_key")
    }

    val openAiApiKey: Flow<String?> = context.dataStore.data.map { it[Keys.OPENAI_API_KEY] }

    suspend fun setOpenAiApiKey(key: String) {
        context.dataStore.edit { prefs ->
            prefs[Keys.OPENAI_API_KEY] = key
        }
    }
}
