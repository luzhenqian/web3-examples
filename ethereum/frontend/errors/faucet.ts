const faucetErrors = {
  invalidAmount: {
    code: 100100,
    message: "数量格式不正确",
  },
  invalidAddress: {
    code: 100100,
    message: "地址不合法",
  },
  insufficientBalance: {
    code: 100101,
    message: "当前地址不能领取",
  },
};

export { faucetErrors };
