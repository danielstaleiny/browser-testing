const puppeteer = require("puppeteer");
const devices = require("puppeteer/DeviceDescriptors");
const fs = require("fs");
const util = require("util");
const mkdir = util.promisify(fs.mkdir);

const iPhone = devices["iPhone 6"];
const tablet = devices["iPad"];
const desktop = {
  name: "Desktop",
  userAgent:
    "Mozilla/5.0 (X11; Linux x86_64; rv:63.0) Gecko/20100101 Firefox/63.0",
  viewport: {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    isLandscape: true
  }
};
const desktop2x = {
  name: "Desktop 2x",
  userAgent:
    "Mozilla/5.0 (X11; Linux x86_64; rv:63.0) Gecko/20100101 Firefox/63.0",
  viewport: {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    isLandscape: true
  }
};

// sideEffectNoError :: Promise -> Object -> Promise
const sideEffectNoError = fn => async then =>
  await fn.then(() => then).catch(() => then);

// screenshot :: Object -> String -> String -> Object -> Promise
const screenshot = browser => proxy => endpoint => async device => {
  const page = await browser.newPage();
  await page.emulate(device);
  await sideEffectNoError(mkdir(proxy + endpoint.replace("/", "-")))(true); // create timestamp folder if doesn't exists
  await page.goto("https://" + proxy + endpoint, { waitUntil: "networkidle0" });
  return await page.screenshot({
    path:
      proxy +
      endpoint.replace("/", "-") +
      "/" +
      device.name.replace(" ", "-").toLowerCase() +
      ".png"
  });
};

// screenDevices :: Function -> Promise
const screenDevices = async fn => {
  const iphoneP = fn(iPhone);
  const tabletP = fn(tablet);
  const desktopP = fn(desktop);
  const desktop2xP = fn(desktop2x);

  return await Promise.all([iphoneP, tabletP, desktopP, desktop2xP]);
};

// tryCatch :: Function -> Promise
const tryCatch = fn => {
  try {
    fn();
  } catch (err) {
    console.log(err);
  }
};

tryCatch(async () => {
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });

  const proxy = screenshot(browser)("eatmybackyard.dk");

  const landingPage = proxy("/");
  const region = proxy("/region");
  const support = proxy("/support");
  const terms = proxy("/terms");

  await screenDevices(landingPage);
  await screenDevices(region);
  await screenDevices(support);
  await screenDevices(terms);

  await browser.close();
});
