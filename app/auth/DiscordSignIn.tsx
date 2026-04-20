import { discordStyles, discordIcon } from "./stylesButton"

export function SignInDiscord() {
  const handleClick = () => {
    console.log("")
  }

  return (
    <button onClick={handleClick} className={discordStyles}>
      {discordIcon}
    </button>
  )
}

