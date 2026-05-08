type EvolutionSendTextResponse = {
  key?: {
    id?: string;
    remoteJid?: string;
    fromMe?: boolean;
  };
  status?: string;
  messageTimestamp?: string;
};

function removePlus(phoneE164: string) {
  return phoneE164.replace("+", "").replace(/\D/g, "");
}

export async function sendEvolutionText(input: {
  to: string;
  text: string;
}) {
  const baseUrl = process.env.EVOLUTION_API_URL!;
  const apiKey = process.env.EVOLUTION_API_KEY!;
  const instance = process.env.EVOLUTION_INSTANCE_NAME!;

  const response = await fetch(`${baseUrl}/message/sendText/${instance}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey,
    },
    body: JSON.stringify({
      number: removePlus(input.to),
      text: input.text,
    }),
  });

  const data = (await response.json()) as EvolutionSendTextResponse | {
    message?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(
      "Evolution API error: " + JSON.stringify(data)
    );
  }

  return {
    providerMessageId: data.key?.id ?? null,
    status: data.status ?? "sent",
    raw: data,
  };
}