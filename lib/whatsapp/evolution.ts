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

export async function checkEvolutionWhatsappNumber({
  phoneE164,
}: {
  phoneE164: string;
}) {
  try {
    const response = await fetch(
      `${process.env.EVOLUTION_API_URL}/chat/whatsappNumbers/${process.env.EVOLUTION_INSTANCE_NAME}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.EVOLUTION_API_KEY!,
        },
        body: JSON.stringify({
          numbers: [phoneE164.replace("+", "")],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Evolution API error: ${response.status}`);
    }

    const data = await response.json();

    const exists =
      Array.isArray(data) &&
      data.length > 0 &&
      data[0]?.exists === true;

    return {
      exists,
      raw: data,
    };
  } catch (error) {
    console.error("checkEvolutionWhatsappNumber error:", error);

    return {
      exists: false,
    };
  }
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

  const data = (await response.json()) as
    | EvolutionSendTextResponse
    | {
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

export async function sendEvolutionUrlButton(input: {
  to: string;
  text: string;
  footerText?: string;
  buttonText: string;
  url: string;
}) {
  const baseUrl = process.env.EVOLUTION_API_URL!;
  const apiKey = process.env.EVOLUTION_API_KEY!;
  const instance = process.env.EVOLUTION_INSTANCE_NAME!;

  const response = await fetch(`${baseUrl}/message/sendButtons/${instance}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey,
    },
    body: JSON.stringify({
      number: removePlus(input.to),
      text: input.text,
      footerText: input.footerText ?? "",
      buttons: [
        {
          type: "url",
          buttonText: {
            displayText: input.buttonText,
          },
          url: input.url,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      "Evolution API URL button error: " + JSON.stringify(data)
    );
  }

  return data;
}