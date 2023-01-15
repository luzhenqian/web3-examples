const creatorRequestErrors = {
  cannotReapply: {
    code: 100100,
    message: "当前申请正在审核，请不要重复提交申请",
  },
  isNotCreator: {
    code: 100101,
    message: "您不是创作者",
  },
};

export { creatorRequestErrors };
