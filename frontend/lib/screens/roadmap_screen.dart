import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';

class RoadmapScreen extends StatelessWidget {
  const RoadmapScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final roadmap = state.activeRoadmap;
    final milestones = roadmap?["milestones"] as List<dynamic>? ?? [];

    return Scaffold(
      appBar: AppBar(
        title: const Text("Learning Roadmap"),
      ),
      body: RefreshIndicator(
        onRefresh: () => state.loadActiveRoadmap(),
        child: milestones.isEmpty
            ? Center(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.route_outlined, size: 56, color: Colors.grey.shade400),
                      const SizedBox(height: 16),
                      const Text(
                        "No Active Roadmap Yet",
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        "Ask Elara in the chat to generate a personalized roadmap for your learning goals.",
                        textAlign: TextAlign.center,
                        style: TextStyle(color: AppTheme.textMuted),
                      ),
                    ],
                  ),
                ),
              )
            : ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Roadmap header card
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                "Version ${roadmap?['version'] ?? 1}",
                                style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.green.shade50,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  "ACTIVE",
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.green.shade700),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            "Milestones: ${milestones.length}",
                            style: const TextStyle(color: AppTheme.textMuted),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Milestones list
                  ...milestones.asMap().entries.map((entry) {
                    final idx = entry.key;
                    final m = entry.value;
                    final isCompleted = m["is_completed"] == true;

                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: isCompleted ? AppTheme.accentColor : AppTheme.primaryColor.withOpacity(0.1),
                          foregroundColor: isCompleted ? Colors.white : AppTheme.primaryColor,
                          child: Text("${idx + 1}"),
                        ),
                        title: Text(
                          m["title"] ?? "Milestone",
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            decoration: isCompleted ? TextDecoration.lineThrough : null,
                          ),
                        ),
                        subtitle: Text(m["description"] ?? ""),
                        trailing: isCompleted
                            ? const Icon(Icons.check_circle_rounded, color: AppTheme.accentColor)
                            : const Icon(Icons.chevron_right_rounded),
                      ),
                    );
                  }).toList(),
                ],
              ),
      ),
    );
  }
}
