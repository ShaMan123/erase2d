import { isTransparent } from '@erase2d/fabric';
import { type FabricObject } from 'fabric';
import { useCallback, useEffect, useRef } from 'react';

export function useIsTransparentWorker() {
  const workerRef = useRef<Worker>();

  useEffect(() => {
    const worker = new Worker(new URL('../worker.ts', import.meta.url));
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  return useCallback(
    (target: FabricObject) => isTransparent(target, workerRef.current),
    [workerRef]
  );
}
