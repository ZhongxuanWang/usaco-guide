import MODULE_ORDERING from '../../content/ordering';
import { ModuleInfo, ModuleLinkInfo } from '../models/module';
import { Problem } from '../models/problem';

export const getModulesForDivision = (allModules, division) => {
  return MODULE_ORDERING[division].map(k => {
    // rip spaghetti code, clean this up
    if (typeof k === 'object') {
      return {
        name: k.name,
        items: k.items.map(k2 => {
          if (!allModules.hasOwnProperty(k2)) {
            throw 'Module not found: ' + k2;
          }
          return {
            ...allModules[k2 as string],
            slug: `/${division}/${allModules[k2 as string].frontmatter.id}`,
          };
        }),
        description: k.description,
      };
    } else {
      if (!allModules.hasOwnProperty(k)) {
        throw 'Module not found: ' + k;
      }
      return {
        ...allModules[k],
        slug: `/${division}/${allModules[k].frontmatter.id}`,
      };
    }
  });
};

export function graphqlToModuleLinks(allMdx: any): ModuleLinkInfo[] {
  return allMdx.edges.map(
    cur =>
      new ModuleLinkInfo(
        cur.node.frontmatter.id,
        cur.node.fields.division,
        cur.node.frontmatter.title,
        null,
        null,
        null,
        cur.node.problems, // todo upate to fields
        cur.node.fields.gitAuthorTime
      )
  );
}

export function graphqlToModuleInfo(mdx: any): ModuleInfo {
  return new ModuleInfo(
    mdx.frontmatter.id,
    mdx.fields.division,
    mdx.frontmatter.title,
    mdx.body,
    mdx.frontmatter.author,
    mdx.frontmatter.prerequisites,
    mdx.frontmatter.description,
    mdx.frontmatter.frequency,
    mdx.toc,
    mdx.parent.relativePath,
    mdx.fields.gitAuthorTime
  );
}
