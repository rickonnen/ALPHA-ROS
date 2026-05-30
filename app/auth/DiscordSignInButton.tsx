/**Archivo DiscordSignInButton.tsx 
 * Direccion         app/auth/DiscordSignInButton.tsx
*/
"use client"
import { signIn } from "next-auth/react"
import { discordStyles, discordIcon } from "./stylesButton"

export function SignInDiscord() {
  const handleClick = () => {
    signIn("discord", { callbackUrl: "/" })
  }

  return (
    <button type="button" onClick={handleClick} className={discordStyles}>     
    {discordIcon}
    </button>
  )
}