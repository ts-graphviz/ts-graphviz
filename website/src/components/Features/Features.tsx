import Translate, { translate } from '@docusaurus/Translate';
import Heading from '@theme/Heading';

import styles from './Features.module.css';

// NOTE: Get SVG from https://undraw.co/

const features = [
  {
    title: translate({
      message: 'Fully Compatible with TypeScript/JavaScript',
      description: 'Feature title of ts-graphviz 1',
    }),
    description: translate({
      message: 'Achieve improved development efficiency and type safety.',
      description: 'Feature description of ts-graphviz 1',
    }),
    Svg: require('@site/static/img/undraw_code_typing.svg').default,
  },
  {
    title: translate({
      message: 'Various Tools and Libraries',
      description: 'Feature title of ts-graphviz 2',
    }),
    description: translate({
      message:
        'Support your development with OSS libraries and GitHub Actions.',
      description: 'Feature description of ts-graphviz 2',
    }),
    Svg: require('@site/static/img/undraw_bookshelves.svg').default,
  },
  {
    title: translate({
      message: 'Harness the Power of Graphviz',
      description: 'Feature title of ts-graphviz 3',
    }),
    description: translate({
      message: 'Easily generate and manipulate complex graphs.',
      description: 'Feature description of ts-graphviz 3',
    }),
    Svg: require('@site/static/img/undraw_omega.svg').default,
  },
  {
    title: translate({
      message: 'Cross-Platform Support',
      description: 'Feature title of ts-graphviz 4',
    }),
    description: translate({
      message: 'Works in Node.js, Deno, and browser environments.',
      description: 'Feature description of ts-graphviz 4',
    }),
    Svg: require('@site/static/img/undraw_progressive_app.svg').default,
  },
  {
    title: translate({
      message: 'Customizable and Extensible',
      description: 'Feature title of ts-graphviz 5',
    }),
    description: translate({
      message: "Extend the library's type system to meet specific needs.",
      description: 'Feature description of ts-graphviz 5',
    }),
    Svg: require('@site/static/img/undraw_bibliophile.svg').default,
  },
];

const Features: React.FC = () => (
  <section id="features" className={styles.features}>
    <Heading as="h2">
      <Translate id="Features.title">Why Choose ts-graphviz?</Translate>
    </Heading>
    <div className={styles.featureList}>
      {features.map(({ title, Svg, description }) => (
        <div key={title} className={styles.featureItem}>
          <div className="text--center">
            <Svg className={styles.featureSvg} role="img" />
          </div>
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      ))}
    </div>
  </section>
);

export default Features;
