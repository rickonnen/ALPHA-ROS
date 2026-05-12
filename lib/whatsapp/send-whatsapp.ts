import {
  sendEvolutionText,
  sendEvolutionUrlButton,
} from "@/lib/whatsapp/evolution";

export async function sendWhatsAppMessage(input: {
  to: string;
  text: string;
}) {
  return sendEvolutionText({
    to: input.to,
    text: input.text,
  });
}

export async function sendWhatsAppNotification(input: {
  to: string;
  title: string;
  body: string;
}) {
  return sendWhatsAppMessage({
    to: input.to,
    text: `${input.title}\n\n${input.body}`,
  });
}

export async function sendWhatsAppUrlButtonNotification(input: {
  to: string;
  title: string;
  body: string;
  buttonText: string;
  url: string;
}) {
  return sendEvolutionUrlButton({
    to: input.to,
    text: `${input.title}\n\n${input.body}`,
    footerText: "PropBol",
    buttonText: input.buttonText,
    url: input.url,
  });
}