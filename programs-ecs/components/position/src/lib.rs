use bolt_lang::*;

declare_id!("7eTCahw23RWz7EoGzkLcN6mLEgucX9AQTC76SfYF58UC");

#[component]
#[derive(Default)]
pub struct Position {
    pub x: i64,
    pub y: i64,
    pub z: i64,
    #[max_len(20)]
    pub description: String,
}