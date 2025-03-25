interface Colors {
  primary: string
  secondary: string
  accent: string
  background?: string
}

const tokyoSunset = '#FF2E63'
const cyberMint = '#08D9D6'
const nordicSky = '#73A9CA'
const purpleHeart = '#141826'

const colors: Colors = {
  primary: tokyoSunset,
  secondary: cyberMint,
  accent: nordicSky,
  background: purpleHeart
}

const appBarIconColors: Colors = {
  primary: 'white',
  secondary: 'black',
  accent: nordicSky
}

export { colors, appBarIconColors }
