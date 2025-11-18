import { prisma } from "../prisma/db";
import admins from "./admins";

async function initialAdmin() {
  // 将所有管理员的 role 设置为 ADMIN
  admins.forEach((admin) => {
    admin.role = "ADMIN";
  });
  // 创建管理员
  const res = await prisma.user.createMany({
    data: admins,
  });
  // TODO: 同步更新 account 表的数据
  console.log(`初始化管理员成功，共创建${res.count}个管理员`);
}

initialAdmin();
