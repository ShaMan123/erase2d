import 'bootstrap/dist/css/bootstrap.min.css';
import Head from 'next/head';
import { Container, Nav, Navbar } from 'react-bootstrap';
import '../index.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Erase2d App</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Navbar bg="light">
        <Container>
          <Navbar.Brand>
            <strong>Erase2d</strong> App
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link
              href="https://github.com/ShaMan123/erase2d"
              target="_blank"
              rel="noopener noreferrer"
              active={false}
            >
              <small>Github</small>
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      <Component {...pageProps} />
    </>
  );
}
