import { ChakraProvider } from '@chakra-ui/react'

import theme from '../theme'
import { AppProps } from 'next/app'
import { DarkModeSwitch } from '../components/DarkModeSwitch'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <DarkModeSwitch/>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp
