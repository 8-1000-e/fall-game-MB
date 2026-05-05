use bolt_lang::prelude::*;

declare_id!("5Hz8Lj7cMB9ct6ftkp66yM9ysCKv7CPQPDFu85J9sFfd");

#[program]
pub mod fall_game {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
