import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { type AppProps } from 'next/app';
import Head from 'next/head';
import { useState } from 'react';
import {
  ButtonGroup,
  Container,
  Form,
  Nav,
  Navbar,
  ToggleButton,
} from 'react-bootstrap';
import '../index.css';
import { Tool } from '../src/tool';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }: AppProps) {
  const { route } = useRouter();
  const [tool, setTool] = useState<Tool>('erase');
  const [removeFullyErased, setRemoveFullyErased] = useState<boolean>(true);
  return (
    <>
      <Head>
        <title>Erase2d App</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Navbar bg="light">
        <Container>
          <Navbar.Brand className="me-5">
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
            <ButtonGroup className="me-5">
              {(['select', 'erase', 'undo'] as Tool[]).map((toolType) => (
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
            <Form.Check
              type="switch"
              id="rm-erased-switch"
              label="Remove fully erased objects"
              inline
              className="m-auto"
              checked={removeFullyErased}
              onChange={(e) => setRemoveFullyErased(e.target.checked)}
            />
          </Nav>

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
        </Container>
      </Navbar>
      <Component
        {...pageProps}
        tool={tool}
        removeFullyErased={removeFullyErased}
      />
    </>
  );
}
