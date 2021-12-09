async function drawWindowList() {
  let windows = await browser.windows.getAll({ populate: true });
  let windowListNode = $('.myWindowList');
  let ourWindow = await browser.windows.getCurrent();
  let inSidebar = $('.sideBarClass').length > 0;
  for (let win of windows) {
    if (inSidebar || (win.id != ourWindow.id)) {
      appendWindow(windowListNode, win);
    }
  }
}

function appendWindow(parentNode, win) {
  parentNode.append(getWindowNode(win));
}

function getWindowNode(win) {
  let title = win.state == 'minimized' ? '<i>minimized</i> Window' : 'Window' ;

  let windowNode =
    `<div id=${win.id} class=windowClass>` +
      `<div class=myWindowTitle>${title}</div>`;

  for (let tab of win.tabs) {
    windowNode += getTabNode(tab);
  }

  windowNode += `</div>`;
  return windowNode;
}

async function appendTab(parent, tab) {
  parent.append(getTabNode(tab));
}

function getTabNode(tab) {
  let tabStateClass = '';
  if (tab.discarded) {
    tabStateClass = 'discarded';
  } else {
    tabStateClass = tab.active ? 'active' : 'inactive';
  }

  let favIconUrl = 'favIconUrl' in tab ?
    tab.favIconUrl : '/firefox-watermark-favicon.png';

  let tabNode =
    `<div id=${tab.id} class="tabClass ${tabStateClass}">` +
      `<button title="Unload tab"></button> ` +
      `<a class=tabClickToOpenLink href="#" title="Show tab"> ` +
        `<img class=favIcon src="${favIconUrl}" width=16 height=16> ` +
        `${tab.title}` +
      `</a>` +
    `</div>`;

  return tabNode;
}

function scrollToBottom() {
  $('html, body').scrollTop($(document).height());
}

async function getPopulatedWindowById(windowId) {
  return browser.windows.get(windowId, { populate: true });
}

async function onNewWindow(newWindow) {
  let populatedWindow = await getPopulatedWindowById(newWindow.id);
  appendWindow($('.myWindowList'), populatedWindow);
  //Scoll to bottom works, but it would be better to just scroll
  //to the activated tab or not scroll at all.
  //scrollToBottom();
}

async function onCloseWindow(windowId) {
  $(`#${windowId}.windowClass`).remove();
}

async function redrawWindowWithTab(tab) {
  let win = await browser.windows.get(tab.windowId, { populate: true });
  $(`#${tab.windowId}.windowClass`).replaceWith(getWindowNode(win));

  $(`#${tab.windowId}.windowClass .tabClass .tabClickToOpenLink`).click(async function(e) {
    e.preventDefault();
    let tabId = parseInt($(this).closest('.tabClass')[0].id);
    let tab = await browser.tabs.get(tabId);
    await browser.tabs.highlight({windowId: tab.windowId, tabs: [tab.index]});
    await browser.windows.update(tab.windowId, {focused: true});
    redrawWindowWithTab(tab);
  });

  $(`#${tab.windowId}.windowClass .tabClass.inactive button`).click(async function(e) {
    e.preventDefault();
    let tabId = parseInt($(this).closest('.tabClass')[0].id);
    browser.tabs.discard([tabId]).then(() => {
      $(this).closest('.tabClass').removeClass('inactive');
      $(this).closest('.tabClass').addClass('discarded');
    }).then(async function() {
      let tab = await browser.tabs.get(tabId);
      redrawWindowWithTab(tab);
    });
  });
}

async function onCloseTab(tabId) {
  let tab = $(`#${tabId}.tabClass`);
  tab.hide('fast', function(){ tab.remove(); });
}

async function onUpdateTabTitle(tabId, changeInfo, tab) {
  let oldTab = $(`#${tabId}.tabClass`);
  oldTab.fadeOut(100, function() {
    oldTab.replaceWith(getTabNode(tab));
    $(`#${tabId}.tabClass`).hide().fadeIn(100);
  });
}

async function onActivatedTab(activeInfo) {
  let tab = await browser.tabs.get(activeInfo.tabId);
  redrawWindowWithTab(tab);
}

$(document).ready(async function() {
  await drawWindowList();

  $('.tabClass .tabClickToOpenLink').click(async function(e) {
    e.preventDefault();
    let tabId = parseInt($(this).closest('.tabClass')[0].id);
    let tab = await browser.tabs.get(tabId);
    await browser.tabs.highlight({windowId: tab.windowId, tabs: [tab.index]});
    await browser.windows.update(tab.windowId, {focused: true});
    redrawWindowWithTab(tab);
  });

  $('.tabClass.inactive button').click(async function(e) {
    e.preventDefault();
    let tabId = parseInt($(this).closest('.tabClass')[0].id);
    browser.tabs.discard([tabId]).then(() => {
      $(this).closest('.tabClass').removeClass('inactive');
      $(this).closest('.tabClass').addClass('discarded');
    }).then(async function() {
      let tab = await browser.tabs.get(tabId);
      redrawWindowWithTab(tab);
    });
  });

  browser.tabs.onCreated.addListener(redrawWindowWithTab);
  browser.tabs.onRemoved.addListener(onCloseTab);
  browser.tabs.onUpdated.addListener(onUpdateTabTitle, {properties: ["title", "favIconUrl"]});
  browser.tabs.onActivated.addListener(onActivatedTab);
  browser.windows.onCreated.addListener(onNewWindow);
  browser.windows.onRemoved.addListener(onCloseWindow);
});
