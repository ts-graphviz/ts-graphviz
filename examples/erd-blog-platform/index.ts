import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { type Color, digraph, toDot } from 'ts-graphviz';

const COLORS = {
  entity: '#E8EAF6',
  junction: '#FFF3E0',
  lookup: '#E8F5E9',
  profile: '#F3E5F5',
  entityHeader: '#3F51B5',
  junctionHeader: '#FF9800',
  lookupHeader: '#4CAF50',
  profileHeader: '#9C27B0',
  oneToOne: '#1976D2',
  oneToMany: '#0288D1',
  manyToMany: '#F57C00',
  selfRef: '#7B1FA2',
};

function createTableNode(
  name: string,
  fields: Array<{ name: string; type: string; isPK?: boolean; isFK?: boolean }>,
  bgColor: string,
  headerColor: string,
): string {
  const fieldRows = fields
    .map((field) => {
      let icon = '';
      let style = '';

      if (field.isPK && field.isFK) {
        icon = '𝙁𝙆 𝙋𝙆';
        style = ' BGCOLOR="#FFF9C4"';
      } else if (field.isPK) {
        icon = '𝙋𝙆';
        style = ' BGCOLOR="#E3F2FD"';
      } else if (field.isFK) {
        icon = '𝙁𝙆';
        style = ' BGCOLOR="#FFE0B2"';
      }

      const fieldName = icon ? `${icon} ${field.name}` : field.name;

      return `<TR><TD ALIGN="LEFT" PORT="${field.name}"${style}><FONT POINT-SIZE="11">${fieldName}</FONT></TD><TD ALIGN="LEFT"${style}><FONT POINT-SIZE="10" COLOR="#666666">${field.type}</FONT></TD></TR>`;
    })
    .join('');

  return `<<TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="6" BGCOLOR="${bgColor}" STYLE="ROUNDED">
    <TR><TD COLSPAN="2" BGCOLOR="${headerColor}"><FONT COLOR="white" POINT-SIZE="13"><B>${name.toUpperCase()}</B></FONT></TD></TR>
    ${fieldRows}
  </TABLE>>`;
}

const tables = {
  users: {
    fields: [
      { name: 'id', type: 'UUID', isPK: true },
      { name: 'username', type: 'VARCHAR(50)' },
      { name: 'email', type: 'VARCHAR(255)' },
      { name: 'password_hash', type: 'VARCHAR(255)' },
      { name: 'created_at', type: 'TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP' },
    ],
    color: COLORS.entity,
    headerColor: COLORS.entityHeader,
  },
  posts: {
    fields: [
      { name: 'id', type: 'UUID', isPK: true },
      { name: 'title', type: 'VARCHAR(255)' },
      { name: 'slug', type: 'VARCHAR(255)' },
      { name: 'content', type: 'TEXT' },
      { name: 'author_id', type: 'UUID', isFK: true },
      { name: 'status', type: 'ENUM' },
      { name: 'published_at', type: 'TIMESTAMP' },
      { name: 'created_at', type: 'TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP' },
    ],
    color: COLORS.entity,
    headerColor: COLORS.entityHeader,
  },
  comments: {
    fields: [
      { name: 'id', type: 'UUID', isPK: true },
      { name: 'post_id', type: 'UUID', isFK: true },
      { name: 'user_id', type: 'UUID', isFK: true },
      { name: 'parent_id', type: 'UUID', isFK: true },
      { name: 'content', type: 'TEXT' },
      { name: 'approved', type: 'BOOLEAN' },
      { name: 'created_at', type: 'TIMESTAMP' },
    ],
    color: COLORS.entity,
    headerColor: COLORS.entityHeader,
  },
  categories: {
    fields: [
      { name: 'id', type: 'UUID', isPK: true },
      { name: 'name', type: 'VARCHAR(100)' },
      { name: 'slug', type: 'VARCHAR(100)' },
      { name: 'description', type: 'TEXT' },
    ],
    color: COLORS.lookup,
    headerColor: COLORS.lookupHeader,
  },
  tags: {
    fields: [
      { name: 'id', type: 'UUID', isPK: true },
      { name: 'name', type: 'VARCHAR(50)' },
      { name: 'slug', type: 'VARCHAR(50)' },
    ],
    color: COLORS.lookup,
    headerColor: COLORS.lookupHeader,
  },
  post_categories: {
    fields: [
      { name: 'post_id', type: 'UUID', isPK: true, isFK: true },
      { name: 'category_id', type: 'UUID', isPK: true, isFK: true },
    ],
    color: COLORS.junction,
    headerColor: COLORS.junctionHeader,
  },
  post_tags: {
    fields: [
      { name: 'post_id', type: 'UUID', isPK: true, isFK: true },
      { name: 'tag_id', type: 'UUID', isPK: true, isFK: true },
    ],
    color: COLORS.junction,
    headerColor: COLORS.junctionHeader,
  },
  user_profiles: {
    fields: [
      { name: 'user_id', type: 'UUID', isPK: true, isFK: true },
      { name: 'bio', type: 'TEXT' },
      { name: 'avatar_url', type: 'VARCHAR(255)' },
      { name: 'website', type: 'VARCHAR(255)' },
    ],
    color: COLORS.profile,
    headerColor: COLORS.profileHeader,
  },
  user_roles: {
    fields: [
      { name: 'id', type: 'UUID', isPK: true },
      { name: 'name', type: 'VARCHAR(50)' },
      { name: 'permissions', type: 'JSONB' },
    ],
    color: COLORS.profile,
    headerColor: COLORS.profileHeader,
  },
  user_role_assignments: {
    fields: [
      { name: 'user_id', type: 'UUID', isPK: true, isFK: true },
      { name: 'role_id', type: 'UUID', isPK: true, isFK: true },
    ],
    color: COLORS.junction,
    headerColor: COLORS.junctionHeader,
  },
};

const g = digraph('BlogPlatformERD', (g) => {
  // Global graph settings for better layout
  g.set('rankdir', 'TB');
  g.set('splines', 'true');
  g.set('nodesep', 1.5);
  g.set('ranksep', 2.5);
  g.set('bgcolor', 'white');
  g.set('fontname', 'Helvetica');
  g.set('fontsize', 14);
  g.set('pad', 0.8);
  // g.set('dpi', 150); //You can un-comment it to increase the svg size (in px)
  g.set('concentrate', false);

  // Default edge settings
  g.edge({ fontsize: 11 });
  g.edge({ fontname: 'Helvetica' });
  g.edge({ fontcolor: '#424242' });
  g.edge({ labeldistance: 2 });
  g.edge({ labelangle: 0 });

  // Default node settings
  g.node({ fontname: 'Helvetica' });

  // TOP ROW: CORE ENTITIES
  g.subgraph('cluster_core', (sg) => {
    sg.set('label', 'CORE ENTITIES');
    sg.set('style', 'rounded,filled');
    sg.set('color', COLORS.entityHeader);
    sg.set('fillcolor', '#E8EAF620');
    sg.set('fontsize', 16);
    sg.set('fontname', 'Helvetica-Bold');
    sg.set('penwidth', 2);
    sg.set('margin', 30);

    // Force horizontal layout
    sg.set('rank', 'same');

    sg.node('users', {
      shape: 'plaintext',
      label: createTableNode(
        'users',
        tables.users.fields,
        tables.users.color,
        tables.users.headerColor,
      ),
    });

    sg.node('posts', {
      shape: 'plaintext',
      label: createTableNode(
        'posts',
        tables.posts.fields,
        tables.posts.color,
        tables.posts.headerColor,
      ),
    });

    sg.node('comments', {
      shape: 'plaintext',
      label: createTableNode(
        'comments',
        tables.comments.fields,
        tables.comments.color,
        tables.comments.headerColor,
      ),
    });
  });

  // MIDDLE ROW: JUNCTION TABLES
  g.subgraph('cluster_junction', (sg) => {
    sg.set('label', 'JUNCTION TABLES');
    sg.set('style', 'rounded,filled');
    sg.set('color', COLORS.junctionHeader);
    sg.set('fillcolor', '#FFF3E020');
    sg.set('fontsize', 16);
    sg.set('fontname', 'Helvetica-Bold');
    sg.set('penwidth', 2);
    sg.set('margin', 30);

    sg.node('post_categories', {
      shape: 'plaintext',
      label: createTableNode(
        'post_categories',
        tables.post_categories.fields,
        tables.post_categories.color,
        tables.post_categories.headerColor,
      ),
    });

    sg.node('post_tags', {
      shape: 'plaintext',
      label: createTableNode(
        'post_tags',
        tables.post_tags.fields,
        tables.post_tags.color,
        tables.post_tags.headerColor,
      ),
    });

    sg.node('user_role_assignments', {
      shape: 'plaintext',
      label: createTableNode(
        'user_role_assignments',
        tables.user_role_assignments.fields,
        tables.user_role_assignments.color,
        tables.user_role_assignments.headerColor,
      ),
    });
  });

  // BOTTOM LEFT: LOOKUP TABLES
  g.subgraph('cluster_lookup', (sg) => {
    sg.set('label', 'LOOKUP TABLES');
    sg.set('style', 'rounded,filled');
    sg.set('color', COLORS.lookupHeader);
    sg.set('fillcolor', '#E8F5E920');
    sg.set('fontsize', 16);
    sg.set('fontname', 'Helvetica-Bold');
    sg.set('penwidth', 2);
    sg.set('margin', 30);

    sg.node('categories', {
      shape: 'plaintext',
      label: createTableNode(
        'categories',
        tables.categories.fields,
        tables.categories.color,
        tables.categories.headerColor,
      ),
    });

    sg.node('tags', {
      shape: 'plaintext',
      label: createTableNode(
        'tags',
        tables.tags.fields,
        tables.tags.color,
        tables.tags.headerColor,
      ),
    });
  });

  // BOTTOM RIGHT: USER EXTENSIONS
  g.subgraph('cluster_user_ext', (sg) => {
    sg.set('label', 'USER EXTENSIONS');
    sg.set('style', 'rounded,filled');
    sg.set('color', COLORS.profileHeader);
    sg.set('fillcolor', '#F3E5F520');
    sg.set('fontsize', 16);
    sg.set('fontname', 'Helvetica-Bold');
    sg.set('penwidth', 2);
    sg.set('margin', 30);

    sg.node('user_profiles', {
      shape: 'plaintext',
      label: createTableNode(
        'user_profiles',
        tables.user_profiles.fields,
        tables.user_profiles.color,
        tables.user_profiles.headerColor,
      ),
    });

    sg.node('user_roles', {
      shape: 'plaintext',
      label: createTableNode(
        'user_roles',
        tables.user_roles.fields,
        tables.user_roles.color,
        tables.user_roles.headerColor,
      ),
    });
  });

  //Relations
  // One-to-One: users <-> user_profiles
  g.edge(['users:id:s', 'user_profiles:user_id:n'], {
    label: '1:1',
    color: COLORS.oneToOne,
    penwidth: 2.5,
    arrowhead: 'none',
    arrowtail: 'none',
    style: 'bold',
    fontcolor: COLORS.oneToOne as Color,
    constraint: true,
    weight: 10,
    headport: 'n',
    tailport: 's',
  });

  // One-to-Many: users -> posts
  g.edge(['users:id:e', 'posts:author_id:w'], {
    label: '1:N \n(author)',
    color: COLORS.oneToMany,
    penwidth: 2,
    arrowhead: 'crow',
    arrowtail: 'tee',
    fontcolor: COLORS.oneToMany as Color,
    constraint: false,
    weight: 2,
    headport: 'w',
    tailport: 'e',
  });

  // One-to-Many: posts -> comments
  g.edge(['posts:id:e', 'comments:post_id:w'], {
    label: '1:N',
    color: COLORS.oneToMany,
    penwidth: 2,
    arrowhead: 'crow',
    arrowtail: 'tee',
    fontcolor: COLORS.oneToMany as Color,
    constraint: false,
    weight: 2,
    headport: 'w',
    tailport: 'e',
  });

  // One-to-Many: users -> comments
  g.edge(['users:id:ne', 'comments:user_id:nw'], {
    label: '1:N \n(author)',
    color: COLORS.oneToMany,
    penwidth: 2,
    arrowhead: 'crow',
    arrowtail: 'tee',
    fontcolor: COLORS.oneToMany as Color,
    constraint: false,
    weight: 1,
    headport: 'nw',
    tailport: 'ne',
  });

  // Many-to-Many: posts <-> categories
  g.edge(['posts:id:s', 'post_categories:post_id:n'], {
    color: COLORS.manyToMany,
    penwidth: 1.8,
    arrowhead: 'crow',
    style: 'dashed',
    constraint: true,
    weight: 8,
    headport: 'n',
    tailport: 's',
  });
  g.edge(['post_categories:category_id:s', 'categories:id:n'], {
    label: 'M:N',
    color: COLORS.manyToMany,
    penwidth: 1.8,
    arrowhead: 'crow',
    style: 'dashed',
    fontcolor: COLORS.manyToMany as Color,
    constraint: true,
    weight: 8,
    headport: 'n',
    tailport: 's',
  });

  // Many-to-Many: posts <-> tags
  g.edge(['posts:id:se', 'post_tags:post_id:n'], {
    color: COLORS.manyToMany,
    penwidth: 1.8,
    arrowhead: 'crow',
    style: 'dashed',
    constraint: false,
    weight: 5,
    headport: 'n',
    tailport: 'se',
  });
  g.edge(['post_tags:tag_id:s', 'tags:id:n'], {
    label: 'M:N',
    color: COLORS.manyToMany,
    penwidth: 1.8,
    arrowhead: 'crow',
    style: 'dashed',
    fontcolor: COLORS.manyToMany as Color,
    constraint: true,
    weight: 8,
    headport: 'n',
    tailport: 's',
  });

  // Many-to-Many: users <-> roles
  g.edge(['users:id:sw', 'user_role_assignments:user_id:n'], {
    color: COLORS.manyToMany,
    penwidth: 1.8,
    arrowhead: 'crow',
    style: 'dashed',
    constraint: true,
    weight: 5,
    headport: 'n',
    tailport: 'sw',
  });
  g.edge(['user_role_assignments:role_id:s', 'user_roles:id:n'], {
    label: 'M:N',
    color: COLORS.manyToMany,
    penwidth: 1.8,
    arrowhead: 'crow',
    style: 'dashed',
    fontcolor: COLORS.manyToMany as Color,
    constraint: true,
    weight: 8,
    headport: 'n',
    tailport: 's',
  });

  g.edge(['users', 'user_profiles'], {
    style: 'invis',
    constraint: true,
  });

  g.edge(['posts', 'post_categories'], {
    style: 'invis',
    constraint: true,
  });

  g.edge(['comments', 'post_tags'], {
    style: 'invis',
    constraint: true,
  });
});

const dot = toDot(g);
writeFileSync(join(__dirname, 'blog-platform-erd.dot'), dot);

export { g as blogPlatformERD };
export default g;
