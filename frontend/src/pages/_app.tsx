import { ChakraProvider } from '@chakra-ui/react'
import theme from '../theme'
import { AppProps } from 'next/app'
import { DarkModeSwitch } from '../components/DarkModeSwitch'
import { createClient, Provider } from 'urql'

const client = createClient({
  url: 'http://localhost:5000/graphql',
  fetchOptions: {
    credentials: "include",
  }
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <ChakraProvider theme={theme}>
        <DarkModeSwitch/>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  )
}

export default MyApp
