const util = require('reshape-plugin-util')
    , path = require('path')
    , fs = require('fs');

class CssInject {
  constructor(options = {}) {

    const resolvePath = options.resolvePath || process.cwd();

    return function cssPlugin(tree/*, ctx, opts*/) {
      return util.modifyNodes(tree, (node) => {

        if(node.type === 'tag'
          && node.name === 'link'
          && node.attrs
          && node.attrs.rel
          && node.attrs.href) {

            // gather stylesheet link types
            const rel = node.attrs.rel.reduce((m, v, k) => {
              if(v.content === 'stylesheet') {
                m[k] = v;
              }
              return m;
            }, []);

            if(rel.length) {
              const file = path.join(resolvePath, node.attrs.href[0].content);

              if(!fs.existsSync(file)) {
                console.warn(`css file ${file} does not exist`);
                return true;
              }

              let contents = '' + fs.readFileSync(file);

              if(options.minify) {
                const CleanCSS = require('clean-css');
                contents = new CleanCSS(options.cleancss)
                  .minify(contents).styles;
              }

              node.name = 'style';
              node.attrs = {};
              node.content = [
                {
                  type: 'text',
                  content: contents
                }
              ]
            }
        }
        return true
      }, (node) => {
        return node
      })
    }
  }
}

module.exports = CssInject;
