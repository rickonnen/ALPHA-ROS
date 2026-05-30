/**Archivo FacebookSignInButton.tsx 
 * * Direccion         app/auth/FacebookSignInButton.tsx
*/
"use client"
import { signIn } from "next-auth/react"
import { facebookStyles, facebookIcon } from "./stylesButton"

export function SignInFacebook() {
  const handleClick = () => {
    signIn("facebook", { callbackUrl: "/" })
  }

  return (
    <button type="button" onClick={handleClick} className={facebookStyles}>
      {facebookIcon}
    </button>
  )
}