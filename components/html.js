/**
 * Generate properties html
 *
 * @param properties
 * @return {string}
 */
export function genPropertiesTable(properties) {
  const html = [];

  Object.entries(properties).forEach(property => {
    let [key, value] = property;
    html.push('<tr><td style="vertical-align: top ">' + key + ':</td><td style=" font-weight: bold">' + (value instanceof Object ? "↘" + genPropertiesTable(value) : value) + '<td></tr>');
  });
  return "<table style='user-select: text'>" + html.join('') + "</table>";
}

