import { facebookStyles, facebookIcon } from "./stylesButton"

export function SignInFacebook() {
  const handleClick = () => {
    console.log("")
  }

  return (
    <button onClick={handleClick} className={facebookStyles}>
      {facebookIcon}
    </button>
  )
}

