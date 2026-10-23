import { randomBytes } from "node:crypto";


const sessions = new Map();
const SESSION_MAX_AGE = 1000 * 60 * 60 * 24; // 24시간

function createSession(userId) {
    const sessionId = randomBytes(32).toString("hex");

    sessions.set(sessionId, {
        userId,
        expiresAt: Date.now() + SESSION_MAX_AGE,
    });

    return sessionId;
}
// 세션 ID 추출
function getSessionId(req) {
    const cookie = req.headers.cookie;

    if (!cookie) return null;

    const sessionCookie = cookie
        .split(";")
        .map((item) => item.trim())
        .find((item) => item.startsWith("sessionId="));

    return sessionCookie
        ? sessionCookie.slice("sessionId=".length)
        : null;
}
// 세션 조회
function getSession(req) {
    const sessionId = getSessionId(req);

    if (!sessionId) return null;

    const session = sessions.get(sessionId);

    if (!session) return null;

    // 만료된 세션 삭제
    if (session.expiresAt <= Date.now()) {
        sessions.delete(sessionId);
        return null;
    }

    return session;
}

function deleteSession(req) {
    const sessionId = getSessionId(req);

    if (sessionId) {
        sessions.delete(sessionId);
    }
}

export default { createSession, getSession, getSessionId, deleteSession };