package com.jarvis.assistant.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jarvis.assistant.storage.SettingsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val settingsRepository: SettingsRepository
) : ViewModel() {

    suspend fun getOpenAiKey(): String? = withContext(Dispatchers.IO) {
        settingsRepository.openAiApiKeyFirst()
    }

    fun setOpenAiKey(key: String) {
        viewModelScope.launchDeprecatedIO {
            settingsRepository.setOpenAiApiKey(key)
        }
    }
}

private fun androidx.lifecycle.ViewModel.launchDeprecatedIO(block: suspend () -> Unit) {
    // Avoid bringing in extra coroutine scope helpers; this is a minimal helper
    this.viewModelScope.launch(kotlinx.coroutines.Dispatchers.IO) {
        block()
    }
}
