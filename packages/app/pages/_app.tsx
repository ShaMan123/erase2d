import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import type { FabricObject } from 'fabric';
import { type AppProps } from 'next/app';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import {
  ButtonGroup,
  Container,
  Dropdown,
  DropdownButton,
  Form,
  Nav,
  Navbar,
  ToggleButton,
} from 'react-bootstrap';
import '../index.css';
import { TOOL, Tool } from '../src/tool';

export default function App({ Component, pageProps }: AppProps) {
  const { route } = useRouter();
  const [tool, setTool] = useState<Tool>('erase');
  const [removeFullyErased, setRemoveFullyErased] = useState<boolean>(true);
  const [activeObject, setActiveObject] = useState<FabricObject>();
  const [erasable, setErasable] = useState<boolean | 'deep' | undefined>();
  useEffect(() => setErasable(activeObject?.erasable), [activeObject]);
  const onSelect = useCallback(
    (eventKey: string | null) => {
      if (!activeObject || eventKey === null) {
        setErasable(undefined);
        return;
      }

      const erasable =
        eventKey === 'deep' ? eventKey : Boolean(Number(eventKey));
      activeObject.erasable = erasable;
      setErasable(erasable);
    },
    [activeObject, setErasable]
  );

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
              {TOOL.map((toolType) => (
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
              checked={removeFullyErased}
              onChange={(e) => setRemoveFullyErased(e.target.checked)}
              className="my-auto"
            />
            {activeObject && (
              <>
                <span className="me-2 my-auto">erasable:</span>
                <DropdownButton
                  id="dropdown-basic-button"
                  title={erasable?.toString() || ''}
                  onSelect={onSelect}
                  variant="info"
                  className="m-auto"
                >
                  <Dropdown.Item eventKey={0} active={!erasable}>
                    false
                  </Dropdown.Item>
                  <Dropdown.Item eventKey={1} active={erasable === true}>
                    true
                  </Dropdown.Item>
                  <Dropdown.Item eventKey="deep" active={erasable === 'deep'}>
                    deep
                  </Dropdown.Item>
                </DropdownButton>
              </>
            )}
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
        setActiveObject={setActiveObject}
      />
    </>
  );
}
