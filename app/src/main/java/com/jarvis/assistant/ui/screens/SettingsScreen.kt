package com.jarvis.assistant.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun SettingsScreen(padding: PaddingValues) {
    var apiKey by remember { mutableStateOf("") }

    Column(modifier = Modifier.padding(16.dp)) {
        Text("OpenAI API Key")
        OutlinedTextField(
            value = apiKey,
            onValueChange = { apiKey = it },
            placeholder = { Text("sk-...") },
            modifier = Modifier.fillMaxWidth()
        )
        Button(onClick = { /* TODO: save to DataStore */ }, modifier = Modifier.padding(top = 12.dp)) {
            Text("Save")
        }
    }
}
