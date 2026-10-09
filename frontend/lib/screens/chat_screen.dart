import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:provider/provider.dart';
import '../providers/app_state.dart';
import '../theme/app_theme.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _send(AppState state) {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    _controller.clear();
    state.sendMessageToElara(text).then((_) => _scrollToBottom());
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 10,
              height: 10,
              decoration: const BoxDecoration(
                color: AppTheme.accentColor,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 8),
            const Text("Elara — Teacher Brain"),
          ],
        ),
      ),
      body: Column(
        children: [
          // Quick suggestion chips
          Container(
            height: 48,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _buildQuickChip("Explain dynamic programming", state),
                _buildQuickChip("Create curriculum for Algorithms", state),
                _buildQuickChip("Quiz me on binary search", state),
              ],
            ),
          ),
          const Divider(height: 1),

          // Messages list
          Expanded(
            child: state.messages.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.auto_awesome, size: 48, color: AppTheme.primaryColor.withOpacity(0.5)),
                        const SizedBox(height: 12),
                        const Text(
                          "Ask Elara anything to begin your learning journey.",
                          style: TextStyle(color: AppTheme.textMuted),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: state.messages.length,
                    itemBuilder: (context, index) {
                      final msg = state.messages[index];
                      final isUser = msg["role"] == "user";
                      return _buildMessageBubble(msg, isUser);
                    },
                  ),
          ),

          if (state.isSendingMessage)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
                  SizedBox(width: 8),
                  Text("Elara is thinking and retrieving context...", style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                ],
              ),
            ),

          // Input bar
          SafeArea(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      decoration: const InputDecoration(
                        hintText: "Ask a question or request a lesson...",
                        border: InputBorder.none,
                      ),
                      onSubmitted: (_) => _send(state),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.send_rounded, color: AppTheme.primaryColor),
                    onPressed: state.isSendingMessage ? null : () => _send(state),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickChip(String label, AppState state) {
    return Padding(
      padding: const EdgeInsets.only(right: 8, top: 8, bottom: 8),
      child: ActionChip(
        label: Text(label, style: const TextStyle(fontSize: 12)),
        onPressed: () {
          _controller.text = label;
          _send(state);
        },
      ),
    );
  }

  Widget _buildMessageBubble(Map<String, dynamic> msg, bool isUser) {
    final citations = msg["citations"] as List<dynamic>? ?? [];

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isUser ? AppTheme.primaryColor : Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!isUser) ...[
              Row(
                mainAxisSize: MainAxisSize.min,
                children: const [
                  Icon(Icons.school_rounded, size: 14, color: AppTheme.primaryColor),
                  SizedBox(width: 4),
                  Text("Elara", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.primaryColor)),
                ],
              ),
              const SizedBox(height: 6),
            ],
            MarkdownBody(
              data: msg["content"] ?? "",
              styleSheet: MarkdownStyleSheet(
                p: TextStyle(color: isUser ? Colors.white : AppTheme.textDark, height: 1.4),
                code: TextStyle(
                  backgroundColor: isUser ? Colors.indigo.shade700 : Colors.grey.shade100,
                  color: isUser ? Colors.white : Colors.indigo.shade900,
                ),
              ),
            ),
            if (citations.isNotEmpty) ...[
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: citations.map((c) {
                  return Chip(
                    visualDensity: VisualDensity.compact,
                    backgroundColor: Colors.indigo.shade50,
                    label: Text(
                      "Source: ${c['source_title'] ?? 'Verified Passage'}",
                      style: TextStyle(fontSize: 10, color: Colors.indigo.shade800),
                    ),
                  );
                }).toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
