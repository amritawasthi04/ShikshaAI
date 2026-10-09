import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final profile = state.profile;
    final goals = state.goals;

    return Scaffold(
      appBar: AppBar(
        title: const Text("Learner Profile"),
      ),
      body: RefreshIndicator(
        onRefresh: () => state.loadProfile(),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // User card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: AppTheme.primaryColor.withOpacity(0.15),
                      child: const Icon(Icons.person, size: 36, color: AppTheme.primaryColor),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            profile?["display_name"] ?? "Learner",
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            "ID: ${profile?['learner_id'] ?? 'Loading...'}",
                            style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            "Timezone: ${profile?['timezone'] ?? 'UTC'}",
                            style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Active goals
            const Text(
              "Active Goals",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            if (goals.isEmpty)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text("No goals registered yet.", style: TextStyle(color: AppTheme.textMuted)),
                ),
              )
            else
              ...goals.map((g) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: const Icon(Icons.flag_rounded, color: AppTheme.primaryColor),
                    title: Text(g["title"] ?? "Goal", style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text("Domain: ${g['target_domain'] ?? 'General'} • Level: ${g['target_mastery_level'] ?? 'Intermediate'}"),
                  ),
                );
              }).toList(),

            const SizedBox(height: 20),

            // Preferences
            const Text(
              "Learning Preferences",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    _buildPrefRow("Language", profile?["preferred_language"]?.toUpperCase() ?? "EN"),
                    const Divider(),
                    _buildPrefRow("Availability", "10 hrs/week"),
                    const Divider(),
                    _buildPrefRow("Tutor Voice", "Enabled (Elara)"),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPrefRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppTheme.textMuted)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
