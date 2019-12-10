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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const child_process_1 = require("child_process");
const getCommitMessageCommand = 'git log -n 1 --pretty="format:%s" | tail';
const publish = 'npx lerna publish --loglevel debug -y';
function runComm(command) {
    child_process_1.exec(command, (err, stdout, stderr) => {
        core.info(stdout);
        core.error(stderr);
        if (err)
            throw err;
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            child_process_1.exec(getCommitMessageCommand, (err, stdout) => {
                if (err)
                    throw err;
                runComm('lerna bootstrap');
                runComm(`npm config set //registry.npmjs.org/:_authToken ${process.env.NPM_TOKEN}`);
                if (stdout.includes('BREAKING CHANGE')) {
                    runComm(`${publish} major`);
                }
                else if (stdout.includes('FEATURE')) {
                    runComm(`${publish} minor`);
                }
                else if (stdout.includes('PATCH')) {
                    runComm(`${publish} patch`);
                }
                else {
                    core.info(`Commit message didn't contain:
\t* BREAKING CHANGE
\t* FEATURE
\t* PATCH

Skipping publishing
`);
                }
            });
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
