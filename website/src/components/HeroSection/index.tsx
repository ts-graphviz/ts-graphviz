import { useEffect, useState } from 'react';

import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Heading from '@theme/Heading';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

import styles from './styles.module.css';

const HeroSection: React.FC = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
      setInit(true);
    });
  }, []);

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
          to="https://ts-graphviz.github.io/ts-graphviz/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Translate id="HeroSection.api">API Reference 📖</Translate>{' '}
        </Link>
      </div>
      {init ? (
        <Particles
          className={styles.particles}
          options={{
            fullScreen: false,
            background: {},
            fpsLimit: 60,
            interactivity: {
              events: {
                resize: {
                  enable: true,
                },
              },
            },
            particles: {
              color: {
                value: '#ffffff',
              },
              links: {
                color: '#ffffff',
                distance: 150,
                enable: true,
                opacity: 0.5,
                width: 1,
              },
              move: {
                direction: 'none',
                enable: true,
                outModes: {
                  default: 'bounce',
                },
                random: false,
                speed: 1,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                },
                value: 80,
              },
              opacity: {
                value: 0.5,
              },
              shape: {
                type: 'circle',
              },
              size: {
                value: { min: 1, max: 5 },
              },
            },
            detectRetina: true,
          }}
        />
      ) : null}
    </section>
  );
};

export default HeroSection;
