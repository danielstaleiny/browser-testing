# browser-testing
Create screenshots of the pages with Puppeter


## change website

```javascript
const proxy = screenshot(browser)("eatmybackyard.dk");
```


## add devices

```javascript
// import
const tablet = devices["iPad"];

//screenDevices function
const tabletPnew = fn(tablet);
// add it to list of promises
return await Promise.all([iphoneP, tabletP, desktopP, desktop2xP, tabletPnew]);

```

## Add pages you want to take a screenshot of

```javascript
  await screenDevices(proxy('/index.html'));
```

