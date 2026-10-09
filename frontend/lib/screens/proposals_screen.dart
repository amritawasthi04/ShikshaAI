import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';

class ProposalsScreen extends StatelessWidget {
  const ProposalsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final proposals = state.proposals;

    return Scaffold(
      appBar: AppBar(
        title: const Text("Roadmap Proposals"),
      ),
      body: RefreshIndicator(
        onRefresh: () => state.loadProposals(),
        child: proposals.isEmpty
            ? const Center(
                child: Text(
                  "No pending proposals.\nElara will propose adjustments as you progress.",
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppTheme.textMuted),
                ),
              )
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: proposals.length,
                itemBuilder: (context, idx) {
                  final prop = proposals[idx];
                  final status = prop["status"] ?? "proposed";
                  final isPending = status == "proposed";

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
                              Text(
                                "Proposal: ${prop['kind'] ?? 'Roadmap Change'}",
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: isPending ? Colors.amber.shade50 : Colors.grey.shade100,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  status.toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: isPending ? Colors.amber.shade800 : Colors.grey.shade700,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            "Base Version ${prop['base_version']} → Proposed Version ${prop['proposed_version']}",
                            style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            prop["rationale"] ?? "Pedagogical adjustment based on recent assessment outcomes.",
                            style: const TextStyle(color: AppTheme.textDark),
                          ),
                          if (isPending) ...[
                            const SizedBox(height: 16),
                            Row(
                              children: [
                                Expanded(
                                  child: OutlinedButton(
                                    onPressed: state.isLoading
                                        ? null
                                        : () => state.decideProposal(
                                              prop["proposal_id"],
                                              "reject",
                                              prop["base_version"],
                                            ),
                                    child: const Text("Decline"),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: ElevatedButton(
                                    onPressed: state.isLoading
                                        ? null
                                        : () => state.decideProposal(
                                              prop["proposal_id"],
                                              "accept",
                                              prop["base_version"],
                                            ),
                                    child: const Text("Accept Changes"),
                                  ),
                                ),
                              ],
                            ),
                          ],
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
