const { test } = require("node:test");
const assert = require("node:assert/strict");
const { sendEmail, buildHtml } = require("../src/modules/shared/email.service");
test("MailerSend: SDK envia ao destinatário escolhido, aceita 202 e trata erros sem expor dados", async () => {
  assert.match(buildHtml({ header: "<script>", body: "A & B", footer: "Fim" }), /&lt;script&gt;/);
  const originalFetch = global.fetch;
  const keys = ["MAILER_API", "DOMAIN_MAIL", "MAILER_FROM"];
  const old = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  process.env.MAILER_API = "test-only-token";
  process.env.DOMAIN_MAIL = "example.test";
  delete process.env.MAILER_FROM;
  const message = { to: "chosen@example.test", toName: "Escolhido", subject: "Teste", header: "Olá", body: "Conteúdo", footer: "Fim" };
  let expectedFrom = "no-reply@example.test";
  try {
    global.fetch = async (input, options) => {
      const request = input instanceof Request ? input : new Request(input, options);
      assert.equal(request.url, "https://api.mailersend.com/v1/email");
      assert.equal(request.headers.get("authorization"), "Bearer test-only-token");
      const body = await request.json();
      assert.equal(body.from.email, expectedFrom);
      assert.deepEqual(body.to, [{ email: message.to, name: message.toName }]);
      assert.equal(body.subject, message.subject); assert.match(body.html, /Conteúdo/);
      return new Response("", { status: 202, headers: { "x-message-id": "test-id" } });
    };
    assert.deepEqual(await sendEmail(message), { statusCode: 202, messageId: "test-id" });
    process.env.MAILER_FROM = expectedFrom = "custom@example.test";
    assert.equal((await sendEmail(message)).messageId, "test-id");
    global.fetch = async () => new Response(JSON.stringify({ message: "Validation failed", errors: { "from.email": ["Domain not verified chosen@example.test test-only-token"] } }), { status: 422, headers: { "content-type": "application/json" } });
    await assert.rejects(sendEmail(message), error => {
      assert.match(error.message, /HTTP 422.*Domain not verified/);
      assert.ok(!error.message.includes("test-only-token"));
      assert.ok(!error.message.includes("chosen@example.test"));
      return true;
    });
    global.fetch = async () => { throw new Error("Connection unavailable"); };
    await assert.rejects(sendEmail(message), /Connection unavailable/);
    delete process.env.MAILER_API;
    await assert.rejects(sendEmail(message), /MailerSend não configurado/);
  } finally {
    global.fetch = originalFetch;
    for (const key of keys) { if (old[key] === undefined) delete process.env[key]; else process.env[key] = old[key]; }
  }
});
