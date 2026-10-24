import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Heading from '@theme/Heading';

// drawn with ts-graphviz at build time (scripts/generate-hero-graph.mts)
import HeroGraph from './hero-graph.svg';
import styles from './styles.module.css';

const HeroSection: React.FC = () => {
  return (
    <section className={styles.hero}>
      <Heading as="h1">
        <Translate id="HeroSection.copy">
          Bringing the power of Graphviz to the TypeScript/JavaScript ecosystem.
        </Translate>
      </Heading>
      <div className={styles.background} />
      <img src={useBaseUrl('/img/logo.png')} alt="ts-graphviz" />
      <p>
        <Translate id="HeroSection.headline">
          Simplify graph visualization with a variety of tools.
        </Translate>
      </p>
      <div className={styles.buttons}>
        <Link
          className="button button--secondary button--lg"
          to="/docs/ts-graphviz/introduction"
        >
          <Translate id="HeroSection.tutorial">Get Started 🚀</Translate>
        </Link>
        <Link className="button button--secondary button--lg" to="/playground">
          <Translate id="HeroSection.playground">Playground 🎡</Translate>
        </Link>
        <Link
          className="button button--secondary button--lg"
          // absolute, like the navbar link: a path gets the locale prefix
          to="https://ts-graphviz.github.io/api/"
          target="_self"
        >
          <Translate id="HeroSection.api">API Reference 📖</Translate>{' '}
        </Link>
      </div>
      <HeroGraph className={styles.graph} />
    </section>
  );
};

export default HeroSection;
