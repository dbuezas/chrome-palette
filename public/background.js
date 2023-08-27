const preloadHTML = async () => {
  if (!(await chrome.offscreen.hasDocument())) {
    await chrome.offscreen.createDocument({
      url: "index.html",
      reasons: [chrome.offscreen.Reason.DISPLAY_MEDIA],
      justification: "Helps with faster load times of popup",
    });
  }
};
preloadHTML();
