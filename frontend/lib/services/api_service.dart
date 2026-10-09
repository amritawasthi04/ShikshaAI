import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Use 10.0.2.2 for Android emulator or localhost for Web/Windows/desktop
  static String baseUrl = "http://127.0.0.1:8000/api/v1";
  static String authToken = "Bearer test-learner-amrit_shiksha";

  static Map<String, String> get _headers => {
        "Content-Type": "application/json",
        "Authorization": authToken,
      };

  // --- Profile & Preferences ---
  static Future<Map<String, dynamic>> getProfile() async {
    final res = await http.get(Uri.parse("$baseUrl/me"), headers: _headers);
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    throw Exception("Failed to load profile: ${res.statusCode}");
  }

  static Future<List<dynamic>> getGoals() async {
    final res = await http.get(Uri.parse("$baseUrl/goals"), headers: _headers);
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    return [];
  }

  static Future<Map<String, dynamic>> createGoal(String title, String domain) async {
    final res = await http.post(
      Uri.parse("$baseUrl/goals"),
      headers: _headers,
      body: jsonEncode({
        "title": title,
        "target_domain": domain,
        "target_mastery_level": "intermediate",
      }),
    );
    if (res.statusCode == 201) {
      return jsonDecode(res.body);
    }
    throw Exception("Failed to create goal: ${res.statusCode}");
  }

  // --- Chat & Teacher Brain (Elara) ---
  static Future<List<dynamic>> getConversations() async {
    final res = await http.get(Uri.parse("$baseUrl/conversations"), headers: _headers);
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    return [];
  }

  static Future<Map<String, dynamic>> createConversation([String? title]) async {
    final res = await http.post(
      Uri.parse("$baseUrl/conversations"),
      headers: _headers,
      body: jsonEncode({"title": title ?? "Session with Elara"}),
    );
    if (res.statusCode == 201) {
      return jsonDecode(res.body);
    }
    throw Exception("Failed to create conversation");
  }

  static Future<List<dynamic>> getMessages(String conversationId) async {
    final res = await http.get(
      Uri.parse("$baseUrl/conversations/$conversationId/messages"),
      headers: _headers,
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    return [];
  }

  static Future<Map<String, dynamic>> sendMessage(String conversationId, String content) async {
    final res = await http.post(
      Uri.parse("$baseUrl/conversations/$conversationId/messages"),
      headers: _headers,
      body: jsonEncode({"content": content, "role": "user"}),
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    throw Exception("Failed to send message: ${res.statusCode}");
  }

  // --- Roadmaps ---
  static Future<Map<String, dynamic>?> getActiveRoadmap() async {
    final res = await http.get(Uri.parse("$baseUrl/roadmaps/active"), headers: _headers);
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    return null;
  }

  // --- Assessments ---
  static Future<List<dynamic>> getAssessments() async {
    final res = await http.get(Uri.parse("$baseUrl/assessments"), headers: _headers);
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    return [];
  }

  static Future<Map<String, dynamic>> submitAttempt(String assessmentId, Map<String, dynamic> answers) async {
    final res = await http.post(
      Uri.parse("$baseUrl/assessments/$assessmentId/submit"),
      headers: _headers,
      body: jsonEncode({"answers": answers}),
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    throw Exception("Failed to submit assessment: ${res.statusCode}");
  }

  // --- Proposals ---
  static Future<List<dynamic>> getProposals() async {
    final res = await http.get(Uri.parse("$baseUrl/proposals"), headers: _headers);
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    return [];
  }

  static Future<Map<String, dynamic>> decideProposal(String proposalId, String decision, int baseVersion) async {
    final res = await http.post(
      Uri.parse("$baseUrl/proposals/$proposalId/decision"),
      headers: _headers,
      body: jsonEncode({
        "decision": decision,
        "expected_base_version": baseVersion,
      }),
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    throw Exception("Failed to submit proposal decision: ${res.statusCode}");
  }
}
