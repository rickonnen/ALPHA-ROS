/**Archivo LinkedInSignInButton.tsx 
 * * Direccion         app/auth/LinkedInSignInButton.tsx
*/
"use client"
import { signIn } from "next-auth/react"
import { linkedinStyles, linkedinIcon } from "./stylesButton"

export function SignInLinkedIn() {
  const handleClick = () => {
    signIn("linkedin", { callbackUrl: "/" })
  }

  return (
    <button type="button" onClick={handleClick} className={linkedinStyles}>
      {linkedinIcon}
    </button>
  )
}