// import { consoleColors as color } from "./common.js";
//
// export class Logger {
//     private static format(message: string, ...params: any[]): string {
//         let slice = message.split("{}");
//         let result: string = "";
//
//         for (let i = 0; i < slice.length; i++) {
//             let param = params.shift();
//             console.log(param);
//
//             param = (typeof param === 'object') ? ((param === null) ? "null" : ((param === undefined) ? "undefined" : JSON.stringify(param))) : param;
//
//             result = result + slice[i] + param;
//         }
//
//         return result;
//     }
//
//     static info (message: string, ...params: any[]) {
//         let logStr: string = this.format(message, params);
//
//         console.log(color.green+ "[INFO] " + color.reset + logStr);
//     }
//
//     static debug (message: string, ...params: any[]) {
//         let logStr: string = message ? message : "";
//
//         if(params) {
//             logStr += params;
//         }
//
//         console.log(color.blue + "[DEBUG] " +color.reset, logStr);
//     }
// }
//
//
// function test () {
//     const map = new Map();
//         map.set("isMap", "value");
//     const obj = {
//         key: "key",
//         map: map,
//     };
//     const str = "is string";
//
//     Logger.info("test obj={}, str={}", obj, str);
//     Logger.debug("test obj={}, str={}", obj, str);
// }
//
// test();