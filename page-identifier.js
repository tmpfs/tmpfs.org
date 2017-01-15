const pageId = require('spike-page-id')

function pageIdentifier(ctx) {
  var id = pageId(ctx);
  id = id.replace(/-index$/, '');
  return id;
}

module.exports = pageIdentifier;
