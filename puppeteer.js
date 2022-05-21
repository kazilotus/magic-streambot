// const puppeteer = require('puppeteer-extra')
const { launch, getStream } = require("puppeteer-stream");
const fs = require("fs");

const file = fs.createWriteStream("/data/test.webm");

// add stealth plugin and use defaults (all evasion techniques)
// const StealthPlugin = require('puppeteer-extra-plugin-stealth')
// // const UsrDataPlugin = require('puppeteer-extra-plugin-user-data-dir')
// puppeteer.use(StealthPlugin())
// // puppeteer.use(UsrDataPlugin())

const runner = async search => {
  let data = [];

	const browser = await launch({
	  headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
		defaultViewport: {
			width: 1920,
			height: 1080,
		},
	});

	const page = await browser.newPage();
// 	await page.goto("http://www.youtube.com/embed/JW5meKfy3fY?autoplay=1");
	const stream = await getStream(page, { audio: true, video: true });
	console.log("recording");

	stream.pipe(file);
	setTimeout(async () => {
		await stream.destroy();
		file.close();
		console.log("finished");
	}, 1000 * 10);

  // console.log("Opening browser");
  // const browser = await puppeteer.launch({
  //   headless: false,
  //   args: ["--no-sandbox", "--disable-setuid-sandbox"]
  // });
  // const page = await browser.newPage();

  async function cleanup() {
    try {
      console.log("Cleaning up instances");
      await page.close();
      await browser.close();
    } catch (e) {
      console.log("Cannot cleanup istances");
    }
  }

  try {
    
//     const email = 'mahmudul.hasan7@northsouth.edu'
//     const password = '99886389'
    
// console.log('Opening chromium browser...');
//   const page = await browser.newPage();
//   const pages = await browser.pages();
//   // Close the new tab that chromium always opens first.
//   pages[0].close();
//   await page.goto('https://accounts.google.com/signin/v2/identifier', { waitUntil: 'networkidle2' });

//     // Only needed if sign in requires you to click 'sign in with google' button.
//     // await page.waitForSelector('button[data-test="google-button-login"]');
//     // await page.waitFor(1000);
//     // await page.click('button[data-test="google-button-login"]');

//     // Wait for email input.
//     await page.waitForSelector('#identifierId');
//     let badInput = true;
  
//     // Keep trying email until user inputs email correctly.
//     // This will error due to captcha if too many incorrect inputs.
//     while (badInput) {
//       await page.type('#identifierId', email);
//       await page.waitFor(1000);
//       await page.keyboard.press('Enter');
//       await page.waitFor(1000);
//       badInput = await page.evaluate(() => document.querySelector('#identifierId[aria-invalid="true"]') !== null);
//       if (badInput) {
//         console.log('Incorrect email or phone. Please try again.');
//         await page.click('#identifierId', { clickCount: 3 });
//       }
//     }
//     const password = await prompt('Enter your password: ', true);
//     console.log('Finishing up...');
//     // Wait for password input
//     await page.type('input[type="password"]', password);
//     await page.waitFor(1000);
//     await page.keyboard.press('Enter');
  
    // console.log("Navigating url");
    // await page.goto("https://meet.google.com/xpw-qzev-btg", { waitUntil: "networkidle2" });
    await page.goto("https://dl5.webmfiles.org/big-buck-bunny_trailer.webm", { waitUntil: "networkidle2" });
    // await page.goto("https://recaptcha-demo.appspot.com/recaptcha-v3-request-scores.php", { waitUntil: "networkidle2" });
    await page.waitForTimeout(10000)
    // await page.screenshot({path: '/data/screenshot.png'});
    // console.log("Typing text");
    // await page.type("input#search_form_input_homepage", search, { delay: 50 });
    // await page.click("input#search_button_homepage");
    // console.log("Wait for results");
    // await page.waitForSelector(".results--main #r1-0");
    // data = await page.evaluate(() =>
    //   [...document.querySelectorAll("a.result__a")].map(e=>e.textContent.trim())
    // );
    // console.log("Extracted data");
    await cleanup();
  } catch (e) {
    console.log("Error happened", e);
    await page.screenshot({ path: "/data/error.png" });
    await cleanup();
  }
  return data;
};

module.exports = runner;
