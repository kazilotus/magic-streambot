"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStream = exports.launch = exports.Stream = void 0;
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const pluginStealth = require('puppeteer-extra-plugin-stealth')();
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
pluginStealth.enabledEvasions.delete('defaultArgs');
puppeteer_extra_1.default.use(pluginStealth);
const stream_1 = require("stream");
const path_1 = __importDefault(require("path"));
class Stream extends stream_1.Readable {
    constructor(page, options) {
        super(options);
        this.page = page;
    }
    _read() { }
    destroy() {
        const _super = Object.create(null, {
            destroy: { get: () => super.destroy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            _super.destroy.call(this);
            // @ts-ignore
            yield this.page.browser().videoCaptureExtension.evaluate((index) => {
                // @ts-ignore
                STOP_RECORDING(index);
            }, 
            // @ts-ignore
            this.page._id);
        });
    }
}
exports.Stream = Stream;
function launch(opts) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        if (!opts)
            opts = {};
        if (!opts.args)
            opts.args = [];
        const extensionPath = path_1.default.join(__dirname, "..", "extension");
        const extensionId = "jjndjgheafjngoipoacpjgeicjeomjli";
        let loadExtension = false;
        let loadExtensionExcept = false;
        let whitelisted = false;
        opts.args = opts.args.map((x) => {
            if (x.includes("--load-extension=")) {
                loadExtension = true;
                return x + "," + extensionPath;
            }
            else if (x.includes("--disable-extensions-except=")) {
                loadExtensionExcept = true;
                return "--disable-extensions-except=" + extensionPath + "," + x.split("=")[1];
            }
            else if (x.includes("--whitelisted-extension-id")) {
                whitelisted = true;
                return x + "," + extensionId;
            }
            return x;
        });
        if (!loadExtension)
            opts.args.push("--load-extension=" + extensionPath);
        if (!loadExtensionExcept)
            opts.args.push("--disable-extensions-except=" + extensionPath);
        if (!whitelisted)
            opts.args.push("--whitelisted-extension-id=" + extensionId);
        if (((_a = opts.defaultViewport) === null || _a === void 0 ? void 0 : _a.width) && ((_b = opts.defaultViewport) === null || _b === void 0 ? void 0 : _b.height))
            opts.args.push(`--window-size=${(_c = opts.defaultViewport) === null || _c === void 0 ? void 0 : _c.width}x${(_d = opts.defaultViewport) === null || _d === void 0 ? void 0 : _d.height}`);
        opts.headless = false;
        if (opts.solveCaptcha)
            puppeteer_extra_1.default.use(RecaptchaPlugin({
                provider: { id: '2captcha', token: opts.solveCaptcha },
                visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
            }));
        const browser = yield puppeteer_extra_1.default.launch(opts);
        // @ts-ignore
        browser.encoders = new Map();
        const extensionTarget = yield browser.waitForTarget(
        // @ts-ignore
        (target) => target.type() === "background_page" && target._targetInfo.title === "Video Capture");
        // @ts-ignore
        browser.videoCaptureExtension = yield extensionTarget.page();
        // @ts-ignore
        yield browser.videoCaptureExtension.exposeFunction("sendData", (opts) => {
            const data = Buffer.from(str2ab(opts.data));
            // @ts-ignore
            browser.encoders.get(opts.id).push(data);
        });
        return browser;
    });
}
exports.launch = launch;
function getStream(page, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const encoder = new Stream(page);
        if (!opts.audio && !opts.video)
            throw new Error("At least audio or video must be true");
        if (!opts.mimeType) {
            if (opts.video)
                opts.mimeType = "video/webm";
            else if (opts.audio)
                opts.mimeType = "audio/webm";
        }
        if (!opts.frameSize)
            opts.frameSize = 20;
        yield page.bringToFront();
        // @ts-ignore
        yield page.browser().videoCaptureExtension.evaluate((settings) => {
            // @ts-ignore
            START_RECORDING(settings);
        }, Object.assign(Object.assign({}, opts), { index: page._id }));
        // @ts-ignore
        page.browser().encoders.set(page._id, encoder);
        return encoder;
    });
}
exports.getStream = getStream;
function str2ab(str) {
    // Convert a UTF-8 String to an ArrayBuffer
    var buf = new ArrayBuffer(str.length); // 1 byte for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVwcGV0ZWVyU3RyZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1B1cHBldGVlclN0cmVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFRQSxzRUFBd0M7QUFFeEMsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLGdDQUFnQyxDQUFDLEVBQUUsQ0FBQTtBQUVqRSxhQUFhLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUVuRCx5QkFBUyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUU1QixtQ0FBbUQ7QUFDbkQsZ0RBQXdCO0FBQ3hCLE1BQWEsTUFBTyxTQUFRLGlCQUFRO0lBQ25DLFlBQW9CLElBQVUsRUFBRSxPQUF5QjtRQUN4RCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFESSxTQUFJLEdBQUosSUFBSSxDQUFNO0lBRTlCLENBQUM7SUFFRCxLQUFLLEtBQUksQ0FBQztJQUVKLE9BQU87Ozs7O1lBQ1osT0FBTSxPQUFPLFlBQUc7WUFDaEIsYUFBYTtZQUNiLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQ3ZELENBQUMsS0FBYSxFQUFFLEVBQUU7Z0JBQ2pCLGFBQWE7Z0JBQ2IsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZCLENBQUM7WUFDRCxhQUFhO1lBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQ2IsQ0FBQztRQUNILENBQUM7S0FBQTtDQUNEO0FBbkJELHdCQW1CQztBQVNELFNBQXNCLE1BQU0sQ0FDM0IsSUFBMEU7OztRQUUxRSxJQUFJLENBQUMsSUFBSTtZQUFFLElBQUksR0FBRyxFQUFFLENBQUM7UUFFckIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJO1lBQUUsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7UUFFL0IsTUFBTSxhQUFhLEdBQUcsY0FBSSxD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