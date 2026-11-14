const { test } = require("node:test");
const assert = require("node:assert/strict");
const { sendEmail, buildHtml } = require("../src/modules/shared/email.service");
test("Email: monta HTML seguro, chama provedor e sinaliza falha", async () => {
  assert.match(buildHtml({ header: "<script>", body: "A & B", footer: "Fim" }), /&lt;script&gt;/);
  const originalFetch = global.fetch;
  const oldKey = process.env.EMAIL_API_KEY, oldFrom = process.env.EMAIL_FROM;
  process.env.EMAIL_API_KEY = "test-only"; process.env.EMAIL_FROM = "sender@example.test";
  try {
    global.fetch = async (url, options) => {
      assert.equal(url, "https://api.resend.com/emails");
      assert.equal(options.headers.Authorization, "Bearer test-only");
      const body = JSON.parse(options.body);
      assert.deepEqual(body.to, ["recipient@example.test"]); assert.equal(body.subject, "Teste");
      assert.match(body.html, /Conteúdo/);
      return { ok: true, json: async () => ({ id: "fake-id" }) };
    };
    const message = { to: "recipient@example.test", subject: "Teste", header: "Olá", body: "Conteúdo", footer: "Fim" };
    assert.deepEqual(await sendEmail(message), { id: "fake-id" });
    global.fetch = async () => ({ ok: false, status: 503 });
    await assert.rejects(sendEmail(message), /503/);
  } finally {
    global.fetch = originalFetch;
    for (const [key, value] of [["EMAIL_API_KEY", oldKey], ["EMAIL_FROM", oldFrom]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
