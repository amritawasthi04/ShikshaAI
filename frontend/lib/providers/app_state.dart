import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class AppState extends ChangeNotifier {
  bool isLoading = false;
  String? errorMessage;

  Map<String, dynamic>? profile;
  List<dynamic> goals = [];
  Map<String, dynamic>? activeRoadmap;
  List<dynamic> assessments = [];
  List<dynamic> proposals = [];

  // Chat State
  String? currentConversationId;
  List<dynamic> messages = [];
  bool isSendingMessage = false;

  Future<void> init() async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      await Future.wait([
        loadProfile(),
        loadGoals(),
        loadActiveRoadmap(),
        loadAssessments(),
        loadProposals(),
        loadConversations(),
      ]);
    } catch (e) {
      errorMessage = e.toString();
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadProfile() async {
    try {
      profile = await ApiService.getProfile();
      notifyListeners();
    } catch (e) {
      debugPrint("Profile load error: $e");
    }
  }

  Future<void> loadGoals() async {
    try {
      goals = await ApiService.getGoals();
      notifyListeners();
    } catch (e) {
      debugPrint("Goals load error: $e");
    }
  }

  Future<void> loadActiveRoadmap() async {
    try {
      activeRoadmap = await ApiService.getActiveRoadmap();
      notifyListeners();
    } catch (e) {
      debugPrint("Roadmap load error: $e");
    }
  }

  Future<void> loadAssessments() async {
    try {
      assessments = await ApiService.getAssessments();
      notifyListeners();
    } catch (e) {
      debugPrint("Assessments load error: $e");
    }
  }

  Future<void> loadProposals() async {
    try {
      proposals = await ApiService.getProposals();
      notifyListeners();
    } catch (e) {
      debugPrint("Proposals load error: $e");
    }
  }

  Future<void> loadConversations() async {
    try {
      final convos = await ApiService.getConversations();
      if (convos.isNotEmpty) {
        currentConversationId = convos.first["conversation_id"];
        await loadMessages();
      } else {
        // Create initial conversation
        final newConvo = await ApiService.createConversation("Learning Session with Elara");
        currentConversationId = newConvo["conversation_id"];
        await loadMessages();
      }
    } catch (e) {
      debugPrint("Convo error: $e");
    }
  }

  Future<void> loadMessages() async {
    if (currentConversationId == null) return;
    try {
      messages = await ApiService.getMessages(currentConversationId!);
      notifyListeners();
    } catch (e) {
      debugPrint("Messages load error: $e");
    }
  }

  Future<void> sendMessageToElara(String text) async {
    if (currentConversationId == null || text.trim().isEmpty) return;

    isSendingMessage = true;
    notifyListeners();

    try {
      final response = await ApiService.sendMessage(currentConversationId!, text.trim());
      await loadMessages();
      // If a task plan created proposals or altered roadmap, reload them
      if (response["task_plan"] != null) {
        await loadProposals();
        await loadActiveRoadmap();
      }
    } catch (e) {
      errorMessage = "Message failed: $e";
    } finally {
      isSendingMessage = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>?> submitAssessment(String assessmentId, Map<String, dynamic> answers) async {
    isLoading = true;
    notifyListeners();
    try {
      final result = await ApiService.submitAttempt(assessmentId, answers);
      await loadProfile();
      await loadActiveRoadmap();
      return result;
    } catch (e) {
      errorMessage = "Assessment submission failed: $e";
      return null;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> decideProposal(String proposalId, String decision, int baseVersion) async {
    isLoading = true;
    notifyListeners();
    try {
      await ApiService.decideProposal(proposalId, decision, baseVersion);
      await loadProposals();
      await loadActiveRoadmap();
    } catch (e) {
      errorMessage = "Proposal decision failed: $e";
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}
