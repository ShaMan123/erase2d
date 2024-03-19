import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Tool } from '../src/tool';

const FabricPage: NextPage<{ tool: Tool }> = ({}) => {
  const router = useRouter();
  useEffect(() => {
    router.replace('fabric');
  }, [router]);

  return null;
};

export default FabricPage;
