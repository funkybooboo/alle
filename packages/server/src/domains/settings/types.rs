use async_graphql::{Enum, InputObject, SimpleObject};

#[derive(Enum, Copy, Clone, Eq, PartialEq, Debug)]
pub enum Theme {
    Light,
    Dark,
}

impl Theme {
    pub fn as_str(&self) -> &'static str {
        match self {
            Theme::Light => "light",
            Theme::Dark => "dark",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "light" => Some(Theme::Light),
            "dark" => Some(Theme::Dark),
            _ => None,
        }
    }
}

#[derive(SimpleObject, Clone)]
pub struct Settings {
    pub id: i32,
    pub column_min_width: i32,
    pub today_shows_previous: bool,
    pub single_arrow_days: i32,
    pub double_arrow_days: i32,
    pub auto_column_breakpoints: String, // JSON string
    pub auto_column_counts: String,      // JSON string
    pub drawer_height: i32,
    pub drawer_is_open: bool,
    pub theme: Theme,
}

impl From<super::entity::Model> for Settings {
    fn from(model: super::entity::Model) -> Self {
        Self {
            id: model.id,
            column_min_width: model.column_min_width,
            today_shows_previous: model.today_shows_previous,
            single_arrow_days: model.single_arrow_days,
            double_arrow_days: model.double_arrow_days,
            auto_column_breakpoints: model.auto_column_breakpoints,
            auto_column_counts: model.auto_column_counts,
            drawer_height: model.drawer_height,
            drawer_is_open: model.drawer_is_open,
            theme: Theme::from_str(&model.theme).unwrap_or(Theme::Light),
        }
    }
}

#[derive(InputObject)]
pub struct UpdateSettingsInput {
    pub column_min_width: Option<i32>,
    pub today_shows_previous: Option<bool>,
    pub single_arrow_days: Option<i32>,
    pub double_arrow_days: Option<i32>,
    pub auto_column_breakpoints: Option<String>,
    pub auto_column_counts: Option<String>,
    pub drawer_height: Option<i32>,
    pub drawer_is_open: Option<bool>,
    pub theme: Option<Theme>,
}
