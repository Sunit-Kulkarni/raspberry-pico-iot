import { SSTConfig } from "sst";
import { API } from "./stacks/IoTCoreStack";

export default {
  config(_input) {
    return {
      name: "raspberry-pico-iot",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(API);
  }
} satisfies SSTConfig;
