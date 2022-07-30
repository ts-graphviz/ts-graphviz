import { SourceBuildOptions } from 'peggy';
import { CustomHeaderPlugin } from './plugins/custom-header-plugin.js';

export const options: SourceBuildOptions = {
  format: 'es',
  allowedStartRules: ['Dot', 'Graph', 'Node', 'Edge', 'Attributes', 'Attribute', 'Subgraph', 'ClusterStatements'],
  output: 'source',
  plugins: [
    new CustomHeaderPlugin({
      customHeader: "import { Builder } from '@ts-graphviz/dot-ast';",
    }),
  ],
};
