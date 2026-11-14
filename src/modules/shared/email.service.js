function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"}[char]));
}

function buildHtml({ header, body, footer }) {
  return `<div style="font-family:sans-serif;max-width:600px;margin:auto"><h2>${escapeHtml(header)}</h2><div>${escapeHtml(body).replace(/\n/g, "<br/>")}</div><hr/><p>${escapeHtml(footer)}</p></div>`;
}

async function sendEmail({ to, toName, subject, header, body, footer }) {
  const { EMAIL_API_KEY, EMAIL_FROM, EMAIL_FROM_NAME = "EasyFood" } = process.env;
  if (!EMAIL_API_KEY || !EMAIL_FROM || !to) throw new Error("Envio de e-mail não configurado");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${EMAIL_API_KEY}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`, to: [to], subject,
      html: buildHtml({ header, body, footer }),
      text: `${header}\n\n${body}\n\n${footer}`
    })
  });
  if (!response.ok) throw new Error(`Provedor de e-mail retornou HTTP ${response.status}`);
  return response.json();
}

module.exports = { sendEmail, buildHtml };
