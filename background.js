// Tab
async function OpenOrSwitchToTab() {
  let querying = browser.tabs.query({
    currentWindow: true,
    url: "moz-extension://*/page.html"
  });
  querying.then((tabs) => {
    if (tabs.length == 0) {
      OpenTab();
    } else {
      browser.tabs.highlight({ tabs: tabs[0].index });
    }
  }, (error) => { console.log(error); });
}

async function OpenTab() {
  await browser.tabs.create({ pinned: true, url: "/page.html" });
}

// Window
async function OpenOrSwitchToWindow() {
  let querying = browser.tabs.query({
    url: "moz-extension://*/page.html"
  });
  querying.then((tabs) => {
    if (tabs.length == 0) {
      browser.windows.create({
        focused: true,
        url: "moz-extension:/page.html",
        type: "panel",
        width: 400,
        height: window.screen.height - 100,
      }).then(function (windowInfo) {
        console.log(`Created window with ID ${windowInfo.id}`);
        OurWindowId = windowInfo.id;
      }, function (error) {
        console.log(error);
      });
    } else {
      browser.windows.update(tabs[0].windowId, { focused: true});
      browser.tabs.highlight({ tabs: tabs[0].index });
    }
  }, (error) => { console.log(error); });
}

async function OpenTab() {
  await browser.tabs.create({ pinned: true, url: "moz-extension:/page.html" });
}

function ToolbarButtonPressed() {
  OpenOrSwitchToWindow();
  //OpenOrSwitchToTab();
}

browser.browserAction.onClicked.addListener(ToolbarButtonPressed);
