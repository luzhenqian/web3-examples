import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="zh-CN">
      <Head />
      <body className='h-full h-[-webkit-fill-available]'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
