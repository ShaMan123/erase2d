import { Canvas, type FabricObject } from 'fabric';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { Tool } from '../src/tool';

export function useStoreData() {
  const canvas = useRef<Canvas | null>(null);
  const [tool, setTool] = useState<Tool>('erase');
  const [removeFullyErased, setRemoveFullyErased] = useState(true);
  const [activeObject, setActiveObject] = useState<FabricObject>();
  const [erasable, setErasable] = useState<boolean | 'deep' | undefined>();
  useEffect(() => setErasable(activeObject?.erasable), [activeObject]);
  const toggleErasable = useCallback(
    (erasable: boolean | 'deep') => {
      if (!activeObject) {
        setErasable(undefined);
        return;
      }

      activeObject.erasable = erasable;
      setErasable(erasable);
      tool !== 'erase' && tool !== 'undo' && setTool('erase');
    },
    [activeObject, setErasable, tool],
  );
  const [erasableBackground, setErasableBackground] = useState<
    boolean | 'deep' | undefined
  >();
  const toggleErasableBackground = useCallback(
    (erasable: boolean | 'deep') => {
      const bg = canvas.current?.backgroundImage;
      if (!bg) {
        return;
      }
      bg.erasable = erasable;
      setErasableBackground(erasable);
    },
    [setErasable, tool],
  );

  return {
    canvas,
    tool,
    setTool,
    removeFullyErased,
    setRemoveFullyErased,
    activeObject,
    setActiveObject,
    erasable,
    erasableBackground,
    toggleErasableBackground,
    toggleErasable,
  };
}

export const StoreContext = createContext<ReturnType<
  typeof useStoreData
> | null>(null);

export function useStore() {
  return useContext(StoreContext)!;
}
