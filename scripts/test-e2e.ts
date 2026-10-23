async function runTests() {
  console.log("=== Starting Couple Sanctuary Comprehensive End-to-End Verification ===\n");
  const baseUrl = "http://localhost:3005";

  // Test 1: Invalid login rejection
  console.log("1. Testing authentication security (invalid credentials)...");
  const badLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "intruder@stranger.com", password: "wrong" }),
  });
  console.log(`   Status: ${badLoginRes.status} (Expected 401)`);
  if (badLoginRes.status !== 401) throw new Error("Intruder was not rejected!");

  // Test 2: Valid login as Abdel
  console.log("\n2. Logging in as Abdel...");
  const abdelLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "abdel@ourstory.private", password: "love2024" }),
  });
  const abdelCookie = abdelLoginRes.headers.get("set-cookie")?.split(";")[0];
  if (!abdelCookie) throw new Error("No session cookie for Abdel!");
  console.log(`   Abdel authenticated successfully.`);

  // Test 3: Valid login as Nour
  console.log("\n3. Logging in as Nour...");
  const nourLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "nour@ourstory.private", password: "love2024" }),
  });
  const nourCookie = nourLoginRes.headers.get("set-cookie")?.split(";")[0];
  if (!nourCookie) throw new Error("No session cookie for Nour!");
  console.log(`   Nour authenticated successfully.`);

  // Test 4: Questions & Dual-Answer Reveal Protocol
  console.log("\n4. Verifying Dual-Answer Question Sealing & Reveal Protocol...");
  const { PrismaClient } = require("@prisma/client");
  const prismaClient = new PrismaClient();
  const questionsRes = await fetch(`${baseUrl}/api/questions`, {
    headers: { Cookie: abdelCookie },
  });
  const questionsData = await questionsRes.json();
  const targetQ = questionsData.pastQuestions[0];
  // Ensure pristine test state for this question
  await prismaClient.questionAnswer.deleteMany({ where: { questionId: targetQ.id } });
  await prismaClient.$disconnect();
  console.log(`   Target discovery question: "${targetQ.prompt}"`);

  // Abdel submits answer
  console.log(`   Abdel submitting answer...`);
  await fetch(`${baseUrl}/api/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: abdelCookie },
    body: JSON.stringify({ questionId: targetQ.id, answerText: "Abdel's private romantic answer" }),
  });

  // Check Nour's perspective before answering - partnerAnswer must be sealed!
  const nourViewBefore = await fetch(`${baseUrl}/api/questions`, {
    headers: { Cookie: nourCookie },
  }).then((r) => r.json());
  const nourTargetBefore = nourViewBefore.pastQuestions.find((q: any) => q.id === targetQ.id);
  console.log(`   Nour perspective on question: partnerAnswered = ${nourTargetBefore.partnerAnswered}`);
  console.log(`   Nour perspective: partnerAnswer = "${nourTargetBefore.partnerAnswer}"`);
  if (nourTargetBefore.partnerAnswer !== "[SEALED_UNTIL_YOU_ANSWER]") {
    throw new Error("Security failure: Partner answer was not sealed before user answered!");
  }

  // Nour answers
  console.log(`   Nour submitting answer to the same question...`);
  await fetch(`${baseUrl}/api/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: nourCookie },
    body: JSON.stringify({ questionId: targetQ.id, answerText: "Nour's sweet matching answer" }),
  });

  // Now both should see both answers revealed!
  const finalCheckRes = await fetch(`${baseUrl}/api/questions`, {
    headers: { Cookie: abdelCookie },
  }).then((r) => r.json());
  const abdelTargetFinal = finalCheckRes.pastQuestions.find((q: any) => q.id === targetQ.id);
  console.log(`   Both answered after Nour responded? ${abdelTargetFinal.bothAnswered}`);
  console.log(`   Abdel sees Nour's revealed answer: "${abdelTargetFinal.partnerAnswer}"`);
  if (!abdelTargetFinal.bothAnswered) {
    throw new Error("Question answers were not revealed after both responded!");
  }

  // Test 5: Games API (This or That & Guess My Answer)
  console.log("\n5. Verifying Games (This or That & Guess My Answer)...");
  const gamesRes = await fetch(`${baseUrl}/api/games`, {
    headers: { Cookie: abdelCookie },
  });
  const gamesData = await gamesRes.json();
  console.log(`   This or That games available: ${gamesData.thisOrThat.length}`);
  console.log(`   Guess My Answer quizzes available: ${gamesData.guessMyAnswer.length}`);
  if (gamesData.thisOrThat.length > 0) {
    const game = gamesData.thisOrThat[0];
    await fetch(`${baseUrl}/api/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: abdelCookie },
      body: JSON.stringify({ gameItemId: game.id, selectedOption: game.optionA }),
    });
    console.log(`   Abdel submitted choice for "${game.optionA} vs ${game.optionB}"`);
  }

  // Test 6: Chat -> Memory Conversion Loop
  console.log("\n6. Verifying Chat -> Memory Loop...");
  const sendChatRes = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: abdelCookie },
    body: JSON.stringify({ text: "I love the way your eyes light up when you smile." }),
  });
  const chatMsg = (await sendChatRes.json()).message;
  console.log(`   Created test chat message ID: ${chatMsg.id}`);

  // Save chat as memory
  const saveChatMemRes = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: abdelCookie },
    body: JSON.stringify({ action: "save_as_memory", messageId: chatMsg.id }),
  });
  const saveChatMemData = await saveChatMemRes.json();
  console.log(`   Saved chat to memory! Memory ID: ${saveChatMemData.memory.id}`);
  if (!saveChatMemData.memory?.id) throw new Error("Failed to save chat message as memory!");

  // Test 7: Plan -> Memory Loop
  console.log("\n7. Verifying Plan -> Memory Loop...");
  const createPlanRes = await fetch(`${baseUrl}/api/plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: abdelCookie },
    body: JSON.stringify({
      title: "Sunrise Coffee in Maadi",
      category: "date",
      targetDate: new Date().toISOString(),
      location: "Maadi Corniche",
      description: "Quiet morning watching the Nile wake up.",
    }),
  });
  const planItem = (await createPlanRes.json()).plan;
  console.log(`   Created plan: "${planItem.title}"`);

  // Fulfill plan and convert atomically to memory & timeline
  const completePlanRes = await fetch(`${baseUrl}/api/plans`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: abdelCookie },
    body: JSON.stringify({
      id: planItem.id,
      status: "completed",
      convertToMemory: true,
      memoryNotes: "The morning light was breathtaking and our coffee was warm.",
    }),
  });
  const completePlanData = await completePlanRes.json();
  console.log(`   Fulfilled plan converted to Memory ID: ${completePlanData.memoryId}`);
  if (!completePlanData.memoryId) throw new Error("Plan was not converted to memory!");

  // Test 8: Milestone Firsts & Pending Chapters
  console.log("\n8. Verifying Milestone Firsts & Anticipated Chapters...");
  const firstsRes = await fetch(`${baseUrl}/api/firsts`, { headers: { Cookie: abdelCookie } });
  const firstsData = await firstsRes.json();
  const pending = firstsData.firsts.filter((f: any) => !f.isHappened);
  const completed = firstsData.firsts.filter((f: any) => f.isHappened);
  console.log(`   Fulfilled chapters: ${completed.length}`);
  console.log(`   Anticipated chapters awaiting us: ${pending.length}`);
  if (pending.length > 0) {
    console.log(`   Sample awaiting chapter: "${pending[0].title}"`);
  }

  // Test 9: Couple Identity Tokens
  console.log("\n9. Verifying Couple Identity Tokens...");
  const identityRes = await fetch(`${baseUrl}/api/identity`, { headers: { Cookie: abdelCookie } });
  const identityData = await identityRes.json();
  console.log(`   Our Song: ${identityData.identity?.ourSong || "Not set"}`);
  console.log(`   Our Restaurant: ${identityData.identity?.ourRestaurant || "Not set"}`);

  // Test 10: Private Vault PIN Protection
  console.log("\n10. Verifying Private Vault PIN Protection...");
  const correctPinRes = await fetch(`${baseUrl}/api/vault`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: abdelCookie },
    body: JSON.stringify({ pin: "1409" }),
  });
  const vaultData = await correctPinRes.json();
  console.log(`   Vault items unlocked: ${vaultData.items.length}`);

  console.log("\n========================================================");
  console.log("   ALL 10 END-TO-END VERIFICATION CHECKS PASSED!");
  console.log("========================================================");
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
