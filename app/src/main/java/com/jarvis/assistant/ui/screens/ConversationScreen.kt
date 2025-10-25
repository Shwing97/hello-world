package com.jarvis.assistant.ui.screens

import android.Manifest
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.rememberPermissionState
import com.jarvis.assistant.assistant.AssistantViewModel

@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun ConversationScreen(padding: PaddingValues, viewModel: AssistantViewModel = hiltViewModel()) {
    val transcript by viewModel.transcript.collectAsState()
    val assistant by viewModel.assistant.collectAsState()

    val micPermission = rememberPermissionState(Manifest.permission.RECORD_AUDIO)

    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(transcript.ifEmpty { "Say 'Hey Jarvis' or press the mic" })
        Spacer(Modifier.height(16.dp))
        Button(onClick = {
            if (micPermission.status.isGranted) {
                viewModel.startListening()
            } else {
                micPermission.launchPermissionRequest()
            }
        }) {
            Icon(painterResource(android.R.drawable.ic_btn_speak_now), contentDescription = "Speak")
            Spacer(Modifier.height(4.dp))
            Text("Speak")
        }
        Spacer(Modifier.height(24.dp))
        Text(assistant)
    }
}
