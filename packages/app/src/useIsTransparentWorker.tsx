import { isTransparent } from '@erase2d/fabric';
import { type FabricObject } from 'fabric';
import { useCallback, useEffect, useRef } from 'react';
import Worker from '../worker?worker';

export function useIsTransparentWorker() {
  const workerRef = useRef<Worker>(null);

  useEffect(() => {
    const worker = new Worker({ name: '@erase2d/worker' });
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  return useCallback(
    (target: FabricObject) => isTransparent(target, workerRef.current!),
    [workerRef]
  );
}
