import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:frontend/main.dart';
import 'package:frontend/providers/app_state.dart';

void main() {
  testWidgets('App smoke test renders navigation shell', (WidgetTester tester) async {
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AppState()),
        ],
        child: const ShikshaApp(),
      ),
    );

    // Verify bottom navigation items render
    expect(find.text('Elara Tutor'), findsOneWidget);
    expect(find.text('Roadmap'), findsOneWidget);
    expect(find.text('Assessments'), findsOneWidget);
  });
}
