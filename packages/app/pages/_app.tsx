import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { type AppProps } from 'next/app';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  ButtonGroup,
  Container,
  Nav,
  Navbar,
  ToggleButton,
} from 'react-bootstrap';
import '../index.css';
import { Tool } from '../src/tool';

export default function App({ Component, pageProps }: AppProps) {
  const { route } = useRouter();
  const [tool, setTool] = useState<Tool>('erase');
  return (
    <>
      <Head>
        <title>Erase2d App</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Navbar bg="light">
        <Container>
          <Nav>
            <Nav.Link
              href="https://github.com/ShaMan123/erase2d"
              target="_blank"
              rel="noopener noreferrer"
              active={false}
            >
              <i className="bi bi-github"></i>
            </Nav.Link>
          </Nav>
          <Navbar.Brand>
            <Nav.Link
              as={Link}
              href="/"
              legacyBehavior={false}
              active={route === '/'}
            >
              <strong>Erase2d</strong> App
            </Nav.Link>
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              href="/fabric"
              legacyBehavior={false}
              active={route === '/fabric'}
            >
              fabric
            </Nav.Link>
          </Nav>
          <Nav>
            <ButtonGroup>
              {(['default', 'erase', 'undo'] as const).map((toolType) => (
                <ToggleButton
                  key={toolType}
                  id={`radio-${toolType}`}
                  type="radio"
                  variant="outline-info"
                  name="radio"
                  value={toolType}
                  checked={tool === toolType}
                  onChange={() => setTool(toolType)}
                >
                  {toolType}
                </ToggleButton>
              ))}
            </ButtonGroup>
          </Nav>
        </Container>
      </Navbar>
      <Component {...pageProps} tool={tool} />
    </>
  );
}
