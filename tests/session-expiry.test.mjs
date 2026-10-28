import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import axios from "axios";

// Exercise the actual TypeScript client without a browser or an extra test dependency.
const source = await readFile(new URL("../src/api/axiosClient.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source.replaceAll("import.meta.env", "({})"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText.replace('from "axios"', `from ${JSON.stringify(import.meta.resolve("axios"))}`);
const { default: client } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
let store;
let events;
let profileStatus;
let profileChecks;
let onProfileCheck;
beforeEach(() => {
  store = new Map();
  events = 0;
  profileStatus = 401;
  profileChecks = 0;
  onProfileCheck = () => {};
  axios.defaults.adapter = async (config) => {
    profileChecks++;
    assert.ok(config.url.endsWith("/api/users/profile"));
    await onProfileCheck();
    if (profileStatus === "network") throw new axios.AxiosError("offline", "ERR_NETWORK", config);
    if (profileStatus !== 200) throw new axios.AxiosError("test", "ERR_BAD_RESPONSE", config, null, { status: profileStatus, config, data: {} });
    return { status: 200, data: { username: "reader" }, headers: {}, config };
  };
  globalThis.localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
  };
  const window = new EventTarget();
  window.location = { get href() { return "/A509/tin-tuc/example"; }, set href(_) { assert.fail("Unexpected navigation"); } };
  window.addEventListener("a509:session-expired", () => events++);
  globalThis.window = window;
});
function login(token = "old-token") {
  store.set("ACCESS_TOKEN", token);
  store.set("USER_INFO", '{"username":"reader"}');
}
async function failRequest(url, status = 401, beforeResponse = () => {}) {
  await assert.rejects(client.get(url, {
    adapter: async (config) => {
      beforeResponse();
      throw new axios.AxiosError("test", "ERR_BAD_RESPONSE", config, null, { status, config, data: {} });
    },
  }));
}
test("anonymous 401 stays on the current page", async () => {
  await failRequest("/api/users/profile");
  assert.equal(events, 0);
  assert.equal(window.location.href, "/A509/tin-tuc/example");
});
test("an expired current token clears token, user info, and emits once", async () => {
  login();
  await failRequest("/api/users/profile");
  assert.equal(store.size, 0);
  assert.equal(events, 1);
});
test("failed login does not clear an existing session", async () => {
  login();
  await failRequest("/api/auth/login");
  assert.equal(store.get("ACCESS_TOKEN"), "old-token");
  assert.equal(events, 0);
});
test("an old failed request cannot clear a new login", async () => {
  login();
  await failRequest("/api/users/profile", 401, () => login("new-token"));
  assert.equal(store.get("ACCESS_TOKEN"), "new-token");
  assert.equal(events, 0);
});
test("concurrent unauthorized requests expire the session once", async () => {
  login();
  await Promise.all([failRequest("/api/users/profile"), failRequest("/api/articles/admin")]);
  assert.equal(events, 1);
});
test("403 does not sign the user out", async () => {
  login();
  await failRequest("/api/articles/admin", 403);
  assert.equal(store.get("ACCESS_TOKEN"), "old-token");
  assert.equal(events, 0);
});
test("successful requests preserve the session", async () => {
  login();
  await client.get("/api/articles", { adapter: async (config) => ({ status: 200, data: [], headers: {}, config }) });
  assert.equal(store.get("ACCESS_TOKEN"), "old-token");
  assert.equal(events, 0);
});
test("a broken admin API cannot log out a valid session", async () => {
  login(); profileStatus = 200;
  await failRequest("/api/users/admin");
  assert.equal(store.get("ACCESS_TOKEN"), "old-token");
  assert.equal(events, 0);
  assert.equal(profileChecks, 1);
});
test("an expired token is cleared after the authoritative profile confirms 401", async () => {
  login();
  await failRequest("/api/articles/admin");
  assert.equal(store.size, 0);
  assert.equal(events, 1);
  assert.equal(profileChecks, 1);
});
test("a temporary profile outage does not clear credentials", async () => {
  for (const status of [500, 503, "network"]) {
    login(); profileStatus = status;
    await failRequest("/api/users/admin");
    assert.equal(store.get("ACCESS_TOKEN"), "old-token");
  }
  assert.equal(events, 0);
});
test("a delayed validation result cannot clear a new login", async () => {
  login(); onProfileCheck = async () => login("new-token");
  await failRequest("/api/users/admin");
  assert.equal(store.get("ACCESS_TOKEN"), "new-token");
  assert.equal(events, 0);
});
test("concurrent broken API responses use one profile check and retain a valid session", async () => {
  login(); profileStatus = 200;
  let finish;
  onProfileCheck = () => new Promise((resolve) => { finish = resolve; });
  const first = failRequest("/api/users/admin");
  const second = failRequest("/api/articles/admin");
  await new Promise((resolve) => setImmediate(resolve));
  finish();
  await Promise.all([first, second]);
  assert.equal(profileChecks, 1);
  assert.equal(events, 0);
});
