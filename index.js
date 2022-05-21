const { launch, getStream } = require("./dist/PuppeteerStream");
const child_process = require('child_process');
const fs = require("fs");
 
const record = async ({captureEndpoint, streamEndpoint, userDataPath}) => {
  
  console.log("Launching chrome browser");
	let browser = await launch({
	  headless: false,
		defaultViewport: null,
		args: [
		  "--no-sandbox",
		  "--disable-setuid-sandbox",
			"--window-size=1366,768",
			"--window-position=1367,0",
			"--autoplay-policy=no-user-gesture-required",
			'--user-data-dir='+userDataPath,
			'--use-fake-device-for-media-stream',
			'--use-file-for-fake-audio-capture=/app/audio.wav',
			'--use-file-for-fake-video-capture=/app/video.y4m',
			'--allow-file-access',
			'--enable-experimental-web-platform-features',
			'--disable-dev-shm-usage'
		],
	});

  const page = await browser.newPage();
  const pages = await browser.pages();
  // Close the new tab that chromium always opens first.
  pages[0].close();

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

    console.log("Start Recording");
  	const stream = await getStream(page, { audio: true, video: true });
    
    run_script("ffmpeg",
        [
          "-i",
          'pipe:0',
          "-c:v",
          "libx264",
          "-preset",
          "ultrafast",
          "-tune",
          "zerolatency",
          "-c:a",
          "aac",
          "-f",
          "flv",
          streamEndpoint
        ], stream, function(output, exit_code) {
        console.log("Process Finished.");
        console.log('closing code: ' + exit_code);
        console.log('Full output of script: ',output);
    });
  
    console.log("Navigating to meet link");
    await page.goto(captureEndpoint, { waitUntil: "load" });
    await page.waitForTimeout(1000000)
    await stream.destroy()

    console.log("Cleaning Up");
    await cleanup();
  } catch (e) {
    console.log("Error happened", e);
    await page.screenshot({ path: "/data/record-error.png" });
    await cleanup();
  }
  return;
};

function run_script(command, args, stream, callback) {
    console.log("Starting Process.");
    var child = child_process.spawn(command, args);
    stream.pipe(child.stdin);

    var scriptOutput = "";

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', function(data) {
        console.log('stdout: ' + data);

        data=data.toString();
        scriptOutput+=data;
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function(data) {
        console.log('stderr: ' + data);

        data=data.toString();
        scriptOutput+=data;
    });

    child.on('close', function(code) {
        callback(scriptOutput,code);
    });
}

(async function(){
  const chromeData = '/data/profile/default'
  const URL = 'https://www.youtube.com/watch?v=g5U7AqetuEA'
  const rtmpURL = 'rtmp://stream.ant.accmagic.com/LiveApp/pK3925zpyujg1653025084853'

	record({
	  captureEndpoint: URL,
	  streamEndpoint: rtmpURL,
	  userDataPath: chromeData
	});
	
})();