import { NextPage } from 'next';
import { Tool } from '../src/tool';
import { useIsTransparentWorker } from '../src/useIsTransparentWorker';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const FabricPage: NextPage<{ tool: Tool }> = ({ tool }) => {
  const isTransparent = useIsTransparentWorker();
  const router = useRouter();
  useEffect(() => {
    router.replace('fabric');
  }, [router]);

  return null;
};

export default FabricPage;
