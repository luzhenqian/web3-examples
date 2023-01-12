import { Errors } from "./type";

const commonErrors: Errors = {
  serviceNotAvailable: {
    code: 200000,
    message: "服务暂不可用",
  },
  other: {
    code: 200001,
    message: "未知错误",
  },
};

export { commonErrors };
