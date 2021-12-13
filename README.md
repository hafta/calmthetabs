# CalmTheTabs
A webextension for listing and unloading tabs. The motivation was to help users with loads of old tabs (that they don't want to close) speed up their browser by unloading tabs they aren't ready to close yet but don't need to be active. Only tested on Firefox so far. Version 0.1 - my first attempt at writing a webextension. 

## Installation and Use
The extension is not ready to be published yet and can only be installed using the `about:debugging` page on Firefox (`about:debugging` -> `This Firefox` -> `Load Temporary Add-on...` -> select the `manifest.json` file). The extension provides a tab list which can be shown in the sidebar by selecting `View->Sidebar->All Tabs` or in a window by clicking the extension's tab icon in the toolbar. With a separate window, there is only one instance of the list compared to when the sidebar is used which hosts a separate instance of the list for each window. The icon in the toolbar always focuses or opens the tab list window. To unload a tab, make sure the tab is not the active tab in a window and click its gray tab icon. Once unloaded, the icon will appear as an empty tab.

## Known Issues
* The active tab in a window can not be unloaded even when the window is minimized. This is a limitation in the webextensions API. The extension could work around this by creating a new empty tab first.
* When a window is minimized, its label in the list is not updated to reflect the change.

## Future Work
* Instead of a sidebar or separate window, display a new pinned tab at index 0 for each window displaying a list of tabs in the window with an option to display all tabs for all windows.
* Allow unloading all tabs in a window with one click.
* Allow unloading all tabs except the current tab with one click.
