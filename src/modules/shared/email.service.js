const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"}[char]));
}

function buildHtml({ header, body, footer }) {
  return `<div style="font-family:sans-serif;max-width:600px;margin:auto"><h2>${escapeHtml(header)}</h2><div>${escapeHtml(body).replace(/\n/g, "<br/>")}</div><hr/><p>${escapeHtml(footer)}</p></div>`;
}

async function sendEmail({ to, toName, subject, header, body, footer }) {
  const apiKey = process.env.MAILER_API;
  const domain = process.env.DOMAIN_MAIL?.trim();
  const from = process.env.MAILER_FROM?.trim() || (domain ? `no-reply@${domain}` : "");
  if (!apiKey || !from || !to) throw new Error("MailerSend não configurado: informe MAILER_API, DOMAIN_MAIL ou MAILER_FROM e destinatário");
  const sender = new Sender(from, process.env.EMAIL_FROM_NAME || "EasyFood");
  const params = new EmailParams()
    .setFrom(sender)
    .setTo([new Recipient(to, toName || to)])
    .setReplyTo(sender)
    .setSubject(subject)
    .setHtml(buildHtml({ header, body, footer }))
    .setText(`${header}\n\n${body}\n\n${footer}`);
  try {
    const result = await new MailerSend({ apiKey }).email.send(params);
    return { statusCode: result.statusCode, messageId: result.headers?.["x-message-id"] };
  } catch (error) {
    const details = error?.body || error?.response?.data;
    const messages = details?.errors && typeof details.errors === "object"
      ? Object.values(details.errors).flat().filter(value => typeof value === "string") : [];
    let reason = [details?.message, ...messages, !details ? error?.message : ""]
      .filter(value => typeof value === "string").join("; ");
    reason = reason.split(apiKey).join("<REDACTED>")
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "<EMAIL>")
      .replace(/[\r\n\x00-\x1f]/g, " ").slice(0, 600);
    const status = error?.statusCode || error?.response?.status;
    throw new Error(`MailerSend recusou o envio${status ? ` (HTTP ${status})` : ""}${reason ? ": " + reason : ""}`);
  }
}

module.exports = { sendEmail, buildHtml };
