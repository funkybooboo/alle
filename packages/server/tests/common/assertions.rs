//! Test assertion helpers
//!
//! Note: Not all functions are used in every test file, which is expected for shared test utilities.

#![allow(dead_code)]

use alle_server::domains::tasks::entity;

/// Assert task fields match expected values
pub fn assert_task_eq(task: &entity::Model, title: &str, completed: bool) {
    assert_eq!(task.title, title);
    assert_eq!(task.completed, completed);
}

/// Assert task exists with expected title
pub fn assert_task_exists(task: Option<entity::Model>, expected_title: &str) {
    assert!(task.is_some(), "Expected task to exist");
    let task = task.unwrap();
    assert_eq!(task.title, expected_title);
}

/// Assert task does not exist
pub fn assert_task_not_found(task: Option<entity::Model>) {
    assert!(task.is_none(), "Expected task to not exist");
}

/// Assert collection has expected length
pub fn assert_count<T>(items: &[T], expected: usize) {
    assert_eq!(
        items.len(),
        expected,
        "Expected {} items, got {}",
        expected,
        items.len()
    );
}
