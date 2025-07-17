import { Digraph, Edge, Node, renderToDot, Subgraph } from '@ts-graphviz/react';

const Example = () => (
  <Digraph
    rankdir="TB"
    edge={{
      color: 'blue',
      fontcolor: 'blue',
    }}
    node={{
      shape: 'none',
    }}
  >
    <Node
      id="nodeA"
      shape="none"
      label={
        <dot:table border={0} cellborder={1} cellSpacing={0}>
          <dot:tr>
            <dot:td>left</dot:td>
            <dot:td port="m">middle</dot:td>
            <dot:td port="r">right</dot:td>
          </dot:tr>
        </dot:table>
      }
    />

    <Subgraph id="cluster" label="Cluster" labeljust="l">
      <Node id="nodeB" label="This is label for nodeB." />
    </Subgraph>
    <Edge
      targets={['nodeB', 'nodeA:m']}
      comment="Edge from node A to B"
      label={<dot:b>A to B</dot:b>}
    />
  </Digraph>
);

const dot = renderToDot(<Example />);

console.log(dot);
