module.exports = {
  format: "A3",
  orientation: "landscape",
  border: "2mm",
  footer: {
    height: "20mm",
    contents: {
      first: "Cover page",
      2: "Second page",
      default:
        '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
      last: "Last Page",
    },
  },
};
