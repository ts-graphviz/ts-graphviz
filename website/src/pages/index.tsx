import Layout from '@theme/Layout';

import { translate } from '@docusaurus/Translate';
import Features from '@site/src/components/Features/Features';
import HeroSection from '@site/src/components/HeroSection';
import Tools from '@site/src/components/Tools/Tools';

export default function LandingPage(): JSX.Element {
  return (
    <Layout
      title={translate({
        id: 'index.title',
        message: 'Simplify graph visualization with a variety of tools.',
      })}
      description={translate({
        id: 'index.description',
        message:
          'Leverage the power of Graphviz in your TypeScript and JavaScript projects with ts-graphviz. Simplify graph visualization using a variety of tools.',
      })}
    >
      <HeroSection />
      <main>
        <Features />
        <Tools />
      </main>
    </Layout>
  );
}
