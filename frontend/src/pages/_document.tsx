import NextDocument, { Html, Head, Main, NextScript } from 'next/document'
import { ColorModeScript } from '@chakra-ui/react'

export default class Document extends NextDocument {
  render() {
    return (
      <Html>
        <Head />
        <title>Reddit Clone</title>
        <link rel="icon" href="https://i.ibb.co/DpT4sQx/logo.png" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <body>
          {/* Make Color mode to persists when you refresh the page. */}
          <ColorModeScript />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
