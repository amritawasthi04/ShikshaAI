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
    final milestones = (roadmap?["milestones"] as List<dynamic>?) ?? [];
    final canonicalTopic = roadmap?["canonical_topic"] as String? ?? "Developer Curriculum";
    final canonicalRef = roadmap?["canonical_ref"] as String? ?? "https://roadmap.sh";
    final rationale = roadmap?["rationale"] as String? ?? "";

    final completedCount = milestones.where((m) => m["is_completed"] == true || m["status"] == "completed").length;
    final progressFraction = milestones.isNotEmpty ? completedCount / milestones.length : 0.0;

    // Group milestones by category
    final Map<String, List<Map<String, dynamic>>> grouped = {};
    for (final m in milestones) {
      final map = Map<String, dynamic>.from(m as Map);
      final cat = (map["category"] as String?) ?? "Core Milestones";
      grouped.putIfAbsent(cat, () => []).add(map);
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text("Authoritative Roadmap"),
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
                      Icon(Icons.alt_route_rounded, size: 64, color: Colors.grey.shade400),
                      const SizedBox(height: 16),
                      const Text(
                        "No Active Roadmap Yet",
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        "Ask Elara in the chat to compile a personalized curriculum backed by roadmap.sh.",
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
                  // Authoritative Backbone Header Card
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryColor.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Text(
                                  "roadmap.sh backbone",
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.primaryColor,
                                  ),
                                ),
                              ),
                              const Spacer(),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.green.shade50,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  "ACTIVE (v${roadmap?['version'] ?? roadmap?['active_version'] ?? 1})",
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.green.shade700,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            canonicalTopic,
                            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                          ),
                          if (rationale.isNotEmpty) ...[
                            const SizedBox(height: 6),
                            Text(
                              rationale,
                              style: const TextStyle(fontSize: 13, color: AppTheme.textMuted),
                            ),
                          ],
                          const SizedBox(height: 14),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                "Progress: $completedCount / ${milestones.length} nodes",
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                              ),
                              Text(
                                "${(progressFraction * 100).toInt()}%",
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: LinearProgressIndicator(
                              value: progressFraction,
                              minHeight: 8,
                              backgroundColor: Colors.grey.shade200,
                              valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.accentColor),
                            ),
                          ),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              Icon(Icons.link_rounded, size: 14, color: Colors.grey.shade600),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  canonicalRef,
                                  style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Categories and Hierarchical Nodes
                  ...grouped.entries.map((catEntry) {
                    final categoryTitle = catEntry.key;
                    final categoryNodes = catEntry.value;

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 4.0),
                          child: Row(
                            children: [
                              Container(
                                width: 4,
                                height: 18,
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryColor,
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                categoryTitle,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.textDark,
                                ),
                              ),

                              const SizedBox(width: 8),
                              Text(
                                "(${categoryNodes.length})",
                                style: const TextStyle(fontSize: 13, color: AppTheme.textMuted),
                              ),
                            ],
                          ),
                        ),
                        ...categoryNodes.map((node) {
                          final isCompleted = node["is_completed"] == true || node["status"] == "completed";
                          final isInProgress = node["status"] == "in_progress";
                          final prereqs = (node["prerequisites"] as List<dynamic>?) ?? [];
                          final estHours = node["estimated_hours"] ?? 2.0;

                          return Card(
                            margin: const EdgeInsets.only(bottom: 8),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(12),
                              onTap: () => _showNodeDetailsSheet(context, node, state),
                              child: Padding(
                                padding: const EdgeInsets.all(12.0),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    CircleAvatar(
                                      radius: 16,
                                      backgroundColor: isCompleted
                                          ? AppTheme.accentColor
                                          : isInProgress
                                              ? AppTheme.primaryColor
                                              : Colors.grey.shade200,
                                      foregroundColor: isCompleted || isInProgress ? Colors.white : Colors.grey.shade600,
                                      child: Icon(
                                        isCompleted
                                            ? Icons.check
                                            : isInProgress
                                                ? Icons.play_arrow_rounded
                                                : Icons.radio_button_unchecked,
                                        size: 18,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Expanded(
                                                child: Text(
                                                  node["title"] ?? "Node",
                                                  style: TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 15,
                                                    decoration: isCompleted ? TextDecoration.lineThrough : null,
                                                  ),
                                                ),
                                              ),
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                decoration: BoxDecoration(
                                                  color: Colors.grey.shade100,
                                                  borderRadius: BorderRadius.circular(6),
                                                ),
                                                child: Text(
                                                  "${estHours}h",
                                                  style: TextStyle(fontSize: 10, color: Colors.grey.shade700),
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            node["description"] ?? "",
                                            style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          if (prereqs.isNotEmpty) ...[
                                            const SizedBox(height: 6),
                                            Wrap(
                                              spacing: 4,
                                              children: prereqs.map<Widget>((p) {
                                                return Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                                  decoration: BoxDecoration(
                                                    color: Colors.blueGrey.shade50,
                                                    borderRadius: BorderRadius.circular(4),
                                                  ),
                                                  child: Text(
                                                    "prereq: ${p.toString().split(':').last}",
                                                    style: TextStyle(fontSize: 9, color: Colors.blueGrey.shade700),
                                                  ),
                                                );
                                              }).toList(),
                                            ),
                                          ],
                                        ],
                                      ),
                                    ),
                                    const Icon(Icons.chevron_right_rounded, color: AppTheme.textMuted),
                                  ],
                                ),
                              ),
                            ),
                          );
                        }),
                        const SizedBox(height: 12),
                      ],
                    );
                  }),
                ],
              ),
      ),
    );
  }

  void _showNodeDetailsSheet(BuildContext context, Map<String, dynamic> node, AppState state) {
    final title = node["title"] ?? "Concept Node";
    final desc = node["description"] ?? "";
    final category = node["category"] ?? "General";
    final nodeId = node["node_id"] ?? "";
    final externalRef = node["external_ref"] as String? ?? "https://roadmap.sh";
    final resources = (node["resources"] as List<dynamic>?) ?? [];
    final milestoneId = node["milestone_id"] ?? nodeId;
    final isCompleted = node["is_completed"] == true || node["status"] == "completed";

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(sheetContext).viewInsets.bottom + 24,
            top: 24,
            left: 20,
            right: 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      category,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () => Navigator.pop(sheetContext),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                title,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                "Canonical: $nodeId\nRef: $externalRef",
                style: const TextStyle(fontSize: 11, color: AppTheme.textMuted, fontFamily: "monospace"),
              ),

              const SizedBox(height: 12),
              Text(
                desc,
                style: const TextStyle(fontSize: 14, color: AppTheme.textDark, height: 1.4),
              ),
              const SizedBox(height: 16),
              if (resources.isNotEmpty) ...[
                const Text(
                  "Curated Documentation & Guides",
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                ...resources.map((r) {
                  final rTitle = r["title"] ?? "Documentation Resource";
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4.0),
                    child: Row(
                      children: [
                        const Icon(Icons.menu_book_rounded, size: 16, color: AppTheme.primaryColor),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            rTitle,
                            style: const TextStyle(fontSize: 13, color: AppTheme.primaryColor, decoration: TextDecoration.underline),
                          ),
                        ),
                      ],
                    ),
                  );
                }),
                const SizedBox(height: 16),
              ],
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () async {
                        Navigator.pop(sheetContext);
                        final lesson = await state.startMilestoneLesson(milestoneId);
                        if (context.mounted && lesson != null) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text("Grounded lesson compiled: ${lesson['title']}"),
                              backgroundColor: AppTheme.primaryColor,
                            ),
                          );
                        }
                      },
                      icon: const Icon(Icons.auto_stories_rounded),
                      label: const Text("Start Grounded Lesson"),
                    ),
                  ),
                  const SizedBox(width: 12),
                  OutlinedButton.icon(
                    onPressed: () async {
                      Navigator.pop(sheetContext);
                      await state.completeLesson("les_${milestoneId.toString().replaceAll(':', '_')}");
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(isCompleted ? "Marked not started" : "Marked completed"),
                          ),
                        );
                      }
                    },
                    icon: Icon(isCompleted ? Icons.undo_rounded : Icons.check_circle_rounded),
                    label: Text(isCompleted ? "Reset" : "Complete"),
                  ),
                ],
              ),

            ],
          ),
        );
      },
    );
  }
}
