// 导入所需的依赖库
use {
    anchor_lang::{
        prelude::*,  // Anchor 框架的核心功能
        solana_program::{native_token::LAMPORTS_PER_SOL, system_instruction},  // Solana 原生代币常量和系统指令
    },
    pyth_solana_receiver_sdk::price_update::{get_feed_id_from_hex, PriceUpdateV2, TwapUpdate},  // Pyth 价格预言机 SDK
};

// 声明程序 ID（部署后的程序地址）
declare_id!("2e5gZD3suxgJgkCg4pkoogxDKszy1SAwokz8mNeZUj4M");

// 价格数据的最大允许时间差（秒）- 超过这个时间的价格数据将被视为过期
pub const MAXIMUM_AGE: u64 = 3600; // 1 小时

// Pyth 价格源 ID - 这是 SOL/USD 价格对的唯一标识符
pub const FEED_ID: &str = "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";

// Anchor 程序模块
#[program]
pub mod send_usd {
    use super::*;

    /// 根据美元金额发送 SOL 的函数
    ///
    /// # 参数
    /// * `ctx` - 包含所需账户的上下文
    /// * `amount_in_usd` - 要发送的美元金额（整数，如 100 表示 $100）
    ///
    /// # 工作原理
    /// 1. 从 Pyth 预言机获取最新的 SOL/USD 价格
    /// 2. 将美元金额转换为等值的 lamports（SOL 的最小单位）
    /// 3. 执行转账操作
    pub fn send(ctx: Context<Send>, amount_in_usd: u64) -> Result<()> {
        // 获取价格更新账户的可变引用
        let price_update = &mut ctx.accounts.price_update;

        // 从 Pyth 价格源获取不早于指定时间的价格数据
        // 如果价格数据过期（超过 MAXIMUM_AGE），此调用将失败
        let price = price_update.get_price_no_older_than(
            &Clock::get()?,        // 当前区块链时间
            MAXIMUM_AGE,           // 允许的最大时间差
            &get_feed_id_from_hex(FEED_ID)?,  // SOL/USD 价格源 ID
        )?;

        // 计算等值的 lamports 数量
        // 公式: lamports = (LAMPORTS_PER_SOL * 10^|exponent| * amount_in_usd) / price
        //
        // 解释：
        // - LAMPORTS_PER_SOL: 1 SOL = 10^9 lamports
        // - price.exponent: 价格的指数（通常为负数，如 -8 表示价格需要除以 10^8）
        // - price.price: 实际价格值（需要根据 exponent 调整）
        let amount_in_lamports = LAMPORTS_PER_SOL
            .checked_mul(10_u64.pow(price.exponent.abs().try_into().unwrap()))  // 调整价格精度
            .unwrap()
            .checked_mul(amount_in_usd)  // 乘以美元金额
            .unwrap()
            .checked_div(price.price.try_into().unwrap())  // 除以 SOL 价格，得到 SOL 数量（lamports）
            .unwrap();

        // 创建系统转账指令
        let transfer_instruction = system_instruction::transfer(
            ctx.accounts.payer.key,        // 付款人公钥
            ctx.accounts.destination.key,  // 收款人公钥
            amount_in_lamports,            // 转账金额（lamports）
        );

        // 执行转账指令
        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                ctx.accounts.payer.to_account_info(),       // 付款人账户信息
                ctx.accounts.destination.to_account_info(), // 收款人账户信息
            ],
        )?;

        Ok(())
    }

    /// 使用时间加权平均价格（TWAP）发送 SOL 的函数
    ///
    /// # 参数
    /// * `ctx` - 包含所需账户的上下文
    /// * `amount_in_usd` - 要发送的美元金额（整数，如 100 表示 $100）
    /// * `twap_window_seconds` - TWAP 计算的时间窗口（秒）
    ///
    /// # 什么是 TWAP？
    /// TWAP (Time-Weighted Average Price) 是在指定时间窗口内的平均价格，
    /// 可以减少价格波动和操纵攻击的影响，提供更稳定的价格参考。
    ///
    /// # 工作原理
    /// 1. 从 Pyth 预言机获取指定时间窗口的 TWAP 价格
    /// 2. 将美元金额转换为等值的 lamports
    /// 3. 执行转账操作
    pub fn send_using_twap(
        ctx: Context<SendUsingTwap>,
        amount_in_usd: u64,
        twap_window_seconds: u64,
    ) -> Result<()> {
        // 获取 TWAP 更新账户的可变引用
        let twap_update = &mut ctx.accounts.twap_update;

        // 获取不早于指定时间的 TWAP 价格
        // TWAP 提供了在 twap_window_seconds 时间窗口内的平均价格
        let price = twap_update.get_twap_no_older_than(
            &Clock::get()?,          // 当前区块链时间
            MAXIMUM_AGE,             // 允许的最大时间差
            twap_window_seconds,     // TWAP 时间窗口（如 300 秒表示 5 分钟平均价格）
            &get_feed_id_from_hex(FEED_ID)?,  // SOL/USD 价格源 ID
        )?;

        // 计算等值的 lamports 数量
        // 计算方式与 send 函数相同，但使用的是 TWAP 价格而非即时价格
        let amount_in_lamports = LAMPORTS_PER_SOL
            .checked_mul(10_u64.pow(price.exponent.abs().try_into().unwrap()))  // 调整价格精度
            .unwrap()
            .checked_mul(amount_in_usd)  // 乘以美元金额
            .unwrap()
            .checked_div(price.price.try_into().unwrap())  // 除以 TWAP 价格
            .unwrap();

        // 创建系统转账指令
        let transfer_instruction = system_instruction::transfer(
            ctx.accounts.payer.key,        // 付款人公钥
            ctx.accounts.destination.key,  // 收款人公钥
            amount_in_lamports,            // 转账金额（lamports）
        );

        // 执行转账指令
        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                ctx.accounts.payer.to_account_info(),       // 付款人账户信息
                ctx.accounts.destination.to_account_info(), // 收款人账户信息
            ],
        )?;

        Ok(())
    }
}

/// Send 函数所需的账户结构
///
/// Anchor 使用这个结构来验证和反序列化传入的账户
#[derive(Accounts)]
#[instruction(amount_in_usd : u64)]  // 指令参数，用于账户验证
pub struct Send<'info> {
    /// 付款人账户
    /// - 必须是签名者（Signer），证明授权了这笔交易
    /// - 标记为可变（mut），因为会从该账户扣除 SOL
    #[account(mut)]
    pub payer: Signer<'info>,

    /// 收款人账户
    /// - 标记为可变（mut），因为会向该账户存入 SOL
    /// - 使用 AccountInfo 类型，不需要特定的账户结构
    #[account(mut)]
    /// CHECK : Just a destination
    pub destination: AccountInfo<'info>,

    /// Pyth 价格更新账户
    /// - 包含 SOL/USD 的最新价格数据
    /// - 类型为 PriceUpdateV2，Anchor 会自动验证账户数据格式
    pub price_update: Account<'info, PriceUpdateV2>,

    /// Solana 系统程序
    /// - 用于执行 SOL 转账操作
    pub system_program: Program<'info, System>,
}

/// SendUsingTwap 函数所需的账户结构
///
/// 与 Send 结构类似，但使用 TWAP 价格账户代替即时价格账户
#[derive(Accounts)]
#[instruction(amount_in_usd : u64)]  // 指令参数
pub struct SendUsingTwap<'info> {
    /// 付款人账户
    /// - 必须是签名者（Signer），证明授权了这笔交易
    /// - 标记为可变（mut），因为会从该账户扣除 SOL
    #[account(mut)]
    pub payer: Signer<'info>,

    /// 收款人账户
    /// - 标记为可变（mut），因为会向该账户存入 SOL
    /// - 使用 AccountInfo 类型，不需要特定的账户结构
    #[account(mut)]
    /// CHECK : Just a destination
    pub destination: AccountInfo<'info>,

    /// Pyth TWAP 更新账户
    /// - 包含 SOL/USD 的时间加权平均价格数据
    /// - 类型为 TwapUpdate，提供更平滑、更抗操纵的价格
    pub twap_update: Account<'info, TwapUpdate>,

    /// Solana 系统程序
    /// - 用于执行 SOL 转账操作
    pub system_program: Program<'info, System>,
}
