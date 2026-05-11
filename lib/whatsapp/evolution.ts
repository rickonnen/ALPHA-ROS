type EvolutionSendTextResponse = {
  key?: {
    id?: string;
    remoteJid?: string;
    fromMe?: boolean;
  };
  status?: string;
  messageTimestamp?: string;
};

type EvolutionCheckNumberResponse = Array<{
  exists?: boolean;
  number?: string;
  jid?: string;
}> | {
  numbers?: Array<{
    exists?: boolean;
    number?: string;
    jid?: string;
  }>;
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
    throw new Error("Evolution API error: " + JSON.stringify(data));
  }

  return {
    providerMessageId: "key" in data ? data.key?.id ?? null : null,
    status: "status" in data ? data.status ?? "sent" : "sent",
    raw: data,
  };
}

export async function checkEvolutionWhatsappNumber(input: {
  phoneE164: string;
}) {
  const baseUrl = process.env.EVOLUTION_API_URL!;
  const apiKey = process.env.EVOLUTION_API_KEY!;
  const instance = process.env.EVOLUTION_INSTANCE_NAME!;

  const response = await fetch(`${baseUrl}/chat/whatsappNumbers/${instance}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey,
    },
    body: JSON.stringify({
      numbers: [removePlus(input.phoneE164)],
    }),
  });

  const data = (await response.json()) as EvolutionCheckNumberResponse;

  if (!response.ok) {
    throw new Error("Evolution API error: " + JSON.stringify(data));
  }

  const firstResult = Array.isArray(data)
    ? data[0]
    : data.numbers?.[0];

  return {
    exists: Boolean(firstResult?.exists),
    jid: firstResult?.jid ?? null,
    number: firstResult?.number ?? input.phoneE164,
    raw: data,
  };
}