import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding couple database with new relationship experience...");

  // Clean existing data
  await prisma.gameAnswer.deleteMany();
  await prisma.gameItem.deleteMany();
  await prisma.questionAnswer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.planItem.deleteMany();
  await prisma.weeklyJournalEntry.deleteMany();
  await prisma.coupleIdentity.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.vaultItem.deleteMany();
  await prisma.reasonILoveYou.deleteMany();
  await prisma.insideJoke.deleteMany();
  await prisma.futureMessage.deleteMany();
  await prisma.coupleGoal.deleteMany();
  await prisma.bucketListItem.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.importantDate.deleteMany();
  await prisma.firstTimeMoment.deleteMany();
  await prisma.place.deleteMany();
  await prisma.song.deleteMany();
  await prisma.openWhenEnvelope.deleteMany();
  await prisma.letter.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.memory.deleteMany();
  await prisma.coupleSettings.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash("love2024", salt);
  const vaultPinHash = await bcrypt.hash("1409", salt);

  // 1. Two Authorized Accounts (Abdel & Nour)
  const abdel = await prisma.user.create({
    data: {
      email: "abdel@ourstory.private",
      name: "Abdel",
      nickname: "My Love",
      passwordHash: defaultPasswordHash,
      role: "partner1",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      birthday: new Date("1998-05-12"),
      favoriteThings: "Espresso, nighttime highway drives, seeing her smile, cozy autumn evenings.",
    },
  });

  const nour = await prisma.user.create({
    data: {
      email: "nour@ourstory.private",
      name: "Nour",
      nickname: "My Soul",
      passwordHash: defaultPasswordHash,
      role: "partner2",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
      birthday: new Date("2000-11-20"),
      favoriteThings: "Matcha lattes, ocean sunsets, capturing candid photos, soft ambient lights, romantic poetry.",
    },
  });

  // 2. Couple Settings & Shared Identity
  await prisma.coupleSettings.create({
    data: {
      id: "couple-singleton",
      partner1Name: "Abdel",
      partner2Name: "Nour",
      anniversaryDate: new Date("2026-09-05T00:00:00Z"),
      relationshipQuote: "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.",
      vaultPinHash: vaultPinHash,
      coverPhotoUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1600&auto=format&fit=crop&q=80",
    },
  });

  await prisma.coupleIdentity.create({
    data: {
      id: "identity-singleton",
      ourSong: "Until I Found You — Stephen Sanchez",
      ourNickname: "My Soul & My Love",
      ourRestaurant: "The Shoreline Bistro in Alexandria",
      ourEmoji: "❤️✨☕",
      ourFavoriteMovie: "About Time",
      ourCozyPlace: "The quiet corner table by the window",
      ourCoffeeOrder: "One flat white with oat milk, one double espresso",
    },
  });

  // 3. Discovery Questions (Today's Question + Archive)
  const q1 = await prisma.question.create({
    data: {
      prompt: "What is something you really want us to experience together for the first time?",
      category: "relationship",
      isToday: true,
    },
  });

  // Seed partner answers for today's question
  await prisma.questionAnswer.createMany({
    data: [
      {
        questionId: q1.id,
        userId: abdel.id,
        answerText: "Taking an overnight sleeper train through the mountains, watching the sunrise from our cabin window with hot coffee.",
      },
      {
        questionId: q1.id,
        userId: nour.id,
        answerText: "Setting up a campfire on the Mediterranean shore at midnight and listening to our playlist under the stars.",
      },
    ],
  });

  await prisma.question.createMany({
    data: [
      {
        prompt: "What is a small, ordinary moment with me that secretly made your whole day better?",
        category: "relationship",
        isToday: false,
      },
      {
        prompt: "What is one dream you want your life to look like five years from now?",
        category: "deep",
        isToday: false,
      },
      {
        prompt: "What is your ultimate comfort food after an exhausting week?",
        category: "light",
        isToday: false,
      },
      {
        prompt: "What is something you find completely endearing about the way we talk?",
        category: "relationship",
        isToday: false,
      },
    ],
  });

  // 4. Interactive Games: This or That & Guess My Answer
  const gameBeach = await prisma.gameItem.create({
    data: {
      type: "this_or_that",
      prompt: "Ideal vacation vibe",
      optionA: "Beach & Coastline 🏖️",
      optionB: "Mountains & Mist 🏔️",
      category: "travel",
    },
  });

  await prisma.gameAnswer.createMany({
    data: [
      {
        gameItemId: gameBeach.id,
        userId: abdel.id,
        selectedOption: "Beach & Coastline 🏖️",
      },
      {
        gameItemId: gameBeach.id,
        userId: nour.id,
        selectedOption: "Beach & Coastline 🏖️",
      },
    ],
  });

  const gameCoffee = await prisma.gameItem.create({
    data: {
      type: "this_or_that",
      prompt: "Morning ritual",
      optionA: "Artisan Coffee ☕",
      optionB: "Ceremonial Tea 🍵",
      category: "lifestyle",
    },
  });

  await prisma.gameAnswer.createMany({
    data: [
      {
        gameItemId: gameCoffee.id,
        userId: abdel.id,
        selectedOption: "Artisan Coffee ☕",
      },
      {
        gameItemId: gameCoffee.id,
        userId: nour.id,
        selectedOption: "Ceremonial Tea 🍵",
      },
    ],
  });

  await prisma.gameItem.createMany({
    data: [
      {
        type: "this_or_that",
        prompt: "Evening mood",
        optionA: "Stay cozy at home 🛋️",
        optionB: "Wander the city lights 🌆",
        category: "lifestyle",
      },
      {
        type: "this_or_that",
        prompt: "Weekend entertainment",
        optionA: "Binge-watch a series 📺",
        optionB: "Watch a cinematic movie 🎬",
        category: "entertainment",
      },
      {
        type: "guess_my_answer",
        prompt: "What would Nour pick as her dream road trip snack?",
        options: JSON.stringify(["Dark Chocolate Pretzels", "Sour Berry Gummies", "Salted Pistachios", "Croissants"]),
        category: "food",
      },
    ],
  });

  // 5. Active Near-Term Plans
  await prisma.planItem.createMany({
    data: [
      {
        title: "Sunset dinner at the Citadel Overlook",
        description: "Reserved a terrace table for golden hour. Bringing our film camera.",
        category: "date",
        targetDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
        location: "Citadel of Qaitbay, Alexandria",
        status: "planned",
        createdById: abdel.id,
      },
      {
        title: "Bake fresh lemon drizzle cake together",
        description: "Making everything from scratch on a quiet Saturday afternoon.",
        category: "creative",
        targetDate: new Date(Date.now() + 86400000 * 6),
        location: "Our Kitchen",
        status: "planned",
        createdById: nour.id,
      },
    ],
  });

  // 6. Milestone Firsts (Including intentionally uncompleted "Not yet... ❤️" milestones!)
  await prisma.firstTimeMoment.createMany({
    data: [
      {
        category: "First Time We Met",
        title: "A Tuesday Afternoon in Zamalek",
        momentDate: new Date("2024-09-14"),
        description: "We sat outside with iced lattes. What was supposed to be a quick chat stretched into four hours of non-stop laughing.",
        photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
        isHappened: true,
      },
      {
        category: "First 'I Love You'",
        title: "Under the Soft Streetlights",
        momentDate: new Date("2024-11-05"),
        description: "It slipped out naturally right before saying goodbye at the car door. We both smiled uncontrollably.",
        photoUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80",
        isHappened: true,
      },
      {
        category: "First Travel Adventure",
        title: "The Sinai Mountain Road Expedition",
        momentDate: new Date("2025-02-18"),
        description: "Packing the car with snacks, three playlists, and driving straight toward the Red Sea coast.",
        photoUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80",
        isHappened: true,
      },
      {
        category: "First Cooking Disaster Together",
        title: "The Indestructible Artisan Bread",
        momentDate: new Date("2024-12-08"),
        description: "Flour all over our clothes, laughing until our stomachs hurt because the crust came out hard as granite.",
        isHappened: true,
      },
      {
        category: "First International Flight Together",
        title: "Boarding a Plane to a New Country",
        description: "Sitting side-by-side as the plane takes off toward new horizons.",
        isHappened: false, // Intentional "Not yet... ❤️" milestone!
      },
      {
        category: "First Home Key",
        title: "Unlocking Our Own Front Door",
        description: "Turning the key to our very first shared home.",
        isHappened: false, // Intentional "Not yet... ❤️" milestone!
      },
    ],
  });

  // 7. Starter Memories
  const mem1 = await prisma.memory.create({
    data: {
      title: "The Magic of Alexandria by the Sea",
      description: "We walked down the Corniche as the Mediterranean breeze cooled the evening. We ate gelato, laughed about how lost we got earlier, and watched the twilight fade into gold over the water.",
      memoryDate: new Date("2025-09-14T19:00:00Z"),
      timeOfDay: "Sunset",
      location: "Alexandria, Egypt",
      mood: "romantic",
      tags: "anniversary, alexandria, sunset, ocean",
      authorId: abdel.id,
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
      ]),
      songTitle: "Yellow",
      songArtist: "Coldplay",
      isFavorite: true,
    },
  });

  // 8. Timeline Events
  await prisma.timelineEvent.createMany({
    data: [
      {
        year: 2024,
        title: "The First Time We Met",
        description: "That quiet coffee house on a Tuesday afternoon. One look and conversations that wouldn't stop.",
        eventDate: new Date("2024-09-14T15:00:00Z"),
        category: "milestone",
        location: "Zamalek, Cairo",
        authorId: abdel.id,
        photos: JSON.stringify(["https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80"]),
      },
      {
        year: 2025,
        title: "First Anniversary by the Sea",
        description: "Exactly 365 days together celebrated looking out at the endless horizon in Alexandria.",
        eventDate: new Date("2025-09-14T18:00:00Z"),
        category: "milestone",
        location: "Alexandria",
        authorId: nour.id,
        memoryId: mem1.id,
      },
      {
        year: 2026,
        title: "Building Our Private Space",
        description: "Opening this sanctuary together so our story grows with every conversation.",
        eventDate: new Date("2026-09-14T12:00:00Z"),
        category: "milestone",
        location: "Everywhere With You",
        authorId: abdel.id,
      },
    ],
  });

  // 9. Open When Envelopes & Letters
  await prisma.openWhenEnvelope.createMany({
    data: [
      {
        title: "Open When You're Sad",
        prompt: "For when the world feels heavy and you need a warm embrace.",
        content: "Take a slow, deep breath, my love. Close your eyes and remember that whatever is weighing on your heart right now is only temporary, but my love for you is permanent. Call me, hold my hand, and let me remind you of all the light you bring to this world.",
        waxColor: "gold",
        sealSymbol: "heart",
        isLocked: false,
      },
      {
        title: "Open When You Miss Me",
        prompt: "For when distance or a busy day keeps us physically apart.",
        content: "Even when miles or hours stand between us, look up at the sky. We are living under the same sky, breathing the same air, and my thoughts are orbiting around you every single minute.",
        waxColor: "bronze",
        sealSymbol: "compass",
        isLocked: false,
      },
      {
        title: "Locked Until September 14, 2027",
        prompt: "A sealed letter preserved for our 3rd anniversary milestone.",
        content: "Three whole years! Look at the photo wall, look at our places visited, and look at each other. Happy 3rd Anniversary, my greatest adventure.",
        waxColor: "gold",
        sealSymbol: "star",
        unlockDate: new Date("2027-09-14T00:00:00Z"),
        isLocked: true,
      },
    ],
  });

  // 10. Bucket List & Goals
  await prisma.bucketListItem.createMany({
    data: [
      {
        title: "Watch the sunrise together from a quiet mountaintop",
        description: "Bring hot tea in thermoses and warm woolen blankets.",
        category: "adventure",
        isCompleted: false,
      },
      {
        title: "Take a Polaroid photo on every anniversary",
        description: "Keep a physical leather album that grows with each passing year.",
        category: "tradition",
        isCompleted: true,
        completedAt: new Date("2025-09-14"),
      },
      {
        title: "Cook handmade artisan gnocchi from scratch",
        description: "Turn on our Italian jazz playlist and make pasta dough together.",
        category: "cozy",
        isCompleted: false,
      },
    ],
  });

  await prisma.coupleGoal.createMany({
    data: [
      {
        title: "Visit Kyoto in Autumn",
        description: "Walk under the crimson maple canopies and lantern-lit stone paths.",
        targetDate: new Date("2027-10-15"),
        progressPercent: 35,
        status: "in_progress",
        category: "travel",
      },
    ],
  });

  // 11. Inside Jokes & Reasons
  await prisma.insideJoke.createMany({
    data: [
      {
        title: "The Artisan Brick Bread",
        punchlineOrContext: "When we baked our first loaf and it came out hard enough to use as structural masonry.",
        laughCount: 42,
      },
      {
        title: "'I'm 5 minutes away'",
        punchlineOrContext: "Which translates in Egyptian girlfriend time to 'I just stepped into the shower'.",
        laughCount: 88,
      },
    ],
  });

  const reasons = [
    "The way your eyes crinkle at the corners when you laugh genuinely.",
    "Your quiet compassion for every stray animal and human we come across.",
    "How you reach for my hand without even looking when we cross the street.",
    "The peaceful warmth of your embrace after an exhausting week.",
    "The fact that you remember the smallest things I mentioned months ago.",
  ];

  for (let i = 0; i < reasons.length; i++) {
    await prisma.reasonILoveYou.create({
      data: {
        orderIndex: i + 1,
        reason: reasons[i],
        authorId: i % 2 === 0 ? abdel.id : nour.id,
      },
    });
  }

  // 12. Places & Songs
  await prisma.place.createMany({
    data: [
      {
        name: "Citadel of Qaitbay & Corniche",
        city: "Alexandria",
        country: "Egypt",
        visitedDate: new Date("2025-09-14"),
        description: "Our sunset anniversary stroll by the fortress. Waves crashing and sea breeze.",
        rating: 5,
      },
      {
        name: "Kyoto Lantern Streets",
        city: "Kyoto",
        country: "Japan",
        description: "Dream destination on our bucket list.",
        rating: 5,
      },
    ],
  });

  await prisma.song.createMany({
    data: [
      {
        title: "Yellow",
        artist: "Coldplay",
        spotifyUrl: "https://open.spotify.com/track/3AJwUDP919kvQ9QcozQPxg",
        note: "Played in the car along the coastal road.",
        addedById: abdel.id,
      },
      {
        title: "Until I Found You",
        artist: "Stephen Sanchez",
        spotifyUrl: "https://open.spotify.com/track/0T5iIrXA4p5GsubkhuBIKV",
        note: "Our favorite slow dance song.",
        addedById: nour.id,
      },
    ],
  });

  // 13. Couple Chat Messages
  await prisma.chatMessage.createMany({
    data: [
      {
        senderId: abdel.id,
        text: "Did you check today's question on our space? ❤️",
        createdAt: new Date(Date.now() - 3600000 * 2),
        isRead: true,
      },
      {
        senderId: nour.id,
        text: "Yes! Just submitted my answer. Can't wait for you to see what I wrote 🥰",
        createdAt: new Date(Date.now() - 3600000 * 1.5),
        isRead: true,
      },
      {
        senderId: abdel.id,
        text: "I loved that moment yesterday when we stayed up talking until 3 AM.",
        createdAt: new Date(Date.now() - 1800000),
        isRead: true,
      },
    ],
  });

  // 14. Private Vault Items
  await prisma.vaultItem.createMany({
    data: [
      {
        title: "Our Secret 2028 Blueprint",
        category: "note",
        secretText: "Our pact: a sunlit terrace apartment, a golden retriever named Cairo, and annual slow travel.",
      },
    ],
  });

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
