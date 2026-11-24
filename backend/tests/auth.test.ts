import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app";
import prisma from "../src/config/prisma";
import { hashOtp } from "../src/utils/crypto";
import { env } from "../src/config/env";

const ORIGIN = env.frontendOrigin;

function agent() {
  return request.agent(app);
}

async function insertOtp(email: string, code: string) {
  const now = new Date();
  await prisma.emailOTP.updateMany({
    where: { email, consumedAt: null },
    data: { consumedAt: now },
  });
  await prisma.emailOTP.create({
    data: {
      email,
      codeHash: hashOtp(code, email),
      expiresAt: new Date(now.getTime() + 5 * 60 * 1000),
      lastSentAt: now,
      attempts: 0,
    },
  });
}

beforeAll(async () => {
  // Ensure at least one consultant exists for chat tests
  const existing = await prisma.consultant.findFirst();
  if (!existing) {
    await prisma.consultant.create({
      data: {
        name: "Homeopathy",
        slug: "homeopathy",
        description: "Test",
        systemPrompt: "You are a test consultant.",
        tone: "calm",
        disclaimer: "Test only",
        allowedTopics: ["health"],
        isActive: true,
        sortOrder: 0,
      },
    });
  }
});

beforeEach(async () => {
  await prisma.message.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.session.deleteMany();
  await prisma.guestSession.deleteMany();
  await prisma.emailOTP.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("email OTP auth", () => {
  it("sends otp without exposing the code", async () => {
    const res = await agent()
      .post("/api/auth/send-otp")
      .set("Origin", ORIGIN)
      .send({ email: "alice@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(JSON.stringify(res.body)).not.toMatch(/\b\d{6}\b/);

    const otp = await prisma.emailOTP.findFirst({
      where: { email: "alice@example.com", consumedAt: null },
    });
    expect(otp).toBeTruthy();
    expect(otp!.codeHash).not.toHaveLength(6);
  });

  it("verifies otp and creates a registered session", async () => {
    await insertOtp("bob@example.com", "123456");

    const res = await agent()
      .post("/api/auth/verify-otp")
      .set("Origin", ORIGIN)
      .send({ email: "bob@example.com", code: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.data.user.accountType).toBe("REGISTERED");
    expect(res.body.data.user.email).toBe("bob@example.com");
    expect(res.headers["set-cookie"]).toBeTruthy();

    const jar = request.agent(app);
    await insertOtp("carol@example.com", "654321");
    await jar
      .post("/api/auth/verify-otp")
      .set("Origin", ORIGIN)
      .send({ email: "carol@example.com", code: "654321" });

    const meRes = await jar.get("/api/auth/me");
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe("carol@example.com");
  });

  it("rejects invalid otp and tracks attempts", async () => {
    await insertOtp("dave@example.com", "111111");

    const res = await agent()
      .post("/api/auth/verify-otp")
      .set("Origin", ORIGIN)
      .send({ email: "dave@example.com", code: "000000" });

    expect(res.status).toBe(400);
    expect(res.body.errors.attemptsRemaining).toBe(4);

    const otp = await prisma.emailOTP.findFirst({
      where: { email: "dave@example.com", consumedAt: null },
    });
    expect(otp!.attempts).toBe(1);
  });
});

describe("guest auth", () => {
  it("creates a guest session and scopes chats", async () => {
    const jar = request.agent(app);

    const guestRes = await jar
      .post("/api/auth/guest")
      .set("Origin", ORIGIN)
      .send({ name: "Guest Sam" });

    expect(guestRes.status).toBe(201);
    expect(guestRes.body.data.user.accountType).toBe("GUEST");
    expect(guestRes.body.data.user.name).toBe("Guest Sam");

    const me = await jar.get("/api/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.data.user.name).toBe("Guest Sam");

    const chatRes = await jar
      .post("/api/chat")
      .set("Origin", ORIGIN)
      .send({ consultant: "homeopathy" });

    expect(chatRes.status).toBe(201);

    const list = await jar.get("/api/chat/list");
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);

    // another user cannot see that chat
    const other = request.agent(app);
    await other
      .post("/api/auth/guest")
      .set("Origin", ORIGIN)
      .send({ name: "Other Guest" });

    const otherList = await other.get("/api/chat/list");
    expect(otherList.body.data).toHaveLength(0);

    const forbidden = await other.get(`/api/chat/${chatRes.body.data.id}/messages`);
    expect(forbidden.status).toBe(404);
  });
});

describe("claim guest", () => {
  it("upgrades guest and preserves chats", async () => {
    const jar = request.agent(app);

    await jar
      .post("/api/auth/guest")
      .set("Origin", ORIGIN)
      .send({ name: "Migrating Guest" });

    const chatRes = await jar
      .post("/api/chat")
      .set("Origin", ORIGIN)
      .send({ consultant: "homeopathy" });

    const chatId = chatRes.body.data.id as string;

    await insertOtp("migrate@example.com", "222222");

    const claim = await jar
      .post("/api/auth/claim-guest")
      .set("Origin", ORIGIN)
      .send({ email: "migrate@example.com", code: "222222" });

    expect(claim.status).toBe(200);
    expect(claim.body.data.user.accountType).toBe("REGISTERED");
    expect(claim.body.data.user.email).toBe("migrate@example.com");

    const list = await jar.get("/api/chat/list");
    expect(list.body.data.map((c: { id: string }) => c.id)).toContain(chatId);
  });

  it("merges into existing registered user without duplicating chats", async () => {
    await insertOtp("existing@example.com", "333333");
    const registered = request.agent(app);
    await registered
      .post("/api/auth/verify-otp")
      .set("Origin", ORIGIN)
      .send({ email: "existing@example.com", code: "333333" });

    const existingChat = await registered
      .post("/api/chat")
      .set("Origin", ORIGIN)
      .send({ consultant: "homeopathy" });

    const guestJar = request.agent(app);
    await guestJar
      .post("/api/auth/guest")
      .set("Origin", ORIGIN)
      .send({ name: "Temp Guest" });

    const guestChat = await guestJar
      .post("/api/chat")
      .set("Origin", ORIGIN)
      .send({ consultant: "homeopathy" });

    await insertOtp("existing@example.com", "444444");
    const claim = await guestJar
      .post("/api/auth/claim-guest")
      .set("Origin", ORIGIN)
      .send({ email: "existing@example.com", code: "444444" });

    expect(claim.status).toBe(200);

    const list = await guestJar.get("/api/chat/list");
    const ids = list.body.data.map((c: { id: string }) => c.id);
    expect(ids).toContain(existingChat.body.data.id);
    expect(ids).toContain(guestChat.body.data.id);
    expect(ids).toHaveLength(2);
  });
});

describe("profile", () => {
  it("updates name, avatar, and deletes account", async () => {
    const jar = request.agent(app);
    await jar
      .post("/api/auth/guest")
      .set("Origin", ORIGIN)
      .send({ name: "Profile Guest" });

    const patched = await jar
      .patch("/api/profile")
      .set("Origin", ORIGIN)
      .send({ name: "Updated Name" });

    expect(patched.status).toBe(200);
    expect(patched.body.data.user.name).toBe("Updated Name");

    const png1x1 = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64"
    );

    const avatar = await jar
      .post("/api/profile/avatar")
      .set("Origin", ORIGIN)
      .attach("avatar", png1x1, { filename: "a.png", contentType: "image/png" });

    expect(avatar.status).toBe(200);
    expect(avatar.body.data.user.avatarUrl).toMatch(/^data:image\/png;base64,/);

    const del = await jar.delete("/api/profile").set("Origin", ORIGIN);
    expect(del.status).toBe(200);

    const me = await jar.get("/api/auth/me");
    expect(me.status).toBe(401);
  });
});

describe("auth required", () => {
  it("blocks chat list without session", async () => {
    const res = await agent().get("/api/chat/list");
    expect(res.status).toBe(401);
  });
});
