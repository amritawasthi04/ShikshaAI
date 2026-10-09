import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';

class AssessmentsScreen extends StatefulWidget {
  const AssessmentsScreen({super.key});

  @override
  State<AssessmentsScreen> createState() => _AssessmentsScreenState();
}

class _AssessmentsScreenState extends State<AssessmentsScreen> {
  final Map<String, TextEditingController> _answerControllers = {};

  void _submit(String assessmentId, List<dynamic> questions, AppState state) async {
    final answers = <String, dynamic>{};
    for (var q in questions) {
      final qid = q["id"] ?? q["question_id"] ?? "q1";
      answers[qid] = _answerControllers[qid]?.text.trim() ?? "";
    }

    final result = await state.submitAssessment(assessmentId, answers);
    if (!mounted) return;

    if (result != null) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text("Evaluation Result"),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Score: ${result['score']}%",
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
              ),
              const SizedBox(height: 12),
              Text("Feedback:\n${result['feedback'] ?? 'Good attempt!'}"),
              const SizedBox(height: 8),
              Text(
                "Status: ${result['grading_state'] ?? 'graded'}",
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text("Close"),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final assessments = state.assessments;

    return Scaffold(
      appBar: AppBar(
        title: const Text("Skill Assessments"),
      ),
      body: RefreshIndicator(
        onRefresh: () => state.loadAssessments(),
        child: assessments.isEmpty
            ? const Center(
                child: Text("No assessments currently available.", style: TextStyle(color: AppTheme.textMuted)),
              )
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: assessments.length,
                itemBuilder: (context, idx) {
                  final asm = assessments[idx];
                  final questions = asm["questions"] as List<dynamic>? ?? [];
                  final asmId = asm["assessment_id"];

                  return Card(
                    margin: const EdgeInsets.only(bottom: 16),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  asm["title"] ?? "Assessment",
                                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.blue.shade50,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  "${questions.length} Questions",
                                  style: TextStyle(fontSize: 11, color: Colors.blue.shade700, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          ...questions.map((q) {
                            final qid = q["id"] ?? q["question_id"] ?? "q1";
                            _answerControllers.putIfAbsent(qid, () => TextEditingController());
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 12.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    q["text"] ?? q["prompt"] ?? "Question prompt",
                                    style: const TextStyle(fontWeight: FontWeight.w600),
                                  ),
                                  const SizedBox(height: 6),
                                  TextField(
                                    controller: _answerControllers[qid],
                                    decoration: InputDecoration(
                                      hintText: "Enter your answer...",
                                      filled: true,
                                      fillColor: Colors.grey.shade50,
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(10),
                                        borderSide: BorderSide(color: Colors.grey.shade300),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                          const SizedBox(height: 8),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: state.isLoading ? null : () => _submit(asmId, questions, state),
                              child: const Text("Submit For Evaluation"),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      ),
    );
  }
}
