import Link from '@docusaurus/Link';
import Translate, { translate } from '@docusaurus/Translate';
import Heading from '@theme/Heading';
import styles from './Tools.module.css';

// NOTE: Get icons from https://simpleicons.org/

const SVG = {
  npm: {
    Svg: require('@site/static/img/npm.svg').default,
    fill: '#CB3837',
  },
  GithubActions: {
    Svg: require('@site/static/img/githubactions.svg').default,
    fill: '#2088FF',
  },
};

const tools = [
  {
    name: translate({
      message: 'ts-graphviz Library',
      description: 'Tool name of ts-graphviz',
    }),
    description: translate({
      message: 'Use Graphviz features with TypeScript.',
      description: 'Tool description of ts-graphviz',
    }),
    link: 'https://github.com/ts-graphviz/ts-graphviz',
    ...SVG.npm,
  },
  {
    name: translate({
      message: 'setup-graphviz',
      description: 'Tool name of setup-graphviz',
    }),
    description: translate({
      message: 'Simplify Graphviz setup in CI environments.',
      description: 'Tool description of setup-graphviz',
    }),
    link: 'https://github.com/ts-graphviz/setup-graphviz',
    ...SVG.GithubActions,
  },
];

const Tools: React.FC = () => (
  <section id="tools" className={styles.tools}>
    <Heading as="h2">
      <Translate id="Tools.title">Our Tools and Libraries</Translate>
    </Heading>
    <div className={styles.toolList}>
      {tools.map((tool) => (
        <div key={tool.name} className={styles.toolItem}>
          <div className={styles.toolItemHeader}>
            <Heading as="h3">{tool.name}</Heading>
            <tool.Svg fill={tool.fill} className={styles.toolSvg} role="img" />
          </div>
          <p>{tool.description}</p>
          <Link to={tool.link} target="_blank" rel="noopener noreferrer">
            <Translate id="Tools.learnMore">Learn More</Translate>
          </Link>
        </div>
      ))}
    </div>
  </section>
);

export default Tools;
