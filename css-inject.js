const util = require('reshape-plugin-util')
    , path = require('path')
    , fs = require('fs');

class CssInject {
  constructor(/*options = {}*/) {
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
              const file = path.join('public', node.attrs.href[0].content)
                  , contents = '' + fs.readFileSync(file);
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
