package com.jarvis.assistant

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.jarvis.assistant.ui.screens.ConversationScreen
import com.jarvis.assistant.ui.screens.SettingsScreen

@Composable
fun App() {
    val navController: NavHostController = rememberNavController()

    Scaffold(
        topBar = {
            androidx.compose.material3.TopAppBar(
                title = { Text("Jarvis") },
                actions = {
                    IconButton(onClick = { navController.navigate("settings") }) {
                        Icon(
                            painter = painterResource(android.R.drawable.ic_menu_preferences),
                            contentDescription = "Settings"
                        )
                    }
                }
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = "conversation",
            modifier = Modifier.fillMaxSize()
        ) {
            composable("conversation") { ConversationScreen(padding) }
            composable("settings") { SettingsScreen(padding) }
        }
    }
}
