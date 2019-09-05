function doGet(e) {
  if (e.parameters.v == "data") {
    return HtmlService.createTemplateFromFile("googleSiteOutput").evaluate();
  } else {
    return HtmlService.createTemplateFromFile("login").evaluate();
  }
}
